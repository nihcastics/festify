// @ts-nocheck - Optional AI module, requires genkit installation
// Install with: npm install genkit @genkit-ai/google-genai
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
