import { supabase } from '@/integrations/supabase/client';

export interface AssessmentScore {
  name: string;
  score: number | string;
  maxScore: number | null;
  unit: string | null;
  range: string | null;
  interpretation: string;
  description: string;
}

export interface FormattedPatientData {
  patientInfo: {
    name: string;
    age: number;
    gender: string;
    avatarUrl: string;
  };
  clinicalPresentation: {
    primaryCondition: string;
    presentingComplaint: string;
    keySymptoms: string[];
  };
  medicalHistory: {
    background: string;
    history: string;
    comorbidities: string;
  };
  functionalStatus: {
    adlProblems: string;
    psychosocialFactors: string;
  };
  assessmentScores: AssessmentScore[];
}

export interface AutoFillData {
  patientName: string;
  age: number;
  gender: string;
  condition: string;
  symptoms: string;
  background: string;
  history: string;
  adlProblem: string;
  comorbidities: string;
  psychosocialFactors: string;
  // New fields for enhanced UI
  avatarUrl?: string;
  assessmentScores?: AssessmentScore[];
  formattedData?: FormattedPatientData;
}

interface ConditionProfile {
  ageRange: { min: number; max: number };
  genderDistribution: { male: number; female: number }; // percentages
  commonSymptoms: string[];
  typicalBackground: string[];
  medicalHistory: string[];
  adlProblems: string[];
  commonComorbidities: string[];
  psychosocialFactors: string[];
  patientNames: { male: string[]; female: string[] };
}

interface ClinicalProfile {
  anatomicalRegion: string;
  specialization: string;
  clinicalComplexity: string;
  patientProfile: string;
  icfImpact: string[];
  psychosocialFactors: string[];
  ageRange: { min: number; max: number };
  genderDistribution: { male: number; female: number };
  clinicalPresentation: string[];
  functionalLimitations: string[];
  assessmentFindings: string[];
  redFlags: string[];
  yellowFlags: string[];
  treatmentApproach: string[];
  outcomeExpectations: string[];
  evidenceBase: string[];
  differentialDiagnosis: string[];
  patientNames: { male: string[]; female: string[] };
}

class AutoFillService {
  // Store the last generated profile for access by other components
  public lastGeneratedProfile: any = null;
  
