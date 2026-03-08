const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// Database connection
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'chat-botKasir_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// GET - Ambil semua chat history untuk admin
router.get('/chat-history', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT id, user_email, judul, dibuat_pada, diperbarui_pada
      FROM riwayat_chat
      ORDER BY diperbarui_pada DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ error: 'Gagal mengambil riwayat chat' });
  }
});

// GET - Ambil messages untuk chat history tertentu
router.get('/chat-history/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(`
      SELECT id, peran, konten, sumber, dibuat_pada
      FROM pesan_chat
      WHERE riwayat_chat_id = ?
      ORDER BY dibuat_pada ASC
    `, [id]);

    res.json(rows);
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ error: 'Gagal mengambil pesan chat' });
  }
});

// DELETE - Hapus chat history dan semua messages terkait
router.delete('/chat-history/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Karena ada CASCADE, messages akan terhapus otomatis
    await pool.execute('DELETE FROM riwayat_chat WHERE id = ?', [id]);

    res.json({ success: true, message: 'Chat berhasil dihapus' });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({ error: 'Gagal menghapus chat' });
  }
});

// POST - Simpan chat history baru dengan messages
router.post('/chat/save', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { userEmail, messages, title } = req.body;

    if (!userEmail || !messages || messages.length === 0) {
      return res.status(400).json({ error: 'Data tidak lengkap' });
    }

    // Buat chat history baru
    const chatTitle = title || messages.find(m => m.sender === 'user')?.text?.substring(0, 50) || 'Chat Baru';

    const [chatResult] = await connection.execute(`
      INSERT INTO riwayat_chat (user_email, judul)
      VALUES (?, ?)
    `, [userEmail, chatTitle]);

    const chatHistoryId = chatResult.insertId;

    // Simpan semua messages
    for (const message of messages) {
      const role = message.sender === 'user' ? 'user' : 'assistant';
      const source = message.text?.startsWith('📊') ? 'database' : 'gemini';

      await connection.execute(`
        INSERT INTO pesan_chat (riwayat_chat_id, peran, konten, sumber)
        VALUES (?, ?, ?, ?)
      `, [chatHistoryId, role, message.text, source]);
    }

    await connection.commit();

    // Emit WebSocket event untuk admin
    const io = req.app.get('io');
    if (io) {
      console.log('🔔 Emitting new_chat event:', {
        id: chatHistoryId,
        user_email: userEmail,
        judul: chatTitle
      });
      io.emit('new_chat', {
        id: chatHistoryId,
        user_email: userEmail,
        judul: chatTitle,
        dibuat_pada: new Date(),
        diperbarui_pada: new Date()
      });
    } else {
      console.log('⚠️ Socket.io instance not found!');
    }

    res.json({
      success: true,
      message: 'Chat berhasil disimpan',
      chatId: chatHistoryId
    });
  } catch (error) {
    await connection.rollback();
    console.error('Save chat error:', error);
    res.status(500).json({ error: 'Gagal menyimpan chat' });
  } finally {
    connection.release();
  }
});

// PUT - Update chat dengan menambah messages baru
router.put('/chat/update', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { chatId, userEmail, messages } = req.body;

    if (!chatId || !userEmail || !messages || messages.length === 0) {
      return res.status(400).json({ error: 'Data tidak lengkap' });
    }

    // Extract ID dari format session_123
    const dbId = chatId.toString().replace('session_', '');

    // Ambil messages yang sudah ada
    const [existingMessages] = await connection.execute(
      'SELECT COUNT(*) as count FROM pesan_chat WHERE riwayat_chat_id = ?',
      [dbId]
    );

    // Simpan messages baru saja (yang belum ada di database)
    const newMessages = messages.slice(existingMessages[0].count);

    for (const message of newMessages) {
      const role = message.sender === 'user' ? 'user' : 'assistant';
      const source = message.text?.startsWith('📊') ? 'database' : 'gemini';

      await connection.execute(`
        INSERT INTO pesan_chat (riwayat_chat_id, peran, konten, sumber)
        VALUES (?, ?, ?, ?)
      `, [dbId, role, message.text, source]);

      // Emit WebSocket event untuk setiap message baru
      const io = req.app.get('io');
      if (io) {
        const [insertResult] = await connection.execute(
          'SELECT id FROM pesan_chat WHERE riwayat_chat_id = ? ORDER BY id DESC LIMIT 1',
          [dbId]
        );

        console.log('🔔 Emitting new_message event:', {
          id: insertResult[0].id,
          chat_history_id: parseInt(dbId),
          peran: role,
          konten: message.text.substring(0, 50) + '...'
        });

        io.emit('new_message', {
          id: insertResult[0].id,
          chat_history_id: parseInt(dbId),
          peran: role,
          konten: message.text,
          sumber: source,
          dibuat_pada: new Date()
        });
      } else {
        console.log('⚠️ Socket.io instance not found!');
      }
    }

    // Update timestamp chat_history
    await connection.execute(
      'UPDATE riwayat_chat SET diperbarui_pada = NOW() WHERE id = ?',
      [dbId]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Chat berhasil diupdate'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Update chat error:', error);
    res.status(500).json({ error: 'Gagal mengupdate chat' });
  } finally {
    connection.release();
  }
});

// GET - Ambil chat history berdasarkan email user (untuk frontend chatbot)
router.get('/chat/history/:email', async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.json({ success: false, error: 'Email tidak ditemukan' });
    }

    // Ambil chat history dengan messages
    const [chatRows] = await pool.execute(`
      SELECT id, user_email, judul, dibuat_pada, diperbarui_pada
      FROM riwayat_chat
      WHERE user_email = ?
      ORDER BY diperbarui_pada DESC
    `, [email]);

    const chatHistory = [];

    for (const chat of chatRows) {
      // Ambil messages untuk setiap chat
      const [messageRows] = await pool.execute(`
        SELECT peran, konten, dibuat_pada
        FROM pesan_chat
        WHERE riwayat_chat_id = ?
        ORDER BY dibuat_pada ASC
      `, [chat.id]);

      // Convert ke format yang diharapkan frontend
      const messages = messageRows.map((msg, index) => ({
        id: `${msg.peran}_${chat.id}_${index}`,
        text: msg.konten,
        sender: msg.peran === 'user' ? 'user' : 'bot',
        timestamp: msg.dibuat_pada
      }));

      const session = {
        id: `session_${chat.id}`,
        title: chat.judul,
        preview: messages.find(m => m.sender === 'user')?.text?.substring(0, 30) + '...' || 'Chat kosong',
        timestamp: chat.diperbarui_pada,
        unread: false,
        messages: messages
      };

      chatHistory.push(session);
    }

    res.json({
      success: true,
      chatHistory: chatHistory
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.json({ success: false, error: 'Gagal mengambil riwayat chat' });
  }
});

module.exports = router;