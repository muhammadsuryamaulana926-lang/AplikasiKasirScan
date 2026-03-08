# Fitur Upload Foto Profil

## Deskripsi
Fitur ini memungkinkan user untuk mengganti foto profil mereka dengan mengambil foto langsung dari kamera atau memilih dari galeri.

## Cara Menggunakan
1. Buka halaman **Pengaturan Akun**
2. Tap pada **icon profil** (avatar)
3. Pilih salah satu opsi:
   - **Kamera**: Ambil foto langsung menggunakan kamera
   - **Galeri**: Pilih foto dari galeri perangkat
4. Crop foto sesuai keinginan (rasio 1:1)
5. Foto profil akan otomatis tersimpan dan tetap ada meskipun user keluar masuk aplikasi

## Fitur Teknis
- Foto profil disimpan secara lokal menggunakan **AsyncStorage**
- Foto persisten (tidak hilang saat logout/login)
- Icon tambah (+) muncul di pojok kanan bawah avatar untuk indikasi bisa diganti
- Mendukung crop dengan aspect ratio 1:1
- Kualitas gambar dioptimalkan (50%) untuk menghemat storage

## Dependencies
- `expo-image-picker`: Library untuk mengakses kamera dan galeri

## Permissions
- **Android**: Camera & Media Library
- **iOS**: Camera & Photo Library

## Catatan
- Foto disimpan dalam format URI lokal
- Jika ingin sync ke backend, perlu menambahkan API endpoint untuk upload
