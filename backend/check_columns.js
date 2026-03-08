const db = require('./database/db');

async function checkTable() {
    try {
        console.log('Checking users table structure...');
        const [columns] = await db.query('SHOW COLUMNS FROM users');
        console.log('Columns found:');
        columns.forEach(col => console.log(`- ${col.Field} (${col.Type})`));
    } catch (err) {
        console.error('Error querying database:', err.message);
    }
    process.exit();
}

checkTable();
