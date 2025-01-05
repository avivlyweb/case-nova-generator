/**
 * Represents a medical entity with its occurrence count and related details
 */
export interface MedicalEntity {
  /** Full name of the entity including category (e.g., "diagnoses: Hypertension") */
  name: string;
  /** Number of occurrences in the analyzed text */
  count: number;
  /** Category of the medical entity (e.g., "diagnoses", "symptoms") */
  category: string;
  /** Array of additional context and significance information */
  details: string[];
}

/**
 * Structure for processed medical entity data
 */
export interface ProcessedEntity {
  /** The main term or phrase identified */
  term: string;
  /** Optional contextual information about the entity */
  context?: string;
  /** Optional clinical significance of the entity */
  significance?: string;
}

/**
 * Type for the processed entity data returned by the processing utility
 */
export interface ProcessedEntityData {
  /** Mapping of entity names to their detailed information */
  entityDetails: Record<string, string[]>;
  /** Mapping of entity names to their occurrence counts */
  entityCounts: Record<string, number>;
}