# CLAUDE.md

このリポジトリで作業する際の規約。

## コミットルール

### メッセージ形式: Conventional Commits

```
<type>: <subject（命令形・現在形）>

<body: 箇条書きで「何を・なぜ」>
```

- 件名（subject）は簡潔に。末尾にピリオドを付けない。
- 本文（body）は変更点を箇条書きで列挙する（任意だが推奨）。
- **`Co-Authored-By` などの共同作成者トレーラは付けない。**

### type 一覧

| type | 用途 |
| --- | --- |
| `feat` | 新機能 |
| `fix` | バグ修正 |
| `docs` | ドキュメントのみの変更（README など） |
| `chore` | ビルド・ツール・設定（依存更新、mise/turbo 設定など） |
| `refactor` | 挙動を変えないコード整理 |
| `test` | テストの追加・修正 |
| `style` | フォーマットのみ（ロジック変更なし） |
| `perf` | パフォーマンス改善 |
| `build` | ビルドシステム・外部依存の変更 |
| `ci` | CI 設定の変更 |

### 運用ルール

- **コミット・プッシュはユーザーから依頼があったときのみ行う**（勝手にコミットしない）。
- 1 コミット 1 関心事。ステージごとの区切りでコミットする。
- 作業は段階的に進める（ステージ単位で「実装 → 検証 → コミット」）。

### 例

```
chore: scaffold monorepo root with mise and pnpm

- pin node 24.16.0 (LTS) and pnpm 11.6.0 via mise.toml
- add root package.json as private workspace parent
```

## 実装方針

- **実装 → interface 抽出**の順序で進める。先にポート（interface）を定義するのではなく、
  まず動く具体実装を書き、動く形を見てから interface を抽出する。投機的な抽象化を避ける。
  - 要件が明確な抽象（例: LLM 差し替え）は最終的にポート化するが、到達経路は implement-first。
- **クリーンアーキテクチャ**: 依存方向は常に「外 → 内」（infrastructure / interfaces → application → domain）。
  内側（domain）は外側を知らない。LLM・ベクトルストアなどの外部依存はポートとして抽象化し差し替え可能にする。
- **段階的構築**: ステージ単位で「実装 → 検証 → コミット」を1区切りにする。

## コミュニケーション

- ユーザーとのやり取りは日本語で行う。
