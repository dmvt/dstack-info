---
title: "Setup Development Environment"
description: "Configure your IDE and development tools for dstack development."
section: "Getting Started"
stepNumber: 3
totalSteps: 5
lastUpdated: 2025-10-31
prerequisites:
  - "Rust toolchain installed"
  - "Text editor or IDE"
tags:
  - "development"
  - "ide"
  - "vscode"
difficulty: "beginner"
estimatedTime: "15 minutes"
---

# Setup Development Environment

With Rust installed, let's configure a productive development environment for building dstack applications.

## Recommended: Visual Studio Code

VS Code offers excellent Rust support. If you don't have it installed:

```bash
# Ubuntu/Debian
sudo snap install --classic code

# macOS
brew install --cask visual-studio-code
```

## Step 1: Install Rust Analyzer

Rust Analyzer provides IDE features like autocomplete, go-to-definition, and inline errors.

**In VS Code:**
1. Open Extensions (Ctrl+Shift+X / Cmd+Shift+X)
2. Search for "rust-analyzer"
3. Click Install

## Step 2: Configure VS Code Settings

Create or update `.vscode/settings.json` in your workspace:

```json
{
  "rust-analyzer.checkOnSave.command": "clippy",
  "editor.formatOnSave": true,
  "[rust]": {
    "editor.defaultFormatter": "rust-lang.rust-analyzer"
  }
}
```

## Step 3: Install Useful Extensions

Additional recommended extensions:

- **Error Lens**: Inline error highlighting
- **Better TOML**: TOML file support for Cargo.toml
- **CodeLLDB**: Debugging support for Rust

## Step 4: Verify Setup

Create a test Rust project:

```bash
cargo new hello-dstack
cd hello-dstack
code .
```

Open `src/main.rs` and verify you see:
- Syntax highlighting
- Inline type hints
- Autocomplete suggestions

## Alternative: Other Editors

### Vim/Neovim

Install CoC or rust.vim:

```vim
Plug 'rust-lang/rust.vim'
Plug 'neoclide/coc.nvim'
```

### IntelliJ IDEA

Install the Rust plugin from JetBrains Marketplace.

## Next Steps

Your development environment is ready! Let's clone the dstack repository and explore the codebase.
