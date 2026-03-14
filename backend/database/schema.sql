-- ============================================
-- Database Schema untuk Aplikasi Catatan Warung
-- ============================================

-- Buat database baru
CREATE DATABASE IF NOT EXISTS catatan_warung;
USE catatan_warung;

-- ============================================
-- 1. Tabel Users (Kasir & Admin)
-- ============================================
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'kasir', 'owner') DEFAULT 'kasir',
    phone VARCHAR(20),
    email VARCHAR(100),
    avatar VARCHAR(255),
    banner VARCHAR(255),
    gender ENUM('Laki-laki', 'Perempuan'),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. Tabel Categories (Kategori Produk)
-- ============================================
CREATE TABLE categories (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(20),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. Tabel Products (Produk/Barang)
-- ============================================
CREATE TABLE products (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    barcode VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    category_id VARCHAR(36) NOT NULL,
    buy_price DECIMAL(15,2) NOT NULL DEFAULT 0,
    sell_price DECIMAL(15,2) NOT NULL DEFAULT 0,
    stock INT NOT NULL DEFAULT 0,
    min_stock INT NOT NULL DEFAULT 10,
    unit VARCHAR(20) DEFAULT 'pcs',
    image LONGTEXT,
    expiry_date DATE,
    supplier VARCHAR(100),
    sales_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    INDEX idx_barcode (barcode),
    INDEX idx_name (name),
    INDEX idx_category (category_id),
    INDEX idx_stock (stock),
    INDEX idx_sales_count (sales_count)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. Tabel Customers (Pelanggan/Warga)
-- ============================================
CREATE TABLE customers (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    address TEXT,
    email VARCHAR(100),
    loyalty_points INT DEFAULT 0,
    total_spent DECIMAL(15,2) DEFAULT 0,
    total_transactions INT DEFAULT 0,
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_visit TIMESTAMP,
    avatar VARCHAR(255),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_phone (phone),
    INDEX idx_loyalty (loyalty_points)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. Tabel Transactions (Transaksi)
-- ============================================
CREATE TABLE transactions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id VARCHAR(36),
    customer_name VARCHAR(100) NOT NULL,
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
    discount DECIMAL(15,2) DEFAULT 0,
    tax DECIMAL(15,2) DEFAULT 0,
    total DECIMAL(15,2) NOT NULL,
    payment_method ENUM('cash', 'transfer', 'e-wallet', 'qris', 'credit') NOT NULL DEFAULT 'cash',
    amount_paid DECIMAL(15,2) NOT NULL,
    change_amount DECIMAL(15,2) DEFAULT 0,
    status ENUM('completed', 'refunded', 'pending') DEFAULT 'completed',
    cashier VARCHAR(100) NOT NULL,
    user_id VARCHAR(36),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_invoice (invoice_number),
    INDEX idx_customer (customer_id),
    INDEX idx_status (status),
    INDEX idx_payment (payment_method),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. Tabel Transaction Items (Detail Item Transaksi)
-- ============================================
CREATE TABLE transaction_items (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    transaction_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36),
    product_name VARCHAR(200) NOT NULL,
    qty INT NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    subtotal DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    INDEX idx_transaction (transaction_id),
    INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. Tabel Debts (Hutang Piutang)
-- ============================================
CREATE TABLE debts (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    customer_id VARCHAR(36) NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    paid_amount DECIMAL(15,2) DEFAULT 0,
    remaining DECIMAL(15,2) NOT NULL,
    items TEXT,
    due_date DATE,
    status ENUM('overdue', 'unpaid', 'partial', 'paid') DEFAULT 'unpaid',
    reminder_sent BOOLEAN DEFAULT FALSE,
    transaction_id VARCHAR(36),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL,
    INDEX idx_customer (customer_id),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. Tabel Debt Payments (Pembayaran Hutang)
-- ============================================
CREATE TABLE debt_payments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    debt_id VARCHAR(36) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payment_method ENUM('cash', 'transfer', 'e-wallet', 'qris') DEFAULT 'cash',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (debt_id) REFERENCES debts(id) ON DELETE CASCADE,
    INDEX idx_debt (debt_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9. Tabel Stock History (Riwayat Perubahan Stok)
-- ============================================
CREATE TABLE stock_history (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    product_id VARCHAR(36) NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    type ENUM('in', 'out', 'adjustment') NOT NULL,
    quantity INT NOT NULL,
    before_stock INT NOT NULL,
    after_stock INT NOT NULL,
    reference_type ENUM('transaction', 'restock', 'adjustment', 'refund'),
    reference_id VARCHAR(36),
    notes TEXT,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product (product_id),
    INDEX idx_type (type),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 10. Tabel Notifications (Notifikasi)
-- ============================================
CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    type ENUM('low_stock', 'debt_reminder', 'system', 'info') NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    link VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    user_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_type (type),
    INDEX idx_read (is_read),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 11. Tabel Settings (Pengaturan Aplikasi)
-- ============================================
CREATE TABLE settings (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    key_name VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (key_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: Update stock saat transaksi
DELIMITER $$
CREATE TRIGGER after_transaction_item_insert
AFTER INSERT ON transaction_items
FOR EACH ROW
BEGIN
    -- Kurangi stok produk
    UPDATE products 
    SET stock = stock - NEW.qty,
        sales_count = sales_count + NEW.qty
    WHERE id = NEW.product_id;
    
    -- Log ke stock history
    INSERT INTO stock_history (product_id, product_name, type, quantity, before_stock, after_stock, reference_type, reference_id)
    SELECT 
        NEW.product_id,
        NEW.product_name,
        'out',
        NEW.qty,
        stock + NEW.qty,
        stock,
        'transaction',
        NEW.transaction_id
    FROM products WHERE id = NEW.product_id;
END$$
DELIMITER ;

-- Trigger: Update total spent customer
DELIMITER $$
CREATE TRIGGER after_transaction_insert
AFTER INSERT ON transactions
FOR EACH ROW
BEGIN
    IF NEW.status = 'completed' AND NEW.customer_id IS NOT NULL THEN
        UPDATE customers 
        SET total_spent = total_spent + NEW.total,
            total_transactions = total_transactions + 1,
            last_visit = NEW.created_at
        WHERE id = NEW.customer_id;
    END IF;
END$$
DELIMITER ;

-- Trigger: Update status hutang saat pembayaran
DELIMITER $$
CREATE TRIGGER after_debt_payment_insert
AFTER INSERT ON debt_payments
FOR EACH ROW
BEGIN
    DECLARE new_paid DECIMAL(15,2);
    DECLARE debt_amount DECIMAL(15,2);
    
    SELECT amount INTO debt_amount FROM debts WHERE id = NEW.debt_id;
    
    UPDATE debts 
    SET paid_amount = paid_amount + NEW.amount,
        remaining = amount - (paid_amount + NEW.amount)
    WHERE id = NEW.debt_id;
    
    -- Update status
    SELECT paid_amount INTO new_paid FROM debts WHERE id = NEW.debt_id;
    
    UPDATE debts 
    SET status = CASE 
        WHEN new_paid >= debt_amount THEN 'paid'
        WHEN new_paid > 0 THEN 'partial'
        ELSE status
    END
    WHERE id = NEW.debt_id;
END$$
DELIMITER ;

-- Trigger: Cek low stock dan buat notifikasi
DELIMITER $$
CREATE TRIGGER after_stock_update
AFTER UPDATE ON products
FOR EACH ROW
BEGIN
    IF NEW.stock <= NEW.min_stock AND OLD.stock > NEW.min_stock THEN
        INSERT INTO notifications (type, title, message, priority)
        VALUES (
            'low_stock',
            'Stok Hampir Habis',
            CONCAT('Produk "', NEW.name, '" stok tersisa ', NEW.stock, ' ', NEW.unit),
            'high'
        );
    END IF;
END$$
DELIMITER ;

-- ============================================
-- VIEWS untuk Dashboard & Reports
-- ============================================

-- View: Dashboard Summary
CREATE OR REPLACE VIEW v_dashboard_summary AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_transactions,
    SUM(total) as total_revenue,
    SUM(total - subtotal + discount) as total_tax,
    COUNT(DISTINCT customer_id) as unique_customers
FROM transactions
WHERE status = 'completed'
GROUP BY DATE(created_at);

-- View: Low Stock Products
CREATE OR REPLACE VIEW v_low_stock_products AS
SELECT 
    p.id,
    p.name,
    p.barcode,
    p.stock,
    p.min_stock,
    p.unit,
    c.name as category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.stock <= p.min_stock AND p.is_active = TRUE
ORDER BY p.stock ASC;

-- View: Top Selling Products
CREATE OR REPLACE VIEW v_top_selling_products AS
SELECT 
    p.id,
    p.name,
    p.barcode,
    p.sell_price,
    p.stock,
    p.sales_count,
    c.name as category_name,
    (p.sell_price - p.buy_price) as profit_per_unit
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.is_active = TRUE
ORDER BY p.sales_count DESC
LIMIT 20;

-- View: Customer Debt Summary
CREATE OR REPLACE VIEW v_customer_debt_summary AS
SELECT 
    c.id,
    c.name,
    c.phone,
    COUNT(d.id) as total_debts,
    SUM(d.amount) as total_debt_amount,
    SUM(d.remaining) as total_remaining,
    SUM(CASE WHEN d.status = 'overdue' THEN 1 ELSE 0 END) as overdue_count
FROM customers c
LEFT JOIN debts d ON c.id = d.customer_id
WHERE d.status IN ('unpaid', 'partial', 'overdue')
GROUP BY c.id, c.name, c.phone;
