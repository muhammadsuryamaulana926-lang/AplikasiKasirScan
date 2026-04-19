// Import library nodemailer untuk mengirim email
const nodemailer = require('nodemailer');

// Membuat transporter email menggunakan akun Gmail
// Kredensial diambil dari variabel lingkungan .env agar tidak hardcode
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Alamat email pengirim
        pass: process.env.EMAIL_PASS  // Password atau App Password Gmail
    }
});

// Fungsi untuk mengirim kode OTP ke email pengguna
// Parameter:
//   email → alamat email tujuan
//   code  → kode OTP 6 digit
//   type  → 'register' untuk pendaftaran, 'forgot_password' untuk reset password
const sendOTP = async (email, code, type) => {
    let subject = '';
    let message = '';

    // Tentukan subjek dan isi pesan berdasarkan tipe OTP
    if (type === 'register') {
        subject = 'Kode OTP Pendaftaran - Kasiraja';
        message = `Silakan gunakan kode OTP berikut untuk menyelesaikan pendaftaran Anda: <b>${code}</b>. Kode ini berlaku selama 10 menit.`;
    } else {
        subject = 'Kode OTP Lupa Password - Kasiraja';
        message = `Anda menerima email ini karena ada permintaan untuk reset password. Kode OTP Anda adalah: <b>${code}</b>. Kode ini berlaku selama 10 menit.`;
    }

    // Konfigurasi email yang akan dikirim
    const mailOptions = {
        from: `"Kasiraja Support" <${process.env.EMAIL_USER}>`, // Nama dan alamat pengirim
        to: email,       // Alamat email penerima
        subject: subject, // Subjek email
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px; margin: auto;">
                <h2 style="color: #FF8000; text-align: center;">Kasiraja</h2>
                <hr>
                <p>Halo,</p>
                <p>${message}</p>
                <p>Jika Anda tidak merasa melakukan permintaan ini, silakan abaikan email ini.</p>
                <hr>
                <p style="font-size: 12px; color: #888; text-align: center;">© 2026 Kasiraja. Semua Hak Dilindungi.</p>
            </div>
        `
    };

    try {
        // Kirim email menggunakan transporter
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
};

// Ekspor fungsi sendOTP agar bisa digunakan di routes karyawan
module.exports = { sendOTP };
