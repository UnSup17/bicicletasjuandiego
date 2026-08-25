-- ============================================================
--  BICICLETAS JUAN DIEGO — MySQL Schema
--  Versión: 1.0.0
--  Descripción: DDL completo para el sistema e-commerce con
--               gestión de inventario y panel admin.
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;

-- ------------------------------------------------------------
-- 1. CATEGORÍAS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categories` (
  `id`          INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(100)      NOT NULL,
  `slug`        VARCHAR(120)      NOT NULL UNIQUE,
  `description` TEXT,
  `icon`        VARCHAR(80)       DEFAULT 'tag',        -- nombre de ícono Lucide
  `sort_order`  TINYINT UNSIGNED  NOT NULL DEFAULT 0,
  `is_active`   TINYINT(1)        NOT NULL DEFAULT 1,
  `created_at`  DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_categories_slug` (`slug`),
  KEY `idx_categories_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Categorías iniciales
INSERT IGNORE INTO `categories` (`name`, `slug`, `icon`, `sort_order`) VALUES
  ('Bicicletas',      'bicicletas',       'bike',          1),
  ('Cascos',          'cascos',           'hard-hat',      2),
  ('Medias',          'medias',           'footprints',    3),
  ('Zapatos',         'zapatos',          'footprints',    4),
  ('Repuestos',       'repuestos',        'settings',      5),
  ('Jerseys',         'jerseys',          'shirt',         6),
  ('Badanas',         'badanas',          'circle',        7),
  ('Accesorios',      'accesorios',       'package',       8);


-- ------------------------------------------------------------
-- 2. PRODUCTOS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `products` (
  `id`             INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  `category_id`    INT UNSIGNED      NOT NULL,
  `name`           VARCHAR(200)      NOT NULL,
  `slug`           VARCHAR(220)      NOT NULL UNIQUE,
  `brand`          VARCHAR(100)      NOT NULL DEFAULT '',
  `reference`      VARCHAR(100)      NOT NULL DEFAULT '',
  `description`    TEXT,
  `price`          DECIMAL(12,2)     NOT NULL DEFAULT 0.00,
  `stock`          INT               NOT NULL DEFAULT 0,
  `is_active`      TINYINT(1)        NOT NULL DEFAULT 1,
  `is_featured`    TINYINT(1)        NOT NULL DEFAULT 0,
  `created_at`     DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_products_category` (`category_id`),
  KEY `idx_products_slug` (`slug`),
  KEY `idx_products_active` (`is_active`),
  KEY `idx_products_stock` (`stock`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ------------------------------------------------------------
-- 3. IMÁGENES DE PRODUCTO
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `product_images` (
  `id`            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `product_id`    INT UNSIGNED  NOT NULL,
  `url`           VARCHAR(500)  NOT NULL,
  `alt_text`      VARCHAR(200)  DEFAULT NULL,
  `display_order` TINYINT       NOT NULL DEFAULT 0,
  `is_primary`    TINYINT(1)    NOT NULL DEFAULT 0,
  `created_at`    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_images_product` (`product_id`),
  KEY `idx_images_primary` (`product_id`, `is_primary`),
  CONSTRAINT `fk_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ------------------------------------------------------------
-- 4. ESPECIFICACIONES DE PRODUCTO (EAV flexible)
--    Permite atributos distintos por categoría sin migraciones.
--    Ejemplos de spec_key: "rin", "talla_marco", "material",
--    "grupo_transmision", "frenos", "color", "garantia".
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `product_specifications` (
  `id`            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `product_id`    INT UNSIGNED  NOT NULL,
  `spec_key`      VARCHAR(80)   NOT NULL,
  `spec_label`    VARCHAR(120)  NOT NULL,   -- etiqueta legible: "Rin", "Talla de Marco"
  `spec_value`    VARCHAR(500)  NOT NULL,
  `display_order` TINYINT       NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_specs_product` (`product_id`),
  UNIQUE KEY `uq_specs_product_key` (`product_id`, `spec_key`),
  CONSTRAINT `fk_specs_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ------------------------------------------------------------
-- 5. USUARIOS ADMINISTRADORES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id`           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `email`        VARCHAR(255)  NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `name`         VARCHAR(150)  NOT NULL,
  `role`         ENUM('super_admin','admin','editor') NOT NULL DEFAULT 'admin',
  `is_active`    TINYINT(1)    NOT NULL DEFAULT 1,
  `last_login`   DATETIME      DEFAULT NULL,
  `created_at`   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_admin_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ------------------------------------------------------------
-- 6. REGISTRO DE MOVIMIENTOS DE STOCK
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `stock_logs` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id`     INT UNSIGNED    NOT NULL,
  `admin_user_id`  INT UNSIGNED    DEFAULT NULL,
  `previous_stock` INT             NOT NULL,
  `new_stock`      INT             NOT NULL,
  `change_delta`   INT             NOT NULL GENERATED ALWAYS AS (`new_stock` - `previous_stock`) STORED,
  `reason`         VARCHAR(255)    DEFAULT NULL,
  `created_at`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_stocklog_product` (`product_id`),
  KEY `idx_stocklog_admin` (`admin_user_id`),
  KEY `idx_stocklog_date` (`created_at`),
  CONSTRAINT `fk_stocklog_product`    FOREIGN KEY (`product_id`)    REFERENCES `products`    (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_stocklog_admin`      FOREIGN KEY (`admin_user_id`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- FIN DEL SCHEMA
-- ============================================================
