# PubMed Search Refinement

Use this reference after a PubMed query has already been run and there is enough visible information to judge the result set.

## Goal

Decide whether the current PubMed query should be:

- kept as is
- broadened
- narrowed

Base that judgment on the apparent relevance of the returned papers, not on the wording of the query alone.

## Quick review process

1. Check whether clearly relevant papers appear in the first result set.
2. Note whether irrelevant themes are recurring.
3. Look for missed direct evidence categories such as systematic reviews or RCTs.
4. Decide whether the current search is:
   - too narrow
   - well balanced
   - too broad
5. Suggest one next-step query revision at a time.

## Signs the query is well balanced

- The first screen includes papers directly matching the condition, intervention, and main outcome.
- At least some studies are close to the intended postoperative stage or patient type.
- A mix of review-level and trial-level evidence is visible.
- Irrelevant papers are present but do not dominate the result set.

## Signs the query may be too broad

- Many results are only loosely related to the intervention.
- Mixed populations dominate the results and drown out the target condition.
- The results include many descriptive studies when the user wants intervention-effect evidence.
- The outcome terms are so broad that nonessential papers fill the first page.
- Preoperative or non-PT studies keep appearing when the user wants postoperative rehabilitation evidence.

## Ways to narrow

- Add care-context terms such as:
  - `rehabilitation`
  - `"physical therapy"`
  - `physiotherapy`
  - `exercise`
- Exclude clearly unwanted phases or contexts:
  - `NOT (preoperative OR pre-op)`
- Add outcome terms only when they reflect the user's real question:
  - `gait`
  - `walking`
  - `"gait speed"`
  - `"Timed Up and Go"`
- Add evidence-design filters when the user needs fast, higher-level reading:
  - `randomized`
  - `RCT`
  - `"systematic review"`
  - `"meta-analysis"`

## Signs the query may be too narrow

- Very few results appear.
- Known direct papers are missing.
- The query depends on too many outcome terms at once.
- The query includes PT-setting words that may exclude otherwise relevant rehab papers.
- The stage or timing wording is stricter than the literature typically uses.

## Ways to broaden

- Remove one layer of narrowing first, not several at once.
- Remove strict outcome terms before removing the core condition or intervention.
- Remove care-context terms such as `rehabilitation` or `"physical therapy"` if the topic is already specific.
- Replace specific phrases with broader concepts:
  - from `"balance training"` to `balance`
  - from `"walking ability"` to `walking`
- Keep the core condition and intervention intact whenever possible.

## PT-specific judgment rule

For PT clinical searches, the best search is often not the smallest one.
If clearly relevant reviews and RCTs are already visible, prefer keeping the query or making only a small refinement rather than aggressively narrowing.

## Output preference

When using this reference, report:

- current judgment: `broad`, `balanced`, or `narrow`
- brief reason based on visible results
- one recommended next query
- one fallback query if the first revision underperforms
