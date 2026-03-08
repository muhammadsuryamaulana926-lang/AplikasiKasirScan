const kehadiranLogic = require('./kehadiran-logic');

// Test cases
const testCases = [
  "Daftar Kehadiran nangka busuk nya",
  "kehadiran nangka busuk",
  "absensi nangka busuk",
  "daftar absen nangka busuk",
  "Saya mau data kehadiran nangka busuk dong"
];

console.log('=== TEST KEHADIRAN DETECTION ===\n');

testCases.forEach((testCase, index) => {
  const isDetected = kehadiranLogic.detectKehadiranQuery(testCase);
  console.log(`${index + 1}. "${testCase}"`);
  console.log(`   Detected: ${isDetected ? '✅ YES' : '❌ NO'}\n`);
});
