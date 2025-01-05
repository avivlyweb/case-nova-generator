/**
 * Color mapping for different medical entity categories
 * Used for visual distinction in charts and legends
 */
export const categoryColors = {
  diagnoses: "#0088FE",    // Clinical diagnoses - blue
  symptoms: "#00C49F",     // Signs & symptoms - teal
  interventions: "#FFBB28", // Therapeutic interventions - yellow
  diagnostics: "#FF8042",  // Diagnostic procedures - orange
  anatomical: "#8884d8",   // Anatomical structures - purple
  physiological: "#82ca9d" // Physiological parameters - green
} as const;

/**
 * Human-readable labels for medical entity categories
 * Used for display in UI elements
 */
export const categoryLabels = {
  diagnoses: "Clinical Diagnoses",
  symptoms: "Signs & Symptoms",
  interventions: "Therapeutic Interventions",
  diagnostics: "Diagnostic Procedures",
  anatomical: "Anatomical Structures",
  physiological: "Physiological Parameters"
} as const;

export type CategoryKey = keyof typeof categoryColors;