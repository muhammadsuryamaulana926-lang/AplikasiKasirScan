// Utility untuk parse berbagai platform social media links dari text
export const parseSocialMediaLinks = (text: string) => {
  // Regex untuk berbagai platform
  const patterns = {
    wa: /\[WA:(\d+)\]/g,           // WhatsApp: [WA:08123456789]
    ig: /\[IG:([\w.]+)\]/g,         // Instagram: [IG:username]
    fb: /\[FB:([\w.]+)\]/g,         // Facebook: [FB:username]
    tg: /\[TG:([\w]+)\]/g,          // Telegram: [TG:username]
    line: /\[LINE:(\d+)\]/g,        // LINE: [LINE:08123456789]
    twitter: /\[X:([\w]+)\]/g,      // Twitter/X: [X:username]
    email: /\[EMAIL:([\w.@]+)\]/g,  // Email: [EMAIL:user@email.com]
  };
  
  const parts: Array<{
    type: 'text' | 'wa' | 'ig' | 'fb' | 'tg' | 'line' | 'twitter' | 'email',
    content: string,
    data?: string
  }> = [];
  
  let lastIndex = 0;
  const allMatches: Array<{index: number, length: number, type: string, data: string}> = [];
  
  // Cari semua matches dari semua pattern
  Object.entries(patterns).forEach(([type, regex]) => {
    let match;
    while ((match = regex.exec(text)) !== null) {
      allMatches.push({
        index: match.index,
        length: match[0].length,
        type: type,
        data: match[1]
      });
    }
  });
  
  // Sort berdasarkan posisi
  allMatches.sort((a, b) => a.index - b.index);
  
  // Build parts
  allMatches.forEach(match => {
    // Tambahkan text sebelum match
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex, match.index)
      });
    }
    
    // Tambahkan link
    parts.push({
      type: match.type as any,
      content: match.data,
      data: match.data
    });
    
    lastIndex = match.index + match.length;
  });
  
  // Tambahkan sisa text
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.substring(lastIndex)
    });
  }
  
  return parts.length > 0 ? parts : [{type: 'text' as const, content: text}];
};

// Format nomor telepon untuk WhatsApp (hapus 0 di depan, tambah 62)
export const formatPhoneForWhatsApp = (phone: string): string => {
  let cleaned = phone.replace(/\D/g, ''); // Hapus semua non-digit
  
  // Jika dimulai dengan 0, ganti dengan 62
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  }
  // Jika belum ada kode negara, tambahkan 62
  else if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  
  return cleaned;
};

// Get platform info (icon, color, URL)
export const getPlatformInfo = (type: string, data: string) => {
  switch (type) {
    case 'wa':
      return {
        icon: '',
        color: '#25D366',
        name: 'WhatsApp',
        url: `whatsapp://send?phone=${formatPhoneForWhatsApp(data)}`,
        webUrl: `https://wa.me/${formatPhoneForWhatsApp(data)}`
      };
    case 'ig':
      return {
        icon: '',
        color: '#E4405F',
        name: 'Instagram',
        url: `instagram://user?username=${data}`,
        webUrl: `https://www.instagram.com/${data}/`
      };
    case 'fb':
      return {
        icon: '',
        color: '#1877F2',
        name: 'Facebook',
        url: `fb://profile/${data}`,
        webUrl: `https://www.facebook.com/${data}`
      };
    case 'tg':
      return {
        icon: '',
        color: '#0088CC',
        name: 'Telegram',
        url: `tg://resolve?domain=${data}`,
        webUrl: `https://t.me/${data}`
      };
    case 'line':
      return {
        icon: '',
        color: '#00B900',
        name: 'LINE',
        url: `line://ti/p/${data}`,
        webUrl: `https://line.me/ti/p/${data}`
      };
    case 'twitter':
      return {
        icon: '',
        color: '#1DA1F2',
        name: 'X/Twitter',
        url: `twitter://user?screen_name=${data}`,
        webUrl: `https://x.com/${data}`
      };
    case 'email':
      return {
        icon: '',
        color: '#EA4335',
        name: 'Email',
        url: `mailto:${data}`,
        webUrl: `mailto:${data}`
      };
    default:
      return null;
  }
};
