const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'chat-botKasir_db',
  port: 3306
};

// Update title chat
router.put('/update-title', async (req, res) => {
  let connection;
  try {
    const { chatId, newTitle } = req.body;

    if (!chatId || !newTitle) {
      return res.json({
        success: false,
        error: 'chatId dan newTitle harus diisi'
      });
    }

    connection = await mysql.createConnection(dbConfig);

    const id = chatId.replace('session_', '');

    // Cek apakah kolom judul ada, jika tidak tambahkan
    try {
      await connection.execute(
        'ALTER TABLE riwayat_chat ADD COLUMN IF NOT EXISTS judul VARCHAR(255)'
      );
    } catch (e) {
      // Kolom sudah ada, lanjutkan
    }

    // Update judul
    await connection.execute(
      'UPDATE riwayat_chat SET judul = ? WHERE id = ?',
      [newTitle, id]
    );

    res.json({ success: true, message: 'Title berhasil diupdate' });
  } catch (error) {
    console.error('Error updating title:', error);
    res.json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

// Delete chat
router.delete('/delete/:chatId', async (req, res) => {
  let connection;
  try {
    const { chatId } = req.params;
    console.log('Delete request received for chatId:', chatId);

    if (!chatId) {
      return res.json({
        success: false,
        error: 'chatId harus diisi'
      });
    }

    connection = await mysql.createConnection(dbConfig);

    const id = chatId.replace('session_', '');
    console.log('Deleting chat with ID:', id);

    const [result] = await connection.execute(
      'DELETE FROM riwayat_chat WHERE id = ?',
      [id]
    );

    console.log('Delete result:', result);

    res.json({ success: true, message: 'Chat berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

module.exports = router;
