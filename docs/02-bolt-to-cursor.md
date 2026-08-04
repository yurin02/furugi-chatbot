# 02: GitHub経由でCursorへ移行

## このフェーズでやったこと

Boltで完成したチャットUIプロジェクトを、GitHubリポジトリを介してCursorのローカル環境に移行し、開発を継続できる状態にした。API連携作業の直前段階。

## 移行方法の検討

BoltからCursorへコードを持っていく方法として、以下の3つを検討した。

### 選択肢A: ZIPダウンロード
Boltから直接ZIPで落として解凍する方法。無料プランではZIPダウンロード機能が見当たらず、断念。

### 選択肢B: GitHub経由(採用)
BoltからGitHubリポジトリに直接pushし、Cursorでgit cloneして取得する方法。実務に近い流れで、後の変更管理もスムーズ。

### 選択肢C: 手動コピペ
各ファイルの中身を1つずつコピーしてローカルで再現する方法。ファイル数が10以上あり、ミス混入リスクが高いため却下。

選択肢Bを採用した理由は以下。

- 実務でよく使われるフローに近い(Git操作の練習になる)
- Boltが全ファイルを正確にpushしてくれるので、手動コピペより確実
- yurin02のGitHubに成果物が集約され、ポートフォリオとして見せやすい

## 移行手順

### 1. BoltからGitHubへpush
BoltにGitHubアカウント(yurin02)で認証し、リポジトリ名を「furugi-chatbot」として新規作成。Privateリポジトリを選択(将来APIキーを扱うため)。

Boltが自動で全ファイルをpush。22ファイル、41.64 KiBがGitHubに送信された。

### 2. GitHubで内容確認
push直後はBoltの画面表示が変わらず失敗したように見えたが、GitHub側で直接リポジトリを確認したところ、正常にpushされていた。

確認できたファイル構成:
- .bolt/(Bolt設定)
- src/(ソースコード)
- .gitignore
- README.md
- eslint.config.js
- index.html
- package.json, package-lock.json
- postcss.config.js
- tailwind.config.js
- tsconfig.json, tsconfig.app.json, tsconfig.node.json
- vite.config.ts

Viteプロジェクトの標準構成が全部揃っている状態。

### 3. Cursorでgit clone
Cursorのターミナル(PowerShell)から以下のコマンドを順に実行。

cd C:\Users\bM316\Desktop\エンジニア
git clone https://github.com/yurin02/furugi-chatbot.git
cd furugi-chatbot

git cloneは数秒で完了し、ローカルにプロジェクトフォルダが作成された。

### 4. 依存パッケージのインストール
npm install を実行。288パッケージが33秒でインストール完了。

「18 vulnerabilities」の警告が出たが、これは開発ツールの依存関係で検出される警告で、実際のWebアプリの動作には影響しない。個人の学習用途では触らない方が安全と判断してスキップ。

### 5. ローカル動作確認
npm run dev で開発サーバーを起動。http://localhost:5173/ にアクセスし、Boltで作ったのと同じチャットUI(「古着コーデ相談」ヘッダー、初期メッセージ、入力欄)が表示されることを確認。

Ctrl + C でサーバー停止し、次フェーズ(API連携)の準備完了。

## Cursor操作とClaude Code操作の使い分け

このフェーズでの学びとして、Cursor(コードエディタ)自体の操作と、Claude Code(ターミナルで claude コマンドで起動する対話モード)の使い分けの判断基準が明確になった。

### 直接ターミナルで打つべきコマンド
- git clone、git status、git push などの決まった1コマンド
- cd でフォルダ移動
- npm install、npm run dev などの定型コマンド
- claude(Claude Code起動そのもの)

### Claude Codeに任せるべき作業
- ファイルの中身を書く/編集する
- 複数ファイルにまたがる変更
- エラーの原因調査と修正
- 判断を伴う実装

判断基準を一言でまとめると「単一の決まったコマンド」なら直接ターミナル、それ以外はClaude Code。

## 詰まったポイント

### PhotoMirageのポップアップ
Claude Code起動と全く無関係な写真編集ソフトのライセンス確認ダイアログが唐突に表示された。以前試用したソフトがバックグラウンドから浮上したもの。作業とは無関係なので×で閉じて対応。

### Cursor内Claudeとclaude.aiの役割分担
作業中に「Cursor内Claudeが今までの経緯を知らないのでは?」という懸念が浮上した。整理した結論は以下。

- claude.ai(私が使っている外部相談相手) → 全体戦略、方針判断、比較検討、詰まった時の切り分け
- Cursor内Claude Code → 実装作業、コード編集、コマンド実行、プロジェクト内情報の活用

この分担は「PM + エンジニア」の関係に近く、それぞれの得意分野を活かした構造になっている。

情報の断絶を防ぐため、フェーズごとに docs/ ディレクトリにドキュメントを残す運用を採用した。このドキュメントもその一環。

### 長文プロンプトのペースト問題
Claude Codeに長文Markdownをそのまま貼ろうとしたところ、「Pasted text #1 +24 lines」と省略されて中身が渡らないケースが発生した。

対処法として、Markdown内容を temp-doc.md というローカルファイルに一度保存し、Claude Codeには「temp-doc.md を読み取って docs/xx.md にコピーして」という短い指示を渡す方式に変更。この方式は今後の全ドキュメント作成で採用している。

## このフェーズの成果物

- ローカル環境: C:\Users\bM316\Desktop\エンジニア\furugi-chatbot に完全なプロジェクト
- GitHub: yurin02/furugi-chatbot リポジトリに全ファイル同期済み
- 動作確認済み: npm run dev で Boltと同じUIが動作
- 次フェーズ準備完了: Claude Codeを起動して Dify API連携に進める状態

