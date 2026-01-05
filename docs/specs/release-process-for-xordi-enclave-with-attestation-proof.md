# Release Process for Xordi Enclave with Attestation Proof

**Status:** REVIEW
**Author:** LSDan (with context from Andrew Miller, Node Father, h4x3rotab)
**Created:** 2025-12-21
**Last Updated:** 2026-01-05

## Overview

Xordi is a TEE-based API service for TikTok data collection (watch history, authentication) deployed on Phala Cloud's dstack infrastructure. This specification defines the release process for Xordi enclave deployments, including attestation proof generation and verification.

### Primary Goal (from Andrew, Dec 19)

> "I want to point in tweets to the tokscope enclave repo, I guess it's just I want to be able to provide a clear explanation of how we give evidence we aren't misusing the user data"

> "we want to prove we're not misusing the session to get anything more than watch history... DMs etc are totally safe"

This is **external signaling** for user trust - cryptographic proof that the running enclave only accesses watch history, not DMs or other sensitive data.

### Direct Request (from Andrew, Jan 5, 2026)

> "@LSDan_DeFi since we didn't have a release process we didn't follow one, and as a result we can't actually show any evidence about what code we are running"
>
> "This is what the trust center shows, could you critique it? https://trust.phala.com/app/8b7f9f28fde9764b483ac987c68f3321cb7276b0/..."
>
> "My ask for you is to make a release process we can follow for xordi and how could we provide some report or something, maybe in github or a post"

This spec directly addresses Andrew's request.

### Secondary Goal

Internal documentation so deployments can happen when Node Father is unavailable.

## Context from LSDan-Andrew Sync (Dec 30)

Key insights from a call between LSDan and Andrew Miller on December 30, 2025:

### The Core Problem

**Andrew Miller**:
> "my fear has happened, which is that, because we didn't have a release process prescriptively, Ian just never released it in a way where we're generating evidence"

> "It is about making a transparency log, which we're just not making right now"

> "I suspect that the only thing that needs to change is just choosing to release it on base"

### Availability vs Integrity Tension

**Andrew Miller**:
> "Ian's priority, and he does a natural job at this is to keep availability up. That's at odds with producing evidence of non custodial access"

> "in terms of the safety terms, or security property terms, it's just like availability versus integrity"

This organizational dynamic explains why transparency logging hasn't been implemented despite the technical capability being available. Node Father (Ian) optimizes for uptime; a prescriptive release process would have forced transparency log generation as a deployment prerequisite.

### Three Infrastructure Problems Identified

1. **No transparency log generation** - Deployments happen on Pha KMS which doesn't publish events publicly. Switching to Base on-chain KMS would automatically create a transparency log.

2. **No dev/staging instance** - No stress testing capability. Concurrency issues at ~100 users caused queue failures that could have been caught with proper staging environment.

3. **Archive ownership** - Shin wants someone to take over Archive (the wrapper around Xordi), but no capacity to transfer ownership.

### Path Forward

The path is now clear: adopt the GitHub Actions pattern James demonstrated, deploy using Base on-chain KMS instead of Pha KMS, and transparency logging happens automatically with every update.

---

## Context from Telegram

### The Release Process Discussion (Dec 19)

**Andrew Miller**:
> "@LSDan_DeFi how is openmetal going, I am eager to go over infra for documentation and release process, 22nd is the next timely date for this, for links to notes repo dropped via tweet"

**LSDan**:
> "With the Phala deploy, what are we trying to signal and to whom with the release process. If we're just documenting what our release process is, then we should hop on a call with @TheNodeFather next deploy and have him narrate everything he's doing."
> "Basically, is this internal, so you can release when @TheNodeFather isn't around, or external to signal virtue"

**Andrew Miller** (clarifying the goal):
> "Well I want to point in tweets to the tokscope enclave repo, I guess it's just I want to be able to provide a clear explanation of how we give evidence we aren't misusing the user data"

