export const sections = [
  {
    title: "Patient Introduction",
    description: `Generate a comprehensive patient introduction following this exact structure:

**Demographics and Personal Information:**
- Name, age, gender
- Relevant personal details

**Detailed Medical History Timeline:**
- Chronological sequence of medical events
- Specific dates and progression
- Hospital admissions and treatments

**Current Presenting Complaint with Specific Symptoms:**
- Detailed symptom description
- Specific clinical manifestations
- Functional impact

**Contextual Information about Lifestyle and Occupation:**
- Previous activity level
- Occupation and work demands
- Lifestyle factors

**Psychosocial Factors Affecting Condition:**
- Patient concerns and fears
- Emotional impact
- Support systems

**Results from Standardized Screening Tools:**
- Specific assessment scores with normal ranges
- Multiple validated tools
- Interpretation of results

**Patient-Reported Outcome Measures (PROMs):**
- Quality of life measures
- Functional assessments
- Patient perspectives

**Impact on Daily Life and Quality of Life:**
- Specific functional limitations
- ADL impacts
- Participation restrictions

**Pain Patterns, Intensity, and Duration (if relevant):**
- Detailed pain description
- Specific measurements
- Temporal patterns

**Rationale for Further Assessment:**
- Clinical reasoning for next steps
- Specific areas requiring evaluation
- Evidence-based justification

Ensure each subsection is detailed with specific clinical examples and measurements.`
  },
  {
    title: "Interview and Problem List",
    description: `Generate a complete RPS (Reason for referral, Problems, Solutions) Form with this exact structure:

**1. Patient Information**
- Name, age, date
- Medical diagnosis
- Medications affecting mobility/function

**2. Patient Perspective**
- View on condition
- Pain description and pattern
- Treatment goals and expectations

**3. Body Structures/Functions (↔ indicators)**
- Specific impairments with measurements
- Muscle strength (0-5 MMT scale)
- ROM measurements in degrees
- Pain levels (0-10 scale) and locations

**4. Activities Impact (↔ indicators)**
- Daily tasks affected with specific examples
- Mobility limitations with distances/times
- Self-care challenges

**5. Participation Restrictions**
- Work impact
- Social activities affected
- Recreational limitations

**6. Health Seeking Questions (HSQ)**
- Patient's specific questions
- Concerns about treatment
- Information needs

**7. Patient Identified Problems (PIPs)**
- Problems patient recognizes
- Priority concerns

**8. Non-Patient Identified Problems (NPIPs)**
- Clinical observations
- Risk factors

**9. Three Hypotheses with Problem and Target Mediator**
- Hypothesis 1: Problem + Target Mediator + Evidence Level
- Hypothesis 2: Problem + Target Mediator + Evidence Level  
- Hypothesis 3: Problem + Target Mediator + Evidence Level

Include specific evidence levels (Grade A, B, C) and reference clinical guidelines.`
  },
  {
    title: "Assessment Strategy",
    description: `Create a comprehensive assessment strategy with detailed tables and evidence:

**Assessment Goals:**
- Clear objectives for evaluation
- Alignment with patient condition

**1. Special Tests Selection:**
Create a detailed table with these columns:
| Test Name | Rationale | Expected Outcome | Sensitivity | Specificity | Testing Sequence | Precautions | Evidence Level |

Include tests for:
- Respiratory function (if applicable)
- Neurological assessment
- Musculoskeletal evaluation
- Functional capacity
- Balance and coordination

**2. Differential Diagnosis:**
- Primary hypotheses
- Alternative considerations  
- Red flags assessment

**3. Outcome Measures:**
- Selected validated tools with psychometric properties
- Baseline measurement plan
- Progress tracking schedule

**4. Assessment Documentation:**
- Standardized forms to be used
- Measurement tools and equipment
- Recording and documentation methods

Ensure all tests include specific sensitivity/specificity values and evidence levels.`
  },
  {
    title: "Assessment Findings",
    description: `Present comprehensive findings with clinical reasoning:

**1. Objective Measurements:**
- ROM values in degrees with normal ranges
- Strength testing (0-5 scale) for specific muscle groups
- Special test outcomes with interpretations
- Functional assessment scores

**2. Subjective Reports:**
- Pain descriptions with 0-10 scale ratings
- Activity limitations with specific examples
- Patient concerns and fears

**3. Clinical Patterns:**
- Movement analysis findings
- Compensation strategies observed
- Functional limitation patterns

**4. Contributing Factors:**
- Biomechanical analysis
- Neural components
- Psychosocial elements

**Clinical Reasoning:**
Provide detailed analysis connecting findings to clinical hypotheses, including:
- Integration of objective and subjective findings
- Clinical pattern recognition
- Implications for treatment planning

Include specific measurements, standardized scores, and clinical interpretations.`
  },
  {
    title: "Goals/Actions to Take",
    description: `Establish comprehensive SMART goals with detailed structure:

**Short-term Goals (2-4 weeks):**
For each goal include:
1. **Specific:** Exact improvement target with measurements
2. **Measurable:** Quantifiable metrics and assessment tools
3. **Achievable:** Realistic progression based on evidence
4. **Relevant:** Alignment with patient needs and condition
5. **Time-bound:** Clear timeline for achievement

Include:
- Rationale for each goal
- Evidence level supporting the goal
- Progress indicators and measurement tools

**Long-term Goals (8-12 weeks):**
Follow same SMART format with:
- Final outcome targets
- Functional milestones
- Participation goals
- Quality of life improvements

Each goal should include specific outcome measures, evidence levels, and clinical reasoning.`
  },
  {
    title: "Intervention Plan",
    description: `Detail comprehensive intervention strategy with evidence:

**1. Exercise Therapy:**
- Type and progression with specific protocols
- Sets, reps, intensity with progression criteria
- Home program details with clear instructions

**2. Manual Therapy:**
- Specific techniques with rationale
- Frequency and progression schedule
- Precautions and contraindications

**3. Patient Education:**
- Key topics and learning objectives
- Educational materials and resources
- Self-management strategies

**4. Evidence-Based Approaches:**
- Clinical practice guidelines referenced
- Research support with evidence levels
- Outcome expectations based on literature

Include specific protocols, progression criteria, and evidence levels for all interventions.`
  },
  {
    title: "Reassessment",
    description: `Plan systematic reassessment with detailed protocols:

**1. Outcome Measures:**
- Tools and frequency of assessment
- Progress benchmarks and targets
- Documentation methods

**2. Decision Points:**
- Treatment modification triggers
- Progression criteria with specific thresholds
- Referral indicators

**3. Risk Monitoring:**
- Warning signs and safety parameters
- Emergency protocols
- Risk mitigation strategies

Include specific timeframes, measurement schedules, and decision-making criteria.`
  },
  {
    title: "Clinical Reasoning",
    description: `Apply comprehensive clinical reasoning framework:

**1. Problem Identification:**
- Primary problems with detailed analysis
- Contributing factors and their interactions
- Impact analysis on function and participation

**2. Hypothesis Generation:**
- Clinical patterns and their significance
- Evidence support from literature
- Alternative explanations and differential diagnosis

**3. Intervention Selection:**
- Evidence levels for chosen interventions
- Risk-benefit analysis
- Expected outcomes with timelines

**4. Outcome Evaluation:**
- Measurement tools and their psychometric properties
- Success criteria and benchmarks
- Modification triggers and decision points

Include references to clinical guidelines, research evidence, and professional frameworks.`
  }
];

