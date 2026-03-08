# Update Voice Recognition ke expo-speech-recognition

## Perubahan yang Dilakukan

### 1. Package yang Diupdate
- ❌ Dihapus: `@react-native-voice/voice`
- ✅ Ditambahkan: `expo-speech-recognition`

### 2. Fitur Baru
- ✅ Real-time transcription dengan `interimResults: true`
- ✅ Event-based architecture menggunakan `useSpeechRecognitionEvent`
- ✅ Permission handling yang lebih baik
- ✅ Support untuk Android dan iOS
- ✅ Konfigurasi bahasa Indonesia (`id-ID`)

### 3. Perubahan Kode di ChatScreen.tsx

#### Import
```typescript
// Sebelum
import Voice from '@react-native-voice/voice';

// Sesudah
import {
  useSpeechRecognitionEvent,
  ExpoSpeechRecognitionModule,
} from "expo-speech-recognition";
```

#### Event Handlers
```typescript
// Menggunakan hooks untuk event handling
useSpeechRecognitionEvent("start", () => {
  console.log('🎤 Speech recognition started');
  setRecognizing(true);
});

useSpeechRecognitionEvent("result", (event) => {
  if (event.results[0]?.transcript) {
    setInputText(event.results[0].transcript);
  }
});

useSpeechRecognitionEvent("error", (event) => {
  console.error('❌ Speech recognition error:', event.error);
});
```

#### Start Recording
```typescript
async function startRecording() {
  // Request permissions
  const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
  if (!result.granted) {
    Alert.alert('Izin Ditolak', 'Aplikasi memerlukan izin mikrofon');
    return;
  }

  // Start recognition
  await ExpoSpeechRecognitionModule.start({
    lang: "id-ID",
    interimResults: true,
    maxAlternatives: 1,
    continuous: false,
  });
}
```

### 4. Konfigurasi app.json
```json
{
  "plugins": [
    [
      "expo-speech-recognition",
      {
        "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone for voice input.",
        "speechRecognitionPermission": "Allow $(PRODUCT_NAME) to recognize your speech.",
        "androidSpeechServicePackages": [
          "com.google.android.googlequicksearchbox"
        ]
      }
    ]
  ]
}
```

## Cara Menjalankan

### Development
```bash
# Start Expo
npx expo start

# Run on Android
npx expo run:android

# Run on iOS
npx expo run:ios
```

### Build Production
```bash
# Android
eas build --platform android

# iOS
eas build --platform ios
```

## Testing
1. Tekan tombol microphone di input area
2. Berbicara dalam bahasa Indonesia
3. Teks akan muncul secara real-time di input field
4. Tekan tombol stop untuk menghentikan recording

## Troubleshooting

### Android
- Pastikan Google app terinstall untuk speech recognition
- Cek permission di Settings > Apps > Your App > Permissions

### iOS
- Pastikan microphone permission sudah diizinkan
- Cek di Settings > Privacy > Microphone

## Keuntungan expo-speech-recognition
1. ✅ Native Expo integration
2. ✅ Better TypeScript support
3. ✅ Real-time transcription
4. ✅ Lebih stabil dan maintained
5. ✅ Tidak perlu linking manual
6. ✅ Auto-configured dengan Expo prebuild
