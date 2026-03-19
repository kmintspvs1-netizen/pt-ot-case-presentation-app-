# Playground

このフォルダは、1つの単独アプリのリポジトリというより、複数の試作アプリ、スキル、出力ファイルをまとめて置いている作業用フォルダです。

## まず何を開けばいいか

- 入口ページ: [index.html](./index.html)
- 新しめのアプリ: [training-accountability-app.html](./training-accountability-app.html)
- 既存のPT / OTアプリ: [pt-case-presentation-app.html](./pt-case-presentation-app.html)

通常は `index.html` を開くと、どのアプリに進むか選びやすいです。

## 全体マップ

### 1. 入口ページ

- [index.html](./index.html)
  - このフォルダの案内ページです。
  - 各アプリへのリンクがあります。

### 2. Webアプリ

- [training-accountability-app.html](./training-accountability-app.html)
  - トレーニング習慣化アプリの画面です。
- [training-accountability-app.js](./training-accountability-app.js)
  - 上記アプリのロジックです。
- [training-app-sw.js](./training-app-sw.js)
  - Service Worker です。
- [training-app.webmanifest](./training-app.webmanifest)
  - PWA 用の設定ファイルです。
- [pt-case-presentation-app.html](./pt-case-presentation-app.html)
  - PT / OT ケースプレゼン用アプリです。
- [ameblo-image-generator.html](./ameblo-image-generator.html)
  - 単体のHTMLツールです。
- [online-academy.html](./online-academy.html)
  - 単体のHTMLページです。

### 3. 公開用の別フォルダ

- [pt-case-presentation-pages](./pt-case-presentation-pages/)
  - GitHub Pages に載せるための静的サイトです。
  - 中心ファイルは [pt-case-presentation-pages/index.html](./pt-case-presentation-pages/index.html) です。
  - 説明は [pt-case-presentation-pages/README.md](./pt-case-presentation-pages/README.md) にあります。

### 4. スキル用フォルダ

以下は「アプリ本体」というより、Codex に特定の仕事をさせるための説明書、テンプレート、参考資料です。

- [pt-case-presentation](./pt-case-presentation/)
- [pt-evidence-review](./pt-evidence-review/)
- [patient-home-exercise-handout](./patient-home-exercise-handout/)
- [buzz-recipe](./buzz-recipe/)
- [pt-internal-slides](./pt-internal-slides/)

各フォルダには、`SKILL.md`、`assets/`、`references/`、`agents/` などが入っています。

### 5. データ・成果物

- `pt-case-presentation-case1*.json`
- `pt-case-presentation-case1*.pptx`
- `pt-internal-slides-case1.json`
- `pt-internal-slides-case1.pptx`

これらはケースデータや、生成済みの PowerPoint ファイルです。

### 6. 補助ツール・素材

- [convert_mov_to_mp4.swift](./convert_mov_to_mp4.swift)
- [IMG_3458.mp4](./IMG_3458.mp4)
- [ffmpeg.zip](./ffmpeg.zip)
- [ffmpeg_bin](./ffmpeg_bin/)

## このフォルダを見るときの考え方

この作業場は、大きく分けると次の3種類でできています。

- ブラウザで開くアプリ
- Codex 用のスキル定義
- 出力データや素材ファイル

そのため、「全部が1つの仕組みで動くプロジェクト」ではありません。

## よくある混乱ポイント

### 1. `package.json` がないとはどういう意味か

`package.json` は、JavaScript プロジェクトでよく使う「共通の設定ファイル」です。

たとえば普通のプロジェクトでは、ここに以下のような情報が入ります。

- 使っているライブラリ
- 起動方法
- テスト方法
- ビルド方法
- Lint の方法

このフォルダには、ルート全体を管理するその種のファイルが見当たりません。
つまり、`Playground` 全体に共通する「決まった起動手順」や「標準テスト手順」があるわけではなさそう、という意味です。

言い換えると、ここは「統一された製品リポジトリ」というより、「用途ごとの小さな制作物をまとめた置き場」です。

### 2. `pt-case-presentation-pages` に独立した `.git` があるとはどういう意味か

このフォルダ全体には [`.git`](./.git/) があり、普通はその下のファイルをまとめて1つの Git 履歴で管理します。

ただし、[pt-case-presentation-pages](./pt-case-presentation-pages/) の中にも別の `.git` があります。
これは、そのフォルダだけが別の Git 管理単位になっている可能性がある、ということです。

イメージとしては次のような状態です。

- 外側: `Playground` 全体の Git
- 内側: `pt-case-presentation-pages` だけの別 Git

そのため Git を使うときに、「外側の履歴として扱うのか」「内側のフォルダ単体で扱うのか」を意識する必要があります。

危険というより、「Git の見え方が少しややこしい」という理解で大丈夫です。

## 今後このフォルダを触るときのおすすめ

- まず [index.html](./index.html) を入口として考える
- Web アプリを触るなら、対象の `html` と対応する `js` をセットで見る
- スキルを触るなら、各フォルダの `SKILL.md` から読む
- Git 操作をするときは、[pt-case-presentation-pages](./pt-case-presentation-pages/) を別管理かもしれない前提で慎重に見る

## ひとことで言うと

この `Playground` は、
「複数の小さな制作物が同居している作業場」
です。
