# PT Case Presentation Cheat Sheet

## Skill Name

- `pt-case-presentation`

Exact name is helpful, but you do not need to remember it perfectly every time.
If you describe the task clearly, Codex can still use the skill.

Example:

- `pt-case-presentation スキル発動`
- `pt-case-presentation を使って。この症例の初期評価発表を作って。`
- `pt-case-presentation を使って。先に現在の治療を整理してから、初期評価発表と根拠を作って。`
- `この症例情報から理学療法の初期評価発表を作って。`
- `この再評価結果から最終発表と考察を作って。`

## Where To Check

- Skill body:
  - `/Users/kohey/.codex/skills/pt-case-presentation/SKILL.md`
- Initial presentation template:
  - `/Users/kohey/.codex/skills/pt-case-presentation/references/initial-eval-template.md`
- Final presentation template:
  - `/Users/kohey/.codex/skills/pt-case-presentation/references/final-presentation-template.md`
- Initial abstract template:
  - `/Users/kohey/.codex/skills/pt-case-presentation/references/initial-abstract-template.md`
- Final abstract template:
  - `/Users/kohey/.codex/skills/pt-case-presentation/references/final-abstract-template.md`
- Treatment rationale guide:
  - `/Users/kohey/.codex/skills/pt-case-presentation/references/treatment-rationale-guide.md`
- Input template:
  - `/Users/kohey/.codex/skills/pt-case-presentation/assets/case-input-template.md`

## Shortest Copy-Paste Prompts

### Shortcut

```text
pt-case-presentation スキル発動
```

Meaning:

- 初期評価発表を作る
- 発表本文を入れる
- 抄録を入れる
- 現在の治療を入れる
- 治療の根拠を入れる

### Initial Evaluation

```text
pt-case-presentation を使って。
この症例の初期評価発表を作って。
発表本文、抄録、現在の治療、治療の根拠までまとめて。


- 診断名:
- 年齢 / 性別:
- 主訴:
- 目標:
- ADL:
- 所見:
- 注意点:
- 現在の治療:
```

### Final Presentation / Discussion

```text
pt-case-presentation を使って。
この症例の最終発表を作って。
発表本文、抄録、結果、考察までまとめて。


- 診断名:
- 初期評価の要点:
- 実施した治療:
- 経過:
- 再評価結果:
- 改善した点:
- 残っている問題:
- 今後の課題:
```

### Super Short Version

```text
理学療法の初期評価発表を作って。
抄録もつけて。
以下が症例情報です...
```

```text
理学療法の最終発表を作って。
抄録と考察もつけて。
以下が再評価を含む症例情報です...
```

## Easiest Prompt For Initial Evaluation

Copy and send this:

```text
pt-case-presentation を使って。
この症例の初期評価発表を作って。
発表本文と抄録を作って。
現在行っている治療も整理して、各治療の根拠も簡潔につけて。
不足している情報があれば、不足項目を明記したうえで発表形式にまとめて。

【症例情報】
- 診断名:
- 年齢 / 性別:
- 発症時期 or 術後時期:
- 主訴:
- 患者目標:
- ADL:
- 疼痛:
- ROM:
- 筋力:
- バランス:
- その他の所見:
- 生活背景:
- 注意点・禁忌:
- 現在の治療:
```

## Simple Prompt For Treatment Rationale

```text
pt-case-presentation を使って。
まず現在の治療を整理して。
そのうえで、初期評価発表に「現在の治療」と「治療の根拠」を入れて。
必要なら文献も検索して。
```

## Easiest Prompt For Final Presentation

Copy and send this:

```text
pt-case-presentation を使って。
この症例の最終発表を作って。
発表本文と抄録を作って。
再評価結果をもとに、結果と考察まで発表形式にまとめて。
現在の治療内容と、その根拠も簡潔につけて。

【症例情報】
- 診断名:
- 初期評価の要点:
- 実施した治療:
- 治療期間・頻度:
- 経過:
- 再評価結果:
- 改善した点:
- 残存している問題:
- 今後の課題:
- 現在の治療:
```

## Simple Rule

If you forget everything else, send only this:

```text
理学療法の症例発表を作って。
初期評価発表です。
抄録もつけてください。
以下が症例情報です...
```

or

```text
理学療法の症例発表を作って。
最終発表です。
抄録もつけてください。
以下が再評価を含む症例情報です...
```
