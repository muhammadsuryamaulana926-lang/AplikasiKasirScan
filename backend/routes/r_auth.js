const express = require('express');
const router = express.Router();
const { login, tampil_semua_karyawan, tampil_satu_karyawan, buat_karyawan_baru, ubah_karyawan, hapus_karyawan, kirim_otp, verifikasi_kode_otp, login_google, lupa_password, reset_password } = require('../controllers/c_auth');

module.exports = () => {
    // POST /api/employees/login → Login dengan email dan password
    router.post('/login', login);

    // POST /api/employees/google-login → Login menggunakan akun Google
    router.post('/google-login', login_google);

    // POST /api/employees/request-otp → Kirim kode OTP ke email
    // Harus didaftarkan sebelum POST /:id agar tidak bentrok
    router.post('/request-otp', kirim_otp);

    // POST /api/employees/verify-otp → Verifikasi kode OTP
    router.post('/verify-otp', verifikasi_kode_otp);

    // POST /api/employees/forgot-password → Kirim OTP untuk reset password
    router.post('/forgot-password', lupa_password);

    // POST /api/employees/reset-password → Reset password dengan kode OTP
    router.post('/reset-password', reset_password);

    // GET /api/employees → Ambil semua karyawan aktif
    router.get('/', tampil_semua_karyawan);

    // POST /api/employees → Buat karyawan baru
    // Didaftarkan setelah semua route spesifik di atas
    router.post('/', buat_karyawan_baru);

    // GET /api/employees/:id → Ambil detail satu karyawan
    router.get('/:id', tampil_satu_karyawan);

    // PUT /api/employees/:id → Perbarui data karyawan
    router.put('/:id', ubah_karyawan);

    // DELETE /api/employees/:id → Nonaktifkan karyawan (soft delete)
    router.delete('/:id', hapus_karyawan);

    return router;
};
