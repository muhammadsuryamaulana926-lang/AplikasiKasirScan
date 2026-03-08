const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const axios = require('axios');
const http = require('http');
const { Server } = require('socket.io');
const corsOptions = require('./cors-config');
const authRouter = require('./auth');
const profileRouter = require('./profile');
const databaseConfigRouter = require('./database-config');
const dbHelper = require('./db-helper');
const apiKeysHelper = require('./api-keys-helper');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: corsOptions,
  pingTimeout: 180000, // 3 menit - lebih panjang untuk AI processing
  pingInterval: 10000, // Ping setiap 10 detik
  connectTimeout: 90000, // 90 detik untuk connect
  transports: ['websocket', 'polling'],
  allowUpgrades: true,
  maxHttpBufferSize: 1e8,
  perMessageDeflate: false
});

app.use(cors(corsOptions));
app.use(express.json());

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);

  // Track jika sedang processing
  socket.isProcessing = false;

  // Heartbeat untuk keep connection alive
  const heartbeatInterval = setInterval(() => {
    if (socket.connected) {
      socket.emit('heartbeat', { timestamp: Date.now() });
    } else {
      clearInterval(heartbeatInterval);
    }
  }, 25000);

  // Handle client pong response
  socket.on('pong', () => {
    socket.lastPong = Date.now();
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Client disconnected:', socket.id, 'Reason:', reason);
    if (socket.isProcessing) {
      console.log('⚠️ Client disconnected saat processing - ini normal jika response sudah dikirim');
    }
    clearInterval(heartbeatInterval);
  });

  socket.on('error', (error) => {
    console.error('❌ Socket error:', socket.id, error.message);
  });
});

// Export io untuk digunakan di module lain
app.set('io', io);

// Serve static files untuk images
app.use('/images', express.static('images'));
app.use('/uploads', express.static('uploads'));

// Auth routes
app.use('/api/auth', authRouter);

// Profile routes
app.use('/api', profileRouter);

// Database config routes
app.use('/api', databaseConfigRouter);

// ==================== API KEYS MANAGEMENT ====================