  private clinicalProfiles: Record<string, ClinicalProfile> = {
    'parkinson disease': {
      anatomicalRegion: 'Neurological',
      specialization: 'Neurological Physiotherapy',
      clinicalComplexity: 'Chronic progressive neurodegenerative',
      patientProfile: 'Adult/Geriatric',
      icfImpact: ['Mobility Limitation', 'Self-care Impact', 'Work-related Dysfunction'],
      psychosocialFactors: ['Fear-Avoidance Behavior', 'Low Self-Efficacy', 'Comorbid Depression/Anxiety'],
      ageRange: { min: 55, max: 85 },
      genderDistribution: { male: 60, female: 40 },
      clinicalPresentation: [
        'Unilateral resting tremor (4-6 Hz) predominantly affecting upper limb',
        'Bradykinesia evidenced by reduced amplitude and velocity of repetitive movements',
        'Lead-pipe or cogwheel rigidity throughout axial and appendicular musculature',
        'Postural instability with positive pull test and increased fall risk',
        'Hypokinetic dysarthria and micrographia',
        'Masked facies and reduced blink rate',
        'Shuffling gait with reduced stride length and arm swing'
      ],
      functionalLimitations: [
        'Difficulty with fine motor tasks (buttoning, writing, eating)',
        'Impaired bed mobility and transfers requiring verbal/physical cues',
        'Reduced walking endurance with freezing episodes in doorways',
        'Compromised dual-task performance affecting safety',
        'Difficulty with complex sequential movements'
      ],
      assessmentFindings: [
        'UPDRS-III motor score: 28/108 indicating moderate motor impairment',
        'Berg Balance Scale: 42/56 indicating increased fall risk',
        'Timed Up and Go: 18 seconds (>14 sec indicates fall risk)',
        'PDQ-39 quality of life score indicating moderate impact on daily activities',
        'Montreal Cognitive Assessment: 24/30 suggesting mild cognitive impairment'
      ],
      redFlags: [
        'Rapid progression of symptoms suggesting atypical parkinsonism',
        'Early falls or severe postural instability',
        'Poor response to levodopa therapy',
        'Prominent autonomic dysfunction'
      ],
      yellowFlags: [
        'Catastrophic thinking about disease progression',
        'Social withdrawal due to embarrassment about symptoms',
        'Caregiver burden and family stress',
        'Fear of falling leading to activity avoidance'
      ],
      treatmentApproach: [
        'High-intensity, large-amplitude movements (LSVT BIG protocol)',
        'Dual-task training for gait and cognitive function',
        'Cueing strategies (visual, auditory, tactile) for movement initiation',
        'Progressive resistance training to address bradykinesia',
        'Balance training incorporating perturbation-based exercises'
      ],
      outcomeExpectations: [
        'Improved motor function and reduced bradykinesia with consistent therapy',
        'Enhanced balance confidence and reduced fall risk',
        'Maintained independence in ADLs for 12-18 months',
        'Improved quality of life scores and social participation'
      ],
      evidenceBase: [
        'LSVT BIG shows significant improvements in amplitude of movement (Level I evidence)',
        'High-intensity exercise programs demonstrate neuroprotective effects',
        'Dual-task training improves both motor and cognitive outcomes',
        'Cueing strategies effectively reduce freezing episodes'
      ],
      differentialDiagnosis: [
        'Essential tremor (action vs. rest tremor)',
        'Progressive supranuclear palsy (early falls, vertical gaze palsy)',
        'Multiple system atrophy (prominent autonomic features)',
        'Drug-induced parkinsonism (antipsychotics, metoclopramide)'
      ],
      patientNames: {
        male: ['Robert Mitchell', 'William Thompson', 'James Patterson', 'Charles Anderson', 'Donald Wilson'],
        female: ['Margaret Mitchell', 'Dorothy Thompson', 'Helen Patterson', 'Ruth Anderson', 'Betty Wilson']
      }
    },
    'stroke': {
      anatomicalRegion: 'Neurological',
      specialization: 'Neurological Physiotherapy',
      clinicalComplexity: 'Acute to chronic post-neurological event',
      patientProfile: 'Adult/Geriatric',
      icfImpact: ['Mobility Limitation', 'Self-care Impact', 'Work-related Dysfunction'],
      psychosocialFactors: ['Low Self-Efficacy', 'Comorbid Depression/Anxiety', 'Passive Coping Style'],
      ageRange: { min: 45, max: 85 },
      genderDistribution: { male: 52, female: 48 },
      clinicalPresentation: [
        'Left hemiparesis with Brunnstrom stage III recovery in upper limb',
        'Spastic hypertonia (Modified Ashworth Scale 2) in elbow flexors and ankle plantarflexors',
        'Sensory impairment affecting proprioception and light touch on affected side',
        'Mild expressive aphasia with word-finding difficulties',
        'Visual field defect (left homonymous hemianopia)',
        'Pusher syndrome with lateral postural deviation'
      ],
      functionalLimitations: [
        'Requires moderate assistance for transfers and bed mobility',
        'Ambulates 50 meters with quad cane and close supervision',
        'Unable to perform bilateral upper limb tasks effectively',
        'Difficulty with complex ADLs including dressing and bathing',
        'Impaired safety awareness and judgment'
      ],
      assessmentFindings: [
        'Fugl-Meyer Assessment Upper Extremity: 35/66 indicating moderate impairment',
        'Berg Balance Scale: 38/56 indicating high fall risk',
        'Functional Independence Measure: 85/126 requiring moderate assistance',
        'National Institutes of Health Stroke Scale: 8/42 indicating moderate stroke',
        'Montreal Cognitive Assessment: 22/30 suggesting cognitive impairment'
      ],
      redFlags: [
        'Deteriorating neurological status or new onset symptoms',
        'Signs of increased intracranial pressure',
        'Cardiac arrhythmias or unstable vital signs',
        'Deep vein thrombosis or pulmonary embolism risk'
      ],
      yellowFlags: [
        'Grief reaction to loss of function and independence',
        'Family role changes and relationship strain',
        'Fear of recurrent stroke',
        'Learned helplessness and dependency behaviors'
      ],
      treatmentApproach: [
        'Task-specific training focusing on meaningful activities',
        'Constraint-induced movement therapy for upper limb recovery',
        'Gait training with body weight support and treadmill',
        'Bilateral arm training for improved coordination',
        'Cognitive-motor dual task training'
      ],
      outcomeExpectations: [
        'Significant motor recovery expected within first 3-6 months',
        'Independent ambulation with assistive device achievable',
        'Return to modified ADL independence with adaptive equipment',
        'Potential for community reintegration with support'
      ],
      evidenceBase: [
        'Task-specific training shows superior outcomes to impairment-based approaches',
        'CIMT demonstrates significant upper limb recovery (Level I evidence)',
        'Early mobilization within 24-48 hours improves outcomes',
        'High-intensity therapy (>45 minutes/day) associated with better recovery'
      ],
      differentialDiagnosis: [
        'Transient ischemic attack (symptoms resolve within 24 hours)',
        'Hemorrhagic vs. ischemic stroke (imaging differentiation)',
        'Migraine with aura (younger patients, headache history)',
        'Seizure with Todd\'s paralysis (temporary weakness post-ictal)'
      ],
      patientNames: {
        male: ['John Anderson', 'Robert Davis', 'William Garcia', 'James Martinez', 'Michael Rodriguez'],
        female: ['Susan Anderson', 'Carol Davis', 'Nancy Garcia', 'Betty Martinez', 'Helen Rodriguez']
      }
    },
    'subacromial pain syndrome': {
      anatomicalRegion: 'Shoulder',
      specialization: 'Orthopedic Physiotherapy',
      clinicalComplexity: 'Subacute to chronic overuse injury',
      patientProfile: 'Adult',
      icfImpact: ['Work-related Dysfunction', 'Recreational/Sports Limitation'],
      psychosocialFactors: ['Fear-Avoidance Behavior', 'Work-related stress'],
      ageRange: { min: 30, max: 65 },
      genderDistribution: { male: 55, female: 45 },
      clinicalPresentation: [
        'Anterolateral shoulder pain exacerbated by overhead activities',
        'Positive impingement signs (Neer, Hawkins-Kennedy tests)',
        'Night pain disrupting sleep, particularly when lying on affected side',
        'Painful arc between 60-120 degrees of shoulder abduction',
        'Weakness in shoulder abduction and external rotation',
        'Compensatory scapular dyskinesis with excessive elevation'
      ],
      functionalLimitations: [
        'Unable to reach overhead shelves or perform hair washing',
        'Difficulty with work tasks requiring repetitive overhead reaching',
        'Impaired ability to lift objects above shoulder height',
        'Problems with putting on clothing (shirts, jackets)',
        'Reduced throwing or racquet sport performance'
      ],
      assessmentFindings: [
        'Shoulder Pain and Disability Index (SPADI): 65/100 indicating significant disability',
        'Active shoulder flexion: 140° (limited by pain)',
        'Positive Empty Can test indicating supraspinatus involvement',
        'Scapular dyskinesis evident during arm elevation',
        'Reduced posterior capsule flexibility (cross-body adduction test)'
      ],
      redFlags: [
        'Severe night pain unrelieved by position changes',
        'Progressive weakness suggesting rotator cuff tear',
        'Neurological symptoms indicating cervical involvement',
        'History of significant trauma or dislocation'
      ],
      yellowFlags: [
        'Work-related stress and deadline pressures',
        'Fear of movement causing further injury',
        'Frustration with impact on recreational activities',
        'Concern about need for surgical intervention'
      ],
      treatmentApproach: [
        'Progressive loading program for rotator cuff strengthening',
        'Scapular stabilization exercises addressing dyskinesis',
        'Posterior capsule stretching and joint mobilization',
        'Activity modification and ergonomic education',
        'Graduated return to overhead activities'
      ],
      outcomeExpectations: [
        'Significant pain reduction within 6-8 weeks of conservative treatment',
        'Return to full overhead function in 3-4 months',
        'Prevention of recurrence through proper biomechanics',
        '85-90% of patients respond well to conservative management'
      ],
      evidenceBase: [
        'Exercise therapy more effective than corticosteroid injections long-term',
        'Scapular-focused exercises improve outcomes in SAPS',
        'Manual therapy combined with exercise superior to exercise alone',
        'Progressive loading protocols demonstrate superior outcomes'
      ],
      differentialDiagnosis: [
        'Rotator cuff tear (weakness, positive lag signs)',
        'Adhesive capsulitis (global restriction of movement)',
        'Cervical radiculopathy (neurological symptoms)',
        'Acromioclavicular joint pathology (localized AC joint pain)'
      ],
      patientNames: {
        male: ['Michael Johnson', 'David Wilson', 'Christopher Brown', 'Matthew Davis', 'Andrew Miller'],
        female: ['Jennifer Johnson', 'Michelle Wilson', 'Amanda Brown', 'Jessica Davis', 'Ashley Miller']
      }
    },
    'chronic non-specific low back pain': {
      anatomicalRegion: 'Lumbar Spine',
      specialization: 'Orthopedic Physiotherapy',
      clinicalComplexity: 'Chronic persistent pain with central sensitization',
      patientProfile: 'Adult',
      icfImpact: ['Work-related Dysfunction', 'Mobility Limitation', 'Self-care Impact'],
      psychosocialFactors: ['Fear-Avoidance Behavior', 'Pain Catastrophizing', 'Low Self-Efficacy'],
      ageRange: { min: 25, max: 65 },
      genderDistribution: { male: 48, female: 52 },
      clinicalPresentation: [
        'Persistent aching pain in lumbar region >3 months duration',
        'Pain intensity varies from 4-7/10 on numerical rating scale',
        'Morning stiffness lasting 30-60 minutes',
        'Pain exacerbated by prolonged sitting, bending, and lifting',
        'No specific dermatomal distribution or neurological signs',
        'Compensatory movement patterns and guarded postures'
      ],
      functionalLimitations: [
        'Difficulty with prolonged sitting at work (>30 minutes)',
        'Avoidance of bending and lifting activities',
        'Reduced walking tolerance and exercise capacity',
        'Impaired sleep quality due to positional discomfort',
        'Decreased participation in recreational and social activities'
      ],
      assessmentFindings: [
        'Oswestry Disability Index: 42/100 indicating moderate disability',
        'Fear-Avoidance Beliefs Questionnaire (Work): 35/42 indicating high fear-avoidance',
        'Lumbar flexion ROM: 45° (normal 60°) with pain provocation',
        'Positive centralization with repeated extension exercises',
        'Reduced core endurance (prone plank <30 seconds)'
      ],
      redFlags: [
        'Progressive neurological deficit or cauda equina symptoms',
        'Fever, unexplained weight loss, or night sweats',
        'History of cancer or immunosuppression',
        'Severe trauma or osteoporotic fracture risk'
      ],
      yellowFlags: [
        'Belief that pain indicates tissue damage and harm',
        'Catastrophic thinking about pain and its consequences',
        'Work dissatisfaction and fear of job loss',
        'Passive attitude toward recovery and external locus of control'
      ],
      treatmentApproach: [
        'Graded exposure therapy to reduce fear-avoidance behaviors',
        'Cognitive-behavioral pain management strategies',
        'Progressive loading and movement confidence building',
        'Workplace ergonomic assessment and modification',
        'Multidisciplinary approach including psychology if indicated'
      ],
      outcomeExpectations: [
        'Improved function and pain self-management within 8-12 weeks',
        'Return to work with modifications and pacing strategies',
        'Reduced healthcare utilization and medication dependence',
        'Enhanced quality of life and social participation'
      ],
      evidenceBase: [
        'Exercise therapy and CBT most effective for chronic LBP (Level I evidence)',
        'Graded activity superior to traditional biomedical approaches',
        'Multidisciplinary rehabilitation reduces disability long-term',
        'Pain neuroscience education improves treatment outcomes'
      ],
      differentialDiagnosis: [
        'Lumbar radiculopathy (dermatomal pain, neurological signs)',
        'Facet joint dysfunction (extension-based pain pattern)',
        'Sacroiliac joint dysfunction (unilateral pain, specific tests)',
        'Fibromyalgia (widespread pain, tender points)'
      ],
      patientNames: {
        male: ['Mark Thompson', 'Kevin Anderson', 'Brian Wilson', 'Steven Davis', 'Daniel Garcia'],
        female: ['Lisa Thompson', 'Karen Anderson', 'Amy Wilson', 'Julie Davis', 'Sarah Garcia']
      }
    }
  };

