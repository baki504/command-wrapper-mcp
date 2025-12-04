# Command Wrapper MCP

テスト、静的解析、フォーマット、Git操作などのコマンドを実行するためのツールを提供するModel Context Protocol (MCP) サーバーです。

## 機能

- **テスト**: カスタマイズ可能なオプションでJestテストを実行
- **静的解析**: 設定可能なパラメータでESLintを実行
- **コードフォーマット**: 様々なオプションでPrettierフォーマットを実行
- **Git操作**: 安全なGitコマンドの実行（危険なコマンドはブロック）
- **カスタムコマンド**: ディレクトリ操作やNode.jsバージョン確認など

## セットアップ

### 前提条件

- Node.js (v16以上)
- npmまたはyarn
- 利用するプロジェクトのpackage.jsonに以下のscriptsが定義されていること:
  - `npm run test` (テスト実行用)
  - `npm run lint` (リント実行用)
  - `npm run format` (フォーマット実行用)
- コード品質検証ルールを記述したファイルを配置すること（推奨）
  - 例: [quality-verification.md](quality-verification.md)

**package.json設定例:**

```json
{
  "scripts": {
    "test": "jest",
    "lint": "eslint",
    "format": "prettier"
  }
}
```

### インストール

1. リポジトリをクローン:

```bash
git clone https://github.com/baki504/command-wrapper-mcp.git
cd command-wrapper-mcp
```

2. 依存関係をインストール:

```bash
npm install
```

3. プロジェクトをビルド:

```bash
npm run build
```

### 設定

MCPクライアント設定に以下の設定を追加してください:

```json
{
  "mcpServers": {
    "command-wrapper-mcp": {
      "command": "</path/to/node/dir>/bin/node",
      "args": ["<path/to/command-wrapper-mcp>/build/index.js"],
      "timeout": 60000,
      "disabled": false
    }
  }
}
```

`</path/to/node/dir>`と`<path/to/command-wrapper-mcp>`を実際のパスに置き換えてください。

## 利用可能なツール

### `run_test`

Jestオプション付きでnpm run testコマンドを実行します。

**パラメータ:**

- `cwd` (オプション): 作業ディレクトリ
- `jestOptions` (必須): Jestオプション (例: '--watch', '--coverage', '--testPathPattern=string.test.js')

### `run_lint`

ESLintオプション付きでnpm run lintコマンドを実行します。

**パラメータ:**

- `cwd` (オプション): 作業ディレクトリ
- `eslintOptions` (必須): ESLintオプション (例: '--fix', '--quiet', 'src/specific-file.js')

### `run_format`

Prettierオプション付きでnpm run formatコマンドを実行します。

**パラメータ:**

- `cwd` (オプション): 作業ディレクトリ
- `prettierOptions` (必須): Prettierオプション (例: '--check', '--list-different', 'src/specific-file.js')

**注意:** フォーマットしてファイルを保存するため、`--write`オプションが含まれていない場合、自動的に`--write`を追加します。

### `git_command`

安全なGitコマンドを`--no-pager`オプション付きで実行します。

**パラメータ:**

- `cwd` (オプション): 作業ディレクトリ
- `subcommand` (必須): Gitサブコマンド (例: 'diff', 'log', 'status', 'branch')
- `options` (オプション): Gitコマンドオプション (例: 'main', 'HEAD~1', '--cached', '-a')

**ブロックされるコマンド:** merge, push, pull, reset, clean, rebase, commit, cherry-pick, revert, rm, mv, tag, branch -d, branch -D

### カスタムコマンド

以下のカスタムコマンドが利用可能です：

#### `list_directory`

ディレクトリの内容を一覧表示します。

#### `make_directory`

ディレクトリを作成します。

#### `check_node_version`

Node.jsのバージョンを確認します。

**共通パラメータ:**

- `cwd` (オプション): 作業ディレクトリ
- `options` (オプション): コマンドオプション

## ライセンス

MIT License - 詳細は[LICENSE](LICENSE)ファイルを参照してください。