// Sync API keys from .env to JSON file
app.post('/api/api-keys/sync-from-env', (req, res) => {
  try {
    const apiKeysFromEnv = [
      {
        name: 'Groq Primary',
        provider: 'groq',
        apiKey: process.env.GROQ_API_KEY || '',
        model: 'llama-3.3-70b-versatile',
        url: 'https://api.groq.com/openai/v1/chat/completions',
        enabled: !!process.env.GROQ_API_KEY
      },
      {
        name: 'Gemini Backup',
        provider: 'gemini',
        apiKey: process.env.GEMINI_API_KEY || '',
        model: 'gemini-1.5-flash',
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        enabled: !!process.env.GEMINI_API_KEY
      },
      {
        name: 'Mistral Backup',
        provider: 'mistral',
        apiKey: process.env.MISTRAL_API_KEY || '',
        model: 'mistral-small-latest',
        url: 'https://api.mistral.ai/v1/chat/completions',
        enabled: !!process.env.MISTRAL_API_KEY
      },
      {
        name: 'Cohere Backup',
        provider: 'cohere',
        apiKey: process.env.COHERE_API_KEY || '',
        model: 'command',
        url: 'https://api.cohere.ai/v1/chat',
        enabled: !!process.env.COHERE_API_KEY
      },
      {
        name: 'HuggingFace Backup',
        provider: 'huggingface',
        apiKey: process.env.HUGGINGFACE_API_KEY || '',
        model: 'meta-llama/Meta-Llama-3-8B-Instruct',
        url: 'https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct',
        enabled: !!process.env.HUGGINGFACE_API_KEY
      },
      {
        name: 'OpenRouter Backup',
        provider: 'openrouter',
        apiKey: process.env.OPENROUTER_API_KEY || '',
        model: 'google/gemini-2.0-flash-exp:free',
        url: 'https://openrouter.ai/api/v1/chat/completions',
        enabled: !!process.env.OPENROUTER_API_KEY
      }
    ];

    // Get existing API keys
    const existingKeys = apiKeysHelper.getAllApiKeys();
    let syncedCount = 0;

    // Add only if not exists
    for (const apiKey of apiKeysFromEnv) {
      if (apiKey.apiKey && !existingKeys.find(k => k.name === apiKey.name)) {
        apiKeysHelper.addApiKey(apiKey);
        syncedCount++;
      }
    }

    res.json({
      success: true,
      message: `${syncedCount} API keys synced from .env`,
      synced: syncedCount
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Get all API keys
app.get('/api/api-keys', (req, res) => {
  const apiKeys = apiKeysHelper.getAllApiKeys();
  res.json({ success: true, apiKeys });
});

// Add new API key
app.post('/api/api-keys', (req, res) => {
  const result = apiKeysHelper.addApiKey(req.body);
  res.json(result);
});

// Update API key
app.put('/api/api-keys/:name', (req, res) => {
  const result = apiKeysHelper.updateApiKey(req.params.name, req.body);
  res.json(result);
});

// Delete API key
app.delete('/api/api-keys/:name', (req, res) => {
  const result = apiKeysHelper.deleteApiKey(req.params.name);
  res.json(result);
});

// Toggle API key enabled status
app.patch('/api/api-keys/:name/toggle', (req, res) => {
  const { enabled } = req.body;
  const result = apiKeysHelper.updateApiKey(req.params.name, { enabled });
  res.json(result);
});

// ==================== END API KEYS MANAGEMENT ====================

// Chat history routes
try {
  const chatHistoryRouter = require('./chat-history');
  app.use('/api', chatHistoryRouter);
  console.log('Chat history routes loaded successfully');
} catch (error) {
  console.error('Failed to load chat history routes:', error.message);
}

// History dropdown routes
try {
  const historyDropdownRouter = require('./history-dropdown');
  app.use('/api/chat', historyDropdownRouter);
  console.log('History dropdown routes loaded successfully');
} catch (error) {
  console.error('Failed to load history dropdown routes:', error.message);
}

// Chatbot routes
try {
  const chatbotRouter = require('./chatbot-routes');
  app.use('/api', chatbotRouter);
  console.log('Chatbot routes loaded successfully');
} catch (error) {
  console.error('Failed to load chatbot routes:', error.message);
}

// Voice to text routes
try {
  const voiceToTextRouter = require('./voice-to-text');
  app.use('/api', voiceToTextRouter);
  console.log('Voice-to-text routes loaded successfully');
} catch (error) {
  console.error('Failed to load voice-to-text routes:', error.message);
}

// Load active database config using helper
const activeDatabase = dbHelper.getActiveDatabase();
const dbConfig = dbHelper.getDbConfig();

console.log('📊 Active database:', activeDatabase);
console.log('🔌 Database config:', { ...dbConfig, password: '***' });

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.ping();
    await connection.end();

    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }
});

// ==================== USER MANAGEMENT (ADMIN) ====================

// Import ChatbotHandler dari chatbot-logic.js
const ChatbotHandler = require('./chatbot-logic');

// Inisialisasi chatbot handler
const chatbotHandler = new ChatbotHandler();

// Get all users endpoint
app.get('/api/users', async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'chat-botKasir_db',
      port: 3306
    });

    const [users] = await connection.execute(
      'SELECT id, email, nama, telepon, status, dibuat_pada FROM users ORDER BY dibuat_pada DESC'
    );

    res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.json({ success: false, error: 'Gagal mengambil data pengguna' });
  } finally {
    if (connection) await connection.end();
  }
});

// Add user endpoint
app.post('/api/users', async (req, res) => {
  const { nama, email, phone } = req.body;
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'chat-botKasir_db',
      port: 3306
    });

    const [result] = await connection.execute(
      'INSERT INTO users (nama, email, telepon, status) VALUES (?, ?, ?, ?)',
      [nama, email, phone, 'active']
    );

    const [newUser] = await connection.execute(
      'SELECT id, email, nama, telepon, status, dibuat_pada FROM users WHERE id = ?',
      [result.insertId]
    );

    // Emit ke semua client
    io.emit('user_added', newUser[0]);

    res.json({ success: true, message: 'Pengguna berhasil ditambahkan' });
  } catch (error) {
    console.error('Error adding user:', error);
    res.json({ success: false, error: 'Gagal menambahkan pengguna' });
  } finally {
    if (connection) await connection.end();
  }
});

// Update user endpoint
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { nama, email, phone, status } = req.body;
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'chat-botKasir_db',
      port: 3306
    });

    await connection.execute(
      'UPDATE users SET nama = ?, email = ?, telepon = ? WHERE id = ?',
      [nama, email, phone, id]
    );

    const [updatedUser] = await connection.execute(
      'SELECT id, email, nama, telepon, status, dibuat_pada FROM users WHERE id = ?',
      [id]
    );

    // Emit ke semua client
    io.emit('user_updated', updatedUser[0]);

    res.json({ success: true, message: 'Pengguna berhasil diupdate' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.json({ success: false, error: 'Gagal mengupdate pengguna' });
  } finally {
    if (connection) await connection.end();
  }
});

