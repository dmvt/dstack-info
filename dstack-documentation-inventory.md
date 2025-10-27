# Dstack-TEE/dstack Repository - Complete Documentation Inventory

## Repository Overview
- **Repository**: https://github.com/Dstack-TEE/dstack
- **Description**: Deploy any app to TEE (Trusted Execution Environment)
- **Organization**: Dstack-TEE
- **Language**: Primarily Rust with Python, Go, JavaScript, and TypeScript SDKs
- **Total Markdown Files Found**: 32

---

## 1. ROOT LEVEL DOCUMENTATION FILES

### 1.1 Main Entry Points
- **README.md** (501 lines)
  - Overview of dstack platform
  - Architecture diagram
  - Getting started guide
  - Features overview
  - Hardware requirements
  - Build and run instructions
  - Usage examples
  - Table of contents

- **CHANGELOG.md** (1,287 lines)
  - Version history
  - Feature releases and bug fixes
  - Follows Keep a Changelog format
  - Git-cliff generated with GitHub integration

### 1.2 Project Documentation
- **CLAUDE.md** (226 lines)
  - AI assistant guidance for working with the codebase
  - Project architecture overview
  - Core components description
  - Build commands for different languages
  - Development setup instructions

- **CONTRIBUTING.md**
  - Development workflow
  - Fork and feature branch process
  - Conventional Commits format
  - Changelog generation with git-cliff
  - SPDX license compliance requirements
  - Automated SPDX header script

- **CODE_OF_CONDUCT.md**
  - Community standards and conduct guidelines

- **LICENSE**
  - Project licensing information

---

## 2. DOCS DIRECTORY STRUCTURE

Location: `/docs/`

### 2.1 Core Documentation Files

#### deployment.md (13,625 bytes)
- **Purpose**: Complete deployment guide for dstack components on bare metal TDX hosts
- **Sections**:
  - Prerequisites for TDX setup
  - Cloning dstack repository
  - Compiling and running dstack-vmm
  - Configuration files (vmm.toml)
  - Downloading guest OS images
  - Deploying DstackKms contract
  - Deploying KMS into CVM
  - Deploying dstack-gateway in CVM
  - Adding OS image hash to whitelist
  - Registering dstack-gateway in KMS
  - Deploying dstack-vmm on other TDX hosts
  - Deploying apps on dstack-vmm
  - On-chain registration steps
  - Whitelisting app compose hash
  - Instance deployment using dstack-vmm

#### vmm-cli-user-guide.md (14,640 bytes)
- **Purpose**: Complete user guide for VMM CLI tool
- **Sections**:
  - Table of Contents
  - Getting Started (prerequisites, installation, basic configuration)
  - Server URL Configuration (environment variables, command-line arguments)
  - Basic Commands
  - VM Management
  - Application Deployment
  - Security Features
  - Advanced Usage
  - Troubleshooting

#### design-and-hardening-decisions.md (4,057 bytes)
- **Purpose**: Architectural decisions and security hardening for meta-dstack layer
- **Sections**:
  - Overview of meta-dstack design philosophy
  - Yocto Kernel Recipe Selection rationale
  - TDVF vs td-shim Boot Firmware comparison
  - TDX Guest Driver Implementation decisions
  - Randomness Generation and Seeding (Intel RDRAND)
  - Secure System Time synchronization
  - Trust and security considerations

#### dstack-gateway.md (2,696 bytes)
- **Purpose**: Production setup guide for dstack-gateway reverse proxy
- **Sections**:
  - Wildcard domain setup with Cloudflare
  - SSL Certificate request with Certbot
  - Certbot configuration (acme_url, cf_api_token, cf_zone_id)
  - Certificate creation and renewal
  - gateway.toml configuration
  - URL format specification
  - TLS passthrough and HTTP/2 support
  - vmm.toml adjustment

#### normalized-app-compose.md (9,473 bytes)
- **Purpose**: Guide to deterministic JSON serialization for app-compose.json
- **Sections**:
  - Core rules for deterministic JSON
  - Go encoding/json implementation
  - Python json.dumps implementation
  - JavaScript JSON.stringify implementation
  - Language comparison
  - Summary and best practices

#### faq.md (1,140 bytes)
- **Purpose**: Frequently Asked Questions
- **Content**:
  - CVM status troubleshooting
  - KVM kernel module permission issues
  - Debug log access
  - Group permission fixes

### 2.2 Security Documentation Subdirectory

Location: `/docs/security-guide/`

#### security-guide.md (4,702 bytes)
- **Purpose**: dstack production security best practices
- **Sections**:
  - Always pin image hash in docker-compose.yaml (bad/good examples)
  - Reproducibility requirements
  - Authenticated envs and user_config
  - Environment variable encryption
  - USER_CONFIG_HASH verification
  - Don't put secrets in docker-compose.yaml
  - Additional security considerations

#### cvm-boundaries.md (11,007 bytes)
- **Purpose**: Security boundary documentation for Confidential Virtual Machines
- **Content**: CVM security model and trust boundaries

#### assets subdirectory
- prelaunch-script.png
- token-env.png

### 2.3 Assets Directory

Location: `/docs/assets/`

#### Diagrams (PNG images)
- arch.png - System architecture diagram
- vmm.png - Virtual Machine Manager diagram
- guest-agent.png - Guest Agent diagram
- gateway.png - Gateway architecture diagram
- app-board.png - Application board UI
- app-deploy.png - Deployment workflow
- app-dns-a.png - DNS A record setup
- app-dns-txt.png - DNS TXT record setup
- appid.png - App ID configuration
- certbot-caa.png - Certbot CAA setup
- gateway-accountid.png - Gateway account ID
- kms-bootstrap.png - KMS bootstrap process
- kms-bootstrap-result.png - KMS bootstrap results
- kms-auth-set-info.png - KMS authentication setup
- secret.png - Secret management UI
- td-shim-vs-tdvf.png - Firmware comparison
- tproxy-add-wildcard-domain.jpg - Wildcard domain setup
- org-contributors-2024-12-26.png - Contributors

#### Branding Assets
- dstack-logo.svg - Main logo
- Dstack Logo Kit/
  - 01 Horizontal/ (PNG and SVG variants - primary and dark)
  - 02 Vertical/ (PNG and SVG variants - primary and dark)
  - 03 icon/ (PNG and SVG variants - primary and dark)

### 2.4 Security Subdirectory

Location: `/docs/security/`

#### dstack-audit.pdf (1.17 MB)
- Professional security audit report

---

## 3. SDK DOCUMENTATION

Location: `/sdk/`

### 3.1 SDK Overview

#### sdk/README.md
- General SDK introduction
- Links to language-specific SDKs
- Simulator information
- Docker-based development image

### 3.2 Rust SDK

#### sdk/rust/README.md
- Installation via cargo
- DstackClient (current API)
- TappdClient (legacy API)
- Examples for key derivation
- Examples for TDX quote generation
- RTMRs (Runtime Trusted Measurement Registers) access

#### sdk/rust/types/README.md
- Rust types documentation

### 3.3 Python SDK

#### sdk/python/README.md
- Installation via pip
- DstackClient synchronous client
- AsyncDstackClient asynchronous client
- Application architecture
- Socket connection requirements
- Basic usage examples
- Key derivation examples
- TDX quote generation
- TLS certificate generation
- Blockchain integration (Ethereum)

### 3.4 Go SDK

#### sdk/go/README.md
- Installation via go get
- NewDstackClient constructor
- Client options (endpoint, logger)
- API methods:
  - Info()
  - GetKey()
  - GetQuote()
  - GetTlsKey()
- Code examples

### 3.5 JavaScript/TypeScript SDK

#### sdk/js/README.md (36,648 bytes - extensive)
- Installation via npm
- DstackClient class
- Application architecture
- Socket connection requirements
- Basic SDK integration examples
- Version compatibility (0.5.x vs 0.3.x)
- Advanced features:
  - TLS Certificate Generation
  - Event Logging
  - Blockchain Integration (Ethereum Viem, Solana)
  - Environment variable encryption
  - Browser compatibility
  - Async/promise-based API
  - Compose hash computation
  - Remote attestation
  - Error handling
- Extensive code examples

### 3.6 cURL API Documentation

#### sdk/curl/api.md
- REST API endpoints for dstack Guest Agent RPC
- Base URL and socket configuration
- Endpoints:
  1. GetTlsKey - TLS key derivation with certificates
  2. GetKey - ECDSA key generation (secp256k1)
  3. GetQuote - TDX quote generation
  4. Info - Get CVM instance information
  5. EmitEvent - Event logging
  6. GetAppEnvEncryptPubKey - Environment variable encryption key
- Request/response examples for each endpoint
- Parameter descriptions

#### sdk/curl/api-tappd.md
- Legacy Tappd RPC API documentation
- Deprecated as of version 0.4.2
- Maintained for backward compatibility
- Endpoints:
  1. DeriveKey - Key derivation
  2. DeriveK256Key - K256 ECDSA key generation
  3. GetQuote - Quote generation
  4. GetInfo - Instance information

---

## 4. ADDITIONAL CORE DOCUMENTATION

### 4.1 attestation.md (Root directory)
- **Purpose**: TEE Attestation guide for dstack applications
- **Sections**:
  1. Review code safety
  2. Validate data origin authenticity
  3. Understanding TDX quote measurements
  4. MRTD (Measurement Register) explanation
  5. RTMR (Runtime Measurement Register) breakdown
     - RTMR0: Virtual hardware setup
     - RTMR1: Linux kernel measurement
     - RTMR2: Kernel cmdline and initrd
     - RTMR3: dstack App details
  6. Determining expected MRs
  7. Reproducible image builds
  8. Image measurement calculation
  9. Verification process
  10. Conclusion on trust validation

### 4.2 kms/README.md
- **Purpose**: Comprehensive KMS (Key Management System) protocol documentation
- **Sections**:
  1. Overview of boot modes:
     - Non-KMS Mode (stateless)
     - Local-Key-Provider Mode (stateful, no upgrades)
     - KMS Mode (stateful, upgradeable)
  2. KMS Implementation details:
     - dstack-kms component
     - dstack-kms-auth-eth component
     - Authorization Contracts (DstackKms.sol, DstackApp.sol)
     - Deployment architecture
  3. Trustness explanations:
     - Local-Key-Provider Mode with SGX
     - KMS Mode with RA-TLS
  4. KMS Self Replication process
  5. App Key Provisioning
  6. Attestation mechanisms:
     - Vanilla TDX Quote attestation
     - Validating Apps via KMS Auth Chain
  7. RPC Interface documentation:
     - GetAppKey
     - GetAppEnvEncryptPubKey
     - SignCert

### 4.3 verifier/README.md
- **Purpose**: dstack quote verification service documentation
- **Sections**:
  1. API Endpoints:
     - POST /verify - Quote verification with response structure
     - GET /health - Health check endpoint
  2. Configuration Options:
     - host, port settings
     - image_cache_dir
     - image_download_url
     - image_download_timeout_secs
     - pccs_url
  3. Example configuration
  4. Usage instructions

### 4.4 gateway/dstack-app/builder/README.md
- Gateway builder documentation
- Dockerfile and entrypoint configuration
- Build scripts

### 4.5 Additional Component READMEs
- size-parser/README.md
- sodiumbox/README.md

---

## 5. PROTOCOL BUFFER (PROTO) FILES

Location: Various component directories

These define the RPC interfaces for inter-component communication:

### 5.1 Protocol Definitions
- `/kms/rpc/proto/kms_rpc.proto` - KMS RPC protocol
- `/host-api/proto/host_api.proto` - Host API protocol
- `/vmm/rpc/proto/vmm_rpc.proto` - VMM RPC protocol
- `/guest-api/proto/guest_api.proto` - Guest API protocol
- `/guest-agent/rpc/proto/agent_rpc.proto` - Guest Agent RPC protocol
- `/gateway/rpc/proto/gateway_rpc.proto` - Gateway RPC protocol

---

## 6. DOCUMENTATION BY TOPIC

### 6.1 Deployment & Infrastructure
- deployment.md - Complete deployment guide
- dstack-gateway.md - Gateway production setup
- design-and-hardening-decisions.md - Architecture decisions
- CLAUDE.md - Build commands

### 6.2 Security
- security-guide/security-guide.md - Production security best practices
- security-guide/cvm-boundaries.md - CVM security boundaries
- docs/security/dstack-audit.pdf - Professional security audit
- attestation.md - TEE attestation verification

