<?php
declare(strict_types=1);

namespace POTicket\Controllers;

use InvalidArgumentException;
use POTicket\Database\Database;
use POTicket\Services\PixService;
use RuntimeException;
use PDO;

class OrderController
{
    /**
     * Processa a compra com proteção transacional contra overbooking e gera ingressos com PIX
     */
    public function checkout(array $data, int $userId): array
    {
        $batchId = (int)($data['batch_id'] ?? 0);
        $quantity = (int)($data['quantity'] ?? 1);
        $paymentMethod = $data['payment_method'] ?? 'pix';

        if ($batchId <= 0 || $quantity <= 0) {
            throw new InvalidArgumentException('Selecione um lote e quantidade válidos.');
        }

        $db = Database::getConnection();
        $db->beginTransaction();

        try {
            // Busca lote com bloqueio FOR UPDATE ou verificação estrita de estoque
            $stmt = $db->prepare("SELECT b.*, e.title AS event_title, e.pix_key, e.venue_name, e.city
                                  FROM event_batches b
                                  JOIN events e ON b.event_id = e.id
                                  WHERE b.id = :batch_id AND b.is_active = 1 FOR UPDATE");
            $stmt->execute([':batch_id' => $batchId]);
            $batch = $stmt->fetch();

            if (!$batch) {
                throw new InvalidArgumentException('Lote de ingressos não encontrado.');
            }

            if (($batch['total_quantity'] - $batch['sold_quantity']) < $quantity) {
                throw new InvalidArgumentException('Desculpe, não há ingressos suficientes disponíveis neste lote.');
            }

            $unitPrice = (float)$batch['price'];
            $totalAmount = $unitPrice * $quantity;
            $orderCode = 'POT-' . strtoupper(bin2hex(random_bytes(6)));

            // Atualiza quantidade vendida no lote
            $updateBatch = $db->prepare("UPDATE event_batches 
                                         SET sold_quantity = sold_quantity + :qty 
                                         WHERE id = :id");
            $updateBatch->execute([':qty' => $quantity, ':id' => $batchId]);

            // Geração de PIX ou Cartão
            $pixPayload = null;
            $pixExpiresAt = null;

            if ($paymentMethod === 'pix') {
                $pixKey = !empty($batch['pix_key']) ? $batch['pix_key'] : 'financeiro@poticket.com.br';
                $pixPayload = PixService::generatePayload(
                    $pixKey,
                    'POTICKET EVENTOS',
                    $batch['city'],
                    $totalAmount,
                    $orderCode
                );
                $pixExpiresAt = (new \DateTimeImmutable('+30 minutes'))->format('Y-m-d H:i:s');
            }

            // Insere Pedido
            $orderStmt = $db->prepare("INSERT INTO orders 
                (user_id, order_code, total_amount, payment_method, status, pix_code, pix_expires_at, paid_at)
                VALUES 
                (:user_id, :order_code, :total_amount, :payment_method, :status, :pix_code, :pix_expires_at, :paid_at)");

            $initialStatus = ($paymentMethod === 'credit_card') ? 'paid' : 'pending';
            $paidAt = ($paymentMethod === 'credit_card') ? date('Y-m-d H:i:s') : null;

            $orderStmt->execute([
                ':user_id' => $userId,
                ':order_code' => $orderCode,
                ':total_amount' => $totalAmount,
                ':payment_method' => $paymentMethod,
                ':status' => $initialStatus,
                ':pix_code' => $pixPayload,
                ':pix_expires_at' => $pixExpiresAt,
                ':paid_at' => $paidAt
            ]);

            $orderId = (int)$db->lastInsertId();

            // Emite os ingressos nominais
            $tickets = [];
            for ($i = 0; $i < $quantity; $i++) {
                $ticketCode = 'TKT-' . strtoupper(bin2hex(random_bytes(8)));
                $qrHash = hash('sha256', $ticketCode . $orderCode . $userId . time());

                $tktStmt = $db->prepare("INSERT INTO tickets 
                    (order_id, event_id, batch_id, user_id, ticket_code, qr_code_hash, status)
                    VALUES 
                    (:order_id, :event_id, :batch_id, :user_id, :ticket_code, :qr_code_hash, 'valid')");

                $tktStmt->execute([
                    ':order_id' => $orderId,
                    ':event_id' => $batch['event_id'],
                    ':batch_id' => $batchId,
                    ':user_id' => $userId,
                    ':ticket_code' => $ticketCode,
                    ':qr_code_hash' => $qrHash
                ]);

                $tickets[] = [
                    'ticket_code' => $ticketCode,
                    'qr_hash' => $qrHash
                ];
            }

            $db->commit();

            return [
                'order_id' => $orderId,
                'order_code' => $orderCode,
                'total_amount' => $totalAmount,
                'payment_method' => $paymentMethod,
                'status' => $initialStatus,
                'pix_code' => $pixPayload,
                'tickets' => $tickets,
                'event_title' => $batch['event_title']
            ];
        } catch (\Throwable $e) {
            $db->rollBack();
            error_log("Erro no checkout: " . $e->getMessage());
            throw new RuntimeException($e->getMessage());
        }
    }
}
