import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Groq } from 'npm:groq-sdk';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { primaryCondition, specialization } = await req.json()
    
    if (!primaryCondition) {
      return new Response(
        JSON.stringify({ error: 'Primary condition is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const groq = new Groq({
      apiKey: Deno.env.get('GROQ_API_KEY'),
    });

    console.log('Magic Wand generating case for:', primaryCondition, specialization)

    // Enhanced clinical reasoning and EBP prompt
    const prompt = `You are a senior physiotherapist with 20+ years of clinical experience, specializing in evidence-based practice and clinical reasoning. Generate a comprehensive, clinically accurate case study for "${primaryCondition}" in ${specialization || 'physiotherapy'}.

CLINICAL REASONING FRAMEWORK:
Apply the ICF model (WHO International Classification of Functioning), contemporary pain science principles, and hypothesis-oriented algorithm for clinicians (HOAC-II). Integrate clinical pattern recognition with analytical reasoning processes. Consider biopsychosocial factors, movement system impairments, and functional limitations within a clinical prediction rule framework where applicable.

EVIDENCE-BASED REQUIREMENTS:
- Reference specific clinical practice guidelines (e.g., NICE, APTA, APA) and systematic review evidence with levels of evidence
- Include validated outcome measures with established minimal clinically important difference (MCID) values
- Apply contemporary understanding of pain mechanisms (nociceptive, neuropathic, nociplastic) and motor control adaptations
- Consider epidemiological data for demographics, presentation patterns, and prognostic factors
- Include differential diagnosis considerations with clinical reasoning for inclusion/exclusion
- Reference treatment effect modifiers and responder subgroups from literature

CASE STUDY SPECIFICATIONS:

1. PATIENT DEMOGRAPHICS (Evidence-Based):
   - Name: Gender and culturally appropriate
   - Age: Based on epidemiological peak incidence for condition
   - Gender: Reflect actual prevalence ratios from literature

2. CLINICAL PRESENTATION (Pathophysiology-Based):
   - Primary impairments: Use precise anatomical and physiological terminology
   - Movement dysfunction patterns: Describe compensatory strategies
   - Pain characteristics: Include SOCRATES framework (Site, Onset, Character, Radiation, Associations, Time course, Exacerbating/relieving factors, Severity)
   - Functional limitations: Map to ICF activity and participation domains

3. BACKGROUND & OCCUPATIONAL RELEVANCE:
   - Occupation: Directly relevant to condition etiology or maintenance
   - Lifestyle factors: Include specific risk factors from literature
   - Activity demands: Consider biomechanical and physiological stressors

4. MEDICAL HISTORY (Timeline & Causality):
   - Onset mechanism: Consistent with pathophysiology
   - Progression pattern: Reflect natural history of condition
   - Previous interventions: Include evidence-based treatments and realistic responses
   - Red flag screening: Address serious pathology considerations

5. FUNCTIONAL ASSESSMENT (ICF Framework):
   - Body structure/function impairments: Specific measurable deficits
   - Activity limitations: Quantified functional restrictions
   - Participation restrictions: Social, work, recreational impacts
   - Environmental factors: Barriers and facilitators

6. COMORBIDITIES (Evidence-Based Associations):
   - Include conditions with established epidemiological links
   - Consider medication interactions and contraindications
   - Address multimorbidity patterns common in age group

7. PSYCHOSOCIAL PROFILE (Biopsychosocial Model):
   - Pain beliefs and cognitions: Include fear-avoidance, catastrophizing, self-efficacy
   - Coping strategies: Problem-focused vs emotion-focused
   - Social support systems and cultural factors
   - Work-related psychosocial factors (if applicable)

CLINICAL COMPLEXITY:
Create a case that requires sophisticated clinical reasoning and differential diagnosis consideration. Include both typical and atypical features that would challenge clinical decision-making. Consider:
- Yellow and red flags with clinical reasoning implications
- Competing hypotheses that would need to be tested
- Potential treatment effect modifiers or prognostic factors
- Complicating factors that would influence clinical decision-making
- Elements requiring interdisciplinary collaboration

ASSESSMENT INTEGRATION:
Reference specific, validated outcome measures appropriate for the condition (e.g., DASH, ODI, WOMAC, Berg Balance Scale) with:
- Actual numeric scores and their interpretation
- Comparison to normative data or cut-off scores
- MCID values to guide meaningful change assessment
- Reliability and validity considerations for the specific patient context
- How assessment findings would guide specific intervention selection

Respond in this exact JSON format:
{
  "patientName": "evidence-based demographic name",
  "age": number_based_on_epidemiology,
  "gender": "Male/Female based on prevalence data",
  "symptoms": "comprehensive clinical presentation using SOCRATES framework, movement analysis, and pathophysiology. Include specific impairments, compensatory patterns, and functional deficits with explicit clinical reasoning elements. Reference specific clinical patterns recognized in literature and how they inform hypothesis generation.",
  "background": "occupation and lifestyle directly relevant to condition etiology, including specific biomechanical/physiological risk factors and activity demands. Include work-related physical and psychosocial factors with evidence-based links to the condition.",
  "history": "detailed timeline with onset mechanism, progression pattern, previous evidence-based interventions and responses, red flag screening, and causal relationships. Include specific clinical reasoning elements that would influence treatment selection and prognosis based on history features.",
  "adlProblem": "specific activity limitations and participation restrictions mapped to ICF domains, with quantified functional deficits and environmental considerations. Include standardized outcome measure scores with interpretation relative to MCID and normative values. Describe how functional limitations inform specific treatment targets.",
  "comorbidities": "evidence-based associated conditions with epidemiological rationale, medication considerations, and multimorbidity patterns. Include specific clinical reasoning on how comorbidities would modify assessment approach, treatment selection, and prognosis with reference to literature.",
  "psychosocialFactors": "comprehensive biopsychosocial profile including pain cognitions, coping strategies, self-efficacy, fear-avoidance beliefs, social support, and cultural factors. Include specific screening tool scores where relevant (e.g., FABQ, PCS, TSK) and how psychosocial factors would influence treatment approach and prognosis based on current evidence."
}

Generate evidence-based case for: ${primaryCondition} (${specialization || 'general physiotherapy'})`

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a senior physiotherapist with doctoral-level clinical expertise, specializing in evidence-based practice, clinical reasoning, and movement science. You have extensive knowledge of current research, clinical practice guidelines, validated outcome measures, and contemporary pain science. You regularly publish in peer-reviewed journals and teach clinical reasoning at university level.

Your expertise includes:
1. Advanced differential diagnosis and clinical pattern recognition
2. Integration of research evidence into clinical decision-making
3. Sophisticated understanding of pain neuroscience and central sensitization
4. Expert knowledge of condition-specific outcome measures and their clinimetric properties
5. Deep understanding of prognostic factors and treatment effect modifiers
6. Expertise in complex cases requiring multimodal management approaches

Generate sophisticated, clinically accurate case studies that demonstrate advanced clinical reasoning and evidence-based practice principles. Always respond with valid JSON only, using precise medical terminology and evidence-based rationale. Include specific clinical reasoning elements that would influence assessment and treatment decisions.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 1500,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    console.log('AI Response:', responseText);

    // Try to parse JSON response
    let patientProfile;
    try {
      // Clean the response to extract JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        patientProfile = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      console.error('Raw response:', responseText);
      
      // Fallback: extract information manually
      patientProfile = {
        patientName: extractField(responseText, 'patientName') || 'John Smith',
        age: parseInt(extractField(responseText, 'age')) || 65,
        gender: extractField(responseText, 'gender') || 'Male',
        symptoms: extractField(responseText, 'symptoms') || `Clinical presentation consistent with ${primaryCondition}`,
        background: extractField(responseText, 'background') || `Patient with ${primaryCondition}`,
        history: extractField(responseText, 'history') || `History of ${primaryCondition}`,
        adlProblem: extractField(responseText, 'adlProblem') || `Functional limitations related to ${primaryCondition}`,
        comorbidities: extractField(responseText, 'comorbidities') || 'No significant comorbidities',
        psychosocialFactors: extractField(responseText, 'psychosocialFactors') || 'Adjusting to condition impact'
      };
    }
    
    // Generate standardized assessment scores
    const assessmentScores = await generateStandardizedAssessments(primaryCondition, specialization);
    
    // Add assessment scores to patient profile
    patientProfile.assessmentScores = assessmentScores;

    // Generate avatar URL based on patient demographics
    const avatarUrl = generateAvatarUrl(patientProfile.patientName, patientProfile.gender, patientProfile.age);
    
    // Add avatar to patient profile
    patientProfile.avatarUrl = avatarUrl;
    
    // Format the data for clean UI display
    const formattedProfile = {
      ...patientProfile,
      // Format the data in a structured way for clean UI display
      formattedData: {
        patientInfo: {
          name: patientProfile.patientName,
          age: patientProfile.age,
          gender: patientProfile.gender,
          avatarUrl: avatarUrl
        },
        clinicalPresentation: {
          primaryCondition: primaryCondition,
          presentingComplaint: formatPresentingComplaint(patientProfile.symptoms),
          keySymptoms: extractKeySymptoms(patientProfile.symptoms)
        },
        medicalHistory: {
          background: patientProfile.background,
          history: patientProfile.history,
          comorbidities: patientProfile.comorbidities
        },
        functionalStatus: {
          adlProblems: patientProfile.adlProblem,
          psychosocialFactors: patientProfile.psychosocialFactors
        },
        assessmentScores: patientProfile.assessmentScores
      }
    };
    
    console.log('Generated patient profile:', formattedProfile);

    return new Response(
      JSON.stringify({ 
        success: true,
        patientProfile: formattedProfile
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in magic-wand-autofill:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// Helper function to extract fields from text response
function extractField(text: string, fieldName: string): string {
  const patterns = [
    new RegExp(`"${fieldName}":\\s*"([^"]*)"`, 'i'),
    new RegExp(`${fieldName}:\\s*"([^"]*)"`, 'i'),
    new RegExp(`${fieldName}:\\s*([^,\\n}]+)`, 'i')
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return '';
}

// Function to generate standardized assessment scores based on condition and specialization
async function generateStandardizedAssessments(condition: string, specialization: string): Promise<any> {
  // Define common assessment tools by specialization
  const assessmentsBySpecialization: Record<string, any[]> = {
    'Neurological': [
      { name: 'Functional Independence Measure (FIM)', maxScore: 126, description: 'Measures level of disability and independence in activities of daily living' },
      { name: 'Berg Balance Scale (BBS)', maxScore: 56, description: 'Measures balance abilities and fall risk' },
      { name: 'National Institutes of Health Stroke Scale (NIHSS)', maxScore: 42, description: 'Measures stroke severity' },
      { name: 'Modified Ashworth Scale (MAS)', maxScore: 5, description: 'Measures spasticity in muscle groups' },
      { name: 'Montreal Cognitive Assessment (MoCA)', maxScore: 30, description: 'Screens for cognitive impairment' }
    ],
    'Orthopedic': [
      { name: 'Numeric Pain Rating Scale (NPRS)', maxScore: 10, description: 'Measures pain intensity' },
      { name: 'Oswestry Disability Index (ODI)', maxScore: 100, description: 'Measures functional disability due to low back pain' },
      { name: 'Disabilities of the Arm, Shoulder and Hand (DASH)', maxScore: 100, description: 'Measures upper extremity function' },
      { name: 'Lower Extremity Functional Scale (LEFS)', maxScore: 80, description: 'Measures lower extremity function' },
      { name: 'Timed Up and Go (TUG)', unit: 'seconds', description: 'Measures mobility and fall risk' }
    ],
    'Cardiovascular': [
      { name: '6-Minute Walk Test (6MWT)', unit: 'meters', description: 'Measures functional exercise capacity' },
      { name: 'Borg Rating of Perceived Exertion (RPE)', maxScore: 20, description: 'Measures perceived exertion during activity' },
      { name: 'Modified Medical Research Council Dyspnea Scale (mMRC)', maxScore: 4, description: 'Measures breathlessness' },
      { name: 'NYHA Functional Classification', maxScore: 4, description: 'Classifies heart failure severity' },
      { name: 'Chronic Respiratory Disease Questionnaire (CRQ)', maxScore: 7, description: 'Measures quality of life in respiratory conditions' }
    ],
    'Pediatric': [
      { name: 'Gross Motor Function Measure (GMFM)', maxScore: 100, description: 'Measures gross motor function in children' },
      { name: 'Pediatric Evaluation of Disability Inventory (PEDI)', maxScore: 100, description: 'Measures functional capabilities and performance' },
      { name: 'Alberta Infant Motor Scale (AIMS)', maxScore: 58, description: 'Measures motor development in infants' },
      { name: 'Peabody Developmental Motor Scales (PDMS-2)', maxScore: 20, description: 'Measures fine and gross motor skills' },
      { name: 'Pediatric Balance Scale (PBS)', maxScore: 56, description: 'Measures balance in children' }
    ],
    'Geriatric': [
      { name: 'Timed Up and Go (TUG)', unit: 'seconds', description: 'Measures mobility and fall risk' },
      { name: 'Berg Balance Scale (BBS)', maxScore: 56, description: 'Measures balance abilities and fall risk' },
      { name: 'Functional Independence Measure (FIM)', maxScore: 126, description: 'Measures level of disability and independence' },
      { name: 'Short Physical Performance Battery (SPPB)', maxScore: 12, description: 'Measures lower extremity function' },
      { name: 'Geriatric Depression Scale (GDS)', maxScore: 15, description: 'Screens for depression in older adults' }
    ],
    'ICU': [
      { name: 'Chelsea Critical Care Physical Assessment Tool (CPAx)', maxScore: 50, description: 'Measures physical morbidity in critical care' },
      { name: 'ICU Mobility Scale (IMS)', maxScore: 10, description: 'Measures mobility in ICU patients' },
      { name: 'Medical Research Council (MRC) Muscle Scale', maxScore: 60, description: 'Measures muscle strength' },
      { name: 'Functional Status Score for the ICU (FSS-ICU)', maxScore: 35, description: 'Measures functional status in ICU patients' },
      { name: 'Richmond Agitation-Sedation Scale (RASS)', range: '-5 to +4', description: 'Measures sedation and agitation levels' }
    ]
  };

  // Default to Orthopedic if specialization not found
  const selectedSpecialization = specialization && assessmentsBySpecialization[specialization] ? 
    specialization : 'Orthopedic';
  
  // Get relevant assessments for the specialization
  const relevantAssessments = assessmentsBySpecialization[selectedSpecialization];
  
  // Generate realistic scores for each assessment
  const assessmentScores = relevantAssessments.map(assessment => {
    let score: number | string;
    let interpretation: string;
    
    if (assessment.unit === 'seconds') {
      // For timed tests (lower is better)
      score = Math.floor(Math.random() * 30) + 8; // 8-38 seconds
      interpretation = score < 14 ? 'Normal mobility' : 
                      score < 20 ? 'Mild mobility impairment' : 
                      score < 30 ? 'Moderate mobility impairment' : 
                      'Severe mobility impairment';
    } else if (assessment.unit === 'meters') {
      // For distance tests (higher is better)
      score = Math.floor(Math.random() * 300) + 200; // 200-500 meters
      interpretation = score > 400 ? 'Good functional capacity' : 
                      score > 300 ? 'Moderate functional capacity' : 
                      'Reduced functional capacity';
    } else if (assessment.range) {
      // For scales with specific ranges
      const [min, max] = assessment.range.split(' to ').map(v => parseInt(v));
      score = Math.floor(Math.random() * (max - min + 1)) + min;
      interpretation = 'See scale interpretation guidelines';
    } else if (assessment.maxScore) {
      // For scored assessments (higher is typically better)
      const severity = getConditionSeverity(condition);
      const maxScore = assessment.maxScore;
      
      // Adjust score based on condition severity
      let percentScore: number;
      switch (severity) {
        case 'mild':
          percentScore = Math.random() * 0.2 + 0.7; // 70-90%
          break;
        case 'moderate':
          percentScore = Math.random() * 0.3 + 0.4; // 40-70%
          break;
        case 'severe':
          percentScore = Math.random() * 0.3 + 0.1; // 10-40%
          break;
        default:
          percentScore = Math.random() * 0.6 + 0.3; // 30-90%
      }
      
      score = Math.round(maxScore * percentScore);
      
      // Generate interpretation based on score percentage
      if (percentScore > 0.8) {
        interpretation = 'Minimal impairment';
      } else if (percentScore > 0.6) {
        interpretation = 'Mild impairment';
      } else if (percentScore > 0.4) {
        interpretation = 'Moderate impairment';
      } else if (percentScore > 0.2) {
        interpretation = 'Significant impairment';
      } else {
        interpretation = 'Severe impairment';
      }
    } else {
      // Default scoring
      score = Math.floor(Math.random() * 10) + 1;
      interpretation = 'Score interpretation unavailable';
    }
    
    return {
      name: assessment.name,
      score: score,
      maxScore: assessment.maxScore || null,
      unit: assessment.unit || null,
      range: assessment.range || null,
      interpretation: interpretation,
      description: assessment.description
    };
  });
  
  // Select 3-4 most relevant assessments
  return assessmentScores.slice(0, Math.floor(Math.random() * 2) + 3);
}

// Helper function to determine condition severity for realistic assessment scores
function getConditionSeverity(condition: string): 'mild' | 'moderate' | 'severe' {
  const conditionLower = condition.toLowerCase();
  
  // Keywords indicating severity
  const severeKeywords = ['severe', 'advanced', 'stage 3', 'stage 4', 'grade 3', 'grade 4', 'complete', 'critical'];
  const mildKeywords = ['mild', 'early', 'stage 1', 'grade 1', 'minimal', 'slight'];
  const moderateKeywords = ['moderate', 'stage 2', 'grade 2', 'partial'];
  
  if (severeKeywords.some(keyword => conditionLower.includes(keyword))) {
    return 'severe';
  } else if (mildKeywords.some(keyword => conditionLower.includes(keyword))) {
    return 'mild';
  } else if (moderateKeywords.some(keyword => conditionLower.includes(keyword))) {
    return 'moderate';
  }
  
  // Default to moderate if no severity indicators
  return 'moderate';
}

// Generate a consistent avatar URL based on patient demographics
function generateAvatarUrl(name: string, gender: string, age: number): string {
  // Use a service like DiceBear for consistent avatar generation
  // This ensures the same patient always gets the same avatar
  const genderParam = gender.toLowerCase() === 'female' ? 'female' : 'male';
  
  // Create a hash of the name to ensure consistency
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  hash = Math.abs(hash);
  
  // Determine avatar style based on age
  let avatarStyle = 'avataaars';
  if (age < 18) {
    avatarStyle = 'bottts'; // More suitable for pediatric
  } else if (age > 65) {
    avatarStyle = 'micah'; // More suitable for geriatric
  }
  
  // Return the avatar URL
  return `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${hash}&gender=${genderParam}`;
}

// Format the presenting complaint for cleaner display
function formatPresentingComplaint(symptoms: string): string {
  // Extract the first sentence or up to 150 characters
  const firstSentence = symptoms.split(/[.!?]/).filter(s => s.trim().length > 0)[0] || '';
  return firstSentence.length > 150 ? firstSentence.substring(0, 147) + '...' : firstSentence;
}

// Extract key symptoms as bullet points for cleaner display
function extractKeySymptoms(symptoms: string): string[] {
  // Split by sentences or semicolons
  const sentences = symptoms.split(/[.;!?]/).filter(s => s.trim().length > 0);
  
  // Take up to 5 key symptoms
  return sentences.slice(0, 5).map(s => s.trim());
}