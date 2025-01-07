export interface CaseStudy {
  id: string;
  patient_name: string;
  age: number;
  gender: string;
  medical_history?: string;
  presenting_complaint?: string;
  condition?: string;
  specialization?: string;
  ai_role?: string;
  adl_problem?: string;
  patient_background?: string;
  comorbidities?: string;
  psychosocial_factors?: string;
  date?: string;
}

export interface Section {
  title: string;
  content: string;
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
  citation: string;
}

export interface ClinicalGuideline {
  name: string;
  url: string;
  key_points: string[];
  recommendation_level: string;
}

export interface ProcessedCaseStudy {
  success: boolean;
  analysis?: string;
  sections?: Section[];
  references?: PubMedArticle[];
  medical_entities?: Record<string, string[]>;
  icf_codes?: string[];
  assessment_findings?: string;
  intervention_plan?: string;
  clinical_guidelines?: ClinicalGuideline[];
  evidence_levels?: Record<string, number>;
}