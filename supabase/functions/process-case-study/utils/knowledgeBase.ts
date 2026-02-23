import type { CaseStudy, ClinicalGuideline } from './types.ts';

import crispIdentity from '../knowledge/crisp_identity.json' with { type: 'json' };
import crispCoachingRules from '../knowledge/crisp_coaching_rules.json' with { type: 'json' };
import hoacSteps from '../knowledge/hoac_steps.json' with { type: 'json' };
import hoacReasoningTraps from '../knowledge/hoac_reasoning_traps.json' with { type: 'json' };
import icfReference from '../knowledge/icf_reference.json' with { type: 'json' };
import clinimetricsIndex from '../knowledge/clinimetrics_index.json' with { type: 'json' };
import kngfIndex from '../knowledge/kngf_index.json' with { type: 'json' };

type Dict = Record<string, unknown>;

interface KnowledgeContext {
  conditionBucket: string;
  guidelineSummary: string;
  guidelineObjects: ClinicalGuideline[];
  hoacChecklist: string[];
  reasoningTraps: string[];
  clinimetricSuggestions: string[];
  icfStarterCodes: string[];
  coachingModeHint: string;
}

const FALLBACK_HOAC = [
  'Define patient-relevant functional problems, not diagnoses.',
  'Write testable hypotheses with explicit mediators and falsification criteria.',
  'Choose assessments only when results change decisions.',
  'Set SMART goals linked to activity and participation.',
  'Define re-evaluation and exit criteria before treatment starts.'
];

const CONDITION_BUCKETS: Array<{ bucket: string; patterns: string[]; guidelineKey: string | null }> = [
  { bucket: 'low_back_pain', patterns: ['low back', 'lumbar', 'nslbp', 'back pain'], guidelineKey: 'low_back_pain' },
  { bucket: 'neck_pain', patterns: ['neck', 'wad', 'whiplash', 'cervical'], guidelineKey: 'neck_pain' },
  { bucket: 'hip_knee_oa', patterns: ['osteoarthritis', 'hip oa', 'knee oa', 'gonarthrosis', 'coxarthrosis'], guidelineKey: 'hip_knee_osteoarthritis' },
  { bucket: 'stroke', patterns: ['stroke', 'mca', 'hemiparesis'], guidelineKey: null },
  { bucket: 'parkinson', patterns: ['parkinson'], guidelineKey: null },
  { bucket: 'shoulder', patterns: ['shoulder', 'rotator cuff', 'saps', 'subacromial'], guidelineKey: null },
  { bucket: 'acl', patterns: ['acl', 'anterior cruciate'], guidelineKey: null },
];

function asObject(value: unknown): Dict {
  return typeof value === 'object' && value !== null ? value as Dict : {};
}

function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : [];
}

function toText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

function resolveConditionBucket(caseStudy: CaseStudy): { bucket: string; guidelineKey: string | null } {
  const source = normalize(`${caseStudy.condition || ''} ${caseStudy.presenting_complaint || ''} ${caseStudy.specialization || ''}`);
  for (const candidate of CONDITION_BUCKETS) {
    if (candidate.patterns.some(pattern => source.includes(pattern))) {
      return { bucket: candidate.bucket, guidelineKey: candidate.guidelineKey };
    }
  }
  return { bucket: 'general_msk', guidelineKey: null };
}

function firstN(items: string[], maxItems: number): string[] {
  return items.filter(Boolean).slice(0, maxItems);
}

function getHoacChecklist(): string[] {
  const steps = asArray<Dict>(asObject(hoacSteps).steps);
  if (steps.length === 0) return [...FALLBACK_HOAC];

  return firstN(
    steps.map((step) => {
      const title = toText(step.title) || toText(step.name);
      const objective = toText(step.objective) || toText(step.description);
      return `${title || 'HOAC step'}: ${objective || 'Define decision-linked reasoning output.'}`;
    }),
    6
  );
}

function getReasoningTraps(): string[] {
  const trapsRoot = asObject(hoacReasoningTraps);
  const generalTraps = asArray<Dict>(asObject(asObject(trapsRoot.reasoning_traps).general));
  const stepSpecificRoot = asObject(asObject(trapsRoot.reasoning_traps).step_specific);
  const stepSpecificTraps = Object.values(stepSpecificRoot).flatMap((value) => asArray<Dict>(value));
  const traps = [...generalTraps, ...stepSpecificTraps];
  if (traps.length > 0) {
    return firstN(
      traps.map((trap) => `${toText(trap.name) || 'Trap'}: ${toText(trap.coaching_response) || toText(trap.description)}`),
      5
    );
  }

  const interventionRules = asObject(asObject(crispCoachingRules).intervention_rules);
  const buckets = ['interrupt', 'challenge', 'coach'];
  const extracted: string[] = [];

  for (const bucket of buckets) {
    const entries = asArray<Dict>(asObject(interventionRules[bucket]).triggers);
    for (const entry of entries) {
      const condition = toText(entry.condition).replace(/_/g, ' ');
      const response = toText(entry.response);
      if (condition || response) {
        extracted.push(`${condition || 'reasoning issue'}: ${response || 'ask for explicit correction'}`);
      }
    }
  }

  return firstN(extracted, 5);
}

