---
title: "Install Rust Toolchain"
description: "Set up the Rust programming language and toolchain for dstack development."
section: "Getting Started"
stepNumber: 2
totalSteps: 5
lastUpdated: 2025-10-31
prerequisites:
  - "Completed system setup"
  - "Terminal access"
tags:
  - "rust"
  - "installation"
  - "toolchain"
difficulty: "beginner"
estimatedTime: "10 minutes"
---

# Install Rust Toolchain

Now that your system is ready, let's install Rust - the primary programming language for dstack development.

## Why Rust?

Rust provides:
- Memory safety without garbage collection
- High performance comparable to C/C++
- Great tooling and package management
- Strong type system preventing bugs

## Step 1: Install rustup

Rustup is the official Rust installer and version manager:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

When prompted, choose option 1 (default installation).

## Step 2: Configure Your Shell

Add Rust to your PATH:

```bash
source $HOME/.cargo/env
```

## Step 3: Verify Installation

Check that Rust is installed correctly:

```bash
rustc --version
cargo --version
```

You should see version information for both commands.

## Step 4: Install Additional Components

Install useful Rust components:

```bash
rustup component add rustfmt clippy
```

- `rustfmt`: Code formatter
- `clippy`: Linter for better code

## Troubleshooting

### Issue: Command not found after installation

If `rustc` is not found, ensure your PATH is set correctly:

```bash
echo $PATH | grep cargo
```

If cargo/bin is not in your PATH, add this to your `~/.bashrc` or `~/.zshrc`:

```bash
export PATH="$HOME/.cargo/bin:$PATH"
```

### Issue: Permission errors

If you encounter permission errors, avoid using `sudo` with rustup. Instead, ensure your user owns the `.cargo` directory:

```bash
chown -R $USER:$USER ~/.cargo
```

## Next Steps

Excellent! Rust is now installed. Next, we'll set up your development environment.
