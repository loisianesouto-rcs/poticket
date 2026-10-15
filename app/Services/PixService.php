<?php
declare(strict_types=1);

namespace POTicket\Services;

class PixService
{
    /**
     * Gera o código BR Code Pix no padrão oficial do Banco Central do Brasil (EMVCo)
     */
    public static function generatePayload(
        string $pixKey,
        string $merchantName,
        string $merchantCity,
        float $amount,
        string $txId
    ): string {
        $formattedAmount = number_format($amount, 2, '.', '');
        
        // Formata Merchant Account Info (ID 26)
        $gui = self::formatField('00', 'br.gov.bcb.pix');
        $key = self::formatField('01', $pixKey);
        $merchantAccount = self::formatField('26', $gui . $key);

        // Formata Additional Data (ID 62)
        $tx = self::formatField('05', substr($txId, 0, 25));
        $additionalData = self::formatField('62', $tx);

        $payload = self::formatField('00', '01')                  // Payload Format Indicator
                 . self::formatField('01', '12')                  // Point of Initiation Method (12 = dinâmico / pontual)
                 . $merchantAccount
                 . self::formatField('52', '0000')                // Merchant Category Code
                 . self::formatField('53', '986')                 // BRL Moeda
                 . self::formatField('54', $formattedAmount)       // Valor
                 . self::formatField('58', 'BR')                  // País
                 . self::formatField('59', strtoupper(substr($merchantName, 0, 25)))
                 . self::formatField('60', strtoupper(substr($merchantCity, 0, 15)))
                 . $additionalData
                 . '6304';                                       // ID 63 + tamanho 04 para o CRC16

        // Calcula CRC16-CCITT
        $crc = self::calculateCrc16($payload);
        return $payload . $crc;
    }

    private static function formatField(string $id, string $value): string
    {
        $len = str_pad((string)strlen($value), 2, '0', STR_PAD_LEFT);
        return $id . $len . $value;
    }

    private static function calculateCrc16(string $data): string
    {
        $crc = 0xFFFF;
        $polynomial = 0x1021;

        $bytes = unpack('C*', $data);
        foreach ($bytes as $byte) {
            for ($i = 0; $i < 8; $i++) {
                $bit = (($byte >> (7 - $i)) & 1) === 1;
                $c15 = (($crc >> 15) & 1) === 1;
                $crc = ($crc << 1) & 0xFFFF;
                if ($c15 ^ $bit) {
                    $crc ^= $polynomial;
                }
            }
        }

        return strtoupper(str_pad(dechex($crc), 4, '0', STR_PAD_LEFT));
    }
}
