-- ============================================
-- Sample Data untuk Testing
-- ============================================

USE catatan_warung;

-- ============================================
-- 1. Insert Users
-- ============================================
INSERT INTO users (id, name, username, password, role, phone, email) VALUES
('user-001', 'Admin Warung', 'admin', '$2b$10$YourHashedPasswordHere', 'admin', '081234567890', 'admin@warung.com'),
('user-002', 'Kasir 1', 'kasir1', '$2b$10$YourHashedPasswordHere', 'kasir', '081234567891', 'kasir1@warung.com'),
('user-003', 'Kasir 2', 'kasir2', '$2b$10$YourHashedPasswordHere', 'kasir', '081234567892', 'kasir2@warung.com');

-- ============================================
-- 2. Insert Categories
-- ============================================
INSERT INTO categories (id, name, icon, color, description) VALUES
('cat-1', 'Makanan', 'utensils', '#10B981', 'Produk makanan dan cemilan'),
('cat-2', 'Minuman', 'coffee', '#3B82F6', 'Minuman segar dan kemasan'),
('cat-3', 'Kebutuhan Rumah', 'home', '#F59E0B', 'Sabun, deterjen, dll'),
('cat-4', 'Rokok', 'cigarette', '#EF4444', 'Rokok berbagai merek'),
('cat-5', 'Bumbu Dapur', 'cooking', '#8B5CF6', 'Bumbu masakan'),
('cat-6', 'Alat Tulis', 'pen-tool', '#EC4899', 'ATK dan perlengkapan sekolah');

-- ============================================
-- 3. Insert Products
-- ============================================
INSERT INTO products (id, barcode, name, category_id, buy_price, sell_price, stock, min_stock, unit, supplier) VALUES
-- Makanan
('prod-001', '8992761111111', 'Indomie Goreng', 'cat-1', 2500, 3000, 150, 20, 'pcs', 'PT Indofood'),
('prod-002', '8992761111112', 'Indomie Soto', 'cat-1', 2500, 3000, 100, 20, 'pcs', 'PT Indofood'),
('prod-003', '8992761111113', 'Mie Sedaap Goreng', 'cat-1', 2400, 2800, 80, 20, 'pcs', 'PT Wings'),
('prod-004', '8992761222111', 'Beng Beng', 'cat-1', 1500, 2000, 50, 20, 'pcs', 'PT Mayora'),
('prod-005', '8992761222112', 'Tango Wafer', 'cat-1', 1200, 1500, 60, 20, 'pcs', 'PT Mayora'),
('prod-006', '8992761222113', 'Oreo Original', 'cat-1', 8000, 10000, 30, 10, 'pcs', 'PT Mondelez'),
-- Minuman
('prod-007', '8992761333111', 'Aqua 600ml', 'cat-2', 2500, 3500, 200, 30, 'pcs', 'PT Aqua Danone'),
('prod-008', '8992761333112', 'Teh Botol Sosro', 'cat-2', 3500, 4500, 120, 30, 'pcs', 'PT Sinar Sosro'),
('prod-009', '8992761333113', 'Coca Cola 390ml', 'cat-2', 4000, 5500, 90, 20, 'pcs', 'PT Coca Cola'),
('prod-010', '8992761333114', 'Fanta Orange', 'cat-2', 4000, 5500, 75, 20, 'pcs', 'PT Coca Cola'),
('prod-011', '8992761333115', 'Kopi Kapal Api Susu', 'cat-2', 1800, 2500, 100, 30, 'sachet', 'PT Kapal Api'),
-- Kebutuhan Rumah
('prod-012', '8992761444111', 'Rinso Deterjen 800g', 'cat-3', 15000, 19000, 40, 10, 'pcs', 'PT Unilever'),
('prod-013', '8992761444112', 'Soklin Liquid 800ml', 'cat-3', 18000, 23000, 35, 10, 'pcs', 'PT Wings'),
('prod-014', '8992761444113', 'Sunlight Lime 800ml', 'cat-3', 12000, 15000, 50, 15, 'pcs', 'PT Unilever'),
('prod-015', '8992761444114', 'Molto Pelembut 900ml', 'cat-3', 16000, 20000, 30, 10, 'pcs', 'PT Unilever'),
-- Rokok
('prod-016', '8992761555111', 'Sampoerna Mild 16', 'cat-4', 22000, 25000, 100, 20, 'bungkus', 'PT HM Sampoerna'),
('prod-017', '8992761555112', 'Djarum Super 16', 'cat-4', 20000, 23000, 80, 20, 'bungkus', 'PT Djarum'),
('prod-018', '8992761555113', 'Gudang Garam Filter', 'cat-4', 19000, 22000, 70, 15, 'bungkus', 'PT Gudang Garam'),
-- Bumbu Dapur
('prod-019', '8992761666111', 'Royco Ayam', 'cat-5', 500, 800, 200, 50, 'sachet', 'PT Unilever'),
('prod-020', '8992761666112', 'Masako Sapi', 'cat-5', 500, 800, 180, 50, 'sachet', 'PT Ajinomoto'),
('prod-021', '8992761666113', 'Bango Kecap Manis 220ml', 'cat-5', 8000, 11000, 45, 15, 'botol', 'PT Unilever'),
('prod-022', '8992761666114', 'Garam Bata 250g', 'cat-5', 2000, 3000, 100, 30, 'bungkus', 'PT Garam'),
-- Alat Tulis
('prod-023', '8992761777111', 'Pulpen Standard AE7', 'cat-6', 1500, 2500, 60, 20, 'pcs', 'PT Standard'),
('prod-024', '8992761777112', 'Buku Tulis 38 Lembar', 'cat-6', 2500, 3500, 80, 25, 'pcs', 'PT Sinar Dunia'),
('prod-025', '8992761777113', 'Pensil 2B Faber Castell', 'cat-6', 2000, 3000, 50, 20, 'pcs', 'PT Faber Castell');

