const dbHelper = require('./db-helper');

// Middleware to check database connection
async function checkDatabaseConnection(req, res, next) {
  try {
    const connection = await dbHelper.createConnection();
    await connection.ping();
    await connection.end();
    next();
  } catch (error) {
    console.error('Database connection error:', error.message);
    res.status(503).json({
      success: false,
      error: 'Database connection failed',
      details: error.message
    });
  }
}

// Middleware to attach database connection to request
async function attachDatabaseConnection(req, res, next) {
  try {
    req.dbConnection = await dbHelper.createConnection();
    
    // Cleanup connection after response
    res.on('finish', async () => {
      if (req.dbConnection) {
        await req.dbConnection.end();
      }
    });
    
    next();
  } catch (error) {
    console.error('Failed to attach database connection:', error.message);
    res.status(503).json({
      success: false,
      error: 'Failed to connect to database',
      details: error.message
    });
  }
}

// Middleware to log database queries
function logDatabaseQuery(query, params = []) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] DB Query:`, query);
  if (params.length > 0) {
    console.log(`[${timestamp}] Params:`, params);
  }
}

module.exports = {
  checkDatabaseConnection,
  attachDatabaseConnection,
  logDatabaseQuery
};
