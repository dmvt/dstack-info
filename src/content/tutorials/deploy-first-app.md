---
title: "Deploy Your First Application"
description: "Learn how to deploy a simple application to dstack using Docker and TEE."
section: "Deployment"
stepNumber: 1
totalSteps: 3
lastUpdated: 2025-10-31
prerequisites:
  - "Completed Getting Started tutorials"
  - "Docker installed"
  - "dstack CLI installed"
tags:
  - "deployment"
  - "docker"
  - "tee"
difficulty: "intermediate"
estimatedTime: "20 minutes"
---

# Deploy Your First Application

Ready to deploy? This tutorial walks you through deploying your first application to a Trusted Execution Environment (TEE).

## Prerequisites Check

Verify you have Docker installed:

```bash
docker --version
```

## Step 1: Create a Sample Application

Create a simple HTTP server:

```rust
// src/main.rs
use std::net::TcpListener;
use std::io::{Read, Write};

fn main() {
    let listener = TcpListener::bind("0.0.0.0:8080").unwrap();
    println!("Server listening on port 8080");

    for stream in listener.incoming() {
        let mut stream = stream.unwrap();
        let mut buffer = [0; 1024];
        stream.read(&mut buffer).unwrap();

        let response = "HTTP/1.1 200 OK\r\n\r\nHello from dstack!";
        stream.write(response.as_bytes()).unwrap();
        stream.flush().unwrap();
    }
}
```

## Step 2: Create Dockerfile

```dockerfile
FROM rust:1.75 as builder
WORKDIR /app
COPY . .
RUN cargo build --release

FROM debian:bookworm-slim
COPY --from=builder /app/target/release/hello-dstack /usr/local/bin/
EXPOSE 8080
CMD ["hello-dstack"]
```

## Step 3: Build Docker Image

```bash
docker build -t hello-dstack:latest .
```

## Step 4: Deploy to dstack

Deploy your application:

```bash
dstack deploy \
  --image hello-dstack:latest \
  --tee intel-tdx \
  --port 8080 \
  --name my-first-app
```

## Step 5: Verify Deployment

Check deployment status:

```bash
dstack status my-first-app
```

Get the deployment URL:

```bash
dstack url my-first-app
```

Visit the URL in your browser - you should see "Hello from dstack!"

## Understanding TEE

Your application is now running in a Trusted Execution Environment:

- **Isolated**: Code runs in encrypted memory
- **Attested**: Cryptographic proof of execution
- **Secure**: Protected from host system access

## Troubleshooting

### Issue: Deployment fails with "TEE not available"

Ensure you're deploying to a TEE-capable node:

```bash
dstack nodes list --tee
```

### Issue: Port already in use

Change the port in your deployment:

```bash
dstack deploy --port 8081 ...
```

## Next Steps

Great work! You've deployed your first TEE application. Next, we'll learn about attestation and verification.
