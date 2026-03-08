const mysql = require('mysql2/promise');
const dbHelper = require('./db-helper');

async function debugKehadiranQuery() {
  console.log('🔍 DEBUG KEHADIRAN QUERY\n');
  
  try {
    // Get database config untuk ujicoba
    const dbConfigs = dbHelper.getAllActiveConnectionConfigs();
    const ujicobaDb = dbConfigs.find(c => c.database === 'ujicoba');
    
    if (!ujicobaDb) {
      console.log('❌ Database ujicoba tidak ditemukan!');
      return;
    }
    
    console.log('✅ Connecting to:', ujicobaDb.database);
    const connection = await mysql.createConnection(ujicobaDb);
    
    // 1. CEK STRUKTUR TABEL KEHADIRAN
    console.log('\n📋 STRUKTUR TABEL KEHADIRAN:');
    const [kehadiranCols] = await connection.execute('DESCRIBE kehadiran');
    console.table(kehadiranCols);
    
    // 2. CEK STRUKTUR TABEL ANGGOTA
    console.log('\n📋 STRUKTUR TABEL ANGGOTA:');
    const [anggotaCols] = await connection.execute('DESCRIBE anggota');
    console.table(anggotaCols);
    
    // 3. CEK DATA KEHADIRAN (5 record pertama)
    console.log('\n📊 DATA KEHADIRAN (5 record):');
    const [kehadiranData] = await connection.execute('SELECT * FROM kehadiran LIMIT 5');
    console.table(kehadiranData);
    
    // 4. CEK DATA ANGGOTA (5 record pertama)
    console.log('\n📊 DATA ANGGOTA (5 record):');
    const [anggotaData] = await connection.execute('SELECT id, nama FROM anggota LIMIT 5');
    console.table(anggotaData);
    
    // 5. CEK APAKAH ADA KOLOM anggota_id DI KEHADIRAN
    const hasAnggotaId = kehadiranCols.some(col => col.Field === 'anggota_id');
    console.log('\n🔍 Apakah tabel kehadiran punya kolom anggota_id?', hasAnggotaId ? '✅ YA' : '❌ TIDAK');
    
    if (!hasAnggotaId) {
      console.log('\n⚠️ MASALAH DITEMUKAN!');
      console.log('Tabel kehadiran TIDAK memiliki kolom anggota_id');
      console.log('Solusi: Jalankan script fix-kehadiran-table.sql');
      await connection.end();
      return;
    }
    
    // 6. TEST QUERY JOIN
    console.log('\n🧪 TEST QUERY JOIN:');
    const joinQuery = `
      SELECT a.nama, k.status, k.keterangan, k.tanggal 
      FROM kehadiran k 
      INNER JOIN anggota a ON k.anggota_id = a.id 
      ORDER BY k.id DESC 
      LIMIT 5
    `;
    
    console.log('Query:', joinQuery);
    
    try {
      const [joinResults] = await connection.execute(joinQuery);
      console.log('\n✅ HASIL JOIN:');
      console.table(joinResults);
      
      if (joinResults.length === 0) {
        console.log('\n⚠️ JOIN berhasil tapi tidak ada data!');
        console.log('Kemungkinan:');
        console.log('1. Tabel kehadiran kosong');
        console.log('2. Nilai anggota_id di kehadiran tidak valid');
        console.log('3. Tabel anggota kosong');
      } else {
        console.log('\n✅ JOIN BERHASIL! Nama ditampilkan dengan benar.');
        
        // Cek apakah ada nama yang null
        const hasNullName = joinResults.some(r => !r.nama);
        if (hasNullName) {
          console.log('⚠️ Ada record dengan nama NULL!');
        }
      }
    } catch (joinErr) {
      console.log('\n❌ ERROR SAAT JOIN:');
      console.log(joinErr.message);
      console.log('\nKemungkinan masalah:');
      console.log('1. Kolom anggota_id tidak ada');
      console.log('2. Foreign key constraint error');
      console.log('3. Tipe data tidak cocok');
    }
    
    // 7. CEK KEHADIRAN DENGAN anggota_id TIDAK VALID
    console.log('\n🔍 CEK KEHADIRAN DENGAN anggota_id TIDAK VALID:');
    const invalidQuery = `
      SELECT k.* 
      FROM kehadiran k 
      LEFT JOIN anggota a ON k.anggota_id = a.id 
      WHERE a.id IS NULL
    `;
    
    const [invalidData] = await connection.execute(invalidQuery);
    if (invalidData.length > 0) {
      console.log('⚠️ DITEMUKAN', invalidData.length, 'record dengan anggota_id tidak valid:');
      console.table(invalidData);
      console.log('\nSolusi: Update atau hapus record ini');
    } else {
      console.log('✅ Semua anggota_id valid!');
    }
    
    await connection.end();
    console.log('\n✅ Debug selesai!');
    
  } catch (err) {
    console.error('❌ ERROR:', err.message);
    console.error(err.stack);
  }
}

// Jalankan debug
debugKehadiranQuery().then(() => {
  console.log('\n🎉 Script selesai!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