-- ============================================
-- 4. Insert Customers
-- ============================================
INSERT INTO customers (id, name, phone, address, loyalty_points, total_spent, total_transactions, notes) VALUES
('cust-001', 'Ibu Siti', '081234560001', 'Jl. Mawar No. 12', 50, 250000, 15, 'Pelanggan setia, sering beli rokok'),
('cust-002', 'Pak Budi', '081234560002', 'Jl. Melati No. 5', 30, 150000, 10, 'Suka beli mie instan'),
('cust-003', 'Ibu Ani', '081234560003', 'Jl. Anggrek No. 8', 80, 450000, 25, 'VIP customer'),
('cust-004', 'Pak Joko', '081234560004', 'Jl. Kenanga No. 3', 20, 90000, 5, ''),
('cust-005', 'Ibu Dewi', '081234560005', 'Jl. Dahlia No. 15', 45, 220000, 12, 'Biasa beli kebutuhan rumah'),
('cust-006', 'Pak Ahmad', '081234560006', 'Jl. Flamboyan No. 7', 10, 50000, 3, ''),
('cust-007', 'Ibu Ratna', '081234560007', 'Jl. Sakura No. 21', 60, 320000, 18, 'Pelanggan lama'),
('cust-008', 'Pak Dedi', '081234560008', 'Jl. Cempaka No. 9', 15, 75000, 4, ''),
('cust-009', 'Ibu Yanti', '081234560009', 'Jl. Tulip No. 11', 40, 180000, 9, ''),
('cust-010', 'Pak Rahman', '081234560010', 'Jl. Matahari No. 6', 25, 125000, 7, 'Kadang hutang');

-- ============================================
-- 5. Insert Sample Transactions (Hari ini)
-- ============================================
INSERT INTO transactions (id, invoice_number, customer_id, customer_name, subtotal, discount, tax, total, payment_method, amount_paid, change_amount, status, cashier, user_id) VALUES
('trx-001', 'INV-2026021301', 'cust-001', 'Ibu Siti', 28000, 0, 0, 28000, 'cash', 30000, 2000, 'completed', 'Kasir 1', 'user-002'),
('trx-002', 'INV-2026021302', 'cust-002', 'Pak Budi', 15000, 0, 0, 15000, 'cash', 20000, 5000, 'completed', 'Kasir 1', 'user-002'),
('trx-003', 'INV-2026021303', 'cust-003', 'Ibu Ani', 45500, 500, 0, 45000, 'e-wallet', 45000, 0, 'completed', 'Kasir 2', 'user-003'),
('trx-004', 'INV-2026021304', NULL, 'Umum', 12000, 0, 0, 12000, 'cash', 12000, 0, 'completed', 'Kasir 1', 'user-002'),
('trx-005', 'INV-2026021305', 'cust-005', 'Ibu Dewi', 38000, 0, 0, 38000, 'transfer', 38000, 0, 'completed', 'Kasir 2', 'user-003');

