// Mengubah angka menjadi format mata uang Rupiah
// Contoh: 15000 → "Rp 15.000"
function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
}

// Memotong array menjadi halaman-halaman kecil (pagination)
// Contoh: array 100 data, page=2, limit=20 → mengembalikan data ke-21 sampai ke-40
function paginate(array, page = 1, limit = 20) {
    // Hitung posisi awal dan akhir data yang akan diambil
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = {};

    // Informasi total data dan halaman
    results.total = array.length;
    results.totalPages = Math.ceil(array.length / limit);
    results.currentPage = page;
    results.limit = limit;

    // Tambahkan info halaman berikutnya jika masih ada data
    if (endIndex < array.length) results.nextPage = page + 1;

    // Tambahkan info halaman sebelumnya jika bukan halaman pertama
    if (startIndex > 0) results.prevPage = page - 1;

    // Potong array sesuai halaman yang diminta
    results.data = array.slice(startIndex, endIndex);
    return results;
}

// Menyaring array berdasarkan kata kunci pencarian di field tertentu
// Contoh: filterBySearch(products, 'indomie', ['name', 'barcode'])
function filterBySearch(array, query, fields) {
    // Jika tidak ada kata kunci, kembalikan semua data
    if (!query) return array;

    // Ubah kata kunci menjadi huruf kecil agar pencarian tidak case-sensitive
    const q = query.toLowerCase();

    // Filter item yang memiliki nilai yang mengandung kata kunci di salah satu field
    return array.filter(item =>
        fields.some(field => item[field] && String(item[field]).toLowerCase().includes(q))
    );
}

// Ekspor semua fungsi agar bisa digunakan di file lain
module.exports = { formatRupiah, paginate, filterBySearch };
