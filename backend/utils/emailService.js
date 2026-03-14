const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendOTP = async (email, code, type) => {
    let subject = '';
    let message = '';

    if (type === 'register') {
        subject = 'Kode OTP Pendaftaran - Kasiraja';
        message = `Silakan gunakan kode OTP berikut untuk menyelesaikan pendaftaran Anda: <b>${code}</b>. Kode ini berlaku selama 10 menit.`;
    } else {
        subject = 'Kode OTP Lupa Password - Kasiraja';
        message = `Anda menerima email ini karena ada permintaan untuk reset password. Kode OTP Anda adalah: <b>${code}</b>. Kode ini berlaku selama 10 menit.`;
    }

    const mailOptions = {
        from: `"Kasiraja Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: subject,
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
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = { sendOTP };
