# Dstack-TEE/dstack - Comprehensive File Listing with Absolute Paths

## Complete Documentation Files - Absolute Paths

### Root Level Documentation (Repository Root)

```
/tmp/dstack-repo/README.md
/tmp/dstack-repo/CHANGELOG.md
/tmp/dstack-repo/CLAUDE.md
/tmp/dstack-repo/CODE_OF_CONDUCT.md
/tmp/dstack-repo/CONTRIBUTING.md
/tmp/dstack-repo/LICENSE
/tmp/dstack-repo/attestation.md
/tmp/dstack-repo/dstack-logo.svg
/tmp/dstack-repo/dstack_Technical_Charter_Final_10-17-2025.pdf
```

### Docs Directory Documentation

```
/tmp/dstack-repo/docs/deployment.md
/tmp/dstack-repo/docs/vmm-cli-user-guide.md
/tmp/dstack-repo/docs/design-and-hardening-decisions.md
/tmp/dstack-repo/docs/dstack-gateway.md
/tmp/dstack-repo/docs/normalized-app-compose.md
/tmp/dstack-repo/docs/faq.md
```

### Security Guide Subdirectory

```
/tmp/dstack-repo/docs/security-guide/security-guide.md
/tmp/dstack-repo/docs/security-guide/cvm-boundaries.md
/tmp/dstack-repo/docs/security-guide/assets/prelaunch-script.png
/tmp/dstack-repo/docs/security-guide/assets/token-env.png
/tmp/dstack-repo/docs/security/dstack-audit.pdf
```

### SDK Documentation

```
/tmp/dstack-repo/sdk/README.md
/tmp/dstack-repo/sdk/curl/api.md
/tmp/dstack-repo/sdk/curl/api-tappd.md
/tmp/dstack-repo/sdk/rust/README.md
/tmp/dstack-repo/sdk/rust/types/README.md
/tmp/dstack-repo/sdk/python/README.md
/tmp/dstack-repo/sdk/go/README.md
/tmp/dstack-repo/sdk/js/README.md
```

### Component Documentation

```
/tmp/dstack-repo/kms/README.md
/tmp/dstack-repo/verifier/README.md
/tmp/dstack-repo/gateway/dstack-app/builder/README.md
/tmp/dstack-repo/size-parser/README.md
/tmp/dstack-repo/sodiumbox/README.md
```

---

## Documentation Assets - Diagrams & Images

### Architecture & Workflow Diagrams

```
/tmp/dstack-repo/docs/assets/arch.png                          # System architecture
/tmp/dstack-repo/docs/assets/vmm.png                           # Virtual Machine Manager
/tmp/dstack-repo/docs/assets/guest-agent.png                   # Guest Agent architecture
/tmp/dstack-repo/docs/assets/gateway.png                       # Gateway architecture
/tmp/dstack-repo/docs/assets/app-board.png                     # Application board UI
/tmp/dstack-repo/docs/assets/app-deploy.png                    # Deployment workflow
/tmp/dstack-repo/docs/assets/app-dns-a.png                     # DNS A record setup
/tmp/dstack-repo/docs/assets/app-dns-txt.png                   # DNS TXT record setup
/tmp/dstack-repo/docs/assets/appid.png                         # App ID configuration
/tmp/dstack-repo/docs/assets/certbot-caa.png                   # Certbot CAA setup
/tmp/dstack-repo/docs/assets/gateway-accountid.png             # Gateway account ID
/tmp/dstack-repo/docs/assets/kms-bootstrap.png                 # KMS bootstrap process
/tmp/dstack-repo/docs/assets/kms-bootstrap-result.png          # KMS bootstrap results
/tmp/dstack-repo/docs/assets/kms-auth-set-info.png             # KMS authentication setup
/tmp/dstack-repo/docs/assets/secret.png                        # Secret management UI
/tmp/dstack-repo/docs/assets/td-shim-vs-tdvf.png               # Firmware comparison
/tmp/dstack-repo/docs/assets/tproxy-add-wildcard-domain.jpg    # Wildcard domain setup
/tmp/dstack-repo/docs/assets/org-contributors-2024-12-26.png   # Contributors
```

