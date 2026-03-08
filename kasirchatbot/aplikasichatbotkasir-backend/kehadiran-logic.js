// KEHADIRAN LOGIC - LAPIS 3: INTENT & DATA ROUTER untuk KEHADIRAN
// CORE LOGIC ENGINE - Anti Misroute

// ━━━━━━━━━━━━━━━━━━━━━━
// LAPIS 0: GLOBAL GUARD
// ━━━━━━━━━━━━━━━━━━━━━━
function isNonDataIntent(question) {
  const q = question.toLowerCase().trim();
  const nonDataPatterns = [
    /^(hai|halo|hi|hello|selamat\s+(pagi|siang|sore|malam))$/,
    /^(terima\s*kasih|thanks|thank\s*you)$/,
    /(bahasa\s+(indonesia|inggris|english)|pakai\s+bahasa)/
  ];
  return nonDataPatterns.some(pattern => pattern.test(q));
}

// ━━━━━━━━━━━━━━━━━━━━━━
// LAPIS 1: INPUT PROCESSOR
// ━━━━━━━━━━━━━━━━━━━━━━
function detectKehadiranQuery(question) {
  if (isNonDataIntent(question)) return false;
  
  const q = question.toLowerCase();
  
  // Normalisasi typo
  const normalized = q
    .replace(/ke hadiran/g, 'kehadiran')
    .replace(/absn/g, 'absensi')
    .replace(/absnsi/g, 'absensi');
  
  // Deteksi keyword kehadiran (termasuk typo)
  const kehadiranKeywords = ['kehadiran', 'absen', 'absensi', 'presensi'];
  const hasKehadiran = kehadiranKeywords.some(kw => normalized.includes(kw));
  
  // KEHADIRAN ≠ DAFTAR NAMA
  const isDaftarNama = (normalized.includes('daftar') || normalized.includes('nama')) && !hasKehadiran;
  
  return hasKehadiran && !isDaftarNama;
}

// ━━━━━━━━━━━━━━━━━━━━━━
// LAPIS 4: QUERY & VALIDATION ENGINE
// ━━━━━━━━━━━━━━━━━━━━━━
function buildKehadiranSQLPrompt(question, schema) {
  // Ekstrak nama tabel dari schema dengan lebih akurat
  const kehadiranMatch = schema.match(/Tabel:\s*(\w*(?:kehadiran|attendance|absensi|presensi)\w*)/i);
  const anggotaMatch = schema.match(/Tabel:\s*(\w*(?:anggota|member|users|pengguna)\w*)/i);
  
  const kehadiranTable = kehadiranMatch ? kehadiranMatch[1] : 'kehadiran';
  const anggotaTable = anggotaMatch ? anggotaMatch[1] : 'anggota';
  
  // Deteksi foreign key dari schema
  let foreignKey = 'anggota_id';
  const fkPatterns = ['anggota_id', 'member_id', 'user_id', 'id_anggota'];
  for (const pattern of fkPatterns) {
    if (schema.toLowerCase().includes(pattern)) {
      foreignKey = pattern;
      break;
    }
  }
  
  // Deteksi nama kolom keterangan/catatan dari schema
  let keteranganCol = 'keterangan'; // default
  
  // Cek apakah ada kolom 'catatan' di schema
  if (schema.toLowerCase().includes('- catatan (')) {
    keteranganCol = 'catatan';
  } else if (schema.toLowerCase().includes('- keterangan (')) {
    keteranganCol = 'keterangan';
  }
  
  console.log(`🔍 Detected keterangan column: ${keteranganCol}`);
  
  // Deteksi nama kolom tanggal
  let tanggalCol = 'tanggal';
  if (schema.toLowerCase().includes('- tanggal (')) {
    tanggalCol = 'tanggal';
  } else if (schema.toLowerCase().includes('- created_at (') && !schema.toLowerCase().includes('- tanggal (')) {
    tanggalCol = 'created_at';
  } else if (schema.toLowerCase().includes('- waktu_datang (')) {
    tanggalCol = 'waktu_datang';
  }
  
  console.log(`🔍 Detected tanggal column: ${tanggalCol}`);
  
  // Generate SQL langsung tanpa AI dengan kolom yang sesuai
  const sql = `SELECT a.nama, k.status, k.${keteranganCol} as keterangan, k.${tanggalCol} as tanggal FROM ${kehadiranTable} k INNER JOIN ${anggotaTable} a ON k.${foreignKey} = a.id ORDER BY k.id DESC LIMIT 100`;
  
  console.log(`📝 Generated SQL: ${sql}`);
  
  // Return SQL langsung, bukan prompt untuk AI
  return sql;
}