export const specializedPrompts = {
  "Orthopedic": {
    context: "Focus on musculoskeletal assessment, biomechanical analysis, and movement dysfunction. Consider tissue healing stages and biomechanical principles.",
    assessmentCriteria: [
      "Joint mobility and stability assessment using goniometry and special tests",
      "Muscle strength testing using MMT and dynamometry",
      "Movement pattern analysis including compensatory strategies",
      "Functional biomechanics evaluation during ADLs",
      "Special orthopedic tests with known sensitivity/specificity"
    ],
    commonAssessments: [
      "Goniometry for ROM measurement",
      "Manual Muscle Testing (0-5 scale)",
      "Special tests (e.g., Neer's, Hawkins-Kennedy)",
      "Functional Movement Screen",
      "Pain scales (VAS, NPRS)"
    ]
  },
  "Neurological": {
    context: "Emphasize neurological examination, motor control, balance, and functional recovery strategies. Consider neuroplasticity principles and evidence-based neurological rehabilitation.",
    assessmentCriteria: [
      "Motor control and coordination assessment",
      "Balance and postural control evaluation",
      "Sensory integration testing",
      "Cognitive aspects affecting movement",
      "Functional task analysis and motor learning"
    ],
    commonAssessments: [
      "Berg Balance Scale (0-56 points)",
      "Timed Up and Go test",
      "Modified Ashworth Scale for spasticity",
      "Fugl-Meyer Assessment",
      "Mini-Mental State Examination"
    ]
  },
  "Cardiovascular": {
    context: "Prioritize cardiovascular assessment, exercise tolerance, and risk stratification according to cardiac rehabilitation guidelines.",
    assessmentCriteria: [
      "Exercise capacity using standardized protocols",
      "Vital signs monitoring during activity",
      "Activity tolerance and symptom response",
      "Risk assessment using validated tools"
    ],
    commonAssessments: [
      "6-Minute Walk Test",
      "Rate of Perceived Exertion (Borg Scale)",
      "Heart rate and blood pressure monitoring",
      "Exercise stress testing",
      "Cardiac Risk Factor Assessment"
    ]
  },
  "Pediatric": {
    context: "Consider developmental stages, age-appropriate interventions, and family involvement in pediatric physiotherapy.",
    assessmentCriteria: [
      "Developmental milestone assessment",
      "Play-based assessment techniques",
      "Family dynamics and support systems",
      "Educational and school-based needs"
    ],
    commonAssessments: [
      "Gross Motor Function Measure (GMFM)",
      "Pediatric Evaluation of Disability Inventory (PEDI)",
      "Alberta Infant Motor Scale",
      "Developmental assessments",
      "Family-centered outcome measures"
    ]
  },
  "Geriatric": {
    context: "Address age-related changes, fall risk, and functional independence in older adults.",
    assessmentCriteria: [
      "Fall risk assessment using validated tools",
      "Functional mobility evaluation",
      "Cognitive status screening",
      "Environmental safety assessment"
    ],
    commonAssessments: [
      "Berg Balance Scale",
      "Timed Up and Go test",
      "Falls Efficacy Scale",
      "Barthel Index",
      "Mini-Mental State Examination"
    ]
  },
  "ICU": {
    context: "Focus on critical care considerations, ventilation support, and early mobilization protocols in intensive care settings.",
    assessmentCriteria: [
      "Respiratory function and weaning readiness",
      "Hemodynamic stability during mobilization",
      "Early mobilization safety protocols",
      "Sedation and consciousness levels"
    ],
    commonAssessments: [
      "Richmond Agitation-Sedation Scale (RASS)",
      "Confusion Assessment Method for ICU (CAM-ICU)",
      "Functional Status Score for ICU",
      "Respiratory parameters",
      "Hemodynamic monitoring"
    ]
  },
  "Rheumatology": {
    context: "Emphasize joint protection, pain management, and disease progression monitoring in rheumatological conditions.",
    assessmentCriteria: [
      "Joint status and inflammation assessment",
      "Disease activity monitoring",
      "Functional capacity evaluation",
      "Pain pattern analysis"
    ],
    commonAssessments: [
      "Disease Activity Score (DAS28)",
      "Health Assessment Questionnaire (HAQ)",
      "Joint protection assessment",
      "Fatigue severity scales",
      "Quality of life measures"
    ]
  }
};

