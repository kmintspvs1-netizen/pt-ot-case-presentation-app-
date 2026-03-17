---
name: pt-evidence-review
description: Review physical therapy evidence for clinical decision-making. Use when Codex needs to turn a PT clinical question, paper, abstract, or journal club topic into (1) a focused clinical question, (2) PICO, (3) Japanese and English search terms, (4) structured critical appraisal, and (5) cautious clinical application. Especially useful for intervention-effect questions, paper reading, pre-search organization for PubMed or PEDro, and separating facts, limitations, and hypotheses.
---

# PT Evidence Review

## Overview

Support evidence-informed physical therapy reasoning, not automatic treatment decisions.
Turn a clinical question or paper into a structured review that helps a therapist judge what is known, what is uncertain, and what may be applicable in practice.
For reusable prompt patterns, see [prompt-examples.md](./references/prompt-examples.md).

## Workflow

### 1. Clarify the clinical question

- Rewrite the user's concern as one focused clinical question.
- If the request is vague, infer the most likely intervention-effect question first.
- Distinguish whether the user needs:
  - pre-search question framing
  - paper or abstract appraisal
  - journal club preparation
  - case-specific clinical application

### 2. Build PICO

- Present:
  - `P`: Patient or Problem
  - `I`: Intervention
  - `C`: Comparison
  - `O`: Outcome
- Add `Time` or `Setting` only when they matter clinically.
- If any PICO element is missing, mark it as unknown instead of forcing certainty.

### 3. Propose search terms

- Suggest both Japanese and English keywords.
- For English, prefer PubMed-ready wording and include likely synonyms.
- Draft a simple Boolean search string with `AND` and `OR`.
- When appropriate, include likely MeSH or concept-level alternatives, but keep the query readable.
- Use [search-patterns.md](./references/search-patterns.md) when the user needs more than a quick keyword list.
- When the user wants help after running a search, review the apparent fit of the results and decide whether the query should be broadened, narrowed, or kept as is.
- Use [pubmed-search-refinement.md](./references/pubmed-search-refinement.md) when refining PubMed queries from real search results.

### 4. Extract the study basics

- If a paper, abstract, or summary is provided, extract:
  - research purpose
  - study design
  - participants
  - intervention
  - comparison
  - outcomes
  - main results
  - authors' conclusion
- Separate reported results from inferred interpretation.
- If key details are absent from the source, say so explicitly.

### 5. Critically appraise the evidence

- First identify the study design and adjust confidence accordingly.
- Check internal validity before discussing application.
- Review the likely impact of:
  - selection bias
  - measurement bias
  - attrition bias
  - confounding
  - sample size limitations
- Distinguish:
  - statistical significance
  - clinical importance
  - feasibility in routine PT practice
- Use [critical-appraisal-guide.md](./references/critical-appraisal-guide.md) for design-specific prompts.

### 6. Judge clinical application cautiously

- Explain whether the findings seem applicable to the user's patient or setting.
- State whether the intervention seems:
  - broadly applicable
  - applicable with modification
  - difficult to apply directly
- Note important precautions, implementation barriers, and what should be re-evaluated after applying the evidence.
- Keep recommendations conditional. Prefer phrases such as `考えられる`, `示唆される`, and `〜なら適用しやすい`.

### 7. Separate fact from uncertainty

- End by splitting the case into:
  - facts
  - missing information
  - hypotheses
- Keep the user's clinical reasoning transparent by separating:
  - reported study facts
  - authors' interpretation
  - therapist-facing inference

### 8. Prioritize what to read next

- When several papers are available, rank reading priority instead of listing them equally.
- Prefer this order unless the user asks otherwise:
  - direct systematic reviews or meta-analyses on the exact PT question
  - recent RCTs closest to the target patient, timing, and intervention
  - older but foundational RCTs
  - indirect or mixed-population papers used as supporting context
- Explain briefly why each paper is high, medium, or low priority.
- Use [reading-priority-guide.md](./references/reading-priority-guide.md) when triaging multiple search results for journal club or clinical reading.

## Output Rules

- Write in Japanese unless the user explicitly asks otherwise.
- Keep the structure usable for journal club notes or bedside reasoning.
- Do not claim treatment effectiveness with unwarranted certainty.
- Do not treat the article conclusion as automatically trustworthy.
- Always separate statistical significance from clinical meaningfulness.
- Always comment on whether the study population resembles the target patient.
- Mark unknowns and missing data clearly.
- If the source is only an abstract, say that appraisal confidence is limited.
- If multiple papers are compared, appraise each one before synthesizing across them.
- If the user asks whether a query is too broad or too narrow, make that judgment from the search results rather than from the query text alone.
- When ranking papers, favor directness to the user's clinical question over novelty alone.

## Default Output Structure

- `1. 臨床疑問`
- `2. PICO`
- `3. 検索キーワード案`
- `4. 論文の要点`
- `5. 批判的吟味`
- `6. 臨床応用`
- `7. 事実 / 不足情報 / 仮説`

If the user only asks for search support, shorten sections 4-7.
If the user only asks for appraisal of a provided paper, keep section 3 brief.

## Resources

### references

- [search-patterns.md](./references/search-patterns.md): how to expand PT questions into Japanese and English search terms and simple Boolean search strings.
- [critical-appraisal-guide.md](./references/critical-appraisal-guide.md): design-aware prompts for checking validity, interpretation, and clinical application.
- [pubmed-search-refinement.md](./references/pubmed-search-refinement.md): how to judge whether a PubMed query should be broadened, narrowed, or kept after seeing the result set.
- [reading-priority-guide.md](./references/reading-priority-guide.md): how to rank papers for first-pass reading, journal club prep, and case-focused evidence review.
- [prompt-examples.md](./references/prompt-examples.md): reusable prompt templates for PICO setup, search design, search refinement, appraisal, clinical application, and journal club prep.

## Expected User Requests

- "Use pt-evidence-review to turn this PT clinical question into PICO and search terms."
- "Read this abstract and critically appraise it for a journal club."
- "Help me decide whether this intervention evidence applies to my stroke patient."
- "Organize this paper into facts, limitations, and clinical implications."
- "Make PubMed and PEDro search terms for this PT treatment question."
- "Use pt-evidence-review to summarize this RCT in Japanese and judge clinical meaning."
- "Look at these PubMed results and tell me whether I should broaden or narrow the search."
- "Rank these papers in reading priority for my journal club."
- "Show me example prompts for using pt-evidence-review."

## Safety

- Treat all outputs as clinical decision support drafts, not final medical judgment.
- Avoid overstating causality from weak or uncontrolled designs.
- Highlight when external validity is poor even if results look favorable.
- Note when direct application may be limited by setting, dosage, equipment, or patient characteristics.
