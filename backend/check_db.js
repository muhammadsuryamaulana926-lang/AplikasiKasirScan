const db = require('./database/db');

async function checkDatabase() {
    try {
        console.log('--- 🛡️ Sistem Pengecekan Database Catatan Warung ---');

        // 1. Test Koneksi
        const [testConn] = await db.query('SELECT 1 + 1 AS connection_test');
        console.log('✅ Koneksi ke MySQL: BERHASIL');

        // 2. Cek List Tabel
        const [tables] = await db.query('SHOW TABLES');
        const tableNames = tables.map(t => Object.values(t)[0]);
        console.log('\n📦 Daftar Tabel yang Terdeteksi:');
        tableNames.forEach(name => console.log(`   - ${name}`));

        // 3. Cek Struktur Tabel Penting
        const tablesToInspect = ['products', 'transactions', 'customers', 'debts', 'users'];
        for (const table of tablesToInspect) {
            if (tableNames.includes(table)) {
                console.log(`\n🔍 Struktur Tabel [${table}]:`);
                const [columns] = await db.query(`DESCRIBE ${table}`);
                columns.forEach(col => {
                    console.log(`   • ${col.Field.padEnd(15)} | ${col.Type.padEnd(20)} | Null: ${col.Null}`);
                });
            } else {
                console.log(`\n⚠️ Peringatan: Tabel [${table}] TIDAK DITEMUKAN di database.`);
            }
        }

        console.log('\n--- ✅ Pengecekan Selesai ---');
        process.exit(0);
    } catch (err) {
        console.error('❌ Gagal memeriksa database:', err.message);
        process.exit(1);
    }
}

checkDatabase();