  // Keep the old profiles as fallback
  private conditionProfiles: Record<string, ConditionProfile> = {
    'spinal stenosis': {
      ageRange: { min: 55, max: 80 },
      genderDistribution: { male: 45, female: 55 },
      commonSymptoms: [
        'Lower back pain that worsens with walking or standing',
        'Leg pain and numbness that improves when sitting or leaning forward',
        'Neurogenic claudication with walking intolerance',
        'Bilateral leg weakness and cramping',
        'Difficulty walking long distances without rest'
      ],
      typicalBackground: [
        'Retired office worker with history of prolonged sitting',
        'Former construction worker with heavy lifting history',
        'Teacher who spent many years standing',
        'Homemaker with active lifestyle until recent symptoms',
        'Retired nurse with physically demanding career'
      ],
      medicalHistory: [
        'Degenerative disc disease diagnosed 5 years ago',
        'Previous episodes of lower back pain over 10 years',
        'Osteoarthritis in multiple joints',
        'History of disc herniation L4-L5',
        'Previous physical therapy for back pain with temporary relief'
      ],
      adlProblems: [
        'Difficulty walking to mailbox without stopping to rest',
        'Unable to stand for cooking or household tasks',
        'Trouble with grocery shopping due to walking limitations',
        'Difficulty climbing stairs without holding railings',
        'Problems with prolonged standing activities like showering'
      ],
      commonComorbidities: [
        'Hypertension controlled with medication',
        'Type 2 diabetes mellitus',
        'Osteoporosis with history of fractures',
        'Chronic kidney disease stage 2',
        'Hyperlipidemia'
      ],
      psychosocialFactors: [
        'Frustrated with loss of independence and mobility',
        'Concerned about becoming a burden on family',
        'Depression related to activity limitations',
        'Social isolation due to walking difficulties',
        'Anxiety about falling or further injury'
      ],
      patientNames: {
        male: ['Robert Johnson', 'William Smith', 'James Wilson', 'Michael Brown', 'David Miller'],
        female: ['Mary Johnson', 'Patricia Smith', 'Jennifer Wilson', 'Linda Brown', 'Barbara Miller']
      }
    },
    'stroke': {
      ageRange: { min: 45, max: 85 },
      genderDistribution: { male: 52, female: 48 },
      commonSymptoms: [
        'Left-sided weakness affecting arm and leg',
        'Difficulty with speech and word finding',
        'Balance problems and frequent falls',
        'Fatigue and reduced endurance',
        'Cognitive difficulties with memory and attention'
      ],
      typicalBackground: [
        'Retired accountant with sedentary lifestyle',
        'Former mechanic with history of smoking',
        'Homemaker with family history of cardiovascular disease',
        'Business executive with high-stress career',
        'Retired teacher with hypertension'
      ],
      medicalHistory: [
        'Hypertension for 15 years, poorly controlled',
        'Atrial fibrillation diagnosed 2 years ago',
        'Previous TIA (mini-stroke) 6 months prior',
        'Hyperlipidemia with elevated cholesterol',
        'History of smoking 1 pack per day for 20 years'
      ],
      adlProblems: [
        'Difficulty dressing due to one-sided weakness',
        'Unable to prepare meals safely',
        'Trouble with bathing and personal hygiene',
        'Difficulty with transfers from bed to chair',
        'Problems with walking and mobility around home'
      ],
      commonComorbidities: [
        'Hypertension requiring multiple medications',
        'Atrial fibrillation on anticoagulation',
        'Depression following stroke',
        'Diabetes mellitus type 2',
        'Dysphagia requiring modified diet'
      ],
      psychosocialFactors: [
        'Grief over loss of previous abilities and independence',
        'Family stress and role changes',
        'Fear of having another stroke',
        'Depression and emotional lability',
        'Concerns about returning to work or driving'
      ],
      patientNames: {
        male: ['John Anderson', 'Robert Davis', 'William Garcia', 'James Martinez', 'Michael Rodriguez'],
        female: ['Susan Anderson', 'Carol Davis', 'Nancy Garcia', 'Betty Martinez', 'Helen Rodriguez']
      }
    },
    'knee osteoarthritis': {
      ageRange: { min: 50, max: 75 },
      genderDistribution: { male: 35, female: 65 },
      commonSymptoms: [
        'Bilateral knee pain worse in the morning',
        'Stiffness after periods of inactivity',
        'Pain that worsens with stairs and prolonged walking',
        'Swelling and warmth in knee joints',
        'Grinding sensation (crepitus) with movement'
      ],
      typicalBackground: [
        'Former athlete with history of knee injuries',
        'Overweight individual with sedentary job',
        'Factory worker with repetitive knee stress',
        'Avid gardener who spends time kneeling',
        'Retail worker who stands for long periods'
      ],
      medicalHistory: [
        'Previous meniscus tear repaired 10 years ago',
        'Family history of arthritis',
        'Gradual onset of symptoms over 5 years',
        'Previous cortisone injections with temporary relief',
        'History of being overweight for 15 years'
      ],
      adlProblems: [
        'Difficulty getting up from low chairs',
        'Trouble with stairs, especially going down',
        'Problems kneeling for household tasks',
        'Difficulty with prolonged walking or standing',
        'Trouble getting in and out of car'
      ],
      commonComorbidities: [
        'Obesity (BMI > 30)',
        'Hypertension',
        'Pre-diabetes or diabetes type 2',
        'Sleep apnea',
        'Lower back pain'
      ],
      psychosocialFactors: [
        'Frustration with activity limitations',
        'Concern about need for surgery',
        'Impact on recreational activities and hobbies',
        'Worry about weight gain due to reduced activity',
        'Family concerns about mobility and independence'
      ],
      patientNames: {
        male: ['Thomas Wilson', 'Richard Johnson', 'Charles Brown', 'Joseph Davis', 'Christopher Miller'],
        female: ['Margaret Wilson', 'Dorothy Johnson', 'Ruth Brown', 'Sharon Davis', 'Michelle Miller']
      }
    },
    'lower back pain': {
      ageRange: { min: 25, max: 65 },
      genderDistribution: { male: 48, female: 52 },
      commonSymptoms: [
        'Constant aching in lower back',
        'Sharp pain with bending or lifting',
        'Muscle spasms in back and buttocks',
        'Pain radiating down one or both legs',
        'Stiffness worse in the morning'
      ],
      typicalBackground: [
        'Office worker with poor ergonomics',
        'Construction worker with heavy lifting',
        'Nurse with patient handling duties',
        'Truck driver with prolonged sitting',
        'Stay-at-home parent lifting children'
      ],
      medicalHistory: [
        'Previous episodes of back pain over 5 years',
        'History of poor posture and ergonomics',
        'Previous physical therapy with partial improvement',
        'Family history of back problems',
        'No significant trauma or injury'
      ],
      adlProblems: [
        'Difficulty bending to pick up objects',
        'Trouble with prolonged sitting at work',
        'Problems with lifting groceries or laundry',
        'Difficulty getting comfortable in bed',
        'Trouble with yard work and household chores'
      ],
      commonComorbidities: [
        'Mild depression related to chronic pain',
        'Sleep disturbances due to pain',
        'Occasional headaches from muscle tension',
        'Weight gain due to reduced activity',
        'Anxiety about movement and re-injury'
      ],
      psychosocialFactors: [
        'Work-related stress and deadlines',
        'Concern about job performance and attendance',
        'Impact on family activities and responsibilities',
        'Frustration with recurring nature of symptoms',
        'Fear of movement and further injury'
      ],
      patientNames: {
        male: ['Mark Thompson', 'Kevin Anderson', 'Brian Wilson', 'Steven Davis', 'Daniel Garcia'],
        female: ['Lisa Thompson', 'Karen Anderson', 'Amy Wilson', 'Julie Davis', 'Sarah Garcia']
      }
    },
    'parkinson': {
      ageRange: { min: 55, max: 85 },
      genderDistribution: { male: 60, female: 40 },
      commonSymptoms: [
        'Resting tremor in hands, more pronounced on one side',
        'Bradykinesia (slowness of movement) affecting daily activities',
        'Muscle rigidity and stiffness throughout the body',
        'Postural instability and balance problems',
        'Shuffling gait with reduced arm swing'
      ],
      typicalBackground: [
        'Retired engineer who noticed hand tremor during fine motor tasks',
        'Former teacher who developed writing difficulties',
        'Retired mechanic with family history of movement disorders',
        'Homemaker who noticed difficulty with cooking and household tasks',
        'Former business executive with gradual onset of symptoms'
      ],
      medicalHistory: [
        'Essential tremor diagnosed 5 years ago, later reclassified as Parkinson\'s',
        'Family history of Parkinson\'s disease (father diagnosed at age 70)',
        'Gradual onset of symptoms over 2-3 years',
        'Previous trial of carbidopa-levodopa with good initial response',
        'History of depression and anxiety preceding motor symptoms'
      ],
      adlProblems: [
        'Difficulty with fine motor tasks like buttoning clothes',
        'Problems with handwriting (micrographia)',
        'Trouble getting up from chairs and bed',
        'Difficulty with walking and turning',
        'Problems with eating due to tremor and slow movements'
      ],
      commonComorbidities: [
        'Depression and anxiety related to diagnosis',
        'Sleep disorders including REM sleep behavior disorder',
        'Constipation and other autonomic symptoms',
        'Mild cognitive impairment',
        'Orthostatic hypotension'
      ],
      psychosocialFactors: [
        'Grief and adjustment to progressive neurological diagnosis',
        'Concern about burden on family and caregivers',
        'Fear of disease progression and loss of independence',
        'Social withdrawal due to embarrassment about symptoms',
        'Anxiety about medication management and side effects'
      ],
      patientNames: {
        male: ['Robert Mitchell', 'William Thompson', 'James Patterson', 'Charles Anderson', 'Donald Wilson'],
        female: ['Margaret Mitchell', 'Dorothy Thompson', 'Helen Patterson', 'Ruth Anderson', 'Betty Wilson']
      }
    },
    'parkinson disease': {
      ageRange: { min: 55, max: 85 },
      genderDistribution: { male: 60, female: 40 },
      commonSymptoms: [
        'Resting tremor in hands, more pronounced on one side',
        'Bradykinesia (slowness of movement) affecting daily activities',
        'Muscle rigidity and stiffness throughout the body',
        'Postural instability and balance problems',
        'Shuffling gait with reduced arm swing'
      ],
      typicalBackground: [
        'Retired engineer who noticed hand tremor during fine motor tasks',
        'Former teacher who developed writing difficulties',
        'Retired mechanic with family history of movement disorders',
        'Homemaker who noticed difficulty with cooking and household tasks',
        'Former business executive with gradual onset of symptoms'
      ],
      medicalHistory: [
        'Essential tremor diagnosed 5 years ago, later reclassified as Parkinson\'s',
        'Family history of Parkinson\'s disease (father diagnosed at age 70)',
        'Gradual onset of symptoms over 2-3 years',
        'Previous trial of carbidopa-levodopa with good initial response',
        'History of depression and anxiety preceding motor symptoms'
      ],
      adlProblems: [
        'Difficulty with fine motor tasks like buttoning clothes',
        'Problems with handwriting (micrographia)',
        'Trouble getting up from chairs and bed',
        'Difficulty with walking and turning',
        'Problems with eating due to tremor and slow movements'
      ],
      commonComorbidities: [
        'Depression and anxiety related to diagnosis',
        'Sleep disorders including REM sleep behavior disorder',
        'Constipation and other autonomic symptoms',
        'Mild cognitive impairment',
        'Orthostatic hypotension'
      ],
      psychosocialFactors: [
        'Grief and adjustment to progressive neurological diagnosis',
        'Concern about burden on family and caregivers',
        'Fear of disease progression and loss of independence',
        'Social withdrawal due to embarrassment about symptoms',
        'Anxiety about medication management and side effects'
      ],
      patientNames: {
        male: ['Robert Mitchell', 'William Thompson', 'James Patterson', 'Charles Anderson', 'Donald Wilson'],
        female: ['Margaret Mitchell', 'Dorothy Thompson', 'Helen Patterson', 'Ruth Anderson', 'Betty Wilson']
      }
    },
    'shoulder impingement': {
      ageRange: { min: 30, max: 65 },
      genderDistribution: { male: 55, female: 45 },
      commonSymptoms: [
        'Pain in shoulder with overhead activities',
        'Night pain that disrupts sleep',
        'Weakness with lifting and reaching',
        'Catching or clicking sensation in shoulder',
        'Pain radiating down the arm'
      ],
      typicalBackground: [
        'Construction worker with repetitive overhead work',
        'Tennis player with history of overuse',
        'Painter with years of overhead reaching',
        'Swimmer with intensive training history',
        'Office worker with poor ergonomics'
      ],
      medicalHistory: [
        'Previous episodes of shoulder pain over 2 years',
        'History of repetitive overhead activities',
        'Previous cortisone injection with temporary relief',
        'Family history of shoulder problems',
        'No significant trauma or acute injury'
      ],
      adlProblems: [
        'Difficulty reaching overhead shelves',
        'Problems with hair washing and grooming',
        'Trouble sleeping on affected side',
        'Difficulty with lifting objects above shoulder height',
        'Problems with putting on shirts and jackets'
      ],
      commonComorbidities: [
        'Cervical spine dysfunction',
        'Rotator cuff tendinopathy',
        'Mild depression related to activity limitations',
        'Sleep disturbances due to night pain',
        'Tension headaches from compensatory postures'
      ],
      psychosocialFactors: [
        'Frustration with impact on work performance',
        'Concern about need for surgery',
        'Impact on recreational activities and sports',
        'Worry about chronic pain development',
        'Anxiety about movement and further injury'
      ],
      patientNames: {
        male: ['Michael Johnson', 'David Wilson', 'Christopher Brown', 'Matthew Davis', 'Andrew Miller'],
        female: ['Jennifer Johnson', 'Michelle Wilson', 'Amanda Brown', 'Jessica Davis', 'Ashley Miller']
      }
    },
    'copd': {
      ageRange: { min: 55, max: 80 },
      genderDistribution: { male: 52, female: 48 },
      commonSymptoms: [
        'Shortness of breath with minimal exertion',
        'Chronic cough with sputum production',
        'Fatigue and reduced exercise tolerance',
        'Wheezing and chest tightness',
        'Frequent respiratory infections'
      ],
      typicalBackground: [
        'Former smoker with 30-year pack history',
        'Retired factory worker with dust exposure',
        'Former coal miner with occupational lung disease',
        'Homemaker with secondhand smoke exposure',
        'Retired mechanic with chemical exposure'
      ],
      medicalHistory: [
        'Smoking history of 1-2 packs per day for 25+ years',
        'Quit smoking 5 years ago after diagnosis',
        'Previous hospitalizations for COPD exacerbations',
        'History of pneumonia requiring antibiotics',
        'Progressive worsening of symptoms over 10 years'
      ],
      adlProblems: [
        'Difficulty climbing stairs without stopping',
        'Unable to walk long distances without rest',
        'Trouble with household cleaning activities',
        'Problems with showering due to breathlessness',
        'Difficulty carrying groceries or heavy items'
      ],
      commonComorbidities: [
        'Hypertension and cardiovascular disease',
        'Anxiety and depression related to breathlessness',
        'Osteoporosis from steroid use',
        'Sleep apnea and sleep disturbances',
        'Gastroesophageal reflux disease'
      ],
      psychosocialFactors: [
        'Guilt and regret about smoking history',
        'Fear of suffocation and panic attacks',
        'Social isolation due to activity limitations',
        'Concern about being a burden on family',
        'Depression related to loss of independence'
      ],
      patientNames: {
        male: ['Robert Thompson', 'William Anderson', 'James Wilson', 'Charles Davis', 'Joseph Miller'],
        female: ['Mary Thompson', 'Patricia Anderson', 'Linda Wilson', 'Barbara Davis', 'Susan Miller']
      }
    }
  };

