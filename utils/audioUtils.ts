import { Blob } from '@google/genai';

/**
 * Encodes a Uint8Array into a Base64 string.
 * This is used to prepare audio data to be sent to the Gemini API.
 */
export function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Decodes a Base64 string into a Uint8Array.
 * This is used to process the audio data received from the Gemini API.
 */
export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Creates a Gemini API-compatible Blob from raw audio data.
 * It converts Float32Array data from the microphone into a 16-bit PCM format.
 */
export function createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        // The VAD needs the audio to be in the range of a 16-bit signed integer.
        // We're clamping the values to avoid distortion.
        int16[i] = Math.max(-32768, Math.min(32767, data[i] * 32768));
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        // The required audio MIME type is 'audio/pcm' with a 16000 sample rate.
        mimeType: 'audio/pcm;rate=16000',
    };
}


/**
 * Decodes raw PCM audio data into an AudioBuffer that can be played by the browser.
 * The browser's native `decodeAudioData` is for file formats (like MP3), not raw streams.
 */
export async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    // The incoming data is 16-bit PCM.
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            // Convert the 16-bit integer back to a float in the range [-1.0, 1.0].
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}
