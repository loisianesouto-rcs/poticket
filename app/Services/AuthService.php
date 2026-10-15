<?php
declare(strict_types=1);

namespace POTicket\Services;

use DateTimeImmutable;
use InvalidArgumentException;
use POTicket\Database\Database;
use PDO;

class AuthService
{
    /**
     * Valida matematicamente um CPF brasileiro com cálculo dos dois dígitos verificadores
     */
    public static function validateCpf(string $cpf): bool
    {
        $clean = preg_replace('/[^0-9]/', '', $cpf);

        if (strlen($clean) !== 11) {
            return false;
        }

        // Impede sequências repetidas conhecidas (111.111.111-11, etc.)
        if (preg_match('/^(\d)\1{10}$/', $clean)) {
            return false;
        }

        // Primeiro dígito
        $sum = 0;
        for ($i = 0; $i < 9; $i++) {
            $sum += (int)$clean[$i] * (10 - $i);
        }
        $remainder = $sum % 11;
        $d1 = ($remainder < 2) ? 0 : 11 - $remainder;
        if ((int)$clean[9] !== $d1) {
            return false;
        }

        // Segundo dígito
        $sum = 0;
        for ($i = 0; $i < 10; $i++) {
            $sum += (int)$clean[$i] * (11 - $i);
        }
        $remainder = $sum % 11;
        $d2 = ($remainder < 2) ? 0 : 11 - $remainder;
        return (int)$clean[10] === $d2;
    }

    /**
     * Valida se a pessoa tem no mínimo 18 anos completos na data atual
     */
    public static function validateAdult(string $birthDateStr): bool
    {
        $birthDate = DateTimeImmutable::createFromFormat('Y-m-d', $birthDateStr);
        if (!$birthDate) {
            return false;
        }

        $today = new DateTimeImmutable('today');
        $age = $today->diff($birthDate)->y;

        return $age >= 18;
    }

    /**
     * Busca usuário por CPF sanitizado
     */
    public function findUserByCpf(string $cpf): ?array
    {
        $cleanCpf = preg_replace('/[^0-9]/', '', $cpf);
        $db = Database::getConnection();

        $stmt = $db->prepare('SELECT id, name, cpf, email, birth_date, role, password_hash, biometric_enabled FROM users WHERE cpf = :cpf LIMIT 1');
        $stmt->execute([':cpf' => $cleanCpf]);
        $user = $stmt->fetch();

        return $user ?: null;
    }

    /**
     * Validação da senha no segundo passo do login
     */
    public function verifyPassword(string $inputPassword, string $hash): bool
    {
        return password_verify($inputPassword, $hash);
    }

    /**
     * Registro completo do usuário com todas as regras de negócio
     */
    public function registerUser(array $data): array
    {
        $cleanCpf = preg_replace('/[^0-9]/', '', $data['cpf'] ?? '');
        if (!self::validateCpf($cleanCpf)) {
            throw new InvalidArgumentException('CPF informado é inválido.');
        }

        if (!self::validateAdult($data['birth_date'] ?? '')) {
            throw new InvalidArgumentException('É obrigatório ter no mínimo 18 anos completos para criar uma conta.');
        }

        if (empty($data['name']) || strlen(trim($data['name'])) < 3) {
            throw new InvalidArgumentException('Nome completo é obrigatório.');
        }

        if (!filter_var($data['email'] ?? '', FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException('E-mail informado é inválido.');
        }

        if (empty($data['password']) || strlen($data['password']) < 6) {
            throw new InvalidArgumentException('A senha deve possuir pelo menos 6 caracteres.');
        }

        if ($data['password'] !== ($data['confirm_password'] ?? '')) {
            throw new InvalidArgumentException('A confirmação da senha não confere.');
        }

        $db = Database::getConnection();

        // Checar duplicidade de CPF ou E-mail
        $stmt = $db->prepare('SELECT id FROM users WHERE cpf = :cpf OR email = :email LIMIT 1');
        $stmt->execute([':cpf' => $cleanCpf, ':email' => strtolower(trim($data['email']))]);
        if ($stmt->fetch()) {
            throw new InvalidArgumentException('Já existe uma conta cadastrada com este CPF ou e-mail.');
        }

        $passwordHash = password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 12]);
        $cleanCep = preg_replace('/[^0-9]/', '', $data['cep'] ?? '');

        $insertSql = 'INSERT INTO users 
            (name, cpf, email, birth_date, phone, password_hash, role, cep, street, number, complement, neighborhood, city, state)
            VALUES 
            (:name, :cpf, :email, :birth_date, :phone, :password_hash, :role, :cep, :street, :number, :complement, :neighborhood, :city, :state)';

        $insertStmt = $db->prepare($insertSql);
        $role = ($data['role'] ?? 'customer') === 'producer' ? 'producer' : 'customer';

        $insertStmt->execute([
            ':name' => trim($data['name']),
            ':cpf' => $cleanCpf,
            ':email' => strtolower(trim($data['email'])),
            ':birth_date' => $data['birth_date'],
            ':phone' => $data['phone'] ?? null,
            ':password_hash' => $passwordHash,
            ':role' => $role,
            ':cep' => $cleanCep,
            ':street' => $data['street'] ?? '',
            ':number' => $data['number'] ?? '',
            ':complement' => $data['complement'] ?? null,
            ':neighborhood' => $data['neighborhood'] ?? '',
            ':city' => $data['city'] ?? '',
            ':state' => strtoupper(substr($data['state'] ?? 'RN', 0, 2))
        ]);

        $newId = (int)$db->lastInsertId();

        return [
            'id' => $newId,
            'name' => trim($data['name']),
            'email' => strtolower(trim($data['email'])),
            'role' => $role
        ];
    }
}