  /**
   * Generate evidence-based auto-filled case study data
   */
  async generateAutoFillData(primaryCondition: string): Promise<AutoFillData> {
    console.log('Generating EBP auto-fill data for:', primaryCondition);

    // First try to find clinical profile (more detailed)
    const clinicalKey = this.findMatchingClinicalCondition(primaryCondition);
    const clinicalProfile = this.clinicalProfiles[clinicalKey];

    if (clinicalProfile) {
      console.log('Using clinical profile for:', clinicalKey);
      return this.generateFromClinicalProfile(clinicalProfile, primaryCondition);
    }

    // Fallback to basic condition profile
    const conditionKey = this.findMatchingCondition(primaryCondition);
    const profile = this.conditionProfiles[conditionKey];

    if (!profile) {
      throw new Error(`No profile found for condition: ${primaryCondition}`);
    }

    console.log('Using basic profile for:', conditionKey);
    return this.generateFromBasicProfile(profile, primaryCondition);
  }

  /**
   * Generate from detailed clinical profile (EBP-based)
   */
  private generateFromClinicalProfile(profile: ClinicalProfile, condition: string): AutoFillData {
    const gender = this.selectGender(profile.genderDistribution);
    const age = this.generateAge(profile.ageRange);
    const patientName = this.selectPatientName(profile.patientNames, gender);

    // Create clinically sophisticated case data
    const symptoms = this.selectRandomItems(profile.clinicalPresentation, 2, 3).join('. ') + '.';
    const functionalImpact = this.selectRandomItems(profile.functionalLimitations, 2, 3).join('. ') + '.';
    const assessmentData = this.selectRandomItems(profile.assessmentFindings, 2, 3).join('. ') + '.';
    const psychosocial = this.selectRandomItems(profile.psychosocialFactors, 1, 2).join('. ') + '.';

    // Create realistic background based on age and condition
    const backgroundOptions = [
      `${age}-year-old ${gender.toLowerCase()} with ${profile.clinicalComplexity.toLowerCase()} presentation`,
      `${profile.patientProfile} patient with ${profile.anatomicalRegion.toLowerCase()} involvement`,
      `Individual with ${condition} affecting ${profile.icfImpact.join(', ').toLowerCase()}`
    ];

    const autoFillData: AutoFillData = {
      patientName,
      age,
      gender,
      condition: condition,
      symptoms: symptoms,
      background: this.selectRandomItems(backgroundOptions, 1, 1)[0],
      history: `${assessmentData} Previous functional status was independent prior to onset.`,
      adlProblem: functionalImpact,
      comorbidities: this.generateRealisticComorbidities(age, profile.anatomicalRegion),
      psychosocialFactors: psychosocial
    };

    console.log('Generated clinical auto-fill data:', autoFillData);
    return autoFillData;
  }