### Logo & Branding Assets

```
/tmp/dstack-repo/docs/assets/dstack-logo.svg                                           # Main logo

/tmp/dstack-repo/docs/assets/Dstack Logo Kit/01 Horizontal/
    01 Dstack _Horizontal_primary.png
    01 Dstack _Horizontal_primary.svg
    02 Dstack _Horizontal_dark.png
    02 Dstack _Horizontal_dark.svg

/tmp/dstack-repo/docs/assets/Dstack Logo Kit/02 Vertical/
    01 Dstack_Vertical_primary.png
    01 Dstack_Vertical_primary.svg
    02 Dstack_Vertical_dark.png
    02 Dstack_Vertical_dark.svg

/tmp/dstack-repo/docs/assets/Dstack Logo Kit/03 icon/
    01 Dstack icon_primary.png
    01 Dstack icon_primary.svg
    02 Dstack icon_dark.png
    02 Dstack icon_dark.svg
```

---

## Protocol Buffer Definitions (API Specifications)

```
/tmp/dstack-repo/kms/rpc/proto/kms_rpc.proto                   # KMS RPC interface
/tmp/dstack-repo/host-api/proto/host_api.proto                 # Host API interface
/tmp/dstack-repo/vmm/rpc/proto/vmm_rpc.proto                   # VMM RPC interface
/tmp/dstack-repo/guest-api/proto/guest_api.proto               # Guest API interface
/tmp/dstack-repo/guest-agent/rpc/proto/agent_rpc.proto         # Guest Agent RPC interface
/tmp/dstack-repo/gateway/rpc/proto/gateway_rpc.proto           # Gateway RPC interface
```

---

## Related Configuration Files

```
/tmp/dstack-repo/REUSE.toml                                    # SPDX license configuration
/tmp/dstack-repo/Cargo.toml                                    # Rust project manifest
/tmp/dstack-repo/Cargo.lock                                    # Rust dependency lock
/tmp/dstack-repo/cliff.toml                                    # Git-cliff changelog config
/tmp/dstack-repo/Makefile                                      # Build configuration
```

---

## GitHub Configuration Files

```
/tmp/dstack-repo/.github/workflows/gateway-release.yml         # Gateway release workflow
/tmp/dstack-repo/.github/workflows/kms-release.yml             # KMS release workflow
/tmp/dstack-repo/.github/workflows/rust-sdk-release.yml        # Rust SDK release workflow
/tmp/dstack-repo/.github/workflows/rust.yml                    # Rust build/test workflow
/tmp/dstack-repo/.github/workflows/sdk.yaml                    # SDK workflow
/tmp/dstack-repo/.github/workflows/spdx-check.yml              # SPDX compliance check
/tmp/dstack-repo/.github/workflows/verifier-release.yml        # Verifier release workflow
```

---

## Directory Structure Summary

### Top-Level Directories

```
dstack-repo/
├── docs/                          # Main documentation directory
│   ├── assets/                    # Images and diagrams
│   │   └── Dstack Logo Kit/       # Branding assets
│   ├── security-guide/            # Security documentation
│   │   └── assets/                # Security guide images
│   └── security/                  # Security audit PDF
├── sdk/                           # SDK implementations
│   ├── curl/                      # cURL API reference
│   ├── go/                        # Go SDK
│   ├── js/                        # JavaScript/TypeScript SDK
│   ├── python/                    # Python SDK
│   └── rust/                      # Rust SDK
├── kms/                           # Key Management System
│   ├── rpc/
│   │   └── proto/                 # KMS RPC definitions
│   └── dstack-app/                # KMS deployment app
├── vmm/                           # Virtual Machine Manager
│   └── rpc/
│       └── proto/                 # VMM RPC definitions
├── gateway/                       # Gateway component
│   ├── dstack-app/                # Gateway deployment app
│   │   └── builder/               # Gateway builder
│   └── rpc/
│       └── proto/                 # Gateway RPC definitions
├── guest-agent/                   # Guest agent component
│   └── rpc/
│       └── proto/                 # Agent RPC definitions
├── guest-api/                     # Guest API
│   └── proto/                     # Guest API definitions
├── host-api/                      # Host API
│   └── proto/                     # Host API definitions
├── verifier/                      # Quote verification service
├── .github/
│   └── workflows/                 # CI/CD workflows
├── scripts/                       # Utility scripts
├── basefiles/                     # Base files
├── certbot/                       # Certificate bot
├── dstack-mr/                     # Measurement register tool
├── python/                        # Python utilities
└── [other component directories]
```

---

## File Statistics

### Markdown Files: 32 Total

**By Directory:**
- Root level: 6 files
- /docs/: 6 files
- /docs/security-guide/: 2 files
- /sdk/: 8 files
- Component READMEs: 10 files

**By Type:**
- Guides & Tutorials: 8 files
- SDK Documentation: 8 files
- API References: 3 files
- Configuration Guides: 3 files
- Architecture & Design: 2 files
- Troubleshooting: 1 file
- Component Docs: 8 files

### Visual Assets: 28 Total

**By Type:**
- PNG images: 19
- SVG images: 9
- JPG images: 1 (wildcard domain setup)
- PDF: 2 (audit report + technical charter)

### Protocol Buffers: 6 Files

- KMS RPC specification
- Host API specification
- VMM RPC specification
- Guest API specification
- Guest Agent RPC specification
- Gateway RPC specification

---

## Content Organization by Purpose

### For New Users (Getting Started)
1. /tmp/dstack-repo/README.md
2. /tmp/dstack-repo/docs/faq.md
3. /tmp/dstack-repo/sdk/README.md

### For Developers (Implementation)
1. /tmp/dstack-repo/CONTRIBUTING.md
2. /tmp/dstack-repo/CLAUDE.md
3. /tmp/dstack-repo/sdk/[language]/README.md

### For Operations (Deployment)
1. /tmp/dstack-repo/docs/deployment.md
2. /tmp/dstack-repo/docs/dstack-gateway.md
3. /tmp/dstack-repo/docs/vmm-cli-user-guide.md

### For Security (Hardening & Audit)
1. /tmp/dstack-repo/docs/security-guide/security-guide.md
2. /tmp/dstack-repo/docs/security-guide/cvm-boundaries.md
3. /tmp/dstack-repo/attestation.md
4. /tmp/dstack-repo/docs/security/dstack-audit.pdf

### For Architecture (Design Decisions)
1. /tmp/dstack-repo/docs/design-and-hardening-decisions.md
2. /tmp/dstack-repo/CLAUDE.md
3. /tmp/dstack-repo/kms/README.md

### For API Integration
1. /tmp/dstack-repo/sdk/curl/api.md
2. /tmp/dstack-repo/sdk/curl/api-tappd.md
3. /tmp/dstack-repo/verifier/README.md
4. /tmp/dstack-repo/kms/README.md

---

## Key Entry Points for Documentation Site

### Primary Navigation
- **Getting Started**: README.md
- **Guides**: deployment.md, vmm-cli-user-guide.md, dstack-gateway.md
- **Security**: security-guide.md, attestation.md, cvm-boundaries.md
- **SDK Reference**: sdk/[language]/README.md
- **API Reference**: api.md, api-tappd.md
- **Contributing**: CONTRIBUTING.md
- **FAQ & Troubleshooting**: faq.md

### Secondary Navigation
- Architecture & Design: CLAUDE.md, design-and-hardening-decisions.md
- KMS Protocol: kms/README.md
- Quote Verification: verifier/README.md, attestation.md
- Configuration: normalized-app-compose.md, dstack-gateway.md
- Changelog: CHANGELOG.md

---

## Documentation Metadata

### Last Updated
- Repository cloned: October 23, 2024
- Version tracked: Latest main branch
- Documentation is current as of latest commit

### Standards Followed
- Markdown formatting for text documentation
- Keep a Changelog format for CHANGELOG.md
- Conventional Commits for git history
- SPDX licensing headers
- PNG/SVG for graphics
- Protocol Buffers for API specifications

### External Dependencies
- Canonical TDX setup guide
- Intel Linux hardening documentation
- Phala Cloud documentation
- DeepWiki community wiki
- Git-cliff for changelog generation

