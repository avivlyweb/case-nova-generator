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
    8. Impact on daily life and quality of life
    Include specific details about pain patterns, intensity, and duration if relevant.`
  },
  {
    title: "Interview and Problem List",
    description: `Complete physiotherapy RPS Form including:
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
    6. Health Seeking Questions (HSQ)
    7. Patient Identified Problems (PIPs)
    8. Non-Patient Identified Problems (NPIPs)
    9. Three hypotheses with problem and target mediator
    Include specific objective measurements and standardized assessment scores.`
  },
  {
    title: "Assessment Strategy",
    description: `Detail assessment strategy aligned with clinical standards:
    1. Special Tests Selection
       - List tests with rationale and expected outcomes
       - Include sensitivity and specificity values
       - Document testing sequence
       - Note precautions
    2. Differential Diagnosis
       - Primary hypotheses
       - Alternative considerations
       - Red flags assessment
    3. Outcome Measures
       - Selected validated tools
       - Baseline measurements
       - Progress tracking plan
    4. Assessment Documentation
       - Standardized forms
       - Measurement tools
       - Recording methods
    Include evidence levels for each test and measurement tool.`
  },
  {
    title: "Assessment Findings",
    description: `Present findings with clinical reasoning:
    1. Objective Measurements
       - ROM values (in degrees)
       - Strength testing results (0-5 scale)
       - Special test outcomes
       - Functional assessments
    2. Subjective Reports
       - Pain descriptions (0-10 scale)
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
    Include specific measurements and standardized assessment scores.`
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
    Include specific outcome measures and progress indicators.`
  },
  {
    title: "Intervention Plan",
    description: `Detail comprehensive intervention strategy:
    1. Exercise Therapy
       - Type and progression
       - Sets, reps, intensity
       - Home program details
    2. Manual Therapy
       - Specific techniques
       - Frequency and progression
       - Precautions
    3. Patient Education
       - Key topics
       - Materials
       - Self-management strategies
    4. Evidence-Based Approaches
       - Clinical practice guidelines
       - Research support
       - Outcome expectations
    Include specific protocols and progression criteria.`
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
    Include specific timeframes and measurement tools.`
  },
  {
    title: "Clinical Reasoning",
    description: `Apply HOAC-II Framework:
    1. Problem Identification
       - Primary problems
       - Contributing factors
       - Impact analysis
    2. Hypothesis Generation
       - Clinical patterns
       - Evidence support
       - Alternative explanations
    3. Intervention Selection
       - Evidence levels
       - Risk-benefit analysis
       - Expected outcomes
    4. Outcome Evaluation
       - Measurement tools
       - Success criteria
       - Modification triggers
    Include references to clinical guidelines and research evidence.`
  }
];

export const specializedPrompts = {
  "Orthopedic": {
    context: "Focus on musculoskeletal assessment, biomechanical analysis, and movement dysfunction. Consider tissue healing stages and biomechanical principles.",
    assessmentCriteria: [
      "Joint mobility and stability assessment",
      "Muscle strength and length testing",
      "Movement pattern analysis",
      "Functional biomechanics evaluation",
      "Special orthopedic tests"
    ]
  },
  "Neurological": {
    context: "Emphasize neurological examination, motor control, balance, and functional recovery strategies. Consider neuroplasticity principles.",
    assessmentCriteria: [
      "Motor control and coordination",
      "Balance and postural control",
      "Sensory integration",
      "Cognitive aspects",
      "Functional task analysis"
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

export const evidenceLevels = {
  "1a": "Systematic review of RCTs",
  "1b": "Individual RCT",
  "2a": "Systematic review of cohort studies",
  "2b": "Individual cohort study",
  "3a": "Systematic review of case-control studies",
  "3b": "Individual case-control study",
  "4": "Case series",
  "5": "Expert opinion"
};

export const standardizedAssessments = {
  "Pain": ["VAS", "NPRS", "Brief Pain Inventory"],
  "Function": ["Patient-Specific Functional Scale", "Timed Up and Go", "6-Minute Walk Test"],
  "Quality of Life": ["SF-36", "EQ-5D", "WHO-QOL"],
  "Disability": ["Oswestry Disability Index", "Roland-Morris Disability Questionnaire"],
  "Balance": ["Berg Balance Scale", "Functional Reach Test"],
  "Strength": ["Manual Muscle Testing", "Hand-held Dynamometry"],
  "ROM": ["Goniometry", "Inclinometry"]
};
