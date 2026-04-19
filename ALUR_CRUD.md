# Alur CRUD Aplikasi Kasir

Dokumen ini menjelaskan bagaimana proses CRUD (Create, Read, Update, Delete) berjalan dari tampilan di frontend sampai ke database di backend, lengkap dengan penjelasan istilah-istilah teknis yang digunakan.

---

## Kamus Istilah — Baca Ini Dulu

Sebelum masuk ke alur, berikut penjelasan kata-kata yang sering muncul di kode:

### `const`
`const` adalah cara mendeklarasikan sebuah **variabel yang nilainya tidak akan berubah** (konstanta). Dipakai untuk menyimpan fungsi, hasil data, atau konfigurasi yang sudah pasti.
```js
const id = 'prod-a1b2c3'; // id ini tidak akan diubah lagi
const tampil_semua_produk = async (req, res) => { ... }; // fungsi disimpan ke variabel
```

### `let`
`let` adalah cara mendeklarasikan **variabel yang nilainya bisa berubah**. Dipakai ketika nilai perlu dimodifikasi, misalnya query SQL yang dibangun secara bertahap tergantung kondisi filter yang dikirim user.
```js
let query = 'SELECT * FROM products WHERE is_active = 1';
// Nanti query ini bisa ditambah kondisi lagi tergantung filter
if (search) query += ' AND name LIKE ?'; // query berubah
```

### `await`
`await` artinya **"tunggu dulu sampai selesai, baru lanjut"**. Dipakai karena komunikasi ke database atau ke server membutuhkan waktu — kalau tidak ditunggu, kode berikutnya akan jalan sebelum datanya siap dan hasilnya akan kosong atau error.
```js
// Tanpa await — berbahaya, data belum tentu ada saat dipakai
const res = api.get('/products');
setProducts(res.data); // ❌ res.data belum ada

// Dengan await — aman, tunggu sampai data benar-benar datang
const res = await api.get('/products');
setProducts(res.data); // ✅ res.data sudah pasti ada
```

### `try ... catch`
`try` dan `catch` adalah mekanisme **penanganan error**. Kode yang berisiko gagal (seperti request ke server atau query ke database) dimasukkan ke dalam blok `try`. Kalau terjadi error, program tidak crash — melainkan masuk ke blok `catch` untuk menangani errornya dengan baik, misalnya menampilkan pesan ke user.
```js
try {
    // Coba jalankan ini
    const res = await api.get('/products');
    setProducts(res.data.data);
} catch (error) {
    // Kalau gagal, tangani di sini — jangan biarkan aplikasi crash
    console.log('Gagal ambil data:', error.message);
    tampilkanPesanError('Gagal terhubung ke server');
}
```

---

## Kamus HTTP Method — GET, POST, PUT, DELETE

Ketika frontend berkomunikasi dengan backend, mereka menggunakan **HTTP Method** untuk memberi tahu backend "mau ngapain". Analoginya seperti percakapan:

| Method | Analogi | Kegunaan | Contoh |
|--------|---------|----------|--------|
| **GET** | "Tolong ambilkan data" | Mengambil/membaca data, tidak mengubah apapun di database | Tampilkan daftar produk |
| **POST** | "Tolong simpan data baru ini" | Membuat/menambah data baru ke database | Tambah produk baru |
| **PUT** | "Tolong ganti data yang ini" | Mengubah/memperbarui data yang sudah ada | Edit data produk |
| **DELETE** | "Tolong hapus data ini" | Menghapus atau menonaktifkan data | Hapus produk |

```js
api.get('/products')          // Ambil semua produk
api.post('/products', data)   // Tambah produk baru
api.put('/products/123', data) // Edit produk dengan id 123
api.delete('/products/123')   // Hapus produk dengan id 123
```

---

## Konsep Alur — 4 Lapisan

Setiap operasi data selalu melewati 4 lapisan secara berurutan. Tidak ada yang boleh dilewati:

```
Frontend (v_*.tsx)
    ↓  user klik tombol → kirim request HTTP
Route (r_*.js)
    ↓  "pintu masuk" — tentukan fungsi mana yang dipanggil
Controller (c_*.js)
    ↓  "otak" — proses logika, validasi, format data
Model (m_*.js)
    ↓  "tangan" — eksekusi SQL langsung ke database
Database (MySQL)
```

Kenapa harus berlapis seperti ini? Supaya setiap bagian punya tanggung jawab yang jelas dan mudah dicari kalau ada bug. Kalau ada masalah di query SQL, cukup buka model. Kalau ada masalah logika bisnis, cukup buka controller.

---

## Contoh Nyata: Halaman Stok Barang (v_produk.tsx)

---

### 1. READ — Tampilkan Daftar Produk

**Kapan terjadi:** Saat halaman pertama kali dibuka, setelah refresh, atau setelah user mengetik di kolom pencarian.

**Frontend** `v_produk.tsx` — fungsi `ambilDataProduk()`
```ts
const ambilDataProduk = async () => {
    try {
        setProsesMemuat(true); // Tampilkan loading spinner

        // GET = "tolong ambilkan data produk"
        // params = filter tambahan yang dikirim ke backend (search, category, limit)
        const res = await api.get('/products', {
            params: { search: kataCari, category: selectedCategory, limit: 100 }
        });

        setProducts(res.data.data); // Simpan hasil ke state agar tampil di layar
    } catch (err) {
        console.error(err); // Kalau gagal, catat errornya
    } finally {
        setProsesMemuat(false); // Sembunyikan loading, apapun hasilnya
    }
};
```

**Route** `r_produk.js` — pintu masuk request
```js
// Ketika ada request GET ke /api/products
// teruskan ke fungsi tampil_semua_produk di controller
router.get('/', tampil_semua_produk);
```

**Controller** `c_produk.js` — fungsi `tampil_semua_produk()`
```js
// req = data yang dikirim frontend (query params, body, dll)
// res = objek untuk mengirim balasan ke frontend
const tampil_semua_produk = async (req, res) => {
    try {
        // Panggil model untuk ambil data dari database
        const { rows, total, p, l } = await cari_semua_produk(req.query);

        // Kirim balasan ke frontend dalam format JSON
        res.json({
            success: true,
            data: rows.map(format_produk), // ubah format snake_case → camelCase
            pagination: { total, page: p, limit: l, totalPages: Math.ceil(total / l) }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Database error' });
    }
};
```

**Model** `m_produk.js` — fungsi `cari_semua_produk()`
```js
const cari_semua_produk = async (filters) => {
    const { search, category, page = 1, limit = 20 } = filters;

    // let dipakai karena query ini akan dimodifikasi tergantung filter yang ada
    let query = 'SELECT p.*, c.name as categoryName FROM products p
                 LEFT JOIN categories c ON p.category_id = c.id
                 WHERE p.is_active = 1';
    let params = [];

    // Tambah kondisi pencarian hanya kalau user mengetik sesuatu
    if (search) {
        query += ' AND (p.name LIKE ? OR p.barcode LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }

    // await karena query ke database butuh waktu
    const [rows] = await db.query(query, params);
    return { rows, total, p, l };
};
```

---

### 2. CREATE — Tambah Produk Baru

**Kapan terjadi:** User tekan tombol `+` → isi form (nama, harga, stok, dll) → tekan "Simpan Produk".

**Frontend** `v_produk.tsx` — fungsi `simpanDataProduk()`
```ts
const simpanDataProduk = async () => {
    // Validasi dulu sebelum kirim ke server
    if (!formData.name || !formData.sellPrice) {
        tampilkanError('Nama dan Harga Jual wajib diisi!');
        return; // Berhenti, jangan lanjut
    }

    try {
        // Siapkan data yang akan dikirim
        const payload = {
            ...formData,
            sellPrice: Number(formData.sellPrice), // Pastikan angka, bukan teks
            buyPrice: Number(formData.buyPrice),
            stock: Number(formData.stock),
        };

        // selectedProduct null = ini tambah baru, pakai POST
        // selectedProduct ada = ini edit, pakai PUT
        if (selectedProduct) {
            await api.put(`/products/${selectedProduct.id}`, payload);
        } else {
            await api.post('/products', payload); // POST = "simpan data baru ini"
        }

        setIsFormVisible(false); // Tutup modal form
        ambilDataProduk();       // Refresh daftar produk
    } catch (err) {
        tampilkanError(err.response?.data?.error || 'Gagal menyimpan data.');
    }
};
```

**Route** `r_produk.js`
```js
// Ketika ada request POST ke /api/products
// teruskan ke fungsi buat_produk_baru di controller
router.post('/', buat_produk_baru);
```

