const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createClient } = require('@deepgram/sdk');
const fs = require('fs');

// Setup multer untuk handle upload audio
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // Max 10MB
});

// Deepgram API Key (dari environment variable)
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY || '';

// Voice to Text endpoint
router.post('/voice-to-text', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.json({ success: false, error: 'File audio tidak ditemukan' });
  }

  if (!DEEPGRAM_API_KEY) {
    return res.json({ 
      success: false, 
      error: 'Deepgram API key belum dikonfigurasi. Tambahkan DEEPGRAM_API_KEY di .env' 
    });
  }

  const audioPath = req.file.path;

  try {
    const deepgram = createClient(DEEPGRAM_API_KEY);
    
    // Baca file audio
    const audioBuffer = fs.readFileSync(audioPath);
    
    // Transcribe audio dengan Deepgram
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      audioBuffer,
      {
        model: 'nova-2',
        language: 'id', // Bahasa Indonesia
        smart_format: true,
      }
    );

    if (error) {
      throw error;
    }

    const transcript = result.results.channels[0].alternatives[0].transcript;
    
    // Hapus file temporary
    fs.unlinkSync(audioPath);

    res.json({ 
      success: true, 
      text: transcript,
      confidence: result.results.channels[0].alternatives[0].confidence
    });

  } catch (error) {
    console.error('Error transcribing audio:', error);
    
    // Hapus file jika ada error
    if (fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath);
    }

    res.json({ 
      success: false, 
      error: 'Gagal mengkonversi audio ke text',
      details: error.message 
    });
  }
});

module.exports = router;