### Previous Sync Decisions

From **11/11/25 Dstack Sync**:
- Add **user-verifiable attestation** proving login and sensitive operations run in a Phala TEE
- Ephemeral browser in TEE captures TikTok cookies
- Secrets in-TEE; controller/DB outside

From **10/28/25 Dstack Sync**:
- Refactor `app_compose.json` so **RTMR3 compose hash stops churning** across deployments
- Adopt **three-tier proof-of-cloud**: ceremony, DCAP/TPM, and RFID/camera tamper evidence
- Show attestation-warning when unverifiable

## Requirements

### Must Have

- [ ] Document the current Phala Cloud deployment process (narrated by Node Father)
- [ ] Capture the `phala deploy` command and all parameters used
- [ ] Record the custom-app-id used for Xordi upgrades
- [ ] Provide public link to source repo in tweets/announcements
- [ ] Generate attestation proof (TDQuote) after each deployment
- [ ] Publish attestation proof to a verifiable location
- [ ] Enable users to verify the enclave only accesses watch history

### Should Have

- [ ] On-chain KMS signature verification (per Chuqiao's implementation)
- [ ] Automated attestation proof generation in CI/CD
- [ ] Verification script that third parties can run
- [ ] Integration with dstack-kms for key management attestation

### Must NOT Have

- No manual steps that bypass attestation
- No deployments without corresponding source code commits
- No secret environment variables baked into images (use KMS)

## Non-Requirements

- This spec does NOT cover the Archive layer (separate service outside TEE)
- This spec does NOT cover the Feedling frontend
- This spec does NOT address TikTok API rate limiting or proxy infrastructure

## Design

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Phala Cloud                               │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                      dstack CVM                              │ │
│  │  ┌─────────────────────────────────────────────────────┐    │ │
│  │  │              Xordi Enclave                           │    │ │
│  │  │  ┌─────────┐  ┌─────────┐  ┌─────────────────┐      │    │ │
│  │  │  │  Neko   │  │  API    │  │  TikTok Client  │      │    │ │
│  │  │  │ Browser │  │ Server  │  │  (Playwright)   │      │    │ │
│  │  │  └─────────┘  └─────────┘  └─────────────────┘      │    │ │
│  │  └─────────────────────────────────────────────────────┘    │ │
│  │                         │                                    │ │
│  │              ┌──────────┴──────────┐                        │ │
│  │              │   dstack SDK        │                        │ │
│  │              │   get_key()         │                        │ │
│  │              │   TDQuote           │                        │ │
│  │              └─────────────────────┘                        │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                    │
│                    ┌─────────┴─────────┐                         │
│                    │    dstack-kms     │                         │
│                    │  (phala-prod7)    │                         │
│                    └───────────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
     ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
     │   GitHub    │  │  On-Chain   │  │ /.well-known│
     │   Release   │  │ Verification│  │ /attestation│
     └─────────────┘  └─────────────┘  └─────────────┘
```

### Components

1. **Source Repository**: `Account-Link/teleport-tokscope` (branch: `tokscope-xordi-perf`)
2. **Docker Compose**: `docker-compose-audit.yml` for TEE deployment
3. **Phala Cloud CLI**: `phala deploy` command with `--custom-app-id`
4. **dstack SDK**: Python SDK for `get_key()` deterministic key derivation
5. **KMS Contract**: On-chain verification at `0x2f83172A49584C017F2B256F0FB2Dca14126Ba9C`
6. **Verification Contract**: SimpleDstackVerifier for signature chain verification

### Deployment Process

Based on Telegram context, the current process involves:

```bash
# Example from Andrew's message (Aug 25):
phala deploy --node-id 12 --kms-id phala-prod7 docker-compose.yml \
  --name cvm1 --custom-app-id 0386b0c68bee1fb9846ccba03098f7c2717e5d71

# When providing the app id if it exists already it just "upgrades"
# rather than making a second cvm with matching app id
```

**KMS Bootstrap Process** (from h4x3rotab, Dec 5):
1. Run a SGX key provider
2. Bootstrap a KMS using the SGX local key provider
3. Bootstrap the gateway using the KMS

**Action Required**: Schedule call with Node Father to narrate full deployment process.

### CI/CD Pattern (Hermes Template)

The [Hermes project](https://github.com/amiller/hermes) provides a working CI/CD pattern for Phala Cloud deployments that Xordi should adopt. This pattern was identified by Andrew on Dec 22, 2025.

#### GitHub Actions Workflow Structure

```yaml
# .github/workflows/build.yml
name: Build and Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      deploy:
        description: 'Deploy to Phala Cloud after build'
        required: false
        default: 'false'
        type: boolean

jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      sha_short: ${{ steps.vars.outputs.sha_short }}
    steps:
      - uses: actions/checkout@v4

      - name: Set outputs
        id: vars
        run: echo "sha_short=$(git rev-parse --short HEAD)" >> $GITHUB_OUTPUT

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to DockerHub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            yourorg/xordi:latest
            yourorg/xordi:${{ steps.vars.outputs.sha_short }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build
    if: github.event.inputs.deploy == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Phala CLI
        run: npm install -g @anthropic/phala-cli

      - name: Deploy to Phala Cloud
        env:
          PHALA_CLOUD_API_KEY: ${{ secrets.PHALA_CLOUD_API_KEY }}
        run: |
          phala cvms upgrade \
            --app-id 8b7f9f28fde9764b483ac987c68f3321cb7276b0 \
            --compose docker-compose.yml

      # Security: Clear secrets from environment
      - name: Cleanup
        if: always()
        run: |
          unset PHALA_CLOUD_API_KEY
          unset DOCKERHUB_TOKEN
```

#### Key Pattern Elements

1. **SHA-tagged images**: Every build tagged with git commit SHA for traceability
2. **Manual deployment trigger**: `workflow_dispatch` with deploy flag (not auto-deploy on push)
3. **`phala cvms upgrade`**: Uses upgrade command with existing app-id to update running CVM
4. **Secrets cleanup**: Environment cleared after deploy to prevent leakage

#### Chain-of-Trust Documentation (from Hermes)

The [Hermes VERIFICATION-REPORT](https://github.com/amiller/hermes/blob/auditing/VERIFICATION-REPORT-2025-12-21.md) provides a template for documenting the verification chain:

| Claim | Verification Level | Evidence |
|-------|-------------------|----------|
| GitHub → DockerHub | Cryptographically verified | Commit SHA matches image tag |
| DockerHub → TEE | Cryptographically verified | Image digest in attestation |
| Code behavior claims | Trusted party (code audit) | Source code review |

**Important distinction**: The cryptographic chain proves *which code is running*, but claims about *what that code does* (e.g., "only accesses watch history") require source code audit.

### On-Chain Verification (from Chuqiao's work)

The KMS signature can be verified on-chain:

```solidity
// From SimpleDstackVerifier.sol
bytes20 appIdBytes20 = bytes20(appId);  // Use only first 20 bytes
bytes32 kmsMessage = keccak256(abi.encodePacked(
    "dstack-kms-issued:",
    appIdBytes20,
    appPublicKey
));
address recoveredKMS = _recoverAddress(kmsMessage, kmsSignature);
require(recoveredKMS == kmsRootAddress, "Invalid KMS signature");
```

**KMS Root Address**: `0x52d3CF51c8A37A2CCfC79bBb98c7810d7Dd4CE51`
(Derived from k256Pubkey: `0x02a335aea3df11d46ae0a373d3f26fbd1d208572ecc87e630e618dac693b7af721`)

**Important**: Contract address != signing key address. Must derive verification key from `k256Pubkey` parameter.

### Attestation Proof Structure

The attestation proof should include:

```json
{
  "version": "1.0",
  "timestamp": "2025-12-22T00:00:00Z",
  "source": {
    "repository": "Account-Link/teleport-tokscope",
    "branch": "tokscope-xordi-perf",
    "commit": "<git-sha>",
    "docker_compose": "docker-compose-audit.yml"
  },
  "deployment": {
    "phala_node_id": 12,
    "kms_id": "phala-prod7",
    "custom_app_id": "<app-id>",
    "cvm_id": "<cvm-uuid>"
  },
  "attestation": {
    "td_quote": "<base64-encoded-tdquote>",
    "mr_td": "<measurement-register>",
    "mr_config_id": "<config-measurement>",
    "rtmr": ["<rtmr0>", "<rtmr1>", "<rtmr2>", "<rtmr3>"]
  },
  "kms_signature": {
    "app_public_key": "<compressed-pubkey>",
    "kms_signature": "<signature>",
    "kms_root_address": "0x52d3CF51c8A37A2CCfC79bBb98c7810d7Dd4CE51"
  },
  "verification_url": "https://demo.xordi.io/.well-known/attestation"
}
```

### Verification Process

Third parties should be able to:

1. **Fetch attestation proof** from `/.well-known/attestation` endpoint
2. **Verify TDQuote signature** against Intel's attestation service (DCAP)
3. **Verify KMS signature on-chain** using SimpleDstackVerifier
4. **Compare measurements** against reproducible build (when available)
5. **Confirm source commit** matches deployed code

### Phala Verification Infrastructure

Phala provides several verification tools that Xordi should integrate with:

#### 1. Phala Trust Center
- **URL**: https://trust.phala.com/
- **Purpose**: Public verification dashboard showing verified TEE apps
- **Access**: `https://trust.phala.com/app/{app-id}`
- **Status**: ✅ Xordi verified at `8b7f9f28fde9764b483ac987c68f3321cb7276b0`

#### 2. TEE Attestation Explorer
- **URL**: https://proof.t16z.com/
- **Purpose**: Upload and verify attestation quotes (binary or hex)
- **Features**: Shows verification status (green shield = valid), recent attestations

#### 3. Phala Cloud CLI
```bash
# Get attestation for a CVM
phala cvms attestation [app-id]

# Example
phala cvms attestation 0386b0c68bee1fb9846ccba03098f7c2717e5d71
```

#### 4. Phala Cloud API
```bash
# Verify a quote programmatically
POST https://cloud-api.phala.network/api/v1/attestations/verify
Content-Type: application/json
Body: {"hex": "YOUR_QUOTE_HEX"}
```

#### 5. dstack-verifier Library
```typescript
import { VerificationService } from '@phala/dstack-verifier'

const service = new VerificationService()
const result = await service.verify({
  contractAddress: '0x...',
  metadata: {
    osSource: {
      github_repo: 'https://github.com/Account-Link/teleport-tokscope',
      git_commit: '<commit-sha>',
      version: '<version>'
    }
  }
}, {
  hardware: true,
  os: true,
  sourceCode: true,
  teeControlledKey: true
})
```

### Current Xordi Deployment Status

| Component | Status | URL/Details |
|-----------|--------|-------------|
| TEE Deployment | ✅ Live | demo.xordi.io |
| API Endpoint | ✅ Live | api-a (TEE version) |
| **Trust Center listing** | ✅ **Verified** | https://trust.phala.com/app/8b7f9f28fde9764b483ac987c68f3321cb7276b0 |
| App ID | ✅ Active | `8b7f9f28fde9764b483ac987c68f3321cb7276b0` |
| Domain | ✅ Active | dstack-pha-prod9.phala.network |
| dstack Version | ✅ | dstack-0.5.3 |
| Attestation Date | ✅ | December 11, 2025 |
| `/attestation` endpoint | ❌ Not implemented | Needed for programmatic access |
| `/.well-known/attestation` | ❌ Not implemented | Needed for user-facing verification |

**Key Discovery**: Andrew identified the existing Trust Center report on Dec 22, 2025. The verification shows 30 data objects verified across Hardware, OS, App, KMS, and Gateway components.

### Tweet-Ready Artifacts

Andrew's original request: *"I want to point in tweets to the tokscope enclave repo... provide a clear explanation of how we give evidence we aren't misusing the user data"*

#### For Twitter/Social Media

**Short version (280 chars):**
> Xordi runs in a hardware-isolated TEE. Verify yourself: https://trust.phala.com/app/8b7f9f28fde9764b483ac987c68f3321cb7276b0
> Source: https://github.com/Account-Link/teleport-tokscope

**Detailed version:**
> How we prove Xordi isn't misusing your data:
>
> ✅ Runs in Intel TDX hardware enclave (Trusted Execution Environment)
> ✅ Only accesses watch history - DMs are safe
> ✅ Cryptographic attestation proves which code is running
> ✅ Independent verification via Phala Trust Center
>
> 🔍 Verify: https://trust.phala.com/app/8b7f9f28fde9764b483ac987c68f3321cb7276b0
> 📂 Source: https://github.com/Account-Link/teleport-tokscope

#### Verification Links Bundle

| Purpose | URL |
|---------|-----|
| **Trust Center Report** | https://trust.phala.com/app/8b7f9f28fde9764b483ac987c68f3321cb7276b0 |
| **Source Repository** | https://github.com/Account-Link/teleport-tokscope |
| **Live Demo** | https://demo.xordi.io |

#### Simple Explanation for Users

**"How does TEE attestation prove you're not stealing my DMs?"**

1. **Hardware isolation**: The Xordi code runs inside a locked hardware box (Intel TDX). Not even the server operators can see inside.

2. **Cryptographic proof**: When you request verification, the hardware generates a signed statement saying "I am running *this exact code*" - signed by Intel, not us.

3. **Public source code**: The code is open source. Security researchers can audit it to confirm it only requests watch history from TikTok's API.

4. **The chain of trust**:
   - GitHub commit → matches DockerHub image
   - DockerHub image → matches what's running in TEE
   - TEE code → audited to only access watch history

**What this DOES prove**: The exact code running is the published code.
**What this DOES NOT prove**: That the code itself is safe (requires code audit).

### Implementation Checklist (Based on Hermes Pattern)

Following the Hermes project's verified implementation:

#### Phase 1: CI/CD Setup (Pre-requisites)

- [ ] Fork/adapt Hermes GitHub Actions workflow for tokscope repo
- [ ] Configure DockerHub credentials in GitHub secrets
- [ ] Configure Phala Cloud API key in GitHub secrets
- [ ] Update `docker-compose.yml` for Xordi services
- [ ] Test build workflow (without deploy)

#### Phase 2: Verification Documentation

- [ ] Create `VERIFICATION-REPORT.md` in tokscope repo (follow Hermes template)
- [ ] Document current deployment's chain-of-trust:
  - [ ] GitHub commit SHA
  - [ ] DockerHub image digest
  - [ ] TEE attestation link
- [ ] Add link to Trust Center report

#### Phase 3: Attestation Endpoints (Optional Enhancement)

- [ ] Implement `/attestation` API endpoint returning JSON proof
- [ ] Implement `/.well-known/attestation` for user-friendly verification
- [ ] Add attestation status to Xordi health check

#### Phase 4: Release Process Automation

- [ ] Test full CI/CD deploy workflow
- [ ] Document manual override procedures
- [ ] Create release checklist template
- [ ] Train team on deployment process (Node Father knowledge transfer)

## Resolved Questions

### Q1: Internal or External?

**Answer: External signaling for user trust**

From Andrew (Dec 19):
> "I want to be able to provide a clear explanation of how we give evidence we aren't misusing the user data"

The primary purpose is proving to users that:
- The enclave only accesses watch history
- DMs and other sensitive data are NOT accessed
- The running code matches the published source

### Q2: Where to publish attestation proofs?

**Answer: Multiple locations**

1. **GitHub Release** - Attach to each release in tokscope repo
2. **On-chain** - KMS signature verification via SimpleDstackVerifier
3. **Well-known endpoint** - `https://demo.xordi.io/.well-known/attestation`

### Q3: Release cadence?

**Answer: On significant updates + before public announcements**

Attestation proofs should be generated:
- Before any tweet/announcement linking to the repo
- On significant code changes affecting data access
- When KMS or infrastructure changes

### Q4: Reproducible build gap?

**Answer: Proceed with partial attestation, wait for Phala update**

From h4x3rotab (Dec 16):
> "We are cooking something cool. Probably we will have an update before xmas"

**Current approach**:
- Implement KMS signature verification now (fully working)
- Add TDQuote verification now (partial - RTMR3 may churn)
- Wait for Phala's xmas update for full reproducibility
- Document current limitations transparently

### Q5: KMS integration details?

**Answer: Use dstack SDK + on-chain verification**

- **SDK**: Use `dstack-sdk` Python package for `get_key()` deterministic keys
  - Docs: https://github.com/Dstack-TEE/dstack/tree/master/sdk/python
- **On-chain**: Verify signatures against KMS contract
- **Root Key**: `0x52d3CF51c8A37A2CCfC79bBb98c7810d7Dd4CE51`

### Q6: Should we implement RTMR3 hash stabilization before Phala's update?

**Answer: Yes - use Andrew's reproducible builds approach**

From Oct 28 sync: "Refactor `app_compose.json` so RTMR3 compose hash stops churning across deployments."

Andrew has created a reproducible builds playground that addresses this:
- Repository: https://github.com/Account-Link/reproducible-builds-playground

**Key techniques for RTMR3 stability**:
1. **Pinned base images** using SHA256 digests (not tags)
2. **Fixed Debian snapshots** capturing packages at specific points in time
3. **Exact package versions** without version ranges
4. **Comprehensive cleanup** of APT cache, logs, and artifacts
5. **npm cache removal** after dependency installation
6. **Timestamp normalization** using `SOURCE_DATE_EPOCH`
7. **BuildKit with rewrite-timestamp** for layer determinism

From h4x3rotab (Apr 27, The TEE Kettle):
> "The difference is RTMR is controlled by kernel and can be made append only. It's possible to simulate this behavior with user report data but generally harder to guarantee"

**Verification approach**:
- Initial cached builds for efficiency
- Fresh `--no-cache` rebuilds to expose hidden non-determinism
- Post-deployment verification extracts server-generated salts and confirms local compose configurations generate matching hashes

### Q7: What level of detail for the public-facing verification docs?

**Answer: Layered approach - simple summary + technical deep-dive**

Based on team discussions:

1. **User-Facing Summary** (for tweets/announcements):
   - "This enclave only accesses watch history, not DMs"
   - Link to source repo
   - Link to attestation proof
   - Simple verification URL

2. **Technical Verification Guide** (for auditors/developers):
   - Full TDQuote verification steps
   - KMS signature chain verification
   - Reproducible build instructions
   - On-chain verification via SimpleDstackVerifier

From h4x3rotab (Aug 25, Dstack Community):
> "We are going to launch an API to verify everything and show the result with visualization"

The Phala team is building a verification visualization API that will make this more accessible. Until then, provide both layers of documentation.

## Known Gaps

### From dstack PR #416 Review

Per h4x3rotab:
> "TLDR: good demo and start point, but the challenges we have discussed still remain"

Outstanding issues (tracked in dstack issue #125):
- Reproducible base images for OS code provenance
- Attestation of startup scripts
- Full verification of extended TCB (vTPM, etc.)
- MRs vary based on infrastructure (GCP vs Phala vs bare metal)

### Organizational Gap: Availability vs Integrity

From Dec 30 LSDan-Andrew sync, there's a fundamental tension between:
- **Node Father's priority**: Keep availability up (uptime-first operations)
- **Transparency goal**: Generate cryptographic evidence of non-custodial access

Without a prescriptive release process that *requires* transparency log generation, the path of least resistance is to deploy without it. This is the root cause of the current gap - not technical limitation, but organizational incentive alignment.

### Current Limitations

1. **RTMR3 Churning**: Compose hash changes across deployments
2. **No Full Reproducibility**: Can't rebuild identical image from source (yet)
3. **Partial TCB**: Not verifying full vTPM/firmware chain
4. **Pha KMS lacks public transparency**: Both Xordi and Hermes use "pha" KMS which doesn't publish upgrade events publicly (Shelven Zhou, Dec 23: "To be publicly visible you need to use onchain kms... The pha kms is reserved for other customers who don't want to publish the update events"). **Update (Dec 30):** Andrew confirmed the fix is straightforward: "I suspect that the only thing that needs to change is just choosing to release it on base"
5. **No dev/staging environment**: Can't stress test before production. ~100 user scale exposed concurrency bugs that staging would have caught.

## Alternatives Considered

### Alternative 1: Manual Documentation Only
Rejected - doesn't provide cryptographic verification

### Alternative 2: Wait for Full Reproducibility
Rejected - can make progress now with KMS signatures + partial attestation

### Alternative 3: Build Custom Infrastructure
Rejected - Phala team has more expertise, better to use/contribute upstream

## Risks

1. **Reproducibility Gap**: Users can verify KMS signature but not full image provenance (yet)
2. **Phala Dependency**: Tied to Phala Cloud infrastructure
3. **RTMR3 Instability**: May cause false verification failures
4. **Timeline**: Phala's xmas update timing uncertain

## Related Resources

### Repositories
- **Xordi Source**: https://github.com/Account-Link/teleport-tokscope/tree/tokscope-xordi-perf
- **dstack**: https://github.com/Dstack-TEE/dstack
- **dstack Tutorial**: https://github.com/amiller/dstack-tutorial (Andrew's tutorial for IC3 event Jan 5)
- **Hermes**: https://github.com/amiller/hermes (live at https://hermes.teleport.computer)
- **KMS Simulator**: https://github.com/amiller/dstack-kms-simulator
- **Reproducible Builds Playground**: https://github.com/Account-Link/reproducible-builds-playground
- **dstack Verifier**: https://github.com/Phala-Network/dstack-verifier
- **Trust Center Source**: https://github.com/phala-network/trust-center (Andrew using for Claude auditing)
- **Prelaunch Scripts**: https://github.com/Dstack-TEE/dstack-examples/tree/main/phala-cloud-prelaunch-script (versioned, transparent)
- **Hardened HTTPS Oracle**: https://github.com/Gldywn/phala-cloud-oracle-template (certificate transparency checks)

### dstack Components
- **dstack-kms**: Key management service
- **dstack-vmm**: VM manager for bare metal hosts
- **dstack-gateway**: Reverse proxy for CVMs
- **dstack SDK**: https://github.com/Dstack-TEE/dstack/tree/master/sdk/python

### Specifications & Docs
- **dstack PR #423**: Docs revamp with operator guides for prod deployment (Dec 31, 2025)
- **dstack-examples PR #75**: Examples docs update (Dec 31, 2025)
- **dstack PR #416**: GCP TDX support (gap analysis)
- **dstack Issue #125**: Reproducibility gaps for GCP
- **ERC-733 Draft**: Andrew's EVM+TEE patterns doc
- **Intel TDX 1.5 Spec**: https://cdrdv2-public.intel.com/817877/intel-tdx-module-1.5-abi-spec-348551004.pdf
- **TDX Attestation Guide**: https://phala.com/posts/understanding-tdx-attestation-reports-a-developers-guide
- **Phala Attestation Docs**: https://docs.phala.com/phala-cloud/attestation/overview

### Verification Tools
- **Phala Trust Center**: https://trust.phala.com/
- **TEE Attestation Explorer**: https://proof.t16z.com/
- **RTMR3 Calculator**: https://rtmr3-calculator.vercel.app/
- **Phala Cloud CLI**: `@phala/phala-cli` (npm)

### Contracts
- **KMS Contract**: `0x2f83172A49584C017F2B256F0FB2Dca14126Ba9C`
- **KMS Root Address**: `0x52d3CF51c8A37A2CCfC79bBb98c7810d7Dd4CE51`
- **SimpleDstackVerifier**: https://github.com/amiller/dstack-kms-simulator/blob/master/contracts/src/SimpleDstackVerifier.sol

## Next Steps

### Immediate (The One Thing That Needs to Change)

1. **Switch deployment from Pha KMS to Base on-chain KMS** - This single change creates automatic transparency logging for every upgrade. Andrew: "I suspect that the only thing that needs to change is just choosing to release it on base"

### Short-Term (Release Process)

2. **Adopt James's GitHub Actions pattern** for CI/CD - Build workflow already demonstrated, just needs adaptation for tokscope repo
3. **Create prescriptive release checklist** that *requires* transparency log verification before deployment is considered complete
4. **Schedule call with Node Father** to narrate current deployment process and agree on new prescriptive process

### Medium-Term (Infrastructure)

5. **Set up dev/staging instance** for stress testing before production releases
6. **Implement attestation endpoint** at `/.well-known/attestation`
7. **Resolve Archive ownership** - Transfer from Shin to dedicated maintainer

### Deferred

8. **Create verification script** using SimpleDstackVerifier
9. **Draft public documentation** explaining verification to users
10. **Update spec** when Phala reproducibility tooling is available

## Traceability

*To be filled during implementation*

| Requirement | Implementation | Tests |
|-------------|----------------|-------|
| Document deployment process | | |
| Generate attestation proof | | |
| Publish to GitHub Release | | |
| On-chain verification | SimpleDstackVerifier | |
| Well-known endpoint | | |
| Verification script | | |

## Changelog

| Date | Author | Changes |
|------|--------|---------|
| 2025-12-21 | LSDan | Initial draft based on Telegram context extraction |
| 2025-12-21 | LSDan | Added resolved questions, on-chain verification details, KMS integration |
| 2025-12-21 | LSDan | Resolved Q6 (RTMR3 stabilization) and Q7 (documentation approach); moved to REVIEW status |
| 2025-12-22 | LSDan | Added Phala verification infrastructure details; documented current deployment status gap |
| 2025-12-22 | LSDan | Updated deployment status with correct app-id and Trust Center URL (verified working) |
| 2025-12-22 | LSDan | Added Hermes CI/CD pattern as implementation template |
| 2025-12-22 | LSDan | Added tweet-ready artifacts section and implementation checklist |
| 2025-12-26 | LSDan | Added Pha KMS transparency limitation; added Trust Center source, Prelaunch scripts, and Hardened HTTPS Oracle to resources |
| 2025-12-30 | LSDan | Updated KMS limitation with planned migration to Base (from Andrew's infra roadmap) |
| 2025-12-31 | LSDan | Added dstack docs revamp PRs (#423, #75) with operator guides for prod deployment |
| 2025-12-31 | LSDan | Added LSDan-Andrew sync context: core problem articulation, availability vs integrity tension, three infra problems, restructured next steps around "the one thing that needs to change" |
| 2026-01-05 | LSDan | Added Andrew's direct request (Jan 5 Telegram), dstack-tutorial repo, Hermes live URL (hermes.teleport.computer) |
