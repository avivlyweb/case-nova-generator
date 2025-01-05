export function buildEntityExtractionText(caseStudy: any): string {
  return `
    Patient Condition: ${caseStudy.condition || ''}
    Medical History: ${caseStudy.medical_history || ''}
    Presenting Complaint: ${caseStudy.presenting_complaint || ''}
    Assessment Findings: ${caseStudy.assessment_findings || ''}
    Intervention Plan: ${caseStudy.intervention_plan || ''}
  `.trim();
}