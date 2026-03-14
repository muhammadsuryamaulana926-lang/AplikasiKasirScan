const db = require('./database/db');
(async () => {
    try {
        const [rows] = await db.query('DESCRIBE categories');
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
})();
