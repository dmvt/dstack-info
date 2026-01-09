---
title: "Docker Setup"
description: "Install Docker Engine for dstack services"
section: "Prerequisites"
stepNumber: 4
totalSteps: 6
lastUpdated: 2026-01-09
prerequisites:
  - pccs-configuration
tags:
  - docker
  - containers
  - prerequisites
difficulty: beginner
estimatedTime: "10 minutes"
---

# Docker Setup

This tutorial guides you through installing Docker Engine on your TDX server. Docker is required for the Gramine Key Provider and Local Docker Registry.

## What You'll Install

| Component | Purpose |
|-----------|---------|
| **docker-ce** | Docker Engine (Community Edition) |
| **docker-ce-cli** | Docker command-line interface |
| **containerd.io** | Container runtime |
| **docker-buildx-plugin** | Extended build capabilities |
| **docker-compose-plugin** | Multi-container orchestration |

## Prerequisites

Before starting, ensure you have:

- Completed [PCCS Configuration](/tutorial/pccs-configuration)
- SSH access to your TDX server
- sudo privileges

## Quick Start: Install with Ansible

```bash
ansible-playbook -i inventory/hosts.yml playbooks/setup-docker.yml
```

---

## Manual Installation

### Step 1: Check if Docker is Already Installed

```bash
docker --version
```

If Docker is already installed, you can skip to [Verification](#verification).

### Step 2: Install Prerequisites

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg
```

### Step 3: Add Docker GPG Key

```bash
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo tee /etc/apt/keyrings/docker.asc > /dev/null
sudo chmod a+r /etc/apt/keyrings/docker.asc
```

### Step 4: Add Docker Repository

```bash
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

### Step 5: Install Docker Packages

```bash
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### Step 6: Start Docker Service

```bash
sudo systemctl start docker
sudo systemctl enable docker
```

### Step 7: Add User to Docker Group

This allows running Docker commands without sudo:

```bash
sudo usermod -aG docker $USER
```

**Important:** Log out and back in for the group membership to take effect, or run:

```bash
newgrp docker
```

---

## Verification

### Check Docker is Running

```bash
docker info
```

You should see detailed information about the Docker installation.

### Check Docker Version

```bash
docker --version
```

Expected output:
```
Docker version 27.x.x, build xxxxxxx
```

### Test Docker

```bash
docker run hello-world
```

This downloads and runs a test image. You should see:
```
Hello from Docker!
This message shows that your installation appears to be working correctly.
```

---

## Troubleshooting

### Permission Denied

**Symptom:** `Got permission denied while trying to connect to the Docker daemon socket`

**Solution:**
1. Ensure user is in docker group: `groups`
2. If not listed, add user: `sudo usermod -aG docker $USER`
3. Log out and back in, or run: `newgrp docker`

### Docker Service Not Starting

**Symptom:** `systemctl status docker` shows failed

**Solution:**
```bash
# Check logs
sudo journalctl -u docker -n 50

# Common fix: restart containerd first
sudo systemctl restart containerd
sudo systemctl restart docker
```

### Repository Not Found

**Symptom:** `apt update` fails with Docker repository error

**Solution:**
```bash
# Verify the repository file
cat /etc/apt/sources.list.d/docker.list

# Should contain a valid URL for your Ubuntu version
# If incorrect, recreate with Step 4 above
```

---

## Next Steps

With Docker installed, proceed to:

- [Gramine Key Provider](/tutorial/gramine-key-provider) - Deploy SGX-based key provider

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Engine Installation](https://docs.docker.com/engine/install/ubuntu/)