**Controller** `c_produk.js` — fungsi `buat_produk_baru()`
```js
const buat_produk_baru = async (req, res) => {
    try {
        // Buat ID unik untuk produk baru
        // uuidv4() menghasilkan string acak, .slice(0,8) ambil 8 karakter pertama
        // Contoh hasil: "prod-a1b2c3d4"
        const id = `prod-${uuidv4().slice(0, 8)}`;

        // Panggil model untuk simpan ke database
        await simpan_produk_baru(id, req.body);

        // Kirim balasan sukses ke frontend
        res.status(201).json({ success: true, data: { id, name: req.body.name } });
    } catch (err) {
        // Kalau barcode sudah dipakai produk lain, beri pesan yang jelas
        const message = err.code === 'ER_DUP_ENTRY'
            ? 'Barcode sudah digunakan oleh produk lain'
            : err.message;
        res.status(500).json({ success: false, error: message });
    }
};
```

**Model** `m_produk.js` — fungsi `simpan_produk_baru()`
```js
const simpan_produk_baru = async (id, data) => {
    // Destrukturisasi — ambil nilai dari objek data
    const { barcode, name, categoryId, buyPrice, sellPrice, stock, minStock, unit, image, expiryDate, supplier } = data;

    // await karena INSERT ke database butuh waktu
    // Tanda ? adalah placeholder aman untuk mencegah SQL Injection
    await db.query(
        'INSERT INTO products (id, barcode, name, category_id, buy_price, sell_price, stock, min_stock, unit, image, expiry_date, supplier) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, barcode || '', name || '', categoryId || null, Number(buyPrice) || 0, Number(sellPrice) || 0, Number(stock) || 0, Number(minStock) || 0, unit || 'pcs', image || null, expiryDate || null, supplier || null]
    );
};
```

---

### 3. UPDATE — Edit Produk

**Kapan terjadi:** User tekan salah satu produk di list → form terbuka dengan data yang sudah terisi → ubah data → tekan "Simpan Produk".

> Fungsi `simpanDataProduk()` di frontend dipakai untuk CREATE dan UPDATE sekaligus. Bedanya hanya satu kondisi: kalau `selectedProduct` ada isinya berarti sedang edit (PUT), kalau kosong berarti tambah baru (POST).

**Frontend** `v_produk.tsx` — fungsi `simpanDataProduk()`
```ts
// Bagian yang membedakan CREATE vs UPDATE hanya di sini:
if (selectedProduct) {
    // PUT = "ganti data yang sudah ada ini"
    await api.put(`/products/${selectedProduct.id}`, payload);
} else {
    await api.post('/products', payload);
}
```

**Route** `r_produk.js`
```js
// Ketika ada request PUT ke /api/products/:id
// :id adalah ID produk yang mau diedit, contoh: /api/products/prod-a1b2c3d4
router.put('/:id', ubah_produk);
```

**Controller** `c_produk.js` — fungsi `ubah_produk()`
```js
const ubah_produk = async (req, res) => {
    try {
        // req.params.id = ID produk yang diambil dari URL
        // req.body = data baru yang dikirim frontend
        const result = await ubah_data_produk(req.params.id, req.body);

        // affectedRows = jumlah baris yang berhasil diubah di database
        // Kalau 0 berarti ID tidak ditemukan
        if (result.affectedRows === 0)
            return res.status(404).json({ success: false, error: 'Produk tidak ditemukan' });

        res.json({ success: true, message: 'Produk berhasil diperbarui' });
    } catch (err) {
        const message = err.code === 'ER_DUP_ENTRY'
            ? 'Barcode sudah digunakan oleh produk lain'
            : err.message;
        res.status(500).json({ success: false, error: message });
    }
};
```

**Model** `m_produk.js` — fungsi `ubah_data_produk()`
```js
const ubah_data_produk = async (id, data) => {
    const { barcode, name, categoryId, buyPrice, sellPrice, stock, minStock, unit, image, expiryDate, supplier } = data;

    // const di sini karena result tidak akan diubah lagi, hanya dibaca
    const [result] = await db.query(
        'UPDATE products SET barcode=?, name=?, category_id=?, buy_price=?, sell_price=?, stock=?, min_stock=?, unit=?, image=?, expiry_date=?, supplier=? WHERE id=?',
        [barcode, name, categoryId, buyPrice, sellPrice, stock, minStock, unit, image, expiryDate, supplier, id]
    );

    return result; // Kembalikan ke controller untuk dicek affectedRows-nya
};
```

---

### 4. DELETE — Hapus Produk

**Kapan terjadi:** User tekan "Hapus Produk Ini" di form edit → muncul konfirmasi → tekan "Ya, Hapus".

