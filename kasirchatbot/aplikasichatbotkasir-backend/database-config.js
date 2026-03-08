const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, 'active-db.json');
const CONNECTIONS_FILE = path.join(__dirname, 'db-connections.json');

// Helper: Load connections from file
function loadConnections() {
  if (fs.existsSync(CONNECTIONS_FILE)) {
    return JSON.parse(fs.readFileSync(CONNECTIONS_FILE, 'utf8'));
  }
  return [];
}

// Helper: Save connections to file
function saveConnections(connections) {
  fs.writeFileSync(CONNECTIONS_FILE, JSON.stringify(connections, null, 2));
}

// Get active databases (max 5)
router.get('/databases/active', (req, res) => {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      res.json({ success: true, databases: config.activeDatabases || [] });
    } else {
      res.json({ success: true, databases: [] });
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Get list of available databases
router.get('/databases', async (req, res) => {
  try {
    const savedConnections = loadConnections();
    
    // Jika ada koneksi tersimpan, gunakan itu
    if (savedConnections.length > 0) {
      return res.json({ success: true, databases: savedConnections });
    }
    
    // Fallback: ambil dari MySQL langsung
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      port: 3306
    });
    
    const [rows] = await connection.execute('SHOW DATABASES');
    const databases = rows
      .map(row => row.Database)
      .filter(db => !['information_schema', 'mysql', 'performance_schema', 'sys'].includes(db))
      .map(db => ({ 
        name: db,
        driver: 'mysql',
        host: 'localhost',
        port: 3306,
        database: db,
        user: 'root',
        password: ''
      }));
    
    await connection.end();
    
    res.json({ success: true, databases });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Set active databases (max 5)
router.post('/databases/set-active', (req, res) => {
  try {
    const { databases } = req.body;
    
    if (!Array.isArray(databases)) {
      return res.json({ success: false, error: 'databases must be an array' });
    }
    
    if (databases.length > 5) {
      return res.json({ success: false, error: 'Maximum 5 databases allowed' });
    }
    
    const config = { activeDatabases: databases };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    
    global.activeDatabases = databases;
    
    if (global.io) {
      global.io.emit('database-changed', { databases });
    }
    
    res.json({ success: true, message: `${databases.length} database(s) activated` });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Reload database configuration
router.post('/databases/reload', (req, res) => {
  try {
    const dbHelper = require('./db-helper');
    const newConfig = dbHelper.getDbConfig();
    const newDatabase = dbHelper.getActiveDatabase();
    
    res.json({ 
      success: true, 
      message: 'Configuration reloaded',
      database: newDatabase,
      config: { ...newConfig, password: '***' }
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Get database statistics
router.get('/databases/:name/stats', async (req, res) => {
  try {
    const { name } = req.params;
    const connections = loadConnections();
    const connConfig = connections.find(c => c.name === name);
    
    if (!connConfig) {
      return res.json({ success: false, error: 'Connection not found' });
    }
    
    const connection = await mysql.createConnection({
      host: connConfig.host,
      user: connConfig.user,
      password: connConfig.password,
      database: connConfig.database,
      port: connConfig.port
    });
    
    // Get table count
    const [tables] = await connection.execute('SHOW TABLES');
    const tableCount = tables.length;
    
    // Get database size
    const [sizeResult] = await connection.execute(`
      SELECT 
        SUM(data_length + index_length) / 1024 / 1024 AS size_mb
      FROM information_schema.tables
      WHERE table_schema = ?
    `, [connConfig.database]);
    
    const sizeMB = sizeResult[0].size_mb ? parseFloat(sizeResult[0].size_mb).toFixed(2) : 0;
    
    await connection.end();
    
    res.json({ 
      success: true, 
      stats: {
        tableCount,
        sizeMB,
        database: connConfig.database
      }
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Test database connection
router.post('/databases/test', async (req, res) => {
  try {
    const { database, host, port, user, password } = req.body;
    
    const connection = await mysql.createConnection({
      host: host || 'localhost',
      user: user || 'root',
      password: password || '',
      database: database,
      port: port || 3306
    });
    
    await connection.ping();
    await connection.end();
    
    res.json({ success: true, message: 'Connection successful' });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Add new database connection
router.post('/databases', async (req, res) => {
  try {
    const { name, driver, host, port, database, user, password } = req.body;
    
    if (!name || !database) {
      return res.json({ success: false, error: 'Name and database are required' });
    }
    
    const connections = loadConnections();
    
    // Check if name already exists
    if (connections.find(c => c.name === name)) {
      return res.json({ success: false, error: 'Connection name already exists' });
    }
    
    // Test connection first
    try {
      const testConn = await mysql.createConnection({
        host: host || 'localhost',
        user: user || 'root',
        password: password || '',
        database: database,
        port: port || 3306
      });
      await testConn.ping();
      await testConn.end();
    } catch (testError) {
      return res.json({ success: false, error: 'Connection test failed: ' + testError.message });
    }
    
    // Add new connection
    connections.push({
      name,
      driver: driver || 'mysql',
      host: host || 'localhost',
      port: port || 3306,
      database,
      user: user || 'root',
      password: password || ''
    });
    
    saveConnections(connections);
    
    res.json({ success: true, message: 'Connection added successfully' });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Update database connection
router.put('/databases/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const { driver, host, port, database, user, password } = req.body;
    
    const connections = loadConnections();
    const index = connections.findIndex(c => c.name === name);
    
    if (index === -1) {
      return res.json({ success: false, error: 'Connection not found' });
    }
    
    // Test connection first
    try {
      const testConn = await mysql.createConnection({
        host: host || connections[index].host,
        user: user || connections[index].user,
        password: password !== undefined ? password : connections[index].password,
        database: database || connections[index].database,
        port: port || connections[index].port
      });
      await testConn.ping();
      await testConn.end();
    } catch (testError) {
      return res.json({ success: false, error: 'Connection test failed: ' + testError.message });
    }
    
    // Update connection
    connections[index] = {
      ...connections[index],
      driver: driver || connections[index].driver,
      host: host || connections[index].host,
      port: port || connections[index].port,
      database: database || connections[index].database,
      user: user || connections[index].user,
      password: password !== undefined ? password : connections[index].password
    };
    
    saveConnections(connections);
    
    res.json({ success: true, message: 'Connection updated successfully' });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Delete database connection
router.delete('/databases/:name', async (req, res) => {
  try {
    const { name } = req.params;
    
    const connections = loadConnections();
    const filtered = connections.filter(c => c.name !== name);
    
    if (connections.length === filtered.length) {
      return res.json({ success: false, error: 'Connection not found' });
    }
    
    // If deleting active database, remove from active list
    if (fs.existsSync(CONFIG_FILE)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      const activeDatabases = config.activeDatabases || [];
      const filtered = activeDatabases.filter(db => db !== name);
      if (filtered.length !== activeDatabases.length) {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify({ activeDatabases: filtered }, null, 2));
        global.activeDatabases = filtered;
      }
    }
    
    saveConnections(filtered);
    
    res.json({ success: true, message: 'Connection deleted successfully' });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

module.exports = router;