function getGuidelineSummary(guidelineKey: string | null): { summary: string; guidelines: ClinicalGuideline[] } {
  const root = asObject(kngfIndex);

  if (!guidelineKey || !root[guidelineKey]) {
    const meta = asObject(root.metadata);
    const note = toText(meta.usage_note) || 'Use current guideline recommendations and avoid routine low-value interventions.';
    return {
      summary: note,
      guidelines: []
    };
  }

  const g = asObject(root[guidelineKey]);
  const title = toText(g.guideline_title) || 'KNGF guideline';
  const year = toText(g.year) || 'not specified';

  const recommended = asArray<Dict>(asObject(asObject(g.treatment_recommendations).recommended));
  const notRecommended = asArray<Dict>(asObject(asObject(g.treatment_recommendations).not_recommended));

  const recPoints = firstN(recommended.map(item => {
    const intervention = toText(item.intervention);
    const evidence = toText(item.evidence);
    return `${intervention}${evidence ? ` (${evidence})` : ''}`;
  }), 3);

  const avoidPoints = firstN(notRecommended.map(item => {
    const intervention = toText(item.intervention);
    const rationale = toText(item.rationale);
    return `${intervention}${rationale ? ` (${rationale})` : ''}`;
  }), 2);

  const summary = [
    `${title} (${year})`,
    recPoints.length ? `Recommended: ${recPoints.join('; ')}` : '',
    avoidPoints.length ? `Avoid: ${avoidPoints.join('; ')}` : ''
  ].filter(Boolean).join(' | ');

  const guidelines: ClinicalGuideline[] = [{
    name: title,
    url: '',
    recommendation_level: 'Guideline Summary',
    key_points: [...recPoints, ...avoidPoints]
  }];

  return { summary, guidelines };
}

function getClinimetricSuggestions(caseStudy: CaseStudy): string[] {
  const root = asObject(clinimetricsIndex);
  const tools = asArray<Dict>(root.tools);
  if (tools.length === 0) return [];

  const specialization = normalize(caseStudy.specialization || '');
  const condition = normalize(caseStudy.condition || '');

  const categoryKey = specialization.includes('neuro') || condition.includes('stroke') || condition.includes('parkinson')
    ? 'Neurological'
    : specialization.includes('sport') || condition.includes('acl')
      ? 'Sports'
      : specialization.includes('geriat')
        ? 'Geriatric'
        : 'Musculoskeletal';

  const prioritized = tools
    .filter((tool) => {
      const categories = asArray<string>(tool.category).map(c => c.toLowerCase());
      return categories.includes(categoryKey.toLowerCase()) || categories.includes('general') || categories.includes('complex');
    })
    .slice(0, 18)
    .map((tool) => {
      const name = toText(tool.name);
      const abbr = toText(tool.abbreviation);
      const outcome = toText(tool.outcome_measured);
      const reasoning = toText(asObject(tool.coaching_prompts).clinical_reasoning_question);
      return `${name}${abbr ? ` (${abbr})` : ''}: ${outcome || 'Outcome tracking'}${reasoning ? ` | Reasoning check: ${reasoning}` : ''}`;
    });

  return firstN(prioritized, 6);
}

function lookupIcfCode(code: string): string {
  const needle = code.toLowerCase();

  const traverse = (node: unknown): string => {
    if (Array.isArray(node)) {
      for (const item of node) {
        const found = traverse(item);
        if (found) return found;
      }
      return '';
    }

    if (typeof node !== 'object' || node === null) return '';

    const current = node as Dict;
    const currentCode = toText(current.code).toLowerCase();
    if (currentCode === needle) {
      return `${toText(current.code)} ${toText(current.name)}`.trim();
    }

    for (const value of Object.values(current)) {
      const found = traverse(value);
      if (found) return found;
    }

    return '';
  };

  return traverse(icfReference);
}

function getIcfStarterCodes(bucket: string): string[] {
  const map: Record<string, string[]> = {
    low_back_pain: ['b28013', 'b7101', 'd410', 'd415', 'd850'],
    neck_pain: ['b28010', 'b7100', 'd410', 'd445', 'd850'],
    hip_knee_oa: ['b28016', 'b7100', 'd450', 'd455', 'd920'],
    stroke: ['b730', 'b760', 'd450', 'd510', 'e310'],
    parkinson: ['b765', 'b770', 'd450', 'd410', 'e120'],
    shoulder: ['b28014', 'b7100', 'd430', 'd445', 'd850'],
    acl: ['b715', 'b730', 'd450', 'd455', 'd920'],
    general_msk: ['b280', 'b710', 'd410', 'd450', 'e310']
  };

  const selected = map[bucket] || map.general_msk;
  return selected.map(code => lookupIcfCode(code) || code);
}

export function buildKnowledgeContext(caseStudy: CaseStudy): KnowledgeContext {
  const { bucket, guidelineKey } = resolveConditionBucket(caseStudy);
  const guideline = getGuidelineSummary(guidelineKey);
  const mission = toText(asObject(crispIdentity).mission);

  return {
    conditionBucket: bucket,
    guidelineSummary: guideline.summary,
    guidelineObjects: guideline.guidelines,
    hoacChecklist: getHoacChecklist(),
    reasoningTraps: getReasoningTraps(),
    clinimetricSuggestions: getClinimetricSuggestions(caseStudy),
    icfStarterCodes: getIcfStarterCodes(bucket),
    coachingModeHint: mission || 'Support structured clinical reasoning development, not diagnosis.'
  };
}

export function formatKnowledgePromptBlock(context: KnowledgeContext): string {
  return [
    `Knowledge focus bucket: ${context.conditionBucket}`,
    `CRISP coaching boundary: ${context.coachingModeHint}`,
    `Guideline summary: ${context.guidelineSummary}`,
    `HOAC checklist:\n${context.hoacChecklist.map(item => `- ${item}`).join('\n')}`,
    `Reasoning traps to prevent:\n${context.reasoningTraps.map(item => `- ${item}`).join('\n')}`,
    `Suggested clinimetrics:\n${context.clinimetricSuggestions.map(item => `- ${item}`).join('\n')}`,
    `ICF starter codes:\n${context.icfStarterCodes.map(item => `- ${item}`).join('\n')}`,
  ].join('\n\n');
}