> Hapus di aplikasi ini adalah **soft delete** — produk tidak benar-benar dihapus dari database. Yang terjadi hanya mengubah kolom `is_active` dari `1` menjadi `0`. Tujuannya agar data historis transaksi yang melibatkan produk tersebut tetap bisa dilihat, tidak ikut hilang.

**Frontend** `v_produk.tsx` — fungsi `hapusDataProduk()`
```ts
const hapusDataProduk = async () => {
    try {
        setIsDeleting(true); // Tampilkan loading di tombol hapus

        // DELETE = "nonaktifkan data ini"
        await api.delete(`/products/${productToDelete.id}`);

        setIsDeleteConfirmVisible(false); // Tutup modal konfirmasi
        setIsFormVisible(false);          // Tutup modal form
        ambilDataProduk();                // Refresh daftar — produk sudah tidak muncul
    } catch (err) {
        tampilkanError('Gagal menghapus produk.');
    } finally {
        setIsDeleting(false);
    }
};
```

**Route** `r_produk.js`
```js
// Ketika ada request DELETE ke /api/products/:id
router.delete('/:id', hapus_produk);
```

**Controller** `c_produk.js` — fungsi `hapus_produk()`
```js
const hapus_produk = async (req, res) => {
    try {
        await nonaktifkan_produk(req.params.id);
        res.json({ success: true, message: 'Produk berhasil dinonaktifkan' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
```

**Model** `m_produk.js` — fungsi `nonaktifkan_produk()`
```js
const nonaktifkan_produk = async (id) => {
    // Bukan DELETE FROM products — melainkan UPDATE is_active = 0
    // Produk tetap ada di database, hanya tidak ditampilkan
    // Karena semua query READ pakai WHERE is_active = 1
    await db.query('UPDATE products SET is_active = 0 WHERE id = ?', [id]);
};
```

---

## Ringkasan Fungsi per Lapisan

| Operasi | Frontend | Route | Controller | Model |
|---------|----------|-------|------------|-------|
| Read semua | `ambilDataProduk()` | `GET /` | `tampil_semua_produk()` | `cari_semua_produk()` |
| Read satu | - | `GET /:id` | `tampil_satu_produk()` | `cari_satu_produk()` |
| Create | `simpanDataProduk()` | `POST /` | `buat_produk_baru()` | `simpan_produk_baru()` |
| Update | `simpanDataProduk()` | `PUT /:id` | `ubah_produk()` | `ubah_data_produk()` |
| Delete | `hapusDataProduk()` | `DELETE /:id` | `hapus_produk()` | `nonaktifkan_produk()` |

---

## Pola yang Sama Berlaku untuk Domain Lain

Semua halaman mengikuti pola yang sama persis, tinggal ganti domainnya:

| Halaman | Frontend | Route | Controller | Model |
|---------|----------|-------|------------|-------|
| Stok Barang | `v_produk.tsx` | `r_produk.js` | `c_produk.js` | `m_produk.js` |
| Hutang | `v_hutang.tsx` | `r_hutang.js` | `c_hutang.js` | `m_hutang.js` |
| Pelanggan | `v_pelanggan.tsx` | `r_pelanggan.js` | `c_pelanggan.js` | `m_pelanggan.js` |
| Transaksi | `v_transaksi.tsx` | `r_transaksi.js` | `c_transaksi.js` | `m_transaksi.js` |
| Kasir | `v_kasir.tsx` | `r_transaksi.js` | `c_transaksi.js` | `m_transaksi.js` |
| Login/Daftar | `v_login.tsx` | `r_auth.js` | `c_auth.js` | `m_auth.js` |
| Dasbor | `v_dasbor.tsx` | `r_dasbor.js` | `c_dasbor.js` | `m_dasbor.js` |

---

## Catatan Penting

- **`format_produk()`** di controller bertugas mengubah nama kolom database (`snake_case`) menjadi format yang dipakai frontend (`camelCase`). Contoh: `buy_price` → `buyPrice`, `is_active` → `isActive`. Ini perlu karena konvensi penamaan di database dan JavaScript berbeda.
- **`api.ts`** di frontend adalah konfigurasi Axios yang mengatur base URL server dan timeout. Semua request dari semua halaman melewati file ini, jadi kalau alamat server berubah cukup ubah di satu tempat.
- **`pusat_data_aplikasi.tsx`** menyimpan state global seperti status login, data user, dan keranjang belanja — bukan untuk CRUD produk secara langsung.
- **Tanda `?` di SQL** bukan tanda tanya biasa — ini adalah placeholder yang secara otomatis mengamankan input dari serangan SQL Injection. Nilai aslinya dikirim terpisah di array parameter.
