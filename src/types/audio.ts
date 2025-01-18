export type KokoroVoice = "am_michael" | "af_sarah" | "af" | "af_bella" | "af_nicole" | "af_sky" | "am_adam" | "bf_emma" | "bf_isabella" | "bm_george" | "bm_lewis";

export interface DialogueLine {
  voice: KokoroVoice;
  text: string;
}

export interface GenerationProgress {
  currentChunk: number;
  totalChunks: number;
  status: string;
}