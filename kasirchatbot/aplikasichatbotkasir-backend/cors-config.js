// CORS Configuration untuk Frontend yang berada di folder terpisah
const corsOptions = {
  origin: [
    // Development ports untuk React/Vite
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:3002',
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:8081',
    
    // React Native Expo (ganti dengan IP Expo kamu)
    'exp://192.168.1.100:8081',
    'exp://192.168.100.103:8081',
    
    // Production (sesuaikan dengan domain production)
    // 'https://yourdomain.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

module.exports = corsOptions;