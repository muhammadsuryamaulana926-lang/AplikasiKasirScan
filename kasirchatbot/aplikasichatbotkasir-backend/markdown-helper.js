// Helper untuk convert markdown ke format yang bisa di-render React Native

function convertMarkdownToPlainWithBold(text) {
  if (!text) return text;
  
  // Convert **text** menjadi <b>text</b> untuk React Native
  // React Native Text component bisa render <Text style={{fontWeight: 'bold'}}>
  
  // Tapi karena kita kirim plain text, kita biarkan ** tetap ada
  // dan frontend yang handle dengan react-native-markdown-display
  
  return text;
}

function stripMarkdown(text) {
  if (!text) return text;
  
  // Hapus semua markdown formatting jika frontend tidak support
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1') // Bold
    .replace(/\*(.+?)\*/g, '$1')     // Italic
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Links
    .replace(/`(.+?)`/g, '$1');      // Code
}

module.exports = {
  convertMarkdownToPlainWithBold,
  stripMarkdown
};