  /**
   * Generate from basic profile (fallback)
   */
  private generateFromBasicProfile(profile: ConditionProfile, condition: string): AutoFillData {
    const gender = this.selectGender(profile.genderDistribution);
    const age = this.generateAge(profile.ageRange);
    const patientName = this.selectPatientName(profile.patientNames, gender);

    const autoFillData: AutoFillData = {
      patientName,
      age,
      gender,
      condition: condition,
      symptoms: this.selectRandomItems(profile.commonSymptoms, 2, 3).join('. ') + '.',
      background: this.selectRandomItems(profile.typicalBackground, 1, 1)[0],
      history: this.selectRandomItems(profile.medicalHistory, 2, 3).join('. ') + '.',
      adlProblem: this.selectRandomItems(profile.adlProblems, 2, 3).join('. ') + '.',
      comorbidities: this.selectRandomItems(profile.commonComorbidities, 1, 2).join('. ') + '.',
      psychosocialFactors: this.selectRandomItems(profile.psychosocialFactors, 1, 2).join('. ') + '.'
    };

    console.log('Generated basic auto-fill data:', autoFillData);
    return autoFillData;
  }

  /**
   * Find matching clinical condition profile
   */
  private findMatchingClinicalCondition(condition: string): string {
    const conditionLower = condition.toLowerCase().trim();
    console.log('Looking for clinical condition match for:', conditionLower);

    // Exact match first
    if (this.clinicalProfiles[conditionLower]) {
      console.log('Found exact clinical match:', conditionLower);
      return conditionLower;
    }

    // Enhanced clinical matching
    const clinicalVariations = {
      'parkinson disease': ['parkinson', 'parkinsons', 'parkinson disease', 'parkinsons disease', 'pd'],
      'stroke': ['stroke', 'cva', 'cerebrovascular accident', 'brain attack', 'hemiplegia', 'hemiparesis'],
      'subacromial pain syndrome': ['shoulder impingement', 'impingement', 'subacromial pain', 'rotator cuff pain', 'shoulder pain'],
      'chronic non-specific low back pain': ['chronic back pain', 'chronic low back pain', 'clbp', 'non-specific back pain', 'chronic lbp']
    };

    // Check clinical variations
    for (const [profileKey, variations] of Object.entries(clinicalVariations)) {
      if (variations.some(variation =>
        conditionLower.includes(variation) || variation.includes(conditionLower)
      )) {
        console.log('Found clinical variation match:', profileKey, 'for input:', conditionLower);
        return profileKey;
      }
    }

    console.log('No clinical match found for:', conditionLower);
    return '';
  }

