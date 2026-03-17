# Prompt Examples

Use these templates when invoking `$pt-evidence-review`.
Replace the bracketed parts with the actual case, paper, or search result.

## How to use this skill

The simplest pattern is:

```text
$pt-evidence-review [what you want Codex to do]
```

You do not need to describe every step.
If you ask for one task such as PICO, search refinement, or appraisal, the skill can narrow its output to that task.

## Common prompt patterns

### 1. PICO and search setup

```text
$pt-evidence-review この臨床疑問をPICO化して、PubMed用の検索語と検索式を作ってください。
```

```text
$pt-evidence-review [症例や臨床疑問] について、PICO、日本語キーワード、英語キーワード、PubMed検索式を整理してください。
```

### 2. Three-version search strategy

```text
$pt-evidence-review このテーマについて、PubMed検索式を標準版・広げる版・絞る版の3本で作ってください。
```

### 3. Search-result refinement

```text
$pt-evidence-review この検索式でPubMed検索しました。結果を見て、広げた方がいいか絞った方がいいか判断してください。
```

```text
$pt-evidence-review このPubMed検索結果のタイトル一覧を見て、broad / balanced / narrow のどれか判断し、次の検索式を1本提案してください。
```

### 4. Paper summary

```text
$pt-evidence-review この抄録を、研究目的・研究デザイン・対象・介入・比較・評価項目・結果・結論に分けて整理してください。
```

### 5. Critical appraisal

```text
$pt-evidence-review この論文を批判的吟味してください。強み、限界、バイアスの可能性、統計学的有意差、臨床的意義を分けて整理してください。
```

### 6. Clinical application

```text
$pt-evidence-review この論文が自分の患者に適用できるか、対象、介入内容、アウトカム、実施可能性の観点で整理してください。
```

### 7. Facts, gaps, and hypotheses

```text
$pt-evidence-review この論文または抄録について、事実・不足情報・仮説を分けてまとめてください。
```

### 8. Journal club preparation

```text
$pt-evidence-review この論文を抄読会で発表できる形に整理してください。要点、限界、臨床示唆を簡潔にまとめてください。
```

### 9. Reading priority

```text
$pt-evidence-review この検索結果の論文を、抄読の優先順位つきで並べてください。まず読むべき論文と理由も書いてください。
```

```text
$pt-evidence-review このテーマで、まずレビュー、次にRCTという順で読むべき論文を絞ってください。
```

### 10. Multi-paper synthesis

```text
$pt-evidence-review 複数論文を比較して、共通して言えること、食い違うこと、臨床応用上の注意点を整理してください。
```

## Quick usage advice

- 検索前なら: `PICO化して検索式まで`
- 検索後なら: `結果を見て広げるか絞るか判断して`
- 論文を読むなら: `この抄録/論文を批判的吟味して`
- 症例に当てはめるなら: `この患者に適用できるか整理して`
- 抄読会なら: `発表用に整理して`
- 論文選別なら: `優先順位をつけて`

## Minimal invocation examples

```text
$pt-evidence-review この疑問をPICO化してください。
```

```text
$pt-evidence-review この検索結果を見て、次の一手を決めてください。
```

```text
$pt-evidence-review この論文を抄読会向けに整理してください。
```
