# AI PR Description Generator

[![GitHub Super-Linter](https://github.com/actions/ai-pr-description-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/actions/ai-pr-description-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/actions/ai-pr-description-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/actions/ai-pr-description-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/actions/ai-pr-description-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/actions/ai-pr-description-action/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

Automatically generate comprehensive pull request descriptions using Claude AI.
This action analyzes your PR diff and creates detailed, well-structured
descriptions that help reviewers understand changes quickly.

## 🚀 Features

- **Automatic PR Description Generation**: Creates detailed descriptions based
  on diff analysis
- **Claude AI Integration**: Uses Claude 3.5 Sonnet for intelligent analysis
- **Smart Diff Cleaning**: Automatically filters out noise like
  `package-lock.json`
- **Configurable**: Customize behavior via configuration file
- **Label Support**: Skip generation for PRs with `NO-IA-DESCRIPTION` label
- **Emoji Support**: Makes descriptions more readable with relevant emojis

## 📋 Usage

### Basic Setup

```yaml
name: Generate PR Description
on:
  workflow_dispatch:
  pull_request:
    types: [opened, synchronize]

permissions:
  issues: write
  pull-requests: write
  contents: write

jobs:
  generate-description:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Generate PR Description
        uses: carlosvillu/pr-descriptor-ia@v1.0.0
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          claude-api-key: ${{ secrets.CLAUDE_API_KEY }}
```

### Manual Trigger

```yaml
name: Generate PR Description
on:
  workflow_dispatch:

permissions:
  issues: write
  pull-requests: write
  contents: write

jobs:
  generate-description:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Generate PR Description
        uses: carlosvillu/pr-descriptor-ia@v1.0.0
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          claude-api-key: ${{ secrets.CLAUDE_API_KEY }}
```

## ⚙️ Configuration

Create `.github/pr-description.yml` in your repository:

```yaml
# Sections to include in the description
sections:
  - description
  - main_changes
  - modified_files
  - testing
  - compatibility
  - technical_notes
  - next_steps

# Files to exclude from diff analysis
exclude_files:
  - package-lock.json
  - yarn.lock
  - pnpm-lock.yaml

# Custom prompt additions (optional)
custom_prompt: |
  Focus on business value and technical implementation details.
  Highlight any breaking changes prominently.

# Maximum diff size in characters (default: 250000)
max_diff_size: 250000
```

## 🔧 Inputs

| Input            | Description                     | Required | Default                      |
| ---------------- | ------------------------------- | -------- | ---------------------------- |
| `github-token`   | GitHub token for API access     | ✅       | -                            |
| `claude-api-key` | Claude API key                  | ✅       | -                            |
| `config-path`    | Path to configuration file      | ❌       | `.github/pr-description.yml` |
| `claude-model`   | Claude model to use             | ❌       | `claude-3-5-sonnet-20241022` |
| `max-diff-size`  | Maximum diff size in characters | ❌       | `250000`                     |

## 📤 Outputs

| Output        | Description                                       |
| ------------- | ------------------------------------------------- |
| `description` | Generated PR description                          |
| `status`      | Operation status (`success`, `skipped`, `failed`) |

## 🏷️ Skipping Generation

Add the `NO-IA-DESCRIPTION` label to any PR where you want to skip automatic
description generation.

## 📝 Example Generated Description

```markdown
# PR: Implementación de sistema NFT/Blockchain para jugadores

## 📋 Descripción

Esta PR introduce soporte para funcionalidad NFT/blockchain en el sistema de
gestión de jugadores, añadiendo capacidades de hash, contratos y webhooks para
integraciones externas.

## 🚀 Cambios Principales

### 🔗 Sistema de Hash/Blockchain

- **Añadido campo `hashID`** a entidades `Club`, `Team` y `Player`
- **Implementado método `hash()`** en la clase `ID` usando `keccak256` de viem
  ...
```

## 🔐 Security

- Store your Claude API key as a repository secret
- The action only has access to the PR diff, not your entire codebase
- No data is stored; everything is processed in memory

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.
