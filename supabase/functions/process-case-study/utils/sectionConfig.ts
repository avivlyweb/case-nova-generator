export const sections = [
  {
    title: "Patient Introduction",
    description: `Collect comprehensive personal and medical history:
    1. Demographics and personal information
    2. Detailed medical history and timeline
    3. Current presenting complaint with specific symptoms
    4. Contextual information about lifestyle and occupation
    5. Psychosocial factors affecting condition
    6. Results from standardized screening tools
    7. Patient-Reported Outcome Measures (PROMs)
    8. Impact on daily life and quality of life`
  },
  {
    title: "Interview and Problem List",
    description: `Conduct a detailed clinical interview:
    1. Complete RPS Form including:
       - Patient Information (name, age, date)
       - Medical Details (diagnosis, medications affecting mobility/function)
       - Patient Perspective (view on condition, pain, goals)
       - Body Structures/Functions (↔ impairments, strength, ROM)
       - Activities Impact (↔ daily tasks affected)
       - Participation (work, social, recreational activities)
       - Therapeutic Perspective (approach, goals, interventions)
       - Factors Assessment (personal, environmental impacts)
    2. Health Seeking Questions (HSQ)
    3. Patient Identified Problems (PIPs)
    4. Non-Patient Identified Problems (NPIPs)
    5. Three hypotheses with problem and target mediator`
  },
  {
    title: "Assessment Strategy",
    description: `Detail assessment strategy aligned with clinical standards:
    1. List all special tests with rationale
    2. Provide sensitivity and specificity values
    3. Include differential diagnosis considerations
    4. Document assessment sequence and precautions
    5. Create table with tests, outcomes, and interpretations
    6. Link to relevant clinical guidelines`
  },
  {
    title: "Assessment Findings",
    description: `Present findings with clinical reasoning:
    1. Objective measurements and observations
    2. Subjective patient reports
    3. Pathophysiological considerations
    4. Impact of comorbidities
    5. Functional limitations identified
    6. Contributing factors analysis
    7. Clinical patterns recognition
    8. Red and yellow flags identified`
  },
  {
    title: "Goals/Actions to Take",
    description: `Establish SMART goals:
    1. Minimum 2 short-term SMART goals
    2. Minimum 2 long-term SMART goals
    3. Patient-centered objectives
    4. Functional outcome measures
    5. Timeline for achievement
    6. Integration with PROMs
    7. Progress indicators
    8. Success criteria`
  },
  {
    title: "Intervention Plan",
    description: `Detail comprehensive intervention strategy:
    1. Exercise therapy protocol
    2. Manual therapy techniques
    3. Patient education components
    4. Behavioral approaches
    5. Technology integration
    6. Home exercise program
    7. Progression criteria
    8. Precautions and contraindications
    9. Multidisciplinary coordination
    10. Expected outcomes timeline`
  },
  {
    title: "Reassessment",
    description: `Plan systematic reassessment:
    1. Key outcome measures
    2. Assessment intervals
    3. Progress tracking methods
    4. Decision-making criteria
    5. Treatment modification triggers
    6. Documentation requirements
    7. Patient feedback integration
    8. Risk monitoring protocol`
  },
  {
    title: "Explanation and Justification of Choices",
    description: `Provide evidence-based justification:
    1. HOAC-II framework application
    2. Current research evidence
    3. Clinical guideline alignment
    4. Dutch KNGF guideline integration
    5. Clinical reasoning pathway
    6. Risk-benefit analysis
    7. Alternative approaches considered
    8. Evidence levels for each choice`
  },
  {
    title: "Reference List",
    description: `List evidence sources (2019 onwards):
    1. Primary research articles
    2. Clinical guidelines
    3. Systematic reviews
    4. Meta-analyses
    5. Practice guidelines
    6. All in APA format
    Include evidence levels for each reference`
  },
  {
    title: "Medication Information",
    description: `Detail medication profile:
    1. Current medications
    2. Therapeutic purposes
    3. Dosages and frequency
    4. Side effects
    5. Interactions
    6. Impact on therapy
    7. Monitoring requirements
    8. Precautions for exercise`
  },
  {
    title: "ICF Classification",
    description: `Assign ICF codes with rationale:
    1. Body Functions (b codes)
    2. Body Structures (s codes)
    3. Activities and Participation (d codes)
    4. Environmental Factors (e codes)
    5. Personal Factors
    Include detailed descriptions and impact levels`
  }
];

export const specializedPrompts = {
  "Orthopedic": "Focus on musculoskeletal assessment, biomechanical analysis, and movement dysfunction.",
  "Neurological": "Emphasize neurological examination, motor control, balance, and functional recovery strategies.",
  "Cardiovascular": "Prioritize cardiovascular assessment, exercise tolerance, and risk stratification.",
  "Pediatric": "Consider developmental stages, age-appropriate interventions, and family involvement.",
  "Geriatric": "Address age-related changes, fall risk, and functional independence.",
  "ICU": "Focus on critical care considerations, ventilation support, and early mobilization.",
  "Rheumatology": "Emphasize joint protection, pain management, and disease progression monitoring."
};