# INSTRUKSI UNTUK FRONTEND DEVELOPER

## Masalah
Backend mengirim response dengan format markdown (contoh: **text** untuk bold), 
tapi React Native tidak otomatis render markdown jadi bold.

## Solusi: Install Library Markdown Renderer

### 1. Install react-native-markdown-display

```bash
cd aplikasichatbot-frontend
npm install react-native-markdown-display
```

### 2. Update Component Chat Message

Di file yang render chat message (biasanya `ChatScreen.tsx` atau `MessageItem.tsx`), 
ganti dari:

```tsx
// SEBELUM (Salah - tidak render markdown)
<Text>{message.text}</Text>
```

Menjadi:

```tsx
// SESUDAH (Benar - render markdown)
import Markdown from 'react-native-markdown-display';

<Markdown style={markdownStyles}>
  {message.text}
</Markdown>
```

### 3. Tambahkan Style untuk Markdown

```tsx
const markdownStyles = {
  body: {
    fontSize: 14,
    color: '#333',
  },
  strong: {
    fontWeight: 'bold',
    color: '#000',
  },
  paragraph: {
    marginBottom: 8,
  },
  list_item: {
    marginBottom: 4,
  },
};
```

### 4. Contoh Lengkap

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';

const ChatMessage = ({ message }) => {
  return (
    <View style={styles.messageContainer}>
      <Markdown style={markdownStyles}>
        {message.text}
      </Markdown>
    </View>
  );
};

const markdownStyles = {
  body: {
    fontSize: 14,
    color: '#333',
  },
  strong: {
    fontWeight: 'bold',
    color: '#000',
  },
  heading1: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  paragraph: {
    marginBottom: 8,
  },
  list_item: {
    marginBottom: 4,
  },
};

const styles = StyleSheet.create({
  messageContainer: {
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 8,
  },
});

export default ChatMessage;
```

## Alternatif: react-native-markdown-renderer

Jika `react-native-markdown-display` tidak cocok, bisa pakai:

```bash
npm install react-native-markdown-renderer
```

```tsx
import Markdown from 'react-native-markdown-renderer';

<Markdown>{message.text}</Markdown>
```

## Testing

Setelah install, test dengan message yang ada markdown:

```
**DAFTAR ANGGOTA**

1. **Akmal**
   Email: akmal@email.com
```

Harusnya "DAFTAR ANGGOTA" dan "Akmal" tampil BOLD.

## Troubleshooting

Jika masih tidak bold:
1. Pastikan library sudah ter-install dengan benar
2. Restart Metro bundler: `npx react-native start --reset-cache`
3. Rebuild app: `npx expo start -c` (untuk Expo)
4. Cek console untuk error

## Link Dokumentasi

- react-native-markdown-display: https://github.com/iamacup/react-native-markdown-display
- react-native-markdown-renderer: https://github.com/mientjan/react-native-markdown-renderer
