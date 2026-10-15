<?php
declare(strict_types=1);

namespace POTicket\Controllers;

use InvalidArgumentException;
use POTicket\Database\Database;
use PDO;

class EventController
{
    /**
     * Retorna eventos com filtros de busca, categoria e cidade
     */
    public function index(array $queryParams): array
    {
        $db = Database::getConnection();
        $sql = "SELECT e.id, e.title, e.slug, e.description, e.image_url, e.start_date, 
                       e.venue_name, e.city, e.state, e.is_featured,
                       c.name AS category_name, c.slug AS category_slug,
                       MIN(b.price) AS min_price
                FROM events e
                JOIN categories c ON e.category_id = c.id
                LEFT JOIN event_batches b ON e.id = b.event_id AND b.is_active = 1
                WHERE e.status = 'published'";

        $params = [];

        // Filtro por cidade
        if (!empty($queryParams['city']) && $queryParams['city'] !== 'all') {
            $sql .= " AND LOWER(e.city) = :city";
            $params[':city'] = strtolower(trim($queryParams['city']));
        }

        // Filtro por categoria
        if (!empty($queryParams['category']) && $queryParams['category'] !== 'all') {
            $sql .= " AND (c.slug = :category OR c.id = :catId)";
            $params[':category'] = $queryParams['category'];
            $params[':catId'] = (int)$queryParams['category'];
        }

        // Busca textual
        if (!empty($queryParams['q'])) {
            $sql .= " AND (e.title LIKE :q OR e.venue_name LIKE :q OR e.description LIKE :q)";
            $params[':q'] = '%' . trim($queryParams['q']) . '%';
        }

        $sql .= " GROUP BY e.id ORDER BY e.is_featured DESC, e.start_date ASC LIMIT 50";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    /**
     * Retorna detalhes completos do evento para a tela de compra
     */
    public function show(int $id): ?array
    {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT e.*, c.name AS category_name, u.name AS producer_name
                              FROM events e
                              JOIN categories c ON e.category_id = c.id
                              JOIN users u ON e.producer_id = u.id
                              WHERE e.id = :id AND e.status = 'published' LIMIT 1");
        $stmt->execute([':id' => $id]);
        $event = $stmt->fetch();

        if (!$event) {
            return null;
        }

        // Busca lotes disponíveis
        $batchStmt = $db->prepare("SELECT id, name, price, total_quantity, sold_quantity, 
                                          (total_quantity - sold_quantity) AS available_quantity
                                   FROM event_batches 
                                   WHERE event_id = :id AND is_active = 1 
                                   ORDER BY price ASC");
        $batchStmt->execute([':id' => $id]);
        $event['batches'] = $batchStmt->fetchAll();

        return $event;
    }

    /**
     * Cadastro de novo evento pelo Produtor
     */
    public function create(array $data, int $producerId): array
    {
        $db = Database::getConnection();

        // Validação mínima de segurança
        if (empty($data['title']) || empty($data['start_date']) || empty($data['venue_name']) || empty($data['city'])) {
            throw new InvalidArgumentException('Campos obrigatórios do evento não foram preenchidos.');
        }

        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $data['title']))) . '-' . bin2hex(random_bytes(3));

        $db->beginTransaction();
        try {
            $stmt = $db->prepare("INSERT INTO events 
                (producer_id, category_id, title, slug, description, image_url, start_date, venue_name, cep, street, number, neighborhood, city, state, pix_key, status)
                VALUES 
                (:producer_id, :category_id, :title, :slug, :description, :image_url, :start_date, :venue_name, :cep, :street, :number, :neighborhood, :city, :state, :pix_key, 'published')");

            $stmt->execute([
                ':producer_id' => $producerId,
                ':category_id' => (int)($data['category_id'] ?? 1),
                ':title' => trim($data['title']),
                ':slug' => $slug,
                ':description' => trim($data['description'] ?? ''),
                ':image_url' => trim($data['image_url'] ?? 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800'),
                ':start_date' => $data['start_date'],
                ':venue_name' => trim($data['venue_name']),
                ':cep' => preg_replace('/[^0-9]/', '', $data['cep'] ?? '00000000'),
                ':street' => $data['street'] ?? '',
                ':number' => $data['number'] ?? 'S/N',
                ':neighborhood' => $data['neighborhood'] ?? '',
                ':city' => trim($data['city']),
                ':state' => strtoupper(substr($data['state'] ?? 'RN', 0, 2)),
                ':pix_key' => trim($data['pix_key'] ?? 'financeiro@poticket.com.br')
            ]);

            $eventId = (int)$db->lastInsertId();

            // Cadastra lote inicial padrão
            $batchStmt = $db->prepare("INSERT INTO event_batches (event_id, name, price, total_quantity, sold_quantity) 
                                       VALUES (:event_id, :name, :price, :qty, 0)");
            $batchStmt->execute([
                ':event_id' => $eventId,
                ':name' => $data['batch_name'] ?? 'Lote Promocional',
                ':price' => (float)($data['price'] ?? 50.00),
                ':qty' => (int)($data['quantity'] ?? 100)
            ]);

            $db->commit();
            return ['id' => $eventId, 'slug' => $slug, 'message' => 'Evento publicado com sucesso!'];
        } catch (\Throwable $e) {
            $db->rollBack();
            error_log("Erro ao criar evento: " . $e->getMessage());
            throw new \RuntimeException("Erro ao salvar evento e lotes com segurança.");
        }
    }
}
