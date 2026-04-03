---
name: pt-case-presentation
description: Build structured physical therapy case presentations from patient data, evaluation findings, treatment progress, and reassessment results. Use when Codex needs to turn PT case information into (1) an initial evaluation presentation with problem list, goals, clinical reasoning, treatment plan, and abstract, or (2) a final presentation with treatment summary, outcomes, reassessment-based interpretation, discussion, and abstract.
---

# PT Case Presentation

## Overview

Convert case details into presentation-ready physical therapy materials.
Produce two modes: an initial evaluation presentation and a final presentation after treatment and reassessment, and support written drafts and abstracts.
If the user says `pt-case-presentation スキル発動`, treat it as shorthand for: create an initial evaluation presentation with the main presentation text, abstract, current treatment, and treatment rationale.

## Workflow

### 1. Choose the output mode

- Use the initial mode when the user provides baseline information and wants an assessment presentation, problem interpretation, and treatment plan.
- Use the final mode when the user provides treatment progress or reassessment findings and wants outcomes, interpretation, and discussion.
- If both are requested, draft the initial section first and then the final section so the clinical logic stays consistent.

### 2. Normalize the inputs

- If the case is missing structure, reorganize it using [case-input-template.md](./assets/case-input-template.md).
- Keep only the facts given by the user. Mark assumptions explicitly.
- Ask what treatment is already being performed before proposing a new program when that information is missing.
- Pull out the essentials before drafting:
  - diagnosis and stage or post-op timing
  - chief complaints and pain behavior
  - ADL and participation limits
  - objective findings
  - goals and expected discharge path
  - current treatment already in progress
  - interventions already performed, if any

### 2a. Confirm the current treatment

- Before finalizing the presentation, identify the treatment already being carried out now.
- If treatment details are missing, ask for them briefly or mark them as unknown and draft the presentation with a placeholder section.
- Present current treatment as a separate section from the proposed treatment plan.
- For each current treatment item, connect it to the target impairment, activity limitation, or participation goal.

### 3. Build the clinical story

- Separate impairments, activity limitations, and participation restrictions.
- Link each major problem to supporting findings instead of listing exercises without rationale.
- Write goals that are functional and time-bound when the source material allows it.
- Make treatment progression explicit: what is prioritized now, what change indicates success, and what the next step will be.

### 4. Draft the presentation

- For initial presentations, use [initial-eval-template.md](./references/initial-eval-template.md).
- For final presentations, use [final-presentation-template.md](./references/final-presentation-template.md).
- If the user asks for an abstract, use [initial-abstract-template.md](./references/initial-abstract-template.md) or [final-abstract-template.md](./references/final-abstract-template.md).
- If the user asks for speaker notes or a script, turn the final structure into a concise spoken draft after the main outline is complete.

### 5. Write discussion and interpretation carefully

- Use [clinical-reasoning-guide.md](./references/clinical-reasoning-guide.md) when writing assessment synthesis, outcomes, and discussion.
- Distinguish clearly between:
  - observed facts
  - therapist interpretation
  - speculation or likely mechanism
- If improvement is partial, explain what changed, what did not, and why that matters functionally.

### 6. Add treatment rationale when requested

- If the user asks for rationale or evidence, search for recent primary or guideline-level sources and summarize them briefly.
- Prefer clinical practice guidelines, systematic reviews, and randomized trials.
- Tie each cited rationale to the actual interventions being used now, not to generic exercise advice.
- When the current treatment is already known, explain why each element may fit the case and note relevant precautions.

### 7. Default structure for treatment rationale

- When current treatment is known, add a short section named `Current Treatment and Rationale`.
- Use this order:
  - treatment item
  - clinical aim in this case
  - brief rationale
  - important precautions
- Keep rationale concise and tied to the patient's findings.
- If evidence is limited or indirect, say that clearly instead of overstating confidence.

## Output Rules

- Keep the output presentation-ready with clear section headings.
- When an abstract is requested, write a concise, submission-ready summary with a clear structure and no unnecessary expansion.
- Use professional but plain language; avoid unnecessary jargon stacking.
- Tie each treatment element to a target problem or goal.
- If evidence or rationale is requested, add a short rationale section with sources.
- When current treatment exists, include both `Current Treatment` and `Current Treatment and Rationale` as distinct sections if that improves readability.
- When data is incomplete, say what is missing and continue with a reasonable draft rather than stopping.
- If contraindications, red flags, or medical precautions are relevant, surface them before treatment planning.
- Treat all treatment plans and interpretations as clinical support drafts, not final medical judgment.

## Resources

### assets

- [case-input-template.md](./assets/case-input-template.md): reusable intake form for organizing case details before drafting.

### references

- [initial-eval-template.md](./references/initial-eval-template.md): structure for the first case conference or initial evaluation presentation.
- [final-presentation-template.md](./references/final-presentation-template.md): structure for post-treatment or discharge-oriented final presentations.
- [initial-abstract-template.md](./references/initial-abstract-template.md): concise abstract structure for initial evaluation case reports.
- [final-abstract-template.md](./references/final-abstract-template.md): concise abstract structure for final case reports with outcomes and discussion.
- [clinical-reasoning-guide.md](./references/clinical-reasoning-guide.md): prompts for problem interpretation, progress analysis, and discussion writing.
- [treatment-rationale-guide.md](./references/treatment-rationale-guide.md): how to summarize current treatment, search rationale, and present supporting evidence.

## Expected User Requests

- "Use pt-case-presentation to make an initial evaluation presentation from this knee OA case."
- "Turn this stroke case into a PT case conference draft with goals and treatment program."
- "Use pt-case-presentation to build the final presentation from these reassessment findings."
- "pt-case-presentation スキル発動"
- "Create a final PT case presentation with a slide outline and short speaker notes."
- "First ask what treatment is currently being done, then build the PT presentation."
- "Add evidence-based rationale for the current treatment program."
- "Include the treatment currently being performed and explain the rationale for each item."
- "Draft both the initial and final PT presentation from this case summary and treatment course."

## Safety

- Do not present unsupported medical claims as established fact.
- Do not hide missing data. Mark gaps that weaken the assessment or discussion.
- Recommend confirmation by the treating therapist whenever the draft depends on local protocol, detailed examination, or physician restrictions.
