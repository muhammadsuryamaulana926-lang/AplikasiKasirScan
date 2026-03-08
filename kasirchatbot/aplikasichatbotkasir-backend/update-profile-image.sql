-- Tambah kolom profile_image ke tabel users
ALTER TABLE users ADD COLUMN profile_image VARCHAR(255) NULL AFTER telepon;