-- Transaction Items untuk transaksi di atas
INSERT INTO transaction_items (id, transaction_id, product_id, product_name, qty, price, subtotal) VALUES
-- Transaction 1: Ibu Siti
('item-001', 'trx-001', 'prod-016', 'Sampoerna Mild 16', 1, 25000, 25000),
('item-002', 'trx-001', 'prod-009', 'Coca Cola 390ml', 1, 5500, 5500),
-- Transaction 2: Pak Budi
('item-003', 'trx-002', 'prod-001', 'Indomie Goreng', 5, 3000, 15000),
-- Transaction 3: Ibu Ani
('item-004', 'trx-003', 'prod-012', 'Rinso Deterjen 800g', 1, 19000, 19000),
('item-005', 'trx-003', 'prod-014', 'Sunlight Lime 800ml', 1, 15000, 15000),
('item-006', 'trx-003', 'prod-021', 'Bango Kecap Manis 220ml', 1, 11000, 11000),
-- Transaction 4: Umum
('item-007', 'trx-004', 'prod-007', 'Aqua 600ml', 2, 3500, 7000),
('item-008', 'trx-004', 'prod-008', 'Teh Botol Sosro', 1, 4500, 4500),
-- Transaction 5: Ibu Dewi
('item-009', 'trx-005', 'prod-015', 'Molto Pelembut 900ml', 1, 20000, 20000),
('item-010', 'trx-005', 'prod-013', 'Soklin Liquid 800ml', 1, 23000, 23000);

-- ============================================
-- 6. Insert Sample Debts
-- ============================================
INSERT INTO debts (id, customer_id, customer_name, amount, paid_amount, remaining, items, due_date, status, transaction_id) VALUES
('debt-001', 'cust-010', 'Pak Rahman', 50000, 20000, 30000, 'Rokok dan Mie', '2026-02-20', 'partial', NULL),
('debt-002', 'cust-004', 'Pak Joko', 35000, 0, 35000, 'Kebutuhan Rumah', '2026-02-18', 'unpaid', NULL),
('debt-003', 'cust-001', 'Ibu Siti', 25000, 0, 25000, 'Rokok', '2026-02-10', 'overdue', NULL);

-- Debt Payments
INSERT INTO debt_payments (id, debt_id, amount, payment_method, notes) VALUES
('pay-001', 'debt-001', 10000, 'cash', 'Cicilan pertama'),
('pay-002', 'debt-001', 10000, 'cash', 'Cicilan kedua');

-- ============================================
-- 7. Insert Sample Notifications
-- ============================================
INSERT INTO notifications (type, title, message, priority, is_read) VALUES
('low_stock', 'Stok Hampir Habis', 'Produk "Oreo Original" stok tersisa 30 pcs', 'high', FALSE),
('low_stock', 'Stok Hampir Habis', 'Produk "Pensil 2B Faber Castell" stok tersisa 50 pcs', 'medium', FALSE),
('debt_reminder', 'Hutang Jatuh Tempo', 'Ibu Siti memiliki hutang yang lewat jatuh tempo', 'high', FALSE),
('info', 'Selamat Datang', 'Aplikasi Catatan Warung berhasil disetup', 'low', TRUE);

-- ============================================
-- 8. Insert Settings
-- ============================================
INSERT INTO settings (key_name, value, description) VALUES
('app_name', 'Warung Berkah', 'Nama toko'),
('app_address', 'Jl. Raya Soekarno-Hatta No. 45, Malang', 'Alamat toko'),
('app_phone', '0341-123456', 'Nomor telepon toko'),
('tax_enabled', 'false', 'Aktifkan pajak'),
('tax_percentage', '0', 'Persentase pajak (%)'),
('low_stock_threshold', '10', 'Batas stok rendah default'),
('currency', 'IDR', 'Mata uang'),
('receipt_footer', 'Terima kasih atas kunjungan Anda!', 'Footer struk');

-- ============================================
-- SELESAI
-- ============================================
-- Database siap digunakan!
-- Total tables: 11
-- Sample products: 25
-- Sample customers: 10
-- Sample transactions: 5
-- Sample debts: 3
