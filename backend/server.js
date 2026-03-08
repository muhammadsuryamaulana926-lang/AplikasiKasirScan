require('dotenv').config();
const express = require('express');
const cors = require('cors');
const data = require('./data/mockData');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection test (db.js handles the logging)
require('./database/db');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/products', require('./routes/products')(data));
app.use('/api/customers', require('./routes/customers')(data));
app.use('/api/transactions', require('./routes/transactions')(data));
app.use('/api/debts', require('./routes/debts')(data));
app.use('/api/suppliers', require('./routes/suppliers')(data));
app.use('/api/employees', require('./routes/employees')(data));
app.use('/api/reports', require('./routes/reports')(data));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), name: 'Catatan Warung API' });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Catatan Warung API running on http://localhost:${PORT}`);
    console.log(`📡 Database: ${process.env.DB_NAME}`);
});