  /**
   * Generate realistic comorbidities based on age and condition type
   */
  private generateRealisticComorbidities(age: number, anatomicalRegion: string): string {
    const ageBasedComorbidities = [];

    if (age > 65) {
      ageBasedComorbidities.push('Hypertension', 'Type 2 diabetes mellitus', 'Osteoporosis');
    } else if (age > 50) {
      ageBasedComorbidities.push('Hypertension', 'Hyperlipidemia');
    }

    const regionSpecificComorbidities = {
      'Neurological': ['Depression', 'Sleep disorders', 'Cognitive impairment'],
      'Shoulder': ['Cervical spine dysfunction', 'Tension headaches'],
      'Lumbar Spine': ['Sleep disturbances', 'Mild depression related to chronic pain'],
      'default': ['Mild anxiety', 'Sleep quality issues']
    };

    const specificComorbidities = regionSpecificComorbidities[anatomicalRegion] || regionSpecificComorbidities.default;

    const selectedComorbidities = [
      ...this.selectRandomItems(ageBasedComorbidities, 0, 2),
      ...this.selectRandomItems(specificComorbidities, 1, 2)
    ];

    return selectedComorbidities.join('. ') + (selectedComorbidities.length > 0 ? '.' : 'No significant comorbidities reported.');
  }