// Delete user endpoint
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'chat-botKasir_db',
      port: 3306
    });

    await connection.execute('DELETE FROM users WHERE id = ?', [id]);

    // Emit ke semua client
    io.emit('user_deleted', parseInt(id));

    res.json({ success: true, message: 'Pengguna berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.json({ success: false, error: 'Gagal menghapus pengguna' });
  } finally {
    if (connection) await connection.end();
  }
});

// Toggle user status endpoint
app.patch('/api/users/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'chat-botKasir_db',
      port: 3306
    });

    await connection.execute(
      'UPDATE users SET status = ? WHERE id = ?',
      [status, id]
    );

    // Emit ke semua client
    io.emit('user_status_changed', { userId: parseInt(id), status });

    res.json({ success: true, message: 'Status berhasil diupdate' });
  } catch (error) {
    console.error('Error updating status:', error);
    res.json({ success: false, error: 'Gagal mengupdate status' });
  } finally {
    if (connection) await connection.end();
  }
});

app.post('/api/query', async (req, res) => {
  const { question, userId, userEmail } = req.body;

  if (!question || question.trim() === '') {
    return res.json({
      success: false,
      error: 'Pertanyaan tidak boleh kosong'
    });
  }

  console.log('📩 Pertanyaan diterima:', question);
  console.log('👤 User ID:', userId || 'default');
  console.log('📧 User Email:', userEmail || 'tidak ada');

  // Set timeout yang lebih panjang untuk response
  req.setTimeout(120000); // 120 detik
  res.setTimeout(120000);

  try {
    // Emit progress ke client via Socket.IO
    const io = req.app.get('io');
    const socketId = req.body.socketId;

    // Progress callback function dengan keepalive
    const progressCallback = (message) => {
      if (socketId && io) {
        const targetSocket = io.sockets.sockets.get(socketId);
        if (targetSocket && targetSocket.connected) {
          try {
            targetSocket.emit('processing', {
              status: 'processing',
              message: message,
              timestamp: Date.now()
            });
          } catch (err) {
            console.log('⚠️ Error emit processing:', err.message);
          }
        }
      }
    };

    if (socketId && io) {
      const targetSocket = io.sockets.sockets.get(socketId);
      if (targetSocket && targetSocket.connected) {
        targetSocket.isProcessing = true; // Set flag processing
        try {
          targetSocket.emit('processing', {
            status: 'processing',
            message: 'Memulai pemrosesan...'
          });
        } catch (err) {
          console.log('⚠️ Socket error saat emit:', err.message);
        }
      }
    }

    // Gunakan userId untuk context conversation dengan progress callback
    const result = await chatbotHandler.processMessage(
      question,
      userId || userEmail || 'default',
      progressCallback
    );

    // Emit completion (jika socket masih terhubung)
    if (socketId && io) {
      const targetSocket = io.sockets.sockets.get(socketId);
      if (targetSocket && targetSocket.connected) {
        targetSocket.isProcessing = false; // Clear flag
        try {
          targetSocket.emit('completed', {
            status: 'completed',
            result: result
          });
        } catch (err) {
          console.log('⚠️ Socket error saat emit completed:', err.message);
        }
      }
    }

    // Kirim response hanya jika belum dikirim
    if (!res.headersSent) {
      res.json({
        success: true,
        result: result,
        source: 'chatbot-logic'
      });
    }

  } catch (error) {
    console.error('❌ Server Error:', error);

    // Emit error (jika socket masih terhubung)
    const io = req.app.get('io');
    const socketId = req.body.socketId;
    if (socketId && io) {
      const targetSocket = io.sockets.sockets.get(socketId);
      if (targetSocket && targetSocket.connected) {
        try {
          targetSocket.emit('error', {
            status: 'error',
            error: error.message
          });
        } catch (err) {
          console.log('⚠️ Socket error saat emit error:', err.message);
        }
      }
    }

    // Kirim response hanya jika belum dikirim
    if (!res.headersSent) {
      res.json({
        success: false,
        error: 'Terjadi kesalahan pada server',
        details: error.message
      });
    }
  }
});

// Chat history endpoints sudah dihandle oleh chat-history.js dan history-dropdown.js

app.get('/api/health', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.ping();
    await connection.end();

    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }
});

// ==================== SERVER START ====================

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server berjalan di http://0.0.0.0:${PORT}`);
  console.log('Email OTP: chatbotaiasistent@gmail.com');
  console.log('OTP System: Active');
  console.log('Chatbot System: Active');
  console.log('🔌 WebSocket: Active');
  console.log('🎤 Voice-to-Text: Active (Deepgram)');
  // console.log('Logo URL: http://localhost:3000/images/logo%20mm.jpg');
});