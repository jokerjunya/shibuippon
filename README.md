# ユーモアテストアプリ 😄

大喜利の過去問題を選択式で解答し、可変得点制で「笑の偏差値」を競うWebアプリケーションです。

## 🎯 プロジェクト概要

- **デイリーチャレンジ**: 毎日5問の大喜利問題にチャレンジ
- **即時フィードバック**: 回答ごとに獲得ポイントを表示
- **偏差値算出**: セッション終了後に「笑の偏差値」を算出・表示
- **レスポンシブデザイン**: スマートフォンからデスクトップまで対応

## 🛠 技術スタック

### バックエンド
- **Node.js** (v18.16.0) + **TypeScript**
- **Fastify** - 高速なWebフレームワーク
- **Prisma** - ORMとデータベース管理
- **SQLite** - MVP用軽量データベース
- **Zod** - スキーマバリデーション

### フロントエンド
- **Next.js 14** (App Router) + **React 18**
- **TypeScript** - 型安全な開発
- **Tailwind CSS** - ユーティリティファーストCSS
- **SWR** - データフェッチとキャッシュ

## 🚀 セットアップ手順

### 1. プロジェクトのクローン
```bash
git clone <repository-url>
cd humor-challenge
```

### 2. 依存関係のインストール
```bash
# ルート、バックエンド、フロントエンドの依存関係をすべてインストール
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### 3. データベースのセットアップ
```bash
cd backend

# データベースマイグレーション
npx prisma migrate dev --name init

# シードデータの投入
npm run db:seed
```

### 4. アプリケーションの起動
```bash
# プロジェクトルートで実行（バックエンドとフロントエンドを同時起動）
npm run dev
```

## 📱 アクセス方法

- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:3001
- **API仕様書**: http://localhost:3001/docs

## 🎮 使用方法

1. ブラウザで http://localhost:3000 にアクセス
2. 今日のデイリーチャレンジ（5問）に挑戦
3. 各問題で最も面白い選択肢をクリック
4. 回答後に獲得ポイントが表示される
5. 全問題完了後に「笑の偏差値」が算出される
6. 結果をシェアして友達と比較！

## 📊 API エンドポイント

### 問題取得
```bash
GET /api/daily-challenge
# 今日のデイリーチャレンジ問題（5問）を取得
```

### セッション管理
```bash
POST /api/sessions
# 新しいゲームセッションを作成

POST /api/sessions/{id}/answers
# 回答を送信

GET /api/sessions/{id}/result
# セッション結果と偏差値を取得
```

## 🔧 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# バックエンドのみ起動
npm run dev:backend

# フロントエンドのみ起動
npm run dev:frontend

# ビルド
npm run build

# テスト実行
npm run test

# リンター実行
npm run lint

# データベース管理
cd backend
npx prisma studio         # データベース管理画面
npm run db:seed           # オリジナルシードデータ投入
npm run db:seed-ippon     # IPPONグランプリ実データ投入
```

## 🎨 主な機能

### ゲーム機能
- ✅ デイリーチャレンジ（5問/日）
- ✅ 選択式回答システム
- ✅ リアルタイムスコア表示
- ✅ プログレスバー
- ✅ 偏差値算出システム
- ✅ **IPPONアニメーション演出**（10点獲得時）

### UI/UX
- ✅ レスポンシブデザイン
- ✅ アニメーション効果
- ✅ ローディング状態
- ✅ エラーハンドリング
- ✅ 直感的な操作性
- ✅ **IPPONグランプリ風演出**（フレーム・エフェクト・効果音）

### 技術的特徴
- ✅ 型安全なAPI通信
- ✅ 決定論的ランダム問題選択
- ✅ 統計的偏差値計算
- ✅ スキーマ駆動開発
- ✅ モダンなReact patterns

## 📂 プロジェクト構造

```
humor-challenge/
├── backend/                 # バックエンドAPI
│   ├── src/
│   │   ├── app.ts          # Fastifyアプリケーション
│   │   ├── routes/         # APIルート
│   │   └── prisma/         # データベース関連
│   ├── prisma/
│   │   └── schema.prisma   # データベーススキーマ
│   └── package.json
├── frontend/               # フロントエンドアプリ
│   ├── src/
│   │   ├── app/           # Next.js App Router
│   │   ├── components/    # Reactコンポーネント
│   │   ├── lib/          # ユーティリティ
│   │   └── types/        # TypeScript型定義
│   └── package.json
├── package.json           # ルートpackage.json
└── README.md
```

## 🎭 IPPONグランプリ実データ対応

実際のIPPONグランプリの過去問題とプロ芸人の回答を収録：

### 収録データ
- **2017年〜2024年**の放送データ
- バカリズム、博多大吉、設楽統など**人気芸人の実際の回答**
- **IPPON（10点）**から**3点**まで段階的な得点システム
- 「大不幸中の小幸い」「水戸黄門が〜」など**名作お題**を収録

### 使用方法
```bash
# IPPONグランプリ実データを使用する場合
cd backend && npm run db:seed-ippon
```

### データセット詳細
- **8つのお題**（各5選択肢）
- **40個の回答選択肢**（プロ芸人の実際の回答含む）
- **IPPON（10点）**: 7個の最高得点回答
- **高得点（8-9点）**: 8個の上級回答
- **中得点（5-7点）**: 23個の標準回答
- **低得点（3-4点）**: 2個のチャレンジ回答

## 🎆 IPPON演出システム

### 演出トリガー
- **10点（IPPON級）**の回答を選択した時に自動発動
- 既存の「+10点獲得！」バウンス完了から200ms後に開始

### 演出シーケンス
1. **フレーム演出**（400ms）
   - 上→下→左→右の順で赤いバーが50ms遅延で内側にせり出し
   - イージング: `ease-out`
   
2. **IPPONテキスト**（600ms）
   - フレーム開始200ms後に中央に巨大な「IPPON!」を表示
   - スケールアニメーション: `0.5 → 1.2 → 1.0`
   - 白抜き文字 + 赤グロー + 金色装飾

3. **エフェクト**
   - **コンフェッティ**: 金色系80粒を3段階で発射
   - **効果音**: Web Audio API生成の「パーン！」音
   - **光フラッシュ**: 0.15秒間の白フラッシュ

4. **自動遷移**
   - 演出完了1.2秒後に次の問題または結果画面へ自動遷移

### 技術実装
- **Framer Motion**: アニメーション制御
- **canvas-confetti**: 紙吹雪エフェクト
- **Web Audio API**: リアルタイム効果音生成
- **CSS Grid + Fixed Position**: フルスクリーンオーバーレイ

## 🌟 今後の拡張予定

- [ ] ユーザー認証システム
- [ ] リーダーボード機能
- [ ] 問題投稿システム
- [ ] ソーシャルシェア機能
- [ ] PostgreSQL移行
- [ ] デプロイ設定（Vercel + Heroku）

## 🐛 トラブルシューティング

### よくある問題

1. **ポートが使用中**
   ```bash
   # ポート3000, 3001が使用されていないか確認
   lsof -ti:3000 -ti:3001
   ```

2. **データベースエラー**
   ```bash
   cd backend
   rm prisma/dev.db
   npx prisma migrate dev --name init
   npm run db:seed
   ```

3. **依存関係エラー**
   ```bash
   rm -rf node_modules backend/node_modules frontend/node_modules
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

## 📄 ライセンス

MIT License

## 👥 開発チーム

Humor Challenge Team

---

**毎日新しい問題で「笑の偏差値」をチェック！** 🎉 