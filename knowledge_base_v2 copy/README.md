# CRISP Knowledge Base v2.0

## Clinical Reasoning Interactive Student Partner

**Version:** 2.0  
**Context:** European School of Physiotherapy (ESP), Amsterdam  
**Last Updated:** January 2026

---

## Overview

CRISP is an AI-powered clinical reasoning coach designed for physiotherapy students. It guides learners through structured clinical reasoning using three integrated frameworks:

1. **HOAC-II** (Hypothesis-Oriented Algorithm for Clinicians) - 7-step reasoning process
2. **ICF** (International Classification of Functioning, Disability and Health) - Functional classification
3. **KNGF** (Royal Dutch Society for Physiotherapy) - Evidence-based practice guidelines

### Core Philosophy

> "CRISP reasons about the student's reasoning first"

CRISP is NOT a clinical decision support tool. It is an educational coach that:
- Guides students through structured reasoning
- Challenges assumptions and prevents premature closure
- Requires testable hypotheses with explicit mediators
- Enforces decision-linked assessments
- Promotes self-reflection and metacognition

---

## Knowledge Base Architecture

```
knowledge_base_v2/
|
+-- core/                          # CRISP identity and behavior
|   +-- crisp_identity.json        # Who CRISP is, mission, boundaries
|   +-- crisp_coaching_rules.json  # Mode switching, intervention triggers
|   +-- crisp_rubric.json          # 6-domain reasoning assessment (A-F)
|
+-- frameworks/
|   +-- hoac_ii/                   # Hypothesis-Oriented Algorithm
|   |   +-- hoac_steps.json        # 7 steps with objectives
|   |   +-- hoac_coaching_prompts.json    # Scaffolding questions per step
|   |   +-- hoac_reasoning_traps.json     # Common student errors
|   |
|   +-- icf/                       # International Classification of Functioning
|       +-- icf_body_functions.json       # b-codes (Body Functions)
|       +-- icf_activities.json           # d-codes (Activities & Participation)
|       +-- icf_structures.json           # s-codes (Body Structures)
|       +-- icf_environment.json          # e-codes (Environmental Factors)
|       +-- icf_condition_maps.json       # Condition -> typical ICF profile
|
+-- assessment/
|   +-- clinimetrics_index.json    # All assessment tools with properties
|   +-- clinimetrics_by_domain.json       # Grouped by clinical domain
|   +-- clinimetrics_by_icf.json          # Linked to ICF codes
|
+-- guidelines/
|   +-- kngf_index.json            # Index of KNGF guidelines
|   +-- kngf_low_back_pain.json    # Key decision points extracted
|   +-- kngf_neck_pain.json
|   +-- kngf_hip_knee_oa.json
|
+-- cases/
|   +-- case_schema.json           # Template structure for cases
|   +-- case_archetypes.json       # Condition-specific patterns
|   +-- musculoskeletal/           # Domain-organized cases
|   +-- neurological/
|   +-- sports/
|   +-- geriatric/
|
+-- evidence/
    +-- pedro_interpretation.json  # How to interpret PEDro scores
    +-- evidence_uncertainty.json  # Where guidelines are uncertain
```

---

## How CRISP Works

### 1. Coaching Modes

CRISP operates in three modes, triggered by student language:

| Mode | Triggers | Behavior |
|------|----------|----------|
| **Coaching** | "teach me", "help me", "explain" | Guides through questions, never gives answers directly |
| **Consulting** | "example", "demonstration", "show me" | Provides worked examples with explicit reasoning |
| **Reflective** | After each reasoning sequence | Prompts self-assessment, what-if questions |

### 2. Intervention Rules

CRISP monitors student reasoning and intervenes when:

| Condition | Action | Example Prompt |
|-----------|--------|----------------|
| Diagnosis used as problem | **Interrupt** | "If this problem resolved, what would the patient be able to do?" |
| Vague or non-testable mediator | **Interrupt** | "What change would falsify this hypothesis?" |
| Test without decision consequence | **Interrupt** | "What would you do differently if this test is positive vs negative?" |
| Single mediator reused | **Challenge** | "Why this mediator over alternatives?" |
| Impairment-focused problem | **Coach** | "How does this affect the patient's daily activities?" |

### 3. The ESP-CRISP Reasoning Rubric

Student reasoning is assessed across 6 domains (A-F):

| Domain | Focus | HOAC Steps |
|--------|-------|------------|
| **A: Problem Framing** | Translation of patient story into rehabilitation-relevant problems | 1, 2 |
| **B: Hypothesis-Mediator Logic** | Quality of causal explanations linking problems to mechanisms | 2 |
| **C: Assessment Decision Logic** | Use of assessment to reduce uncertainty and guide decisions | 3, 4 |
| **D: Goal Coherence** | Logical and patient-centred goal hierarchy | 5 |
| **E: Intervention & Re-evaluation** | Adaptive intervention planning and evaluative thinking | 6, 7 |
| **F: Reflection & Self-Correction** | Ability to evaluate and adjust one's own reasoning | All |

**Rating Logic:**
- **Acceptable**: No domain rated as "error"
- **Questionable**: One or more domains rated as "weak"
- **Unsafe**: Any domain rated as "error"

---

## Research Foundation

This knowledge base design is informed by recent scoping reviews on AI in clinical reasoning education:

### Key Findings Integrated

From **Shen (2025)** - "Clinical Reasoning and AI Integration":
- AI tools enhance skill development through personalized feedback
- Emotional safety reduces learner anxiety
- Technical accuracy concerns require human oversight
- Lack of non-verbal cues limits realism

From **Wu (2025)** - "Will AI Reshape Clinical Reasoning Education for Physiotherapy?":
- ICF + HOAC integration is critical for physiotherapy-specific AI
- AI can make reasoning explicit through visible logic chains
- Clinical reasoning skills should be assessed separately from knowledge recall
- Common reasoning traps need explicit scaffolding

### Design Principles Applied

1. **Make reasoning explicit** - Every case includes `reasoning_pathway` fields
2. **Integrate ICF + HOAC** - Deep mapping at each step
3. **Disentangle knowledge vs skills** - Separate metrics in rubric
4. **Structured scaffolding** - Coaching prompts per HOAC step
5. **Close feedback gap** - Criteria-aligned feedback templates

---

## File Format Specifications

### Case Study Schema

Each case follows this structure:

```json
{
  "case_id": "msk_nslbp_001",
  "title": "Non-specific low back pain in office worker",
  "domain": "Musculoskeletal",
  "condition": "Non-specific low back pain",
  "complexity": "Intermediate",
  "guideline_reference": {
    "source": "KNGF Low Back Pain Guideline",
    "year": 2021
  },
  
  "step_1_patient": { ... },
  "step_2_problems_hypotheses": { ... },
  "step_3_assessment": { ... },
  "step_4_findings": { ... },
  "step_5_goals": { ... },
  "step_6_intervention": { ... },
  "step_7_reassessment": { ... },
  
  "icf_mapping": {
    "body_functions": [...],
    "activities_participation": [...],
    "environmental_factors": [...],
    "personal_factors": "..."
  },
  
  "learning_objectives": [...],
  "reasoning_traps_for_this_case": [...]
}
```

### Clinimetrics Entry Schema

```json
{
  "id": "psfs",
  "name": "Patient Specific Functional Scale",
  "abbreviation": "PSFS",
  "icf_domain": "Activity",
  "icf_codes": ["d230", "d450"],
  "categories": ["Musculoskeletal", "Neurological"],
  "outcome": {
    "variable": "Activities of Daily Living",
    "unit": "Score (0-10)"
  },
  "clinimetric_properties": {
    "mcid": 2,
    "reliability": "ICC 0.82-0.92"
  },
  "when_to_use": [...],
  "hoac_steps": [2, 4, 7]
}
```

---

## Usage in ChatGPT

To use this knowledge base with ChatGPT Custom GPT:

1. Upload the core JSON files to the GPT's knowledge base
2. Reference the coaching rules in system instructions
3. Use the rubric for structured feedback
4. Load case studies for practice sessions

### Recommended Upload Priority

1. `core/crisp_identity.json` - Essential
2. `core/crisp_coaching_rules.json` - Essential
3. `frameworks/hoac_ii/hoac_steps.json` - Essential
4. `core/crisp_rubric.json` - Essential
5. `assessment/clinimetrics_index.json` - Recommended
6. Case study files as needed

---

## Contributing

This knowledge base is developed for ESP Amsterdam physiotherapy education. Contributions should:

1. Maintain alignment with HOAC-II, ICF, and KNGF frameworks
2. Include evidence references where applicable
3. Follow the established JSON schemas
4. Support educational (not clinical decision) purposes

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Oct 2025 | Initial CRISP deployment |
| 2.0 | Jan 2026 | Restructured knowledge base, integrated research findings, improved case quality |

---

## Contact

**Developer:** Aviv Hidrian  
**Institution:** European School of Physiotherapy, Hogeschool van Amsterdam  
**Research Contributors:** Yanyan Shen, Qihua Wu (PAP research on AI in CR education)

---

*This documentation is intended for educational purposes within the ESP physiotherapy programme.*