// ━━━━━━━━━━━━━━━━━━━━━━
// LAPIS 2: CONTEXT MANAGER
// ━━━━━━━━━━━━━━━━━━━━━━
function extractOrganisasiKehadiran(question) {
  let organisasi = 'organisasi';
  const orgKeywords = {
    'nangka busuk': 'Nangka Busuk',
    'nangka': 'Nangka Busuk',
    'busuk': 'Nangka Busuk',
    'nangsuk': 'Nangka Busuk',
    'madura': 'Sate Madura',
    'sate': 'Sate Madura',
    'ujicoba': 'Ujicoba',
    'uji coba': 'Ujicoba'
  };
  
  const qLower = question.toLowerCase();
  for (const [key, value] of Object.entries(orgKeywords)) {
    if (qLower.includes(key)) {
      organisasi = value;
      break;
    }
  }
  
  return organisasi;
}

// ━━━━━━━━━━━━━━━━━━━━━━
// LAPIS 5: RESPONSE COMPOSER
// ━━━━━━━━━━━━━━━━━━━━━━
function buildKehadiranFormatPrompt(question, data, database = "") {
  // LAPIS 4: VALIDATION ENGINE
  if (!data || data.length === 0) {
    const organisasi = extractOrganisasiKehadiran(question);
    return `Data kehadiran untuk ${organisasi} tidak ditemukan di database ${database}.`;
  }
  
  // Validasi field nama WAJIB di semua record
  if (!data[0]?.nama) {
    return `❌ ERROR INTERNAL: Query JOIN dengan tabel anggota GAGAL.

Data kehadiran tidak memiliki field "nama".
Hubungi admin untuk memperbaiki struktur database.`;
  }
  
  // LAPIS 2: CONTEXT MANAGER
  const organisasi = extractOrganisasiKehadiran(question);
  
  // Extract tanggal dari data
  let tanggal = '';
  if (data && data.length > 0) {
    tanggal = data[0].tanggal || data[0].waktu || data[0].created_at || '';
    if (tanggal) {
      try {
        const date = new Date(tanggal);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        tanggal = date.toLocaleDateString('id-ID', options);
      } catch (e) {
        // Keep original
      }
    }
  }
  
  return `CORE LOGIC ENGINE - Kamu adalah asisten data organisasi.

Pertanyaan User: "${question}"
Database: ${database}
Organisasi: ${organisasi}

Data Kehadiran:
${JSON.stringify(data, null, 2)}

Format OUTPUT FINAL:
📋 **Kehadiran ${organisasi}**
${tanggal ? `📅 ${tanggal}` : ''}

{nomor}. {Nama}
Status     : {status}
Keterangan : {keterangan / "-"}

ATURAN ABSOLUT:
✅ Setiap field di BARIS TERPISAH
✅ Format "Label : Value"
✅ Semua data format IDENTIK
✅ Jika keterangan kosong → "-"
✅ Tampilkan SEMUA ${data.length} data

❌ DILARANG:
- Tampilkan instruksi/penjelasan
- Gunakan tanda "-" sebagai pemisah
- Bold nomor urut
- Mengarang data

OUTPUT MODE: Tampilkan HANYA hasil final!

Jawaban:`;
}

module.exports = {
  isNonDataIntent,
  detectKehadiranQuery,
  buildKehadiranSQLPrompt,
  buildKehadiranFormatPrompt
};