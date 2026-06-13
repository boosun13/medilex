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

## コミュニケーション

- ユーザーとのやり取りは日本語で行う。
