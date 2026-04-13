# Training Accountability App デプロイ手順メモ

このメモは、`/Users/kohey/Documents/Playground` の
`training-accountability-app` を更新するときの最短手順です。

## 1. 何をどこへ出しているか

- フロントエンド公開先: Firebase Hosting
- 公開ファイル置き場: `public/`
- 公開URL:
  - `https://training-accountability-app.web.app/training-accountability-app`
  - `https://training-accountability-app.web.app/pt-case-draft`

## 2. Hosting を更新する手順

ターミナルでこの順に実行します。

```bash
cd /Users/kohey/Documents/Playground
PATH="/Users/kohey/Documents/Playground/.local-tools/node-v22.14.0-darwin-arm64/bin:$PATH" \
node /Users/kohey/.npm/_npx/7750544ccf494d8b/node_modules/firebase-tools/lib/bin/firebase.js \
deploy --only hosting --project training-accountability-app
```

成功すると最後に `Deploy complete!` と表示されます。

## 3. 反映確認

公開JSの更新時刻を見るには次を実行します。

```bash
curl -I https://training-accountability-app.web.app/training-accountability-app.js
```

見る場所:

- `HTTP/2 200` になっている
- `last-modified` が直近時刻になっている

## 4. 入口URLの注意

- `/pt-case-draft` は Firebase Hosting のリダイレクトで
  `/training-accountability-app` に転送されます
- 入口URLが 404 なら `firebase.json` のリダイレクト設定を確認します

## 5. 注意点

- このPCでは `firebase` や `node` が通常PATHに入っていないことがあります
- そのため、上の「PATH を付けたコマンド」をそのまま使うのが安全です
- `public/training-accountability-app.js` が実際の配信対象です
- `apps/training-accountability/` は編集元の保管場所として使っています

## 6. まだ未確認のもの

- Cloud Run 側の本番デプロイコマンドは、このリポジトリ内では確認できていません
- `cloud-run/` には現時点でデプロイ設定ファイルがありません

## 7. 2026-04-06 の復旧メモ

- `public/pt-case-draft.html` を Git 履歴から復元した
- `cloud-run/pt-case-draft-api/` を Git 履歴から復元した
- `firebase.json` に `/api/pt-case-draft` と `/api/rehab-chat` の Cloud Run rewrite を戻した
- Cloud Run `pt-case-draft-api` を `asia-northeast1` に再デプロイした
- Firebase Hosting を再デプロイした

確認できたこと:

- `https://training-accountability-app.web.app/pt-case-draft` は `Clinical Draft Studio` を表示する
- `https://training-accountability-app.web.app/api/pt-case-draft` は Cloud Run に届く
- Gemini 生成まで動作確認できた

## 8. Cloud Run 再デプロイ手順

作業前:

- `gcloud init` が完了している
- 既定プロジェクトが `training-accountability-app`
- Gemini API キーを用意してある

実行手順:

```bash
cd /Users/kohey/Documents/Playground
read -s GEMINI_API_KEY
gcloud run deploy pt-case-draft-api \
  --source ./cloud-run/pt-case-draft-api \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --set-env-vars ALLOWED_ORIGIN=https://training-accountability-app.web.app,GEMINI_API_KEY=$GEMINI_API_KEY
```

デプロイ後:

```bash
PATH="/Users/kohey/Documents/Playground/.local-tools/node-v22.14.0-darwin-arm64/bin:$PATH" \
node /Users/kohey/.npm/_npx/7750544ccf494d8b/node_modules/firebase-tools/lib/bin/firebase.js \
deploy --only hosting --project training-accountability-app
```

## 9. API 疎通確認

`curl -I` で `405` が返るのは失敗ではない。

理由:

- この API は `HEAD` を受けない
- `curl -I` は `HEAD` で確認する
- そのため `404` ではなく `405` なら、むしろ Cloud Run まで届いている可能性が高い

実際の確認は `POST` で行う:

```bash
curl -X POST https://training-accountability-app.web.app/api/pt-case-draft \
  -H "Content-Type: application/json" \
  -d '{
    "feature":"case_draft",
    "profession":"pt",
    "mode":"initial",
    "fields":{
      "diagnosis":"右人工膝関節全置換術後",
      "timing":"術後3週",
      "chiefComplaint":"歩行時痛と階段昇降への不安がある",
      "findings":"膝関節伸展-10度、屈曲95度、右下肢支持性低下、TUG24秒"
    }
  }'
```

## 10. Evidence Review を差し込む使い方

差し込みは「手で貼る」操作ではない。

手順:

1. `Evidence Review` を生成する
2. 出力欄の `症例発表へ差し込む` を押す
3. 左メニューで `PT 初期評価` か `PT 最終評価` に戻る
4. `症例発表を生成` を押す

注意:

- `症例発表へ差し込む` を押しただけでは本文は変わらないことがある
- そのあとで `症例発表を生成` を押してはじめて反映される
- 反映後は、症例発表本文の中に Evidence Review を踏まえた治療方針や考察が入る
