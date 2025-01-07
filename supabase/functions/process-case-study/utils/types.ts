export interface CaseStudy {
  id: string;
  patient_name: string;
  age: number;
  gender: string;
  medical_history?: string;
  presenting_complaint?: string;
  condition?: string;
  adl_problem?: string;
  patient_background?: string;
  comorbidities?: string;
  psychosocial_factors?: string;
}

export interface ProcessedCaseStudy {
  success: boolean;
  analysis?: string;
  sections?: Array<{
    title: string;
    content: string;
  }>;
  references?: any[];
  medical_entities?: Record<string, string[]>;
  assessment_findings?: string;
  intervention_plan?: string;
  clinical_guidelines?: ClinicalGuideline[];
  learning_objectives?: string[];
  clinical_reasoning_path?: any[];
  evidence_levels?: Record<string, number>;
  icf_codes?: string[];
}

export interface PubMedArticle {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  publicationDate: string;
  journal: string;
  evidenceLevel: string;
  url: string;
}

export interface ClinicalGuideline {
  name: string;
  url: string;
  key_points: string[];
  recommendation_level: string;
}
