# PANDUAN SETUP WEBSOCKET DI BACKEND

## 1. Install Socket.IO di backend
```bash
cd ../chatbot-backend
npm install socket.io
```

## 2. Setup Socket.IO di server (contoh: server.js atau index.js)

```javascript
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Setup Socket.IO dengan CORS
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // URL admin frontend
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('Admin connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Admin disconnected:', socket.id);
  });
});

// Ganti app.listen dengan server.listen
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export io untuk digunakan di controller
module.exports = { app, io };
```

## 3. Emit event di controller saat ada data baru

### Contoh di Chat Controller:

```javascript
const { io } = require('../server'); // atau path ke file server

// Setelah save chat history baru
exports.createChatHistory = async (req, res) => {
  try {
    const newChat = await ChatHistory.create({...});
    
    // Emit ke semua admin yang connected
    io.emit('new_chat', newChat);
    
    res.json({ success: true, data: newChat });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Setelah save message baru
exports.createMessage = async (req, res) => {
  try {
    const newMessage = await Message.create({...});
    
    // Emit ke semua admin yang connected
    io.emit('new_message', {
      chatHistoryId: newMessage.chat_history_id,
      message: newMessage
    });
    
    res.json({ success: true, data: newMessage });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

## 4. Testing

1. Jalankan backend: `npm start`
2. Jalankan admin: `npm run dev`
3. Buka admin di browser
4. Kirim chat dari aplikasi chatbot-frontend
5. Admin akan langsung menerima update tanpa refresh

## Troubleshooting

- Pastikan PORT backend sesuai di `src/services/socket.js`
- Cek CORS settings jika ada error connection
- Lihat console browser untuk error WebSocket
- Lihat console backend untuk connection logs
