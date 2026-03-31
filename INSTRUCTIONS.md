# Copycat Editor — プロトタイプ実装指示書

## これは何

ローカルのClaude Codeに渡す実装指示書。README.mdの仕様に基づいてプロトタイプを実装する。

## ゴール

README.mdの「プロトタイプの最小スコープ」を動くものとして実装する：
1. コード貼り付け → AI解析 → ステップ分解（解説文付き）
2. 左右分割画面（CodeMirror × 2）
3. ステップ送り（前へ/次へ）、差分ハイライト
4. p5.jsのプレビュー実行

## 技術スタック

- **Vanilla JS + Vite**（React不要。シンプルに保つ）
- **CodeMirror 6** — 左右ペインのコードエディタ
- **Claude API**（Anthropic SDK） — コード解析。BYOKey方式（ユーザーがAPIキーを入力、localStorageに保存）
- **p5.js** — プレビュー実行（iframe内）

## ディレクトリ構成

```
projects/copycat-editor/
├── README.md          # 仕様書（これを読んで全体を理解すること）
├── INSTRUCTIONS.md    # この指示書
├── src/
│   ├── index.html
│   ├── main.js        # エントリポイント
│   ├── editor.js      # CodeMirrorのセットアップ（左右ペイン）
│   ├── analyzer.js    # AI解析ロジック（Claude API呼び出し）
│   ├── steps.js       # ステップ管理・差分ハイライト
│   ├── preview.js     # p5.jsプレビュー実行（iframe）
│   ├── settings.js    # APIキー管理（localStorage）
│   └── style.css
├── package.json
└── vite.config.js
```

## 実装手順

### 1. プロジェクト初期化
```bash
cd projects/copycat-editor
npm init -y
npm install vite codemirror @codemirror/lang-javascript @codemirror/view @codemirror/state @codemirror/commands @anthropic-ai/sdk
```

### 2. UI構成（index.html + style.css）
- 左右2カラム分割
- 左ペイン：元コード表示（読み取り専用CodeMirror）+ 解説文エリア + ステップナビゲーション
- 右ペイン：写経用CodeMirror（編集可能）
- 上部：「コード入力」モードと「写経」モードの切り替え
- Settings：APIキー入力フォーム（モーダル or ドロワー）

### 3. コード入力フロー（main.js）
- 初期状態：左ペインにテキストエリア「ここにコードをペースト」
- 「開始」ボタン押下 → analyzer.js呼び出し
- 解析完了 → 写経モードに切り替え

### 4. AI解析（analyzer.js）
- Claude APIをブラウザから直接呼ぶ（BYOKey。CORSの制約があるため、必要ならプロキシを検討するが、まずは直接呼び出しを試す）
- **重要：CORSの問題が出る場合は、Viteのプロキシ設定で回避する**
- プロンプト設計：

```
あなたはコード教育の専門家です。以下のコードを、初学者が段階的に写経できるようにステップに分解してください。

ルール：
- 基盤から積み上げる方式。最小限の動くコードをStep 1とし、徐々に機能を追加する
- 各ステップは前のステップのコードを含む（差分が明確になるように）
- 各ステップに短い解説文をつける：「このステップでは...を追加します。これは...という役割です。」
- 可読性の低い変数名にはコメントで意味を付記する（例: t = 0.1 // t = time）
- p5.jsのコードの場合、各ステップが単体で実行可能であること

以下のJSON形式で返答してください：
{
  "steps": [
    {
      "code": "// ステップ1のコード全体",
      "explanation": "解説文"
    },
    ...
  ]
}
```

- レスポンスをパースしてsteps.jsに渡す

### 5. ステップ管理（steps.js）
- ステップ配列を保持
- 現在のステップインデックスを管理
- 「前へ」「次へ」ボタンでステップ切り替え
- **差分ハイライト**：前ステップとのdiffを取り、追加行を緑背景でハイライト
  - シンプルな行単位のdiffで十分（ライブラリ不要、自前実装でOK）

### 6. プレビュー実行（preview.js）
- 「実行」ボタン押下 → iframe内でp5.jsスケッチを実行
- iframeのsrcdocにp5.jsのCDN + ユーザーコードを埋め込む
- 左右それぞれに実行ボタン（元コード / 写経コード）
- フルスクリーンオーバーレイで表示、クリックで閉じる

### 7. Settings（settings.js）
- APIキーをlocalStorageに保存/読み出し
- 未設定時は「Settings」ボタンを目立たせる

## 後回し（実装しない）
- ステップ粒度の動的調整（「もっと細かく」「まとめて」ボタン）
- エラーアシスト
- lil-gui的パラメータUI
- WebGL対応（p5.jsのみ）
- 変数リネーム（コメント付記はAI解析のプロンプトで対応）

## 完了条件
- `npm run dev` でローカルサーバーが起動する
- p5.jsのコードを貼り付けて「開始」を押すと、ステップに分解される
- ステップを前後に送れて、差分がハイライトされる
- 「実行」ボタンでp5.jsスケッチがプレビューできる
