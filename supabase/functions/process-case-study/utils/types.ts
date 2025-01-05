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
  references?: string[];
  medical_entities?: Record<string, string[]>;
  assessment_findings?: string;
  intervention_plan?: string;
}

export interface Section {
  title: string;
  description: string;
}

export interface PubMedArticle {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  publicationDate: string;
  journal: string;
}