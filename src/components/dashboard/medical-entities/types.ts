export interface MedicalEntity {
  name: string;
  count: number;
  category: string;
  details: string[];
}

export interface ProcessedEntity {
  term: string;
  context?: string;
  significance?: string;
}