# Search Patterns

Use this reference when the user needs a stronger search setup than a short keyword list.

## Quick process

1. Identify the core constructs in `P`, `I`, `C`, and `O`.
2. Decide which terms are essential and which are optional.
3. Build a readable English query first.
4. Add Japanese clinical wording for local discussion or note-taking.
5. Avoid overloading the query with too many outcomes unless precision is needed.

## PT-friendly search construction

### Patient or Problem

- diagnosis
- symptom cluster
- severity or chronicity
- age group if clinically important

Examples:

- `stroke`
- `knee osteoarthritis`
- `chronic low back pain`
- `postoperative rotator cuff repair`

### Intervention

- exact intervention name
- common synonym
- broader PT category if needed

Examples:

- `exercise therapy`
- `task-oriented training`
- `neuromuscular electrical stimulation`
- `manual therapy`

### Comparison

Include only if it materially changes the question.

Examples:

- `usual care`
- `sham`
- `no treatment`
- `home exercise`

### Outcome

Use sparingly. Add outcomes when the topic is too broad or when the user cares about a specific endpoint.

Examples:

- `pain`
- `gait speed`
- `balance`
- `function`
- `quality of life`

## Boolean patterns

### Simple intervention-effect query

```text
(stroke OR cerebrovascular accident) AND (task-oriented training OR task specific training) AND (gait OR walking)
```

### PT trial-focused query

```text
(knee osteoarthritis) AND (exercise therapy OR therapeutic exercise) AND (pain OR function) AND (randomized controlled trial OR RCT)
```

### Review-focused query

```text
(low back pain) AND (manual therapy) AND (systematic review OR meta-analysis)
```

## Output preference

When using this reference, present:

- Japanese keywords
- English keywords
- one simple search string
- one narrower alternative if the topic is broad

## Reminders

- Prefer clarity over maximal recall in first-pass searches.
- Mention that database-specific indexing may require later adjustment.
- If the user names PubMed, it is reasonable to suggest MeSH-like concepts without pretending to have confirmed indexing.
