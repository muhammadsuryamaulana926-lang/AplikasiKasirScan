-- Cek struktur tabel dan data
-- Database: chatbot_db

-- 1. Cek struktur tabel chat_history
DESCRIBE chat_history;

-- 2. Cek struktur tabel chat_messages
DESCRIBE chat_messages;

-- 3. Cek data di chat_history
SELECT * FROM chat_history ORDER BY created_at DESC LIMIT 5;

-- 4. Cek data di chat_messages
SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT 10;

-- 5. Cek jumlah data
SELECT 
    'chat_history' as tabel,
    COUNT(*) as jumlah
FROM chat_history
UNION ALL
SELECT 
    'chat_messages' as tabel,
    COUNT(*) as jumlah
FROM chat_messages;
