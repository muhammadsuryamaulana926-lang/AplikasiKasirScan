// Example: Using expo-speech-recognition in React Native

import React, { useState } from 'react';
import { View, Button, Text, Alert } from 'react-native';
import {
  useSpeechRecognitionEvent,
  ExpoSpeechRecognitionModule,
} from 'expo-speech-recognition';

export default function VoiceRecognitionExample() {
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  // Event: When speech recognition starts
  useSpeechRecognitionEvent('start', () => {
    console.log('Speech recognition started');
    setIsRecording(true);
  });

  // Event: When speech recognition ends
  useSpeechRecognitionEvent('end', () => {
    console.log('Speech recognition ended');
    setIsRecording(false);
  });

  // Event: When results are available
  useSpeechRecognitionEvent('result', (event) => {
    const transcription = event.results[0]?.transcript;
    if (transcription) {
      console.log('Transcription:', transcription);
      setTranscript(transcription);
    }
  });

  // Event: When error occurs
  useSpeechRecognitionEvent('error', (event) => {
    console.error('Speech recognition error:', event.error);
    Alert.alert('Error', `Speech recognition failed: ${event.error}`);
    setIsRecording(false);
  });

  // Start speech recognition
  const startRecognition = async () => {
    try {
      // Request permissions
      const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      
      if (!granted) {
        Alert.alert('Permission Denied', 'Microphone permission is required');
        return;
      }

      // Start recognition
      await ExpoSpeechRecognitionModule.start({
        lang: 'id-ID', // Indonesian language
        interimResults: true, // Get real-time results
        maxAlternatives: 1,
        continuous: false,
        requiresOnDeviceRecognition: false,
        addsPunctuation: false,
        contextualStrings: [],
      });
    } catch (error) {
      console.error('Failed to start recognition:', error);
      Alert.alert('Error', 'Failed to start speech recognition');
    }
  };

  // Stop speech recognition
  const stopRecognition = async () => {
    try {
      await ExpoSpeechRecognitionModule.stop();
    } catch (error) {
      console.error('Failed to stop recognition:', error);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>
        Voice Recognition Example
      </Text>
      
      <Text style={{ marginBottom: 10 }}>
        Status: {isRecording ? 'Recording...' : 'Not recording'}
      </Text>
      
      <Text style={{ marginBottom: 20, padding: 10, backgroundColor: '#f0f0f0' }}>
        Transcript: {transcript || 'No transcript yet'}
      </Text>
      
      <Button
        title={isRecording ? 'Stop Recording' : 'Start Recording'}
        onPress={isRecording ? stopRecognition : startRecognition}
      />
    </View>
  );
}

// Supported Languages
export const supportedLanguages = [
  'id-ID', // Indonesian
  'en-US', // English (US)
  'en-GB', // English (UK)
  'zh-CN', // Chinese (Simplified)
  'ja-JP', // Japanese
  'ko-KR', // Korean
  'es-ES', // Spanish
  'fr-FR', // French
  'de-DE', // German
  'it-IT', // Italian
  'pt-BR', // Portuguese (Brazil)
  'ru-RU', // Russian
  'ar-SA', // Arabic
  'hi-IN', // Hindi
  'th-TH', // Thai
  'vi-VN', // Vietnamese
];
