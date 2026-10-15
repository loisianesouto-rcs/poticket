<?php
declare(strict_types=1);

namespace POTicket\Database;

use PDO;
use PDOException;
use RuntimeException;

class Database
{
    private static ?PDO $instance = null;

    public static function getConnection(): PDO
    {
        if (self::$instance === null) {
            $host = getenv('DB_HOST') ?: '127.0.0.1';
            $port = getenv('DB_PORT') ?: '3306';
            $dbName = getenv('DB_NAME') ?: 'poticket';
            $user = getenv('DB_USER') ?: 'root';
            $password = getenv('DB_PASS') ?: '';

            $dsn = "mysql:host={$host};port={$port};dbname={$dbName};charset=utf8mb4";
            
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
            ];

            try {
                self::$instance = new PDO($dsn, $user, $password, $options);
            } catch (PDOException $e) {
                // Registro seguro em log interno sem expor credenciais ao usuário
                error_log("Database connection error: " . $e->getMessage());
                throw new RuntimeException("Falha ao conectar com o serviço de dados com segurança.");
            }
        }

        return self::$instance;
    }
}
