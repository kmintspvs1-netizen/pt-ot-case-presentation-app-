---
name: patient-home-exercise-handout
description: Create patient-friendly home exercise programs from clinical information and turn them into easy-to-understand handouts with images, dosage, precautions, and plain-language instructions. Use when Codex needs to organize patient findings, choose appropriate exercises, and produce a printable self-exercise sheet for orthopedic, neurologic, or general physical therapy cases.
---

# 患者自主トレ作成

## Overview

患者情報や評価所見をもとに、自主トレーニング案を整理し、患者さんが自宅で実施しやすい説明用紙まで作成する。
専門職向けの臨床 reasoning と、患者さん向けのやさしい表現を分けて扱う。
ユーザーが `患者自主トレ作成スキルで` や `patient-home-exercise-handout を使って` と指示した場合は、このスキルを優先して使う。

## Workflow

### 1. 依頼内容を整理する

- まず今回必要なのが次のどれかを判定する。
  - 自主トレ案のみ
  - 患者説明文つきの用紙
  - 印刷や配布を意識した HTML/Markdown 形式の用紙
- 情報が散らばっている場合は [patient-intake-template.md](./references/patient-intake-template.md) に沿って整理する。
- 不足情報があっても停止せず、わかる範囲で下書きを作り、不明点を明示する。

### 2. 臨床情報を患者向けに変換する

- まず専門職視点で次を短く整理する。
  - 主病態や術後時期
  - 主な機能障害
  - 活動制限
  - 実施時の注意点や禁忌
- そのあと患者さん向けには次の形に言い換える。
  - 何のための運動か
  - どうやって行うか
  - 何回やるか
  - どの程度なら中止・相談が必要か
- 専門用語は必要最小限にし、使う場合はすぐ後ろに平易な説明を添える。

### 3. 自主トレ内容を選ぶ

- 運動は原則 2 から 5 種目に絞る。
- 各種目には必ず次をセットで書く。
  - 種目名
  - 目的
  - 開始姿勢
  - 動き方
  - 回数、秒数、セット数、頻度
  - よくある代償や注意点
  - 中止目安
- 痛み、荷重制限、術後制限、転倒リスクなどがある場合は、種目ごとに安全確認を入れる。
- 情報不足で種目選定の確度が低いときは、断定せず「候補」や「要確認」と明記する。

### 4. Gemini 半自動運用で説明用紙を作る

- 用紙作成が求められたら [handout-template.md](./references/handout-template.md) を基本構成として使う。
- 標準フローは、まず HTML の説明用紙を作り、そのあと必要な種目だけ Gemini で画像を手動生成し、保存済み画像を HTML に差し替えて仕上げる形とする。
- まず [exercise-handout.html](./assets/exercise-handout.html) を土台にして、A4 印刷を前提に文面とカード構成を整える。
- 各種目の図は次の優先順で対応する。
  1. ユーザーから既存画像や写真が与えられているならそれを使う
  2. Gemini の nanobanana や ChatGPT に渡す画像生成プロンプトを作る
  3. ユーザーが手動生成した画像を受け取り、HTML に差し替える
  4. 画像がまだない場合は、仮の SVG 図で先にレイアウトを組む
  5. それも難しい場合は、視線誘導しやすいテキスト図解にする
- Gemini や ChatGPT の操作自体はこのスキルから自動実行できない前提で扱う。
- 画像生成プロンプトが必要な場合は [prompt-template.md](./references/prompt-template.md) を使う。
- 手動生成した画像を受け取ったら、カード内の図を PNG や JPEG に差し替え、必要に応じてトリミングして見出しの重複を抑える。
- 画像を HTML に差し替えるときは、患者さんが真似しやすいか、姿勢が医学的に不自然でないかを確認する。

### 5. 出力を整える

- 患者向け用紙では 1 種目ごとの説明を短く区切り、1 文を長くしすぎない。
- 1 ページに収める必要がある場合は、重要な注意点と頻度を優先し、臨床メモは削る。
- 医療者向けの補足が必要なら、患者用本文とは分けて `Clinician Notes` として追記する。

## Output Rules

- 患者向け本文はやさしい日本語を優先する。
- 種目説明は「開始姿勢」「動作」「回数」「注意点」がすぐ見つかる形にする。
- 標準出力は HTML の患者説明用紙とし、画像は `Gemini半自動運用` を前提に差し替え可能な構造にする。
- 画像がある場合は実画像を優先し、ない場合は SVG 仮図で代替する。
- 痛みの悪化、しびれ増悪、腫脹増加、ふらつきなど中止目安を必要に応じて明記する。
- 事実と推定を分ける。評価所見が不足している場合は不足を明示する。
- 用紙作成時は、患者さんがそのまま読める完成原稿を優先し、説明途中のメモ書きのような文体は避ける。
- A4 1 枚に収めるときは、1 種目 1 カードを基本にして、文字量より視認性を優先する。
- 医療判断の確定表現は避け、最終確認は担当療法士または主治医であることを前提にする。

## Resources

### references

- [patient-intake-template.md](./references/patient-intake-template.md): 患者情報を自主トレ作成用に整理するテンプレート。
- [handout-template.md](./references/handout-template.md): Gemini 半自動運用を前提にした患者説明用紙の標準構成。
- [prompt-template.md](./references/prompt-template.md): Gemini や ChatGPT に手動で渡す画像生成プロンプト雛形。

### assets

- [exercise-handout.html](./assets/exercise-handout.html): 印刷しやすい HTML ベースの説明用紙テンプレート。

## Expected User Requests

- "Use patient-home-exercise-handout to make a home exercise sheet for this TKA patient."
- "患者自主トレ作成スキルで、腰痛患者さん向けの自主トレを3種目作って。"
- "評価内容から患者説明用の自主トレ用紙まで作って。"
- "Gemini で画像を作る前提で、自主トレ handout を HTML で作成して。"
- "片麻痺患者向けに安全面も含めた自主トレを作って。"
- "患者自主トレ作成スキルで、Gemini用プロンプト付きのA4用紙を作って。"
- "患者自主トレ作成スキルで、画像差し替え前提のHTMLを作って。"

## Safety

- 禁忌や術後制限が不明なときは、断定的な運動処方を避ける。
- 症状増悪時の受診・相談目安を、必要に応じて用紙内へ入れる。
- 高リスク症例では、単独実施が危険な動作を自宅メニューへ安易に含めない。