export const evidenceLevels = {
  "Grade A": "Strong evidence from systematic reviews and RCTs",
  "Grade B": "Moderate evidence from cohort studies and case-control studies",
  "Grade C": "Limited evidence from case series and expert opinion",
  "Level I": "Systematic review of RCTs",
  "Level II": "Individual RCT",
  "Level III": "Cohort studies",
  "Level IV": "Case series",
  "Level V": "Expert opinion"
};

export const standardizedAssessments = {
  "Pain": [
    "Visual Analog Scale (VAS) 0-10",
    "Numeric Pain Rating Scale (NPRS) 0-10", 
    "Brief Pain Inventory",
    "McGill Pain Questionnaire"
  ],
  "Function": [
    "Patient-Specific Functional Scale (PSFS)",
    "Timed Up and Go (TUG) test",
    "6-Minute Walk Test (6MWT)",
    "Functional Independence Measure (FIM)"
  ],
  "Quality of Life": [
    "SF-36 Health Survey",
    "EQ-5D-5L",
    "WHO Quality of Life (WHOQOL)",
    "Nottingham Health Profile"
  ],
  "Disability": [
    "Oswestry Disability Index (ODI)",
    "Roland-Morris Disability Questionnaire",
    "Neck Disability Index (NDI)",
    "Disabilities of Arm, Shoulder and Hand (DASH)"
  ],
  "Balance": [
    "Berg Balance Scale (BBS) 0-56",
    "Functional Reach Test",
    "Dynamic Gait Index",
    "Activities-specific Balance Confidence Scale"
  ],
  "Strength": [
    "Manual Muscle Testing (MMT) 0-5 scale",
    "Hand-held Dynamometry",
    "Isokinetic Testing",
    "Grip Strength Testing"
  ],
  "ROM": [
    "Goniometry (universal goniometer)",
    "Inclinometry",
    "Digital goniometry",
    "Photographic analysis"
  ]
};