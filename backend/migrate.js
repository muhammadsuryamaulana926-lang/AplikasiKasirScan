const db = require('./database/db');

async function migrate() {
    try {
        console.log('--- Database Migration ---');
        
        // Helper to check if column exists
        const [columns] = await db.query('SHOW COLUMNS FROM users');
        const columnNames = columns.map(c => c.Field);

        if (!columnNames.includes('google_id')) {
            await db.query('ALTER TABLE users ADD COLUMN google_id VARCHAR(255) NULL');
            console.log('✅ Column google_id added.');
        }

        if (!columnNames.includes('auth_provider')) {
            await db.query("ALTER TABLE users ADD COLUMN auth_provider VARCHAR(50) DEFAULT 'local'");
            console.log('✅ Column auth_provider added.');
        }

        if (!columnNames.includes('is_verified')) {
            await db.query('ALTER TABLE users ADD COLUMN is_verified TINYINT(1) DEFAULT 0');
            console.log('✅ Column is_verified added.');
        }

        // Create otps table
        await db.query(`
            CREATE TABLE IF NOT EXISTS otps (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                code VARCHAR(10) NOT NULL,
                type ENUM('register', 'forgot_password') NOT NULL,
                expires_at DATETIME NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ OTPs table ready.');

        console.log('🎉 Migration successful.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

migrate();
