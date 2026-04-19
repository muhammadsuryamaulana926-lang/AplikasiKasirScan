import api from './api';

// Login dengan email dan password
export const login = (data: object) => api.post('/employees/login', data);

// Login menggunakan akun Google dengan idToken dari Google OAuth
export const login_google = (idToken: string) => api.post('/employees/google-login', { idToken });

// Mengirim kode OTP ke email (type: 'register' atau 'forgot_password')
export const kirim_otp = (email: string, type: string) => api.post('/employees/request-otp', { email, type });

// Memverifikasi kode OTP yang dikirim ke email
export const verifikasi_kode_otp = (email: string, code: string, type: string) => api.post('/employees/verify-otp', { email, code, type });

// Mengirim OTP reset password ke email
export const lupa_password = (email: string) => api.post('/employees/forgot-password', { email });

// Reset password menggunakan kode OTP
export const reset_password = (data: object) => api.post('/employees/reset-password', data);

// Mengambil semua karyawan aktif dengan filter opsional
export const ambil_semua_karyawan = (params?: object) => api.get('/employees', { params });

// Mengambil detail satu karyawan berdasarkan ID
export const ambil_satu_karyawan = (id: string) => api.get(`/employees/${id}`);

// Membuat karyawan baru
export const buat_karyawan_baru = (data: object) => api.post('/employees', data);

// Memperbarui data karyawan berdasarkan ID
export const ubah_karyawan = (id: string, data: object) => api.put(`/employees/${id}`, data);

// Menonaktifkan karyawan berdasarkan ID (soft delete)
export const hapus_karyawan = (id: string) => api.delete(`/employees/${id}`);
