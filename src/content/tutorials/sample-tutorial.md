---
title: "Sample Tutorial: Getting Started"
description: "Learn the basics of dstack deployment with this introductory tutorial."
section: "Getting Started"
stepNumber: 1
totalSteps: 5
lastUpdated: 2025-10-31
prerequisites:
  - "Ubuntu 22.04 or later"
  - "Root or sudo access"
tags:
  - "basics"
  - "installation"
difficulty: "beginner"
estimatedTime: "15 minutes"
---

# Sample Tutorial: Getting Started

This is a sample tutorial to demonstrate the content collections system.

## Prerequisites

Before you begin, ensure you have:

- Ubuntu 22.04 or later
- Root or sudo access
- Basic command-line knowledge

## Step 1: Verify Your System

First, let's verify your system meets the requirements:

```bash
lsb_release -a
```

You should see output showing Ubuntu 22.04 or later.

## Step 2: Update Your System

Update your package list and upgrade existing packages:

```bash
sudo apt update && sudo apt upgrade -y
```

## Step 3: Install Dependencies

Install the required dependencies:

```bash
sudo apt install -y build-essential curl git
```

## Verification

Verify the installations were successful:

```bash
which gcc
which curl
which git
```

All commands should return paths to the installed binaries.

## Troubleshooting

### Issue: Package not found

If you encounter "package not found" errors, ensure your system is fully updated:

```bash
sudo apt update
sudo apt upgrade -y
```

### Issue: Permission denied

If you see "permission denied" errors, ensure you're using `sudo` for commands that require elevated privileges.

## Next Steps

Congratulations! You've completed the first tutorial. Next, we'll move on to installing Rust.

**Continue to:** [Step 2: Install Rust Toolchain](/tutorial/install-rust)
