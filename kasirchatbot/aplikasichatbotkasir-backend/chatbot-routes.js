const express = require('express');
const router = express.Router();
const ChatbotHandler = require('./chatbot-logic');

const chatbotHandler = new ChatbotHandler();

router.post('/query', async (req, res) => {
  const { question } = req.body;
  
  if (!question || question.trim() === '') {
    return res.json({ 
      success: false, 
      error: 'Pertanyaan tidak boleh kosong' 
    });
  }
  
  try {
    const result = await chatbotHandler.processMessage(question);
    
    // Pastikan result memiliki message
    if (!result || !result.message) {
      return res.json({
        success: false,
        error: 'Response tidak valid dari chatbot'
      });
    }
    
    res.json({ 
      success: true, 
      result: result,
      source: 'chatbot-logic' 
    });
    
  } catch (error) {
    console.error('❌ Query Error:', error);
    res.json({ 
      success: false, 
      error: 'Terjadi kesalahan pada server',
      details: error.message 
    });
  }
});

router.post('/confirmation', async (req, res) => {
  const { originalQuestion, action } = req.body;
  
  if (!originalQuestion || !action) {
    return res.json({ 
      success: false, 
      error: 'Parameter tidak lengkap' 
    });
  }
  
  try {
    const result = await chatbotHandler.handleConfirmation(originalQuestion, action);
    
    if (!result || !result.message) {
      return res.json({
        success: false,
        error: 'Response tidak valid dari chatbot'
      });
    }
    
    res.json({ 
      success: true, 
      result: result,
      source: 'confirmation' 
    });
    
  } catch (error) {
    console.error('❌ Confirmation Error:', error);
    res.json({ 
      success: false, 
      error: 'Terjadi kesalahan pada server',
      details: error.message 
    });
  }
});

router.post('/database-selection', async (req, res) => {
  const { originalQuestion, selectedDatabase, allResults } = req.body;
  
  if (!originalQuestion || !selectedDatabase || !allResults) {
    return res.json({ 
      success: false, 
      error: 'Parameter tidak lengkap' 
    });
  }
  
  try {
    const result = await chatbotHandler.handleDatabaseSelection(originalQuestion, selectedDatabase, allResults);
    
    if (!result || !result.message) {
      return res.json({
        success: false,
        error: 'Response tidak valid dari chatbot'
      });
    }
    
    res.json({ 
      success: true, 
      result: result,
      source: 'database-selection' 
    });
    
  } catch (error) {
    console.error('❌ Database Selection Error:', error);
    res.json({ 
      success: false, 
      error: 'Terjadi kesalahan pada server',
      details: error.message 
    });
  }
});

module.exports = router;
