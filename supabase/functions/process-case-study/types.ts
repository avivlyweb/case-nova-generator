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
  generated_sections?: Record<string, any>;
  ai_analysis?: string;
  medical_entities?: Record<string, any>[];
  reference_list?: string;
  icf_codes?: Record<string, any>[];
  assessment_findings?: string;
  intervention_plan?: string;
  smart_goals?: Record<string, any>[];
  medications?: Record<string, any>[];
  evidence_sources?: Record<string, any>[];
  clinical_guidelines?: Record<string, any>[];
  learning_objectives?: Record<string, any>[];
  clinical_reasoning_path?: Record<string, any>[];
  evidence_levels?: Record<string, any>;
  assessment_tools?: Record<string, any>[];
  measurement_data?: Record<string, any>;
  professional_frameworks?: Record<string, any>;
  standardized_tests?: Record<string, any>[];
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