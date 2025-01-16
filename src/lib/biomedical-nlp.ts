import { supabase } from "@/integrations/supabase/client";

export interface BiomedicalEntity {
  entity: string;
  score: number;
  word: string;
  start: number;
  end: number;
}

export interface ClassificationResult {
  label: string;
  score: number;
}

export const processMedicalText = async (
  text: string,
  task: 'ner' | 'text-classification' | 'token-classification' = 'ner'
): Promise<BiomedicalEntity[] | ClassificationResult[]> => {
  try {
    console.log(`Processing medical text with task: ${task}`);
    
    const { data, error } = await supabase.functions.invoke('biomedical-nlp', {
      body: { text, task }
    });

    if (error) {
      console.error('Error processing medical text:', error);
      throw error;
    }

    console.log('Processed result:', data);
    return data.result;
  } catch (error) {
    console.error('Error in processMedicalText:', error);
    throw error;
  }
};

export const enhanceCaseStudy = async (caseStudy: any) => {
  try {
    // Process medical history
    if (caseStudy.medical_history) {
      const entities = await processMedicalText(caseStudy.medical_history);
      caseStudy.medical_entities = [...(caseStudy.medical_entities || []), ...entities];
    }

    // Process presenting complaint
    if (caseStudy.presenting_complaint) {
      const classification = await processMedicalText(
        caseStudy.presenting_complaint,
        'text-classification'
      );
      caseStudy.complaint_classification = classification;
    }

    // Process condition details
    if (caseStudy.condition) {
      const tokens = await processMedicalText(
        caseStudy.condition,
        'token-classification'
      );
      caseStudy.condition_analysis = tokens;
    }

    return caseStudy;
  } catch (error) {
    console.error('Error enhancing case study:', error);
    throw error;
  }
};