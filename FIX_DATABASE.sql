-- ========================================
-- ARREGLAR CAMPOS FALTANTES EN MODELOS
-- ========================================

USE swarco_ops;

-- 1. Agregar campos faltantes a SpareRequest (tabla: repuestos)
ALTER TABLE repuestos ADD COLUMN IF NOT EXISTS titulo VARCHAR(120) AFTER userId;

-- 2. Agregar campos faltantes a PurchaseRequest (tabla: compras)
ALTER TABLE compras ADD COLUMN IF NOT EXISTS titulo VARCHAR(120) AFTER userId;
ALTER TABLE compras ADD COLUMN IF NOT EXISTS proyecto VARCHAR(120) AFTER titulo;
ALTER TABLE compras ADD COLUMN IF NOT EXISTS pais VARCHAR(120) AFTER proyecto;

-- ========================================
-- CREAR ÍNDICES CRÍTICOS
-- ========================================

-- Usuarios
CREATE INDEX IF NOT EXISTS idx_users_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_users_usuario ON usuarios(usuario);
CREATE INDEX IF NOT EXISTS idx_users_userRole ON usuarios(userRole);

-- Tickets
CREATE INDEX IF NOT EXISTS idx_fallas_userId ON fallas(userId);
CREATE INDEX IF NOT EXISTS idx_fallas_createdAt ON fallas(createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_repuestos_userId ON repuestos(userId);
CREATE INDEX IF NOT EXISTS idx_compras_userId ON compras(userId);
CREATE INDEX IF NOT EXISTS idx_assistance_userId ON assistance_requests(userId);

-- Equipos
CREATE INDEX IF NOT EXISTS idx_failure_equipment_failureId ON fallas_equipos(failureId);
CREATE INDEX IF NOT EXISTS idx_failure_equipment_serial ON fallas_equipos(serial);
CREATE INDEX IF NOT EXISTS idx_spare_items_spareRequestId ON spare_items(spareRequestId);
CREATE INDEX IF NOT EXISTS idx_spare_items_serial ON spare_items(serial);
CREATE INDEX IF NOT EXISTS idx_purchase_equipment_purchaseRequestId ON purchase_equipments(purchaseRequestId);

-- Ticket Status (CRÍTICO PARA PERFORMANCE)
CREATE INDEX IF NOT EXISTS idx_ticket_status_ticket ON ticket_statuses(ticketId, ticketType);
CREATE INDEX IF NOT EXISTS idx_ticket_status_status ON ticket_statuses(status);
CREATE INDEX IF NOT EXISTS idx_ticket_status_createdAt ON ticket_statuses(createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_ticket_status_assignedTo ON ticket_statuses(assignedTo);
CREATE INDEX IF NOT EXISTS idx_ticket_status_changedBy ON ticket_statuses(changedBy);

-- Ticket Comments (CRÍTICO PARA PERFORMANCE)
CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket ON ticket_comments(ticketId, ticketType);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_createdAt ON ticket_comments(createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_userId ON ticket_comments(userId);

-- API Keys
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(`key`);

-- ========================================
-- VERIFICAR RESULTADOS
-- ========================================

SELECT 'TABLAS ACTUALIZADAS:' AS resultado;
SHOW COLUMNS FROM repuestos LIKE 'titulo';
SHOW COLUMNS FROM compras LIKE 'titulo';
SHOW COLUMNS FROM compras LIKE 'proyecto';
SHOW COLUMNS FROM compras LIKE 'pais';

SELECT 'ÍNDICES CREADOS:' AS resultado;
SHOW INDEX FROM usuarios WHERE Key_name LIKE 'idx_%';
SHOW INDEX FROM fallas WHERE Key_name LIKE 'idx_%';
SHOW INDEX FROM ticket_statuses WHERE Key_name LIKE 'idx_%';
SHOW INDEX FROM ticket_comments WHERE Key_name LIKE 'idx_%';