### 6.3 API & SDK Documentation
- sdk/curl/api.md - REST API reference
- sdk/curl/api-tappd.md - Legacy API reference
- sdk/rust/README.md - Rust SDK
- sdk/python/README.md - Python SDK
- sdk/go/README.md - Go SDK
- sdk/js/README.md - JavaScript/TypeScript SDK
- verifier/README.md - Quote verification service

### 6.4 Configuration & Usage
- vmm-cli-user-guide.md - CLI tool guide
- normalized-app-compose.md - JSON serialization guide
- dstack-gateway.md - Gateway configuration
- kms/README.md - KMS protocol and configuration

### 6.5 Getting Started & Support
- README.md - Main overview and getting started
- faq.md - Troubleshooting and FAQ
- CONTRIBUTING.md - Development guidelines

### 6.6 Technical Architecture
- attestation.md - TDX quote verification
- kms/README.md - KMS system architecture
- design-and-hardening-decisions.md - System design decisions
- CLAUDE.md - Architecture overview

---

## 7. DOCUMENTATION ASSETS SUMMARY

### 7.1 Diagrams (PNG format)
- 19 architecture and workflow diagrams
- Topics covered:
  - System architecture
  - Component interactions
  - Deployment workflows
  - Configuration UIs
  - DNS/TLS setup

### 7.2 Branding Assets
- Main SVG logo
- 3 logo variations (horizontal, vertical, icon)
- 2 color schemes (primary, dark) for each
- PNG and SVG formats

### 7.3 Security Documents
- Professional audit PDF (1.17 MB)

---

## 8. DOCUMENTATION STATISTICS

### File Count by Type
- Markdown files (.md): 32
- Protocol Buffer files (.proto): 6
- PDF files (audit): 1
- PNG images: 19
- SVG files: 9
- Additional assets: Logo kit variations

### Content Volume
- Total markdown lines: ~3,000+
- Major guides:
  - deployment.md: 13.6 KB
  - vmm-cli-user-guide.md: 14.6 KB
  - sdk/js/README.md: 36.6 KB
  - CHANGELOG.md: Large version history

### Documentation Coverage
1. Getting Started: Yes (README.md)
2. Deployment Guides: Yes (deployment.md, dstack-gateway.md)
3. Security Guides: Yes (security-guide.md, cvm-boundaries.md, attestation.md)
4. API Documentation: Yes (api.md, api-tappd.md, KMS README)
5. SDK Documentation: Yes (Python, Go, Rust, JavaScript)
6. Architecture Documentation: Yes (design-and-hardening-decisions.md, CLAUDE.md)
7. Troubleshooting: Yes (faq.md)
8. Contributing Guidelines: Yes (CONTRIBUTING.md)
9. Examples: Embedded in SDK READMEs and guides

---

## 9. EXTERNAL RESOURCES REFERENCED

The documentation references:
- Canonical TDX setup guide (https://github.com/canonical/tdx)
- Intel CCC Linux guest hardening docs
- Phala Cloud documentation
- DeepWiki community wiki
- Telegram community (t.me/+UO4bS4jflr45YmUx)
- GitHub discussions and issues

---

## 10. KEY DOCUMENTATION GAPS & OPPORTUNITIES

### Well-Documented Areas
- Deployment procedures
- Security architecture
- SDK usage (multiple languages)
- API reference
- Configuration

### Areas for Enhancement
- More step-by-step tutorials
- Video walkthroughs
- Real-world use case examples
- Quick-start templates
- Troubleshooting decision trees
- Performance tuning guide

---

## CONCLUSION

The Dstack-TEE/dstack repository contains comprehensive documentation covering:
- **1 main README** with overview and getting started
- **8 core guide documents** (deployment, security, configuration, troubleshooting)
- **4 complete SDK implementations** with documentation (Rust, Python, Go, JavaScript)
- **2 REST API references** (current and legacy)
- **1 KMS protocol** specification
- **1 Quote verifier** documentation
- **19 diagrams** illustrating architecture and workflows
- **Extensive CHANGELOG** and contribution guidelines
- **Professional security audit** PDF

This documentation provides a solid foundation for building a comprehensive documentation site. All guides are well-structured with clear sections, examples, and technical specifications.

