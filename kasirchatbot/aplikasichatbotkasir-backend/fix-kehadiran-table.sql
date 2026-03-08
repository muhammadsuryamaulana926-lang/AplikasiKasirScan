-- ==========================================
-- FIX KEHADIRAN TABLE - TAMBAH RELASI KE ANGGOTA
-- ==========================================

-- LANGKAH 1: CEK STRUKTUR TABEL KEHADIRAN
-- Jalankan query ini untuk melihat struktur tabel kehadiran
DESCRIBE kehadiran;

-- LANGKAH 2: CEK APAKAH ADA KOLOM anggota_id
-- Jika tidak ada, tambahkan kolom anggota_id
-- ALTER TABLE kehadiran ADD COLUMN anggota_id INT AFTER id;

-- LANGKAH 3: CEK DATA KEHADIRAN SAAT INI
SELECT * FROM kehadiran LIMIT 5;

-- LANGKAH 4: CEK DATA ANGGOTA
SELECT id, nama FROM anggota LIMIT 10;

-- ==========================================
-- SOLUSI 1: JIKA TABEL KEHADIRAN SUDAH ADA DATA TAPI TANPA anggota_id
-- ==========================================

-- Jika tabel kehadiran sudah punya data tapi tidak ada anggota_id,
-- Anda perlu mapping manual atau buat ulang data

-- Contoh: Update kehadiran dengan anggota_id
-- UPDATE kehadiran SET anggota_id = 1 WHERE id = 1;
-- UPDATE kehadiran SET anggota_id = 2 WHERE id = 2;
-- dst...

-- ==========================================
-- SOLUSI 2: BUAT ULANG TABEL KEHADIRAN DENGAN STRUKTUR BENAR
-- ==========================================

-- BACKUP data lama dulu (PENTING!)
-- CREATE TABLE kehadiran_backup AS SELECT * FROM kehadiran;

-- Drop tabel lama (HATI-HATI!)
-- DROP TABLE kehadiran;

-- Buat tabel baru dengan struktur yang benar
CREATE TABLE IF NOT EXISTS kehadiran (
  id INT AUTO_INCREMENT PRIMARY KEY,
  anggota_id INT NOT NULL,
  status ENUM('Hadir', 'Izin', 'Sakit', 'Tidak Hadir', 'Terlambat') DEFAULT 'Hadir',
  keterangan TEXT,
  tanggal DATE NOT NULL,
  waktu TIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (anggota_id) REFERENCES anggota(id) ON DELETE CASCADE,
  INDEX idx_anggota (anggota_id),
  INDEX idx_tanggal (tanggal)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- SOLUSI 3: INSERT DATA KEHADIRAN CONTOH (SESUAIKAN DENGAN anggota_id YANG ADA)
-- ==========================================

-- CEK DULU ID ANGGOTA YANG ADA
SELECT id, nama FROM anggota ORDER BY id;

-- Insert data kehadiran dengan anggota_id yang VALID
-- GANTI anggota_id sesuai dengan ID yang ada di tabel anggota!

INSERT INTO kehadiran (anggota_id, status, keterangan, tanggal) VALUES
(1, 'Hadir', 'Datang tepat waktu', '2024-01-15'),
(2, 'Hadir', 'Membawa snack', '2024-01-15'),
(3, 'Hadir', NULL, '2024-01-15'),
(4, 'Tidak Hadir', 'Sakit', '2024-01-15'),
(5, 'Hadir', NULL, '2024-01-15'),
(6, 'Hadir', 'Datang terlambat 15 menit', '2024-01-15'),
(7, 'Hadir', NULL, '2024-01-15'),
(8, 'Izin', 'Ada urusan keluarga', '2024-01-15'),
(9, 'Hadir', NULL, '2024-01-15'),
(10, 'Hadir', NULL, '2024-01-15');

-- ==========================================
-- VALIDASI: CEK HASIL JOIN
-- ==========================================

-- Query ini HARUS menampilkan NAMA ASLI dari tabel anggota
SELECT 
  a.nama, 
  k.status, 
  k.keterangan, 
  k.tanggal 
FROM kehadiran k 
INNER JOIN anggota a ON k.anggota_id = a.id 
ORDER BY k.tanggal DESC 
LIMIT 20;

-- Jika query di atas menampilkan nama ASLI (bukan "Anggota 1"), berarti BERHASIL!
-- Jika masih error, cek:
-- 1. Apakah kolom anggota_id ada di tabel kehadiran?
-- 2. Apakah nilai anggota_id valid (ada di tabel anggota)?
-- 3. Apakah foreign key constraint sudah dibuat?

-- ==========================================
-- TROUBLESHOOTING
-- ==========================================

-- Jika error "Unknown column 'anggota_id'":
-- → Tambahkan kolom: ALTER TABLE kehadiran ADD COLUMN anggota_id INT;

-- Jika error "Cannot add foreign key constraint":
-- → Pastikan tipe data anggota_id sama dengan anggota.id (INT)
-- → Pastikan nilai anggota_id yang ada valid (ada di tabel anggota)

-- Jika JOIN tidak menampilkan data:
-- → Cek apakah ada data di kedua tabel
-- → Cek apakah anggota_id di kehadiran valid

-- ==========================================
-- QUERY UNTUK CEK MASALAH
-- ==========================================

-- Cek kehadiran yang anggota_id nya tidak valid
SELECT k.* 
FROM kehadiran k 
LEFT JOIN anggota a ON k.anggota_id = a.id 
WHERE a.id IS NULL;

-- Jika query di atas menampilkan data, berarti ada kehadiran dengan anggota_id yang tidak valid!
-- Solusi: Hapus atau update anggota_id nya
