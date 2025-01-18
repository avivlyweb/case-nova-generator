import { KokoroTTS } from 'kokoro-js';
import { DialogueLine } from '@/types/audio';

export const processAudioChunk = async (
  tts: KokoroTTS,
  chunk: DialogueLine,
  onProgress?: (progress: number) => void
): Promise<Float32Array> => {
  try {
    const audio = await tts.generate(chunk.text, {
      voice: chunk.voice,
      speed: 1.0,
    });

    if (!audio || !audio.audio || audio.audio.length === 0) {
      throw new Error('No audio data generated');
    }

    return new Float32Array(audio.audio);
  } catch (error) {
    console.error('Error processing audio chunk:', error);
    throw error;
  }
};

export const combineAudioBuffers = (
  audioBuffers: Float32Array[],
  sampleRate: number
): AudioBuffer => {
  const totalLength = audioBuffers.reduce((sum, buffer) => sum + buffer.length, 0);
  const audioContext = new AudioContext();
  const combinedBuffer = audioContext.createBuffer(1, totalLength, sampleRate);
  
  let offset = 0;
  for (const buffer of audioBuffers) {
    combinedBuffer.getChannelData(0).set(buffer, offset);
    offset += buffer.length;
  }

  return combinedBuffer;
};

export const audioBufferToWav = async (buffer: AudioBuffer): Promise<Blob> => {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  
  const dataLength = buffer.length * numChannels * bytesPerSample;
  const bufferLength = 44 + dataLength;
  
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);
  
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, dataLength, true);
  
  const channelData = buffer.getChannelData(0);
  let offset = 44;
  for (let i = 0; i < channelData.length; i++) {
    const sample = Math.max(-1, Math.min(1, channelData[i]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
    offset += 2;
  }
  
  return new Blob([arrayBuffer], { type: 'audio/wav' });
};