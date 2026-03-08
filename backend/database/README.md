# 📊 Database Setup - Aplikasi Catatan Warung

## Struktur Database

Database ini dirancang untuk aplikasi Point of Sale (POS) warung dengan fitur lengkap:

### 📁 Tabel Utama (11 Tables)

1. **users** - Data kasir dan admin
2. **categories** - Kategori produk
3. **products** - Daftar produk/barang
4. **customers** - Data pelanggan/warga
5. **transactions** - Transaksi penjualan
6. **transaction_items** - Detail item per transaksi
7. **debts** - Catatan hutang piutang
8. **debt_payments** - Riwayat pembayaran hutang
9. **stock_history** - Riwayat perubahan stok
10. **notifications** - Notifikasi sistem
11. **settings** - Pengaturan aplikasi

### ⚡ Fitur Otomatis (Triggers)

- **Auto Update Stock** - Stok otomatis berkurang saat transaksi
- **Auto Update Customer Stats** - Total belanja & loyalty points otomatis terupdate
- **Auto Update Debt Status** - Status hutang otomatis berubah saat pembayaran
- **Auto Notification** - Notifikasi otomatis saat stok rendah

### 📊 Views untuk Dashboard

- `v_dashboard_summary` - Ringkasan penjualan harian
- `v_low_stock_products` - Produk dengan stok rendah
- `v_top_selling_products` - Produk terlaris
- `v_customer_debt_summary` - Ringkasan hutang per pelanggan

---

## 🚀 Cara Install Database

### Opsi 1: Menggunakan MySQL Command Line

```bash
# 1. Login ke MySQL
mysql -u root -p

# 2. Jalankan schema
source D:/belajar/apliaksi-catatanWarung/backend/database/schema.sql

# 3. Jalankan sample data (opsional)
source D:/belajar/apliaksi-catatanWarung/backend/database/seed.sql

# 4. Verifikasi
USE catatan_warung;
SHOW TABLES;
```

### Opsi 2: Menggunakan MySQL Workbench

1. Buka **MySQL Workbench**
2. Klik **File** → **Open SQL Script**
3. Pilih file `schema.sql`
4. Klik icon ⚡ (Execute) untuk menjalankan
5. Ulangi untuk `seed.sql` (opsional)

### Opsi 3: Menggunakan phpMyAdmin

1. Buka **phpMyAdmin** di browser
2. Klik tab **SQL**
3. Copy-paste isi file `schema.sql`
4. Klik **Go**
5. Ulangi untuk `seed.sql` (opsional)

---

## 🔧 Konfigurasi Backend

Setelah database dibuat, update file `.env` di folder backend:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=catatan_warung

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Secret (untuk autentikasi)
JWT_SECRET=your_secret_key_here
```

---

## 📋 Sample Data

File `seed.sql` berisi data contoh:

- ✅ **3 Users** (1 Admin, 2 Kasir)
- ✅ **6 Categories** (Makanan, Minuman, Kebutuhan Rumah, dll)
- ✅ **25 Products** (Indomie, Aqua, Sampoerna, Rinso, dll)
- ✅ **10 Customers** dengan data lengkap
- ✅ **5 Transactions** hari ini
- ✅ **3 Debts** dengan berbagai status

---

## 🔍 Query Penting

### Cek stok produk yang hampir habis
```sql
SELECT * FROM v_low_stock_products;
```

### Lihat transaksi hari ini
```sql
SELECT * FROM transactions 
WHERE DATE(created_at) = CURDATE()
ORDER BY created_at DESC;
```

### Total penjualan hari ini
```sql
SELECT 
    COUNT(*) as total_transaksi,
    SUM(total) as total_pendapatan
FROM transactions 
WHERE DATE(created_at) = CURDATE() 
AND status = 'completed';
```

### Top 10 produk terlaris
```sql
SELECT * FROM v_top_selling_products LIMIT 10;
```

### Daftar hutang yang belum lunas
```sql
SELECT * FROM debts 
WHERE status IN ('unpaid', 'partial', 'overdue')
ORDER BY due_date ASC;
```

### Pelanggan dengan total belanja terbanyak
```sql
SELECT name, phone, total_spent, total_transactions, loyalty_points
FROM customers
ORDER BY total_spent DESC
LIMIT 10;
```

---

## 🛡️ Backup & Restore

### Backup Database
```bash
mysqldump -u root -p catatan_warung > backup_$(date +%Y%m%d).sql
```

### Restore Database
```bash
mysql -u root -p catatan_warung < backup_20260213.sql
```

---

## 📝 Notes

1. **Password di sample data** menggunakan bcrypt hash dummy. Untuk production, generate hash yang benar.
2. **Triggers** akan otomatis berjalan saat ada transaksi, tidak perlu konfigurasi tambahan.
3. **Views** sudah ter-create otomatis dan bisa langsung digunakan seperti tabel biasa.
4. **Foreign Keys** sudah diatur dengan `ON DELETE CASCADE` atau `SET NULL` sesuai kebutuhan.
5. **Indexes** sudah dibuat untuk kolom yang sering di-query agar performa optimal.

---

## 🆘 Troubleshooting

### Error: "Access denied for user"
- Pastikan username dan password MySQL benar
- Cek privileges user dengan: `SHOW GRANTS FOR 'root'@'localhost';`

### Error: "Unknown database"
- Database belum dibuat, jalankan: `CREATE DATABASE catatan_warung;`

### Error: "Table already exists"
- Drop database dulu: `DROP DATABASE catatan_warung;`
- Atau ubah `CREATE TABLE` menjadi `CREATE TABLE IF NOT EXISTS`

### Trigger tidak berjalan
- Pastikan MySQL version > 5.7
- Cek delimiter dengan benar saat menjalankan trigger

---

## 📞 Support

Jika ada pertanyaan atau issue, silakan hubungi developer atau cek dokumentasi di:
- MySQL Docs: https://dev.mysql.com/doc/
- Node.js MySQL2: https://github.com/sidorares/node-mysql2
