-- =====================================================================
-- POTICKET DATABASE SCHEMA - MySQL 8.0+ / MariaDB 10.5+
-- Padrão de Engenharia Sênior: ACID, UTF8mb4, Índices, Constraints
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `poticket` 
  DEFAULT CHARACTER SET utf8mb4 
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `poticket`;

SET foreign_key_checks = 0;
DROP TABLE IF EXISTS `tickets`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `payment_methods`;
DROP TABLE IF EXISTS `event_batches`;
DROP TABLE IF EXISTS `events`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `password_resets`;
DROP TABLE IF EXISTS `users`;
SET foreign_key_checks = 1;

-- ---------------------------------------------------------------------
-- 1. TABELA DE USUÁRIOS (Clientes e Produtores)
-- ---------------------------------------------------------------------
CREATE TABLE `users` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `cpf` VARCHAR(14) NOT NULL UNIQUE,
  `email` VARCHAR(180) NOT NULL UNIQUE,
  `birth_date` DATE NOT NULL,
  `phone` VARCHAR(20) NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('customer', 'producer', 'admin') NOT NULL DEFAULT 'customer',
  -- Endereço
  `cep` VARCHAR(9) NOT NULL,
  `street` VARCHAR(180) NOT NULL,
  `number` VARCHAR(30) NOT NULL,
  `complement` VARCHAR(100) NULL,
  `neighborhood` VARCHAR(100) NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `state` CHAR(2) NOT NULL,
  -- Autenticação Biométrica e Google
  `google_id` VARCHAR(100) NULL UNIQUE,
  `biometric_public_key` TEXT NULL,
  `biometric_enabled` TINYINT(1) NOT NULL DEFAULT 0,
  -- Auditoria e Controle
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_cpf` (`cpf`),
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 2. RECUPERAÇÃO DE SENHA (Tokens Seguros)
-- ---------------------------------------------------------------------
CREATE TABLE `password_resets` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(180) NOT NULL,
  `token_hash` VARCHAR(64) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `used` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_resets_token` (`token_hash`),
  INDEX `idx_resets_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 3. CATEGORIAS DE EVENTOS
-- ---------------------------------------------------------------------
CREATE TABLE `categories` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(80) NOT NULL UNIQUE,
  `slug` VARCHAR(80) NOT NULL UNIQUE,
  `icon` VARCHAR(50) NOT NULL DEFAULT 'bi-tag',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 4. EVENTOS
-- ---------------------------------------------------------------------
CREATE TABLE `events` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `producer_id` BIGINT UNSIGNED NOT NULL,
  `category_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `slug` VARCHAR(220) NOT NULL UNIQUE,
  `description` TEXT NOT NULL,
  `image_url` VARCHAR(500) NOT NULL,
  `start_date` DATETIME NOT NULL,
  `end_date` DATETIME NULL,
  `venue_name` VARCHAR(150) NOT NULL,
  `cep` VARCHAR(9) NOT NULL,
  `street` VARCHAR(180) NOT NULL,
  `number` VARCHAR(30) NOT NULL,
  `neighborhood` VARCHAR(100) NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `state` CHAR(2) NOT NULL,
  `pix_key` VARCHAR(120) NOT NULL,
  `status` ENUM('draft', 'published', 'sold_out', 'finished', 'cancelled') NOT NULL DEFAULT 'published',
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`producer_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT,
  INDEX `idx_events_city` (`city`),
  INDEX `idx_events_category` (`category_id`),
  INDEX `idx_events_status_date` (`status`, `start_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 5. LOTES DE INGRESSOS (Batches)
-- ---------------------------------------------------------------------
CREATE TABLE `event_batches` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `event_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(100) NOT NULL, -- Ex: '1º Lote Pista', 'VIP Open Bar'
  `price` DECIMAL(10, 2) NOT NULL,
  `total_quantity` INT UNSIGNED NOT NULL,
  `sold_quantity` INT UNSIGNED NOT NULL DEFAULT 0,
  `start_sales` DATETIME NULL,
  `end_sales` DATETIME NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  INDEX `idx_batches_event` (`event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 6. FORMAS DE PAGAMENTO SALVAS
-- ---------------------------------------------------------------------
CREATE TABLE `payment_methods` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `type` ENUM('credit_card', 'pix') NOT NULL,
  `card_brand` VARCHAR(30) NULL,
  `card_last4` CHAR(4) NULL,
  `card_holder` VARCHAR(150) NULL,
  `token` VARCHAR(255) NOT NULL,
  `is_default` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 7. PEDIDOS (Orders)
-- ---------------------------------------------------------------------
CREATE TABLE `orders` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `order_code` VARCHAR(32) NOT NULL UNIQUE,
  `total_amount` DECIMAL(10, 2) NOT NULL,
  `payment_method` ENUM('pix', 'credit_card') NOT NULL,
  `status` ENUM('pending', 'paid', 'cancelled', 'refunded') NOT NULL DEFAULT 'pending',
  `pix_code` TEXT NULL,
  `pix_qr_code` TEXT NULL,
  `pix_expires_at` DATETIME NULL,
  `paid_at` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  INDEX `idx_orders_user` (`user_id`),
  INDEX `idx_orders_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 8. INGRESSOS EMITIDOS (Tickets)
-- ---------------------------------------------------------------------
CREATE TABLE `tickets` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_id` BIGINT UNSIGNED NOT NULL,
  `event_id` BIGINT UNSIGNED NOT NULL,
  `batch_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `ticket_code` VARCHAR(40) NOT NULL UNIQUE,
  `qr_code_hash` VARCHAR(120) NOT NULL UNIQUE,
  `status` ENUM('valid', 'used', 'cancelled') NOT NULL DEFAULT 'valid',
  `used_at` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`batch_id`) REFERENCES `event_batches` (`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  INDEX `idx_tickets_user` (`user_id`),
  INDEX `idx_tickets_qr` (`qr_code_hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 9. AUDITORIA E LOGS DO SISTEMA
-- ---------------------------------------------------------------------
CREATE TABLE `audit_logs` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NULL,
  `action` VARCHAR(80) NOT NULL,
  `entity` VARCHAR(80) NOT NULL,
  `entity_id` BIGINT UNSIGNED NULL,
  `details` JSON NULL,
  `ip_address` VARCHAR(45) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_audit_user` (`user_id`),
  INDEX `idx_audit_action` (`action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- DADOS INICIAIS (Seeds)
-- ---------------------------------------------------------------------
INSERT INTO `categories` (`name`, `slug`, `icon`) VALUES
('Shows', 'shows', 'bi-music-note-beamed'),
('Congressos', 'congressos', 'bi-mic-fill'),
('Corridas', 'corridas', 'bi-trophy-fill'),
('Festas', 'festas', 'bi-balloon-fill'),
('Teatro & Cultura', 'teatro', 'bi-mask');
