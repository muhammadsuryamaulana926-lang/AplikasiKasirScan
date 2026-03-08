// ━━━━━━━━━━━━━━━━━━━━━━
// STATE MANAGER - CORE LOGIC ENGINE
// ━━━━━━━━━━━━━━━━━━━━━━

const userState = new Map();

class StateManager {
  // LAPIS 0: GLOBAL GUARD
  static classifyIntent(question) {
    const q = question.toLowerCase().trim();
    
    // NON_DATA_INTENT patterns
    const nonDataPatterns = [
      /^(hai|halo|hello|hi|selamat\s+(pagi|siang|sore|malam))$/i,
      /^(terima kasih|thanks|makasih)$/i,
      /(bahasa|language)\s+(indonesia|english)/i,
      /^(bye|dadah|sampai jumpa)$/i,
    ];
    
    if (nonDataPatterns.some(p => p.test(q))) {
      return 'NON_DATA_INTENT';
    }
    
    return 'DATA_INTENT';
  }
  
  // LAPIS 1: INPUT PROCESSOR (UPGRADE)
  static processInput(question) {
    const normalized = question.trim();
    const q = normalized.toLowerCase();
    
    // Deteksi numeric input
    const numericMatch = q.match(/^\d+$/);
    const numeric_input = numericMatch ? parseInt(numericMatch[0]) : null;
    
    // Deteksi correction flag
    const correction_flag = /(bukan|maksud saya|yang saya mau|sebenarnya|harusnya)/i.test(q);
    
    // Deteksi language request
    const language_request = /(bahasa|language)\s+(indonesia|english)/i.test(q);
    
    // Intent hint
    let intent_hint = null;
    if (/proyek|project/i.test(q)) intent_hint = 'PROYEK';
    else if (/kegiatan|acara|event/i.test(q)) intent_hint = 'KEGIATAN';
    else if (/kehadiran|absen/i.test(q)) intent_hint = 'KEHADIRAN';
    else if (/anggota|member/i.test(q)) intent_hint = 'ANGGOTA';
    
    return {
      normalized_text: normalized,
      intent_hint,
      numeric_input,
      correction_flag,
      language_request
    };
  }
  
  // LAPIS 2: CONTEXT & STATE MANAGER
  static getState(userId) {
    if (!userState.has(userId)) {
      userState.set(userId, {
        active_database: null,
        active_intent: null,
        active_table: null,
        expected_response_type: 'FREE_QUERY',
        last_bot_action: null,
        timestamp: Date.now()
      });
    }
    return userState.get(userId);
  }
  
  static setState(userId, updates) {
    const current = this.getState(userId);
    userState.set(userId, {
      ...current,
      ...updates,
      timestamp: Date.now()
    });
  }
  
  static setExpectedResponse(userId, type) {
    this.setState(userId, { expected_response_type: type });
  }
  
  static isWaitingForResponse(userId) {
    const state = this.getState(userId);
    return state.expected_response_type !== 'FREE_QUERY';
  }
  
  // LAPIS 3: INTENT ROUTER (ANTI MISROUTE)
  static routeIntent(intent_hint, correction_flag, currentState) {
    // Jika koreksi, ganti intent tapi JANGAN reset database
    if (correction_flag && intent_hint) {
      return {
        active_intent: intent_hint,
        active_database: currentState.active_database, // KEEP
        active_table: null // RESET table saja
      };
    }
    
    // Jika intent baru tanpa koreksi
    if (intent_hint) {
      return {
        active_intent: intent_hint,
        active_table: this.mapIntentToTable(intent_hint)
      };
    }
    
    return null;
  }
  
  static mapIntentToTable(intent) {
    const mapping = {
      'PROYEK': 'proyek',
      'ANGGOTA': 'anggota',
      'KEHADIRAN': 'kehadiran',
      'KEGIATAN': 'kegiatan'
    };
    return mapping[intent] || null;
  }
  
  // LAPIS 9: FINAL SELF-CHECK
  static validateBeforeResponse(userId, intent, database) {
    const state = this.getState(userId);
    
    const checks = {
      isDataIntent: intent !== null,
      responseTypeMatch: state.expected_response_type === 'FREE_QUERY' || state.expected_response_type === 'DATABASE_SELECTION',
      intentMatch: !state.active_intent || state.active_intent === intent,
      databaseStable: !state.active_database || state.active_database === database,
      noAssumption: true
    };
    
    const allPassed = Object.values(checks).every(v => v === true);
    
    if (!allPassed) {
      console.log('❌ SELF-CHECK FAILED:', checks);
    }
    
    return allPassed;
  }
  
  static clearState(userId) {
    userState.delete(userId);
  }
}

module.exports = StateManager;
