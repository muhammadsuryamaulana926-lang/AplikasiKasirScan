// KEGIATAN LOGIC - LAPIS 3: INTENT & DATA ROUTER untuk KEGIATAN
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
function detectKegiatanQuery(question) {
  if (isNonDataIntent(question)) return false;
  
  const q = question.toLowerCase();
  
  // Normalisasi typo
  const normalized = q
    .replace(/kegitan/g, 'kegiatan')
    .replace(/ke giatan/g, 'kegiatan')
    .replace(/kehabitan/g, 'kegiatan');
  
  // Pattern untuk kegiatan (termasuk jadwal)
  const kegiatanKeywords = ['kegiatan', 'acara', 'event', 'agenda', 'aktivitas', 'jadwal'];
  const hasKegiatan = kegiatanKeywords.some(kw => normalized.includes(kw));
  
  return hasKegiatan;
}

// ━━━━━━━━━━━━━━━━━━━━━━
// LAPIS 4: QUERY ENGINE
// ━━━━━━━━━━━━━━━━━━━━━━
function buildKegiatanSQLPrompt(question, schema) {
  return `Kamu adalah CORE LOGIC ENGINE - LAPIS 4: QUERY & VALIDATION ENGINE untuk KEGIATAN.

Database Schema:
${schema}

Pertanyaan User: "${question}"

========================
LOGIKA KEGIATAN
========================

1. Cari tabel kegiatan:
   - kegiatan, acara, event, agenda, aktivitas

2. SELECT HANYA field berikut:
   - nama_kegiatan (atau nama, judul, title)
   - lokasi (atau tempat, venue, location)
   - tanggal (atau date, waktu, tgl)

3. DILARANG SELECT:
   - id
   - deskripsi
   - budget
   - status
   - created_at
   - updated_at

4. WAJIB ORDER BY:
   - ORDER BY tanggal DESC (terbaru ke lama)

5. LIMIT:
   - LIMIT 100 (tampilkan SEMUA kegiatan)

========================
CONTOH QUERY YANG BENAR
========================

SELECT 
  nama_kegiatan,
  lokasi,
  tanggal
FROM kegiatan
ORDER BY tanggal DESC
LIMIT 100

========================
RULES KETAT
========================
- HANYA SELECT 3 field: nama_kegiatan, lokasi, tanggal
- WAJIB ORDER BY tanggal DESC
- LIMIT 100 untuk menampilkan semua
- JANGAN gunakan SELECT *
- Jika tidak ada tabel kegiatan: jawab "TIDAK_DITEMUKAN"

========================
ANTI-HALUSINASI MODE
========================
- STOP jika tabel tidak ditemukan
- JANGAN buat query setengah-setengah
- JANGAN asumsi nama tabel

SEKARANG: Buat SQL query untuk pertanyaan user.

Jawab HANYA SQL query (tanpa penjelasan) atau "TIDAK_DITEMUKAN".

SQL Query:`;
}

// ━━━━━━━━━━━━━━━━━━━━━━
// LAPIS 2: CONTEXT MANAGER
// ━━━━━━━━━━━━━━━━━━━━━━
function extractOrganisasi(question) {
  let organisasi = 'Organisasi';
  const orgKeywords = {
    'nangka busuk': 'Nangka Busuk',
    'nangka': 'Nangka Busuk',
    'busuk': 'Nangka Busuk',
    'nangsuk': 'Nangka Busuk',
    'madura': 'Sate Madura',
    'sate': 'Sate Madura',
    'ujicoba': 'Ujicoba',
    'uji coba': 'Ujicoba',
    'perusahaan profesional': 'Perusahaan Profesional',
    'perusahaan': 'Perusahaan Profesional'
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
function buildKegiatanFormatPrompt(question, data, database = "") {
  if (!data || data.length === 0) {
    const organisasi = extractOrganisasi(question);
    return `Data kegiatan untuk ${organisasi} tidak ditemukan di database ${database}.`;
  }
  
  const organisasi = extractOrganisasi(question);
  
  return `CORE LOGIC ENGINE - Kamu adalah asisten data kegiatan organisasi.

Pertanyaan User: "${question}"
Database: ${database}
Organisasi: ${organisasi}

Data Kegiatan:
${JSON.stringify(data, null, 2)}

Format OUTPUT FINAL:
🤖 **Daftar Kegiatan ${organisasi} (Terbaru → Lama)**

{nomor}. {Nama Kegiatan}
Lokasi  : {lokasi / "-"}
Tanggal : {tanggal}

ATURAN ABSOLUT:
✅ Setiap field di BARIS TERPISAH
✅ Format "Label : Value"
✅ Semua kegiatan format IDENTIK
✅ Jika lokasi kosong → "-"
✅ Tampilkan SEMUA ${data.length} data

❌ DILARANG:
- Tampilkan instruksi/penjelasan
- Gunakan tanda "-" sebagai pemisah
- Bold nomor urut atau emoji
- Mengarang data

OUTPUT MODE: Tampilkan HANYA hasil final!

Jawaban:`;
}

module.exports = {
  isNonDataIntent,
  detectKegiatanQuery,
  buildKegiatanSQLPrompt,
  buildKegiatanFormatPrompt
};