  /**
   * Generate auto-fill data using AI for more dynamic results
   */
  async generateAIAutoFillData(primaryCondition: string, specialization: string = ''): Promise<AutoFillData> {
    try {
      console.log('🪄 Magic Wand: Generating AI case for:', primaryCondition, specialization);

      // Try AI-powered generation first
      const { data, error } = await supabase.functions.invoke('magic-wand-autofill', {
        body: {
          primaryCondition: primaryCondition,
          specialization: specialization
        }
      });

      if (!error && data?.success && data?.patientProfile) {
        console.log('✨ AI Magic Wand successful:', data.patientProfile);

        // Store the full formatted data for later use
        this.lastGeneratedProfile = data.patientProfile;

        // Use AI-generated data
        return {
          patientName: data.patientProfile.patientName,
          age: data.patientProfile.age,
          gender: data.patientProfile.gender,
          condition: primaryCondition,
          symptoms: data.patientProfile.symptoms,
          background: data.patientProfile.background,
          history: data.patientProfile.history,
          adlProblem: data.patientProfile.adlProblem,
          comorbidities: data.patientProfile.comorbidities,
          psychosocialFactors: data.patientProfile.psychosocialFactors,
          // Add new fields for enhanced UI
          avatarUrl: data.patientProfile.avatarUrl,
          assessmentScores: data.patientProfile.assessmentScores,
          formattedData: data.patientProfile.formattedData
        };
      } else {
        console.log('🔄 AI failed, falling back to clinical templates:', error);
        // Fallback to clinical templates
        return this.generateAutoFillData(primaryCondition);
      }

    } catch (error) {
      console.error('🚨 Magic Wand error, using clinical templates:', error);
      // Always fallback to clinical templates
      return this.generateAutoFillData(primaryCondition);
    }
  }

