const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const router = express.Router();

// JWT Secret (ganti dengan secret key yang aman)
const JWT_SECRET = 'nangka-busuk-secret-key-2024';
const TOKEN_EXPIRY = '30d'; // Token berlaku 30 hari

// Google OAuth Client
const GOOGLE_CLIENT_ID = '343892476833-g175ljg5aeqipsqq9hoq4vop9bge9oev.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Database config
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'chat-botKasir_db',
  port: 3306
};

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'chatbotaiasistent@gmail.com',
    pass: 'vbtamskdswermvnv'
  }
});

// Generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP Email
async function sendOTPEmail(email, otp, type) {
  const subject = type === 'signup' ? 'Kode Verifikasi Pendaftaran' : 'Kode Reset Password';

  const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Kode Verifikasi</title>
</head>

<body style="margin:0; padding:0; background:#eef2f7; font-family: 'Segoe UI', Arial, sans-serif;">

  <div style="display:none; max-height:0; overflow:hidden; font-size:1px; line-height:1px; color:#ffffff; opacity:0;">
    KODE OTP: ${otp}. Berlaku 5 menit. Jangan bagikan kode ini kepada siapapun.
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 0;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0" 
          style="max-width:600px; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 20px 40px rgba(0,0,0,0.12);">
          
          <tr>
            <td align="center" 
              style="padding:48px 32px; background:linear-gradient(135deg,#f97316,#ea580c);">
              <h1 style="margin:0; color:#ffffff; font-size:26px; font-weight:600;">
                Keamanan Akun
              </h1>
              <p style="margin:8px 0 0; color:#ffedd5; font-size:14px;">
                Verifikasi diperlukan untuk melanjutkan
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:40px;">

              <h2 style="margin:0 0 16px; font-size:22px; color:#111827; text-align:center;">
                ${type === "signup" ? "Verifikasi Akun Anda" : "Reset Password"}
              </h2>

              <p style="margin:0 0 28px; color:#374151; font-size:15px; line-height:1.8; text-align:center;">
                ${type === "signup"
      ? "Terima kasih telah mendaftar. Gunakan kode berikut untuk mengaktifkan akun Anda."
      : "Kami menerima permintaan reset password. Gunakan kode berikut untuk melanjutkan."
    }
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" 
                style="background:#fff7ed; border-radius:14px; padding:32px; text-align:center; border:1px solid #fed7aa;">
                <tr>
                  <td>
                    <p style="margin:0 0 10px; font-size:13px; letter-spacing:1.5px; color:#9a3412; font-weight:600;">
                      KODE VERIFIKASI
                    </p>
                    <p style="margin:0; font-size:44px; letter-spacing:12px; font-weight:700; color:#c2410c; font-family:'Courier New', monospace;">
                      ${otp}
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0; color:#6b7280; font-size:14px; text-align:center;">
                Kode ini berlaku selama <strong>5 menit</strong>. <br>
                Demi keamanan, jangan berikan kode ini kepada pihak manapun termasuk pihak <strong>Nangka Busuk</strong>.
              </p>

            </td>
          </tr>

          <tr>
            <td align="center" 
              style="padding:24px 40px; background:#f9fafb; border-top:1px solid #e5e7eb;">
              <p style="margin:0; font-size:12px; color:#9ca3af;">
                Email ini dikirim otomatis, mohon tidak membalas.
              </p>
              <p style="margin:8px 0 0; font-size:12px; color:#9ca3af;">
                © ${new Date().getFullYear()} Nangka Busuk
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`;

  await transporter.sendMail({
    from: 'chatbotaiasistent@gmail.com',
    to: email,
    subject: subject,
    html: htmlContent,
    attachments: [{
      filename: 'logo.jpg',
      path: './images/logo mm.jpg',
      cid: 'logo'
    }]
  });

  console.log('Email terkirim ke:', email, '| OTP:', otp);
}

// 1. Kirim OTP Registrasi
router.post('/register/send-code', async (req, res) => {
  const { email } = req.body;
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);

    const [existing] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.json({ success: false, error: 'Email sudah terdaftar' });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await connection.execute(
      'INSERT INTO kode_otp (email, kode, tipe, kadaluarsa_pada) VALUES (?, ?, ?, ?)',
      [email, otp, 'signup', expiresAt]
    );

    await sendOTPEmail(email, otp, 'signup');
    res.json({ success: true, message: 'Kode OTP telah dikirim ke email' });
  } catch (error) {
    console.error('Error:', error);
    res.json({ success: false, error: 'Gagal mengirim kode OTP' });
  } finally {
    if (connection) await connection.end();
  }
});

// 2. Verifikasi OTP saja (tanpa buat akun)
router.post('/register/verify-code', async (req, res) => {
  const { email, code } = req.body;
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);

    if (!email || !code) {
      return res.json({ success: false, error: 'Email dan kode verifikasi harus diisi' });
    }

    if (code.toString().trim().length !== 6) {
      return res.json({ success: false, error: 'Kode verifikasi harus 6 digit' });
    }

    if (!/^\d{6}$/.test(code.toString().trim())) {
      return res.json({ success: false, error: 'Kode verifikasi harus berupa angka' });
    }

    const [allOtp] = await connection.execute(
      'SELECT * FROM kode_otp WHERE email = ? AND tipe = ? ORDER BY dibuat_pada DESC LIMIT 1',
      [email, 'signup']
    );

    if (allOtp.length === 0) {
      return res.json({ success: false, error: 'Tidak ada kode verifikasi untuk email ini' });
    }

    if (allOtp[0].digunakan) {
      return res.json({ success: false, error: 'Kode verifikasi sudah pernah digunakan' });
    }

    if (new Date() > new Date(allOtp[0].kadaluarsa_pada)) {
      return res.json({ success: false, error: 'Kode verifikasi sudah kadaluarsa. Silakan kirim ulang kode' });
    }

    if (allOtp[0].kode !== code.toString().trim()) {
      console.log('Kode salah untuk:', email, '| Input:', code, '| Seharusnya:', allOtp[0].kode);
      return res.json({ success: false, error: 'Kode verifikasi yang Anda masukkan tidak valid' });
    }

    console.log('OTP valid untuk:', email);
    res.json({ success: true, message: 'Kode verifikasi valid' });
  } catch (error) {
    console.error('Error:', error);
    res.json({ success: false, error: 'Gagal memverifikasi kode' });
  } finally {
    if (connection) await connection.end();
  }
});

// 3. Verifikasi OTP & Buat Akun
router.post('/register/verify', async (req, res) => {
  const { email, code, password } = req.body;
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);

    if (!email || !code || !password) {
      return res.json({ success: false, error: 'Data tidak lengkap' });
    }

    const [otpRows] = await connection.execute(
      'SELECT * FROM kode_otp WHERE email = ? AND kode = ? AND tipe = ? AND digunakan = FALSE AND kadaluarsa_pada > NOW() ORDER BY dibuat_pada DESC LIMIT 1',
      [email, code.toString().trim(), 'signup']
    );

    if (otpRows.length === 0) {
      console.log('OTP tidak valid untuk:', email, '| Kode:', code);
      return res.json({ success: false, error: 'Kode OTP tidak valid atau sudah kadaluarsa' });
    }

    const [existing] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.json({ success: false, error: 'Email sudah terdaftar' });
    }

    const hashedPassword = await bcrypt.hash(password, 8);

    await connection.execute(
      'INSERT INTO users (email, kata_sandi, status) VALUES (?, ?, ?)',
      [email, hashedPassword, 'active']
    );

    await connection.execute('UPDATE kode_otp SET digunakan = TRUE WHERE id = ?', [otpRows[0].id]);

    console.log('User berhasil dibuat:', email);
    res.json({ success: true, message: 'Akun berhasil dibuat' });
  } catch (error) {
    console.error('Error:', error);
    res.json({ success: false, error: 'Gagal membuat akun' });
  } finally {
    if (connection) await connection.end();
  }
});

// 4. Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);

    console.log('Login attempt for:', email);

    const [allUsers] = await connection.execute('SELECT email FROM users');
    console.log('Total users di database:', allUsers.length);
    console.log('All emails:', allUsers.map(u => u.email));

    const [users] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      console.log('Email tidak ditemukan:', email);
      return res.json({ success: false, error: 'Email atau password salah' });
    }

    // Cek status user
    if (users[0].status === 'inactive') {
      console.log('Akun tidak aktif:', email);
      return res.json({ success: false, error: 'Akun Anda telah dinonaktifkan. Silakan hubungi administrator.' });
    }

    const validPassword = await bcrypt.compare(password, users[0].kata_sandi);

    if (!validPassword) {
      console.log('Password salah untuk:', email);
      return res.json({ success: false, error: 'Email atau password salah' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: users[0].id, email: users[0].email },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    console.log('Login berhasil:', email);
    res.json({
      success: true,
      token: token,
      user: {
        id: users[0].id,
        email: users[0].email,
        name: users[0].email.split('@')[0]
      }
    });
  } catch (error) {
    console.error('Error login:', error);
    res.json({ success: false, error: 'Gagal login' });
  } finally {
    if (connection) await connection.end();
  }
});

// 5. Verifikasi OTP lupa password
router.post('/forgot-password/verify-code', async (req, res) => {
  const { email, code } = req.body;
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);

    if (!email || !code) {
      return res.json({ success: false, error: 'Email dan kode verifikasi harus diisi' });
    }

    if (code.toString().trim().length !== 6) {
      return res.json({ success: false, error: 'Kode verifikasi harus 6 digit' });
    }

    if (!/^\d{6}$/.test(code.toString().trim())) {
      return res.json({ success: false, error: 'Kode verifikasi harus berupa angka' });
    }

    const [allOtp] = await connection.execute(
      'SELECT * FROM kode_otp WHERE email = ? AND tipe = ? ORDER BY dibuat_pada DESC LIMIT 1',
      [email, 'forgot']
    );

    if (allOtp.length === 0) {
      return res.json({ success: false, error: 'Tidak ada kode verifikasi untuk email ini' });
    }

    if (allOtp[0].digunakan) {
      return res.json({ success: false, error: 'Kode verifikasi sudah pernah digunakan' });
    }

    if (new Date() > new Date(allOtp[0].kadaluarsa_pada)) {
      return res.json({ success: false, error: 'Kode verifikasi sudah kadaluarsa. Silakan kirim ulang kode' });
    }

    if (allOtp[0].kode !== code.toString().trim()) {
      console.log('Kode salah untuk:', email, '| Input:', code, '| Seharusnya:', allOtp[0].kode);
      return res.json({ success: false, error: 'Kode verifikasi yang Anda masukkan tidak valid' });
    }

    console.log('OTP valid untuk:', email);
    res.json({ success: true, message: 'Kode verifikasi valid' });
  } catch (error) {
    console.error('Error:', error);
    res.json({ success: false, error: 'Gagal memverifikasi kode' });
  } finally {
    if (connection) await connection.end();
  }
});

// 6. Kirim OTP Lupa Password
router.post('/forgot-password/send-code', async (req, res) => {
  const { email } = req.body;
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);

    const [users] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.json({ success: false, error: 'Email tidak terdaftar' });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await connection.execute(
      'INSERT INTO kode_otp (email, kode, tipe, kadaluarsa_pada) VALUES (?, ?, ?, ?)',
      [email, otp, 'forgot', expiresAt]
    );

    await sendOTPEmail(email, otp, 'forgot');
    res.json({ success: true, message: 'Kode OTP telah dikirim ke email' });
  } catch (error) {
    console.error('Error:', error);
    res.json({ success: false, error: 'Gagal mengirim kode OTP' });
  } finally {
    if (connection) await connection.end();
  }
});

// 7. Google Login
router.post('/google-login', async (req, res) => {
  const { idToken } = req.body;
  let connection;

  try {
    if (!idToken) {
      return res.json({ success: false, error: 'Token Google tidak ditemukan' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: idToken,
      audience: GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const googleId = payload['sub'];
    const email = payload['email'];
    const name = payload['name'];

    connection = await mysql.createConnection(dbConfig);

    // CEK APAKAH EMAIL SUDAH TERDAFTAR
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    // JIKA EMAIL BELUM TERDAFTAR, TOLAK LOGIN
    if (users.length === 0) {
      console.log('Email Google tidak terdaftar:', email);
      return res.json({
        success: false,
        error: 'Email Anda tidak terdaftar. Silakan buat akun terlebih dahulu menggunakan email dan password.'
      });
    }

    // Cek status user
    if (users[0].status === 'inactive') {
      console.log('Akun tidak aktif:', email);
      return res.json({ success: false, error: 'Akun Anda telah dinonaktifkan. Silakan hubungi administrator.' });
    }

    // JIKA SUDAH TERDAFTAR, UPDATE GOOGLE_ID (jika belum ada)
    if (!users[0].google_id) {
      await connection.execute(
        'UPDATE users SET google_id = ? WHERE id = ?',
        [googleId, users[0].id]
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: users[0].id, email: users[0].email },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    console.log('Google login berhasil:', email);
    return res.json({
      success: true,
      token: token,
      user: {
        id: users[0].id,
        email: users[0].email,
        name: name
      }
    });
  } catch (error) {
    console.error('Error Google login:', error);
    res.json({ success: false, error: 'Gagal login dengan Google' });
  } finally {
    if (connection) await connection.end();
  }
});

// 8. Verify Token (Auto-login)
router.post('/verify-token', async (req, res) => {
  const { token } = req.body;
  let connection;

  try {
    if (!token) {
      return res.json({ success: false, error: 'Token tidak ditemukan' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);

    connection = await mysql.createConnection(dbConfig);
    const [users] = await connection.execute('SELECT * FROM users WHERE id = ?', [decoded.userId]);

    if (users.length === 0) {
      return res.json({ success: false, error: 'User tidak ditemukan' });
    }

    // Cek status user
    if (users[0].status === 'inactive') {
      console.log('Akun tidak aktif:', users[0].email);
      return res.json({ success: false, error: 'Akun Anda telah dinonaktifkan. Silakan hubungi administrator.' });
    }

    console.log('Token valid untuk:', users[0].email);
    res.json({
      success: true,
      user: {
        id: users[0].id,
        email: users[0].email,
        name: users[0].email.split('@')[0]
      }
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.json({ success: false, error: 'Token sudah kadaluarsa' });
    }
    console.error('Error verify token:', error);
    res.json({ success: false, error: 'Token tidak valid' });
  } finally {
    if (connection) await connection.end();
  }
});

// 9. Reset Password
router.post('/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);

    if (!email || !code || !newPassword) {
      return res.json({ success: false, error: 'Data tidak lengkap' });
    }

    const [otpRows] = await connection.execute(
      'SELECT * FROM kode_otp WHERE email = ? AND kode = ? AND tipe = ? AND digunakan = FALSE AND kadaluarsa_pada > NOW() ORDER BY dibuat_pada DESC LIMIT 1',
      [email, code.toString().trim(), 'forgot']
    );

    if (otpRows.length === 0) {
      console.log('OTP tidak valid untuk:', email, '| Kode:', code);
      return res.json({ success: false, error: 'Kode OTP tidak valid atau sudah kadaluarsa' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 8);

    await connection.execute('UPDATE users SET kata_sandi = ? WHERE email = ?', [hashedPassword, email]);
    await connection.execute('UPDATE kode_otp SET digunakan = TRUE WHERE id = ?', [otpRows[0].id]);

    console.log('Password berhasil direset:', email);
    res.json({ success: true, message: 'Password berhasil direset' });
  } catch (error) {
    console.error('Error:', error);
    res.json({ success: false, error: 'Gagal reset password' });
  } finally {
    if (connection) await connection.end();
  }
});

module.exports = router;
