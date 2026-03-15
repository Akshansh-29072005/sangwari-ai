/**
 * Voice Assistant Routes — Speech-to-Text, Intent Detection
 */
import { apiFetch } from '../api';

export const voiceRoutes = {
  /** Send transcribed text for intent classification */
  classifyIntent: (transcription: string) =>
    apiFetch('/voice/classify-intent', {
      method: 'POST',
      body: JSON.stringify({ text: transcription }),
    }),

  /** Get AI response for a voice query */
  getVoiceResponse: (text: string, intent: string) =>
    apiFetch('/voice/respond', {
      method: 'POST',
      body: JSON.stringify({ text, intent }),
    }),
};