  /**
   * Find matching condition in profiles
   */
  private findMatchingCondition(condition: string): string {
    const conditionLower = condition.toLowerCase().trim();
    console.log('Looking for condition match for:', conditionLower);

    // Exact match first
    if (this.conditionProfiles[conditionLower]) {
      console.log('Found exact match:', conditionLower);
      return conditionLower;
    }

    // Enhanced partial matching with common variations
    const conditionVariations = {
      'parkinson': ['parkinson', 'parkinsons', 'parkinson disease', 'parkinsons disease', 'pd'],
      'parkinson disease': ['parkinson', 'parkinsons', 'parkinson disease', 'parkinsons disease', 'pd'],
      'stroke': ['stroke', 'cva', 'cerebrovascular accident', 'brain attack'],
      'spinal stenosis': ['spinal stenosis', 'stenosis', 'lumbar stenosis', 'cervical stenosis'],
      'knee osteoarthritis': ['knee osteoarthritis', 'knee oa', 'osteoarthritis knee', 'arthritis knee'],
      'lower back pain': ['lower back pain', 'low back pain', 'back pain', 'lumbar pain', 'lbp'],
      'shoulder impingement': ['shoulder impingement', 'impingement', 'shoulder pain', 'rotator cuff'],
      'copd': ['copd', 'chronic obstructive pulmonary disease', 'emphysema', 'chronic bronchitis']
    };

    // Check variations
    for (const [profileKey, variations] of Object.entries(conditionVariations)) {
      if (variations.some(variation =>
        conditionLower.includes(variation) || variation.includes(conditionLower)
      )) {
        console.log('Found variation match:', profileKey, 'for input:', conditionLower);
        return profileKey;
      }
    }

    // Fallback partial match
    for (const key of Object.keys(this.conditionProfiles)) {
      if (conditionLower.includes(key) || key.includes(conditionLower)) {
        console.log('Found partial match:', key, 'for input:', conditionLower);
        return key;
      }
    }

    // Default fallback
    console.log('No match found, using default fallback for:', conditionLower);
    return 'lower back pain';
  }

  /**
   * Select gender based on distribution
   */
  private selectGender(distribution: { male: number; female: number }): string {
    const random = Math.random() * 100;
    return random < distribution.male ? 'Male' : 'Female';
  }

  /**
   * Generate age within range
   */
  private generateAge(range: { min: number; max: number }): number {
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  }

  /**
   * Select patient name based on gender
   */
  private selectPatientName(names: { male: string[]; female: string[] }, gender: string): string {
    const nameList = gender === 'Male' ? names.male : names.female;
    return nameList[Math.floor(Math.random() * nameList.length)];
  }

  /**
   * Select random items from array
   */
  private selectRandomItems<T>(items: T[], min: number, max: number): T[] {
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffled = [...items].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Fallback methods for AI failure
   */
  private generateRandomName(): string {
    const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa', 'Robert', 'Mary'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  }

  private generateRandomAge(): number {
    return Math.floor(Math.random() * 60) + 20; // 20-80 years
  }

  private generateRandomGender(): string {
    return Math.random() < 0.5 ? 'Male' : 'Female';
  }
}

export const autoFillService = new AutoFillService();