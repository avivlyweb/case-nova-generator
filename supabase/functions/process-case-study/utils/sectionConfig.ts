export const sections = [
  {
    title: "Patient Introduction",
    description: `Collect comprehensive personal and medical history:
    1. Demographics and personal information
    2. Detailed medical history timeline
    3. Current presenting complaint with specific symptoms
    4. Contextual information about lifestyle and occupation
    5. Psychosocial factors affecting condition
    6. Results from standardized screening tools
    7. Patient-Reported Outcome Measures (PROMs)
    8. Impact on daily life and quality of life`
  },
  {
    title: "Interview and Problem List",
    description: `write a Complete physiotherapy RPS Form which will including:
    1. Patient Information
       - Name, age, date
       - Medical diagnosis
       - Medications affecting mobility/function
    2. Patient Perspective
       - View on condition
       - Pain description and pattern
       - Treatment goals and expectations
    3. Body Structures/Functions (↔ indicators)
       - Impairments
       - Muscle strength measurements
       - ROM measurements
       - Pain levels and locations
    4. Activities Impact (↔ indicators)
       - Daily tasks affected
       - Mobility limitations
       - Self-care challenges
    5. Participation Restrictions
       - Work impact
       - Social activities
       - Recreational activities
    6. Therapeutic Perspective
       - Treatment approach
       - Goals
       - Planned interventions
    7. Factors Assessment
       - Personal factors
       - Environmental impacts
       - Contextual considerations
    8. Health Seeking Questions (HSQ)
    9. Patient Identified Problems (PIPs)
    10. Non-Patient Identified Problems (NPIPs)
    11. Three hypotheses with problem and target mediator`
  },
  {
    title: "Assessment Strategy",
    description: `Detail assessment strategy aligned with clinical standards:
    1. Special Tests Selection
       - List in a table all tests with rationale, how to preform and what to expect in the outcome
       - Sensitivity and specificity values
       - Testing sequence
       - Precautions
    2. Differential Diagnosis
       - Primary hypotheses
       - Alternative considerations
       - Red flags assessment
    3. Outcome Measures
       - Validated tools selection
       - Baseline measurements
       - Progress tracking plan
    4. Assessment Documentation
       - Standardized forms
       - Measurement tools
       - Recording methods`
  },
  {
    title: "Assessment Findings",
    description: `Present findings with clinical reasoning:
    1. Objective Measurements
       - ROM values
       - Strength testing results
       - Special test outcomes
       - Functional assessments
    2. Subjective Reports
       - Pain descriptions
       - Activity limitations
       - Patient concerns
    3. Clinical Patterns
       - Movement analysis
       - Compensation strategies
       - Functional limitations
    4. Contributing Factors
       - Biomechanical analysis
       - Neural components
       - Psychosocial elements
    5. Red and Yellow Flags
       - Risk factors
       - Precautions
       - Contraindications`
  },
  {
    title: "Goals/Actions to Take",
    description: `Establish SMART goals:
    Short-term Goals (2-4 weeks):
    1. Specific: Exact improvement target
    2. Measurable: Quantifiable metrics
    3. Achievable: Realistic progression
    4. Relevant: Aligned with patient needs
    5. Time-bound: Clear timeline

    Long-term Goals (8-12 weeks):
    1. Specific: Final outcome target
    2. Measurable: Objective measures
    3. Achievable: Progressive milestones
    4. Relevant: Functional outcomes
    5. Time-bound: Achievement timeline

    Include:
    - Functional outcome measures
    - Patient-specific objectives
    - Progress indicators
    - Success criteria`
  },
  {
    title: "Intervention Plan",
    description: `Detail comprehensive intervention strategy:
    1. Exercise Therapy
       - Type and progression
       - Sets, reps, intensity
       - Home program
    2. Manual Therapy
       - Techniques
       - Frequency
       - Progression criteria
    3. Patient Education
       - Key topics
       - Materials
       - Self-management
    4. Behavioral Approaches
       - Motivation strategies
       - Adherence plan
       - Lifestyle modifications
    5. Technology Integration
       - Tools and apps
       - Monitoring devices
       - Digital resources
    6. Precautions
       - Risk management
       - Contraindications
       - Safety measures`
  },
  {
    title: "Reassessment",
    description: `Plan systematic reassessment:
    1. Outcome Measures
       - Tools and frequency
       - Progress benchmarks
       - Documentation methods
    2. Decision Points
       - Treatment modification triggers
       - Progression criteria
       - Referral indicators
    3. Risk Monitoring
       - Warning signs
       - Safety parameters
       - Emergency protocols
    4. Documentation
       - Progress notes
       - Outcome tracking
       - Report formats`
  },
  {
    title: "Explanation and Justification of Choices",
    description: `Provide evidence-based justification:
    1. HOAC-II Framework Application
       - Problem identification
       - Hypothesis generation
       - Intervention selection
       - Outcome evaluation
    2. Clinical Guidelines Integration
       - KNGF guidelines
       - International standards
       - Best practice recommendations
    3. Evidence Levels
       - Research quality
       - Clinical relevance
       - Implementation context
    4. Risk-Benefit Analysis
       - Treatment options
       - Expected outcomes
       - Potential complications`
  }
];

export const specializedPrompts = {
  "Orthopedic": {
    context: "Focus on musculoskeletal assessment, biomechanical analysis, and movement dysfunction.",
    assessmentCriteria: [
      "Joint mobility and stability",
      "Muscle strength and length",
      "Movement patterns",
      "Functional biomechanics"
    ]
  },
  "Neurological": {
    context: "Emphasize neurological examination, motor control, balance, and functional recovery strategies.",
    assessmentCriteria: [
      "Motor control and coordination",
      "Balance and postural control",
      "Sensory integration",
      "Cognitive aspects"
    ]
  },
  "Cardiovascular": {
    context: "Prioritize cardiovascular assessment, exercise tolerance, and risk stratification.",
    assessmentCriteria: [
      "Exercise capacity",
      "Vital signs monitoring",
      "Activity tolerance",
      "Risk assessment"
    ]
  },
  "Pediatric": {
    context: "Consider developmental stages, age-appropriate interventions, and family involvement.",
    assessmentCriteria: [
      "Developmental milestones",
      "Play-based assessment",
      "Family dynamics",
      "Educational needs"
    ]
  },
  "Geriatric": {
    context: "Address age-related changes, fall risk, and functional independence.",
    assessmentCriteria: [
      "Fall risk assessment",
      "Functional mobility",
      "Cognitive status",
      "Environmental safety"
    ]
  },
  "ICU": {
    context: "Focus on critical care considerations, ventilation support, and early mobilization.",
    assessmentCriteria: [
      "Respiratory function",
      "Hemodynamic stability",
      "Early mobilization safety",
      "Weaning protocols"
    ]
  },
  "Rheumatology": {
    context: "Emphasize joint protection, pain management, and disease progression monitoring.",
    assessmentCriteria: [
      "Joint status",
      "Disease activity",
      "Functional capacity",
      "Pain patterns"
    ]
  }
};