# 03: Dify API連携の実装

## このフェーズでやったこと

Boltから引き継いだチャットUIを、実際にDify APIと通信するように改修した。「ダミー返答」から「本物のAI返答」に切り替えるフェーズ。ここまでの3フェーズの中で、最も実装らしい実装のパート。

## 全体設計

### 直接呼び出し方式を採用
Dify APIの呼び出し方には2つのパターンがある。

- パターン1: フロントエンド(ブラウザ)から直接Dify APIを叩く
- パターン2: 自前のバックエンドサーバー(FastAPI等)を中継してDify APIを叩く

今回はパターン1を選択した。

理由は以下。
- 課題スコープ内で完結する(バックエンド構築が不要)
- 実装がシンプルで、コードの流れが追いやすい
- 将来B2Bで本番運用する時は、パターン2に切り替える設計思想を含めておく

パターン1の欠点は、APIキーがフロントエンドのバンドルに埋め込まれるためユーザーから見える可能性があること。ただし今回は、.env.local に書いたAPIキーをVite経由で埋め込む方式で、GitHubリポジトリには.env.localをコミットしないルールで運用している(.gitignoreの*.localパターンで除外済み)。個人学習・課題用途としては十分。

本番B2B運用時の移行方針としては、以下を想定している。
- 既存のFastAPI中継サーバー(経費ボット用に構築済み)を流用
- フロントエンドは中継サーバーを叩き、中継サーバーがDify APIを叩く
- APIキーはRender等のサーバー側環境変数で管理

## 実装した3つのファイル

### 1. .env.local
環境変数を保存するファイル。GitHubには絶対に上げてはいけない。

内容:
- VITE_DIFY_API_KEY = Difyで発行したAPIキー(app-で始まる文字列)
- VITE_DIFY_API_URL = https://api.dify.ai/v1(Difyクラウド版共通)

VITE_プレフィックスがついているのはViteの仕様で、この接頭辞がついた環境変数だけがフロントエンドから読み込める。逆に言えば、機密情報を絶対に外に出したくないなら VITE_ をつけない方針もある(その場合はバックエンド中継が必要)。

.gitignore に *.local パターンが元々含まれていたので、追加設定は不要だった。

初心者向けメモ: 環境変数とは、コードの外に置く設定値のこと。APIキーや接続先URLのように、環境ごとに変わる情報や、コードに直接書きたくない情報を切り出す仕組み。

### 2. src/lib/difyClient.ts
Dify APIとの通信を担当する関数を切り出した専用ファイル。

関数シグネチャ:
sendMessage(query: string, conversationId: string): Promise<{ answer: string; conversationId: string }>

処理内容:
- POST https://api.dify.ai/v1/chat-messages にfetchでリクエスト
- Authorization ヘッダーに Bearer トークン(APIキー)を付与
- Body: inputs、query、response_mode: "blocking"、conversation_id、user を含む
- レスポンスから answer と conversation_id を取り出して返す
- HTTPエラー時や answer が空の場合は Error を throw

初心者向けメモ: なぜ App.tsx に直接書かず、別ファイルに切り出すのか。理由は「関心の分離」。UI(App.tsx)はUIのことだけを、API通信(difyClient.ts)はAPIのことだけを担当させることで、後で片方を変更しても影響範囲が明確になる。実務でも定石。

### 3. src/App.tsx の改修
既存のダミー返答関数(fetchBotReply)を、difyClient.sendMessage の呼び出しに置き換えた。

主な変更点:
- conversationId を useState で管理(初回は空文字、以降は Dify から返された値を保持)
- 送信時: 楽観的にユーザーメッセージを追加 → API呼び出し → Bot返答を追加
- エラー時: エラー表示エリアにメッセージを出す、conversationId は維持
- localStorage に messages と conversationId を保存(リロード後も継続)

conversation_id の役割について: Dify側で会話を識別するためのID。同じ conversation_id を送り続けることで、Difyが「これは同じ会話の続き」と認識して、前後の文脈を踏まえた返答をしてくれる。空文字を送ると新しい会話が始まる。

localStorage 永続化について: ブラウザをリロードしたり、翌日再訪しても、前回の会話が消えないようにする仕組み。実務でも「セッションを跨いだ体験」の質を上げる基本テクニック。

## セットアップから動作確認までの手順

将来、忘れた頃にこのプロジェクトを再現する自分向けの完全手順。

### 前提
- Node.js がインストール済み
- GitHubアカウント(yurin02)にログイン済み
- Difyアカウント作成済み、APIキー発行済み(Bitwardenに保管)

### 手順
1. git clone でリポジトリを取得
   - コマンド: git clone https://github.com/yurin02/furugi-chatbot.git
2. プロジェクトフォルダに移動
   - コマンド: cd furugi-chatbot
3. 依存パッケージのインストール
   - コマンド: npm install
   - 1〜3分待つ
4. .env.local ファイルを作成
   - プロジェクトルート直下に手動作成
   - 中身の書き方:
     - VITE_DIFY_API_KEY=app-xxxxxxxx(Bitwardenから取得)
     - VITE_DIFY_API_URL=https://api.dify.ai/v1
   - クォート不要、= の前後スペースなし
5. 開発サーバー起動
   - コマンド: npm run dev
   - http://localhost:5173/ が表示される
6. ブラウザでアクセスして動作確認
   - 例: 「白Tシャツに合う古着ボトムスを教えて」と送信
   - 「入力中...」表示 → Difyから実際のAI返答が返る

## 詰まったポイント

### 長文プロンプトのペースト問題(継続)
このドキュメント作成でも、Claude Codeへの長文貼り付けで「Pasted text +N lines」と省略される問題が発生。02のドキュメントで確立した「temp-doc.md 経由でファイル読み込み」方式で対処。

### エクスプローラーが開けない状態
Claude Codeでの実装作業中、別のCursorウィンドウが開いていて、そちらではプロジェクトフォルダを開いていない状態になっていた。エクスプローラーを開いても「フォルダを開いていません」と表示され、.env.local が編集できなかった。

対処法: 「ファイル→フォルダーを開く」でプロジェクトフォルダを再度指定するか、Claude Codeが動いている元のCursorウィンドウに切り替える。

教訓: Cursorは複数ウィンドウを開けるので、作業ウィンドウを見失わないよう注意する。

## このフェーズの成果物

- .env.local: APIキーと接続先URLを設定(GitHubには非公開)
- src/lib/difyClient.ts: Dify API呼び出しの専用モジュール
- src/App.tsx: ダミー返答からDify API呼び出しに改修、localStorage永続化追加
- 実際のAIとの古着コーデ相談が成立する状態を達成

## この学びを B2B事業へどう応用するか

今回学んだ技術は、そのままB2Bのチャットボット事業に転用可能。

- 顧客ごとに Difyアプリを分ける(=それぞれ別のAPIキー)
- フロントエンドは顧客の要件に合わせてカスタマイズ(色、ロゴ、初期メッセージ等)
- 本番では FastAPI中継サーバー方式に切り替え、APIキーをサーバー側で管理
- Render等でホスティングし、顧客のドメインに紐付けて提供

課題の要件は「AIチャットボット機能があるWebアプリを作成」だが、その先の商用化まで見据えた設計思想を持てたのが、このフェーズの大きな収穫。

作成日: 2026-08-04
