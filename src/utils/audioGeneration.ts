import { KokoroTTS } from 'kokoro-js';
import { DialogueLine, GenerationProgress } from '@/types/audio';
import { CaseStudy } from '@/types/case-study';

export const createPodcastScript = (study: CaseStudy): DialogueLine[] => {
  const dialogue: DialogueLine[] = [];
  
  // Introduction
  dialogue.push({
    voice: "am_michael",
    text: `Welcome to today's case study discussion. I'm Dr. Michael, and I'll be presenting an interesting case about ${study.patient_name}.`
  });

  dialogue.push({
    voice: "af_sarah",
    text: `Hello Dr. Michael, I'm Dr. Sarah. I'm looking forward to analyzing this case with you.`
  });

  // Patient Overview
  dialogue.push({
    voice: "am_michael",
    text: `Our patient is ${study.patient_name}, a ${study.age}-year-old ${study.gender}. They presented with ${study.presenting_complaint}.`
  });

  if (study.medical_history) {
    dialogue.push({
      voice: "af_sarah",
      text: `That's interesting. Looking at their medical history, I notice ${study.medical_history}. What are your thoughts on how this affects their current condition?`
    });
  }

  // Analysis Discussion
  if (study.ai_analysis) {
    const analysisPoints = study.ai_analysis.split('\n\n');
    analysisPoints.forEach((point, index) => {
      if (point.trim()) {
        dialogue.push({
          voice: index % 2 === 0 ? "am_michael" : "af_sarah",
          text: point.replace(/[#*]/g, '').trim()
        });
      }
    });
  }

  // Conclusion
  dialogue.push({
    voice: "am_michael",
    text: "Those are excellent observations. Is there anything else you'd like to add to this case?"
  });

  dialogue.push({
    voice: "af_sarah",
    text: "I think we've covered the key aspects of this case. Thank you for this interesting discussion."
  });

  return dialogue;
};

export const generateAudioChunks = async (
  tts: KokoroTTS,
  dialogue: DialogueLine[],
  onProgress: (progress: GenerationProgress) => void
): Promise<Float32Array[]> => {
  const audioBuffers: Float32Array[] = [];
  
  for (let i = 0; i < dialogue.length; i++) {
    const line = dialogue[i];
    onProgress({
      currentChunk: i + 1,
      totalChunks: dialogue.length,
      status: `Generating voice ${i + 1} of ${dialogue.length}...`
    });

    const audio = await tts.generate(line.text, {
      voice: line.voice,
      speed: 1.0,
    });

    if (!audio || !audio.audio || audio.audio.length === 0) {
      throw new Error('No audio data generated');
    }

    audioBuffers.push(new Float32Array(audio.audio));
  }

  return audioBuffers;
};