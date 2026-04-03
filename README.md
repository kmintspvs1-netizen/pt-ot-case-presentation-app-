# Playground

このフォルダは、1つのアプリではありません。

複数のアプリ、Codex 用スキル、素材、出力物、ローカル作業フォルダをまとめた作業場です。

見やすくするために、役割ごとに分けました。

## いまの構成

### `apps/`

ブラウザで開くアプリです。

- `apps/training-accountability/`
  - いまの主力アプリ
  - 中身:
    - `training-accountability-app.html`
    - `training-accountability-app.js`
    - `training-app-sw.js`
    - `training-app.webmanifest`
    - `training-app-icon.svg`
- `apps/pt-case-presentation/`
  - PT / OT ケースプレゼン用アプリ
  - 中身:
    - `pt-case-presentation-app.html`
- `apps/standalone/`
  - 単発の HTML ツール
  - 中身:
    - `ameblo-image-generator.html`
    - `online-academy.html`

### `public/`

Firebase Hosting に公開するファイルです。

ここは配信用です。普段の編集元とは分けてあります。

### `functions/`

Firebase Functions のサーバー側コードです。

### `skills/`

Codex 用のスキルです。

- `skills/buzz-recipe/`
- `skills/patient-home-exercise-handout/`
- `skills/pt-case-presentation/`
- `skills/pt-evidence-review/`

### `exports/`

生成したファイルや出力物です。

- `exports/presentations/`
  - PowerPoint や JSON サンプル
- `exports/pdfs/`
  - PDF 出力物
- `exports/output/`
  - そのほかの出力物

### `assets/`

素材ファイルです。

- `assets/media/`
  - 動画や関連メモ

### `tools/`

補助ツールです。

- `tools/media/`
  - 変換スクリプト
  - `ffmpeg` 一式

### `docs/`

メモや参考資料です。

- `docs/notes/`
  - 作業メモ
- `docs/cases/`
  - 単発のケース資料

### `scratch/`

ローカル作業用の置き場です。

GitHub に上げない一時フォルダを寄せています。

- `scratch/work/`
- `scratch/local-projects/`

## ルート直下に残しているもの

### 残している理由があるもの

- `index.html`
  - 入口ページ
- `firebase.json`
  - Firebase の公開設定
- `.firebaserc`
  - Firebase プロジェクト指定
- `.gitignore`
  - Git に入れないファイルの設定
- `README.md`
  - この説明

### そのまま残したもの

- `cloud-run/`
  - まだ今回の整理対象に入れていない
- `pt-case-presentation-pages/`
  - 独立した Git 管理を含むため、今回は動かしていない

## まずどこを見ればいいか

### ふだんの入口

- `index.html`

### トレーニングアプリを触る

- `apps/training-accountability/`
- 公開側も見るなら `public/`
- サーバー側も見るなら `functions/`

### スキルを触る

- `skills/` 以下

### 出力物を見る

- `exports/` 以下

## Git 的にどういう意味か

今回の整理では、

- アプリ本体
- スキル
- 出力物
- ローカル専用ファイル

を分けました。

これで、少なくとも「何がアプリで、何がただの作業ファイルか」は見分けやすくなっています。

## まだ整理していないもの

次は必要ならここを整理できます。

- `cloud-run/`
- `pt-case-presentation-pages/`
- `.build/`
- `.clang-cache/`
- `.local-tools/`
- `.firebase/`

このあたりは、

- 独立性がある
- ローカル依存が強い
- Git やビルドの事情に影響しやすい

ので、今回は安全側でそのままにしています。
