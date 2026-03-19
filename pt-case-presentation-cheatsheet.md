/Users/kohey/Documents/Playground

# PT Case Presentation Cheat Sheet

## Skill Name

- `pt-case-presentation`

Exact name is helpful, but you do not need to remember it perfectly every time.
If you describe the task clearly, Codex can still use the skill.

Example:

- `pt-case-presentation を使って。この症例の初期評価発表を作って。`
- `pt-case-presentation を使って。この症例の初期評価発表をスライド構成付きで作って。`
- `この症例情報から理学療法の初期評価発表を作って。`
- `この再評価結果から最終発表と考察を作って。`

## Where To Check

- Skill body:
  - `/Users/kohey/.codex/skills/pt-case-presentation/SKILL.md`
- Initial presentation template:
  - `/Users/kohey/.codex/skills/pt-case-presentation/references/initial-eval-template.md`
- Final presentation template:
  - `/Users/kohey/.codex/skills/pt-case-presentation/references/final-presentation-template.md`
- Initial slide template:
  - `/Users/kohey/.codex/skills/pt-case-presentation/references/initial-slide-template.md`
- Final slide template:
  - `/Users/kohey/.codex/skills/pt-case-presentation/references/final-slide-template.md`
- Input template:
  - `/Users/kohey/.codex/skills/pt-case-presentation/assets/case-input-template.md`

## Easiest Prompt For Initial Evaluation

Copy and send this:

```text
pt-case-presentation を使って。
この症例の初期評価発表を作って。
発表本文とスライド構成の両方を作って。
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
```

## Easiest Prompt For Final Presentation

Copy and send this:

```text
pt-case-presentation を使って。
この症例の最終発表を作って。
発表本文とスライド構成の両方を作って。
再評価結果をもとに、結果と考察まで発表形式にまとめて。

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
```

## Simple Rule

If you forget everything else, send only this:

```text
理学療法の症例発表を作って。
初期評価発表です。
スライド構成もつけてください。
以下が症例情報です...
```

or

```text
理学療法の症例発表を作って。
最終発表です。
スライド構成もつけてください。
以下が再評価を含む症例情報です...
```
