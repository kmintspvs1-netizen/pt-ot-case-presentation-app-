# Critical Appraisal Guide

Use this reference when reviewing a paper, abstract, or study summary.

## Core checks for any design

- What question is the study trying to answer?
- Does the design match that question?
- Are the participants similar to the target patient population?
- Is the intervention described clearly enough to reproduce?
- Are the outcomes clinically meaningful?
- Are the results reported clearly enough to interpret?
- Are the authors' conclusions stronger than the data support?

## Design-aware prompts

### Systematic review or meta-analysis

- Were the inclusion criteria appropriate?
- Was the search likely comprehensive?
- Was study quality assessed?
- Are the included studies too heterogeneous to combine confidently?
- If pooled effects are reported, do they hide important clinical differences?

### Randomized controlled trial

- Was randomization described adequately?
- Was allocation concealment likely?
- Were groups similar at baseline?
- Were participants, therapists, or assessors blinded where realistic?
- Was follow-up complete enough to trust the estimate?
- Was the intervention dose and co-intervention handling clear?

### Non-randomized or cohort study

- Are the groups meaningfully comparable?
- Is confounding likely to explain the observed effect?
- Was exposure or intervention measured consistently?
- Was follow-up long enough and reasonably complete?

### Case-control study

- Were cases and controls selected appropriately?
- Were important confounders addressed?
- Could recall or measurement bias distort exposure estimates?

### Cross-sectional study

- Does the study only show association at one time point?
- Is temporal order impossible to determine?
- Are the measures reliable enough for the question?

### Case report or case series

- Is the patient description detailed enough to understand context?
- Are concurrent treatments or natural recovery alternative explanations?
- Does the report generate a hypothesis rather than establish effectiveness?

## Interpreting results

Separate these explicitly:

- `統計学的有意差`: whether the observed difference is unlikely under a null model
- `臨床的意義`: whether the size of change matters to patients or practice
- `実装可能性`: whether the intervention can actually be delivered in the user's setting

## Application prompts

- Does the patient resemble the study population?
- Can the same dose, frequency, and equipment be used?
- What risks, precautions, or barriers matter locally?
- What would you re-evaluate after trying this approach?

## Language reminders

- Use cautious wording for applicability.
- If only an abstract is available, say that bias assessment is incomplete.
- If critical details are missing, make that limitation visible instead of filling gaps with certainty.
