import axios from 'axios';
import { Platform } from 'react-native';

// For Expo Go: use your local IP when on physical device
// For emulator: use 10.0.2.2 (Android) or localhost (iOS)
const getBaseUrl = () => {
    if (Platform.OS === 'android') {
        // Ganti dengan IP komputer Anda jika menggunakan HP fisik
        return 'http://10.251.108.102:3001/api';
    }
    return 'http://localhost:3001/api';
};

const api = axios.create({
    baseURL: getBaseUrl(),
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor for error handling
api.interceptors.response.use(
    response => response,
    error => {
        if (error.code === 'ECONNABORTED') {
            console.log('Request timeout - server might be offline');
        }
        if (!error.response) {
            console.log('Network error - using offline mode');
        }
        return Promise.reject(error);
    }
);

export default api;
