# Dstack Project Memory & Context

## Project Overview
**Created:** October 23, 2025
**Purpose:** dstack.info website to expand exposure and establish thought leadership for Flashbots involvement in dstack project.

## What is dstack?
dstack is a **developer-friendly, security-first SDK** that simplifies the deployment of containerized applications into Trusted Execution Environments (TEEs). It enables developers to deploy Docker containers into secure, attestable environments with minimal configuration changes.

## Key Historical Events
- **September 18, 2025**: dstack announced as Linux Foundation project
- **2025**: Phala Network transfers project governance to Linux Foundation while remaining lead contributor
- **Project Origins**: Initially developed by Phala Network
- **Current Phase**: Expanding to broader ecosystem, including Flashbots collaboration

## Technical Architecture

### Core Components
1. **dstack-vmm**: Service on bare TDX host managing Confidential VMs
2. **dstack-gateway**: Reverse proxy for TLS connections to CVMs
3. **dstack-kms**: Key Management Server for CVM key generation
4. **dstack-guest-agent**: Service in CVM handling key derivation & attestation
5. **meta-dstack**: Yocto meta layer for building CVM guest images

### Key Features
- Convert Docker containers to CVM images
- Remote attestation APIs with chain-of-trust visualization
- Automatic RA-HTTPS wrapping with content addressing
- Decentralized Root-of-Trust system
- Zero-Trust HTTPS (ZT-HTTPS)
- TEE Attestation (TDX quotes)
- Secret management with client-side encryption

## Supported Hardware
- Intel TDX (Trusted Domain Extensions)
- Minimum 16GB RAM, 100GB disk
- Requires public IPv4 address
- Optional: Domain with DNS for ZT-HTTPS

## Target Audiences

### Primary Audiences
1. **Developers**: Looking to deploy confidential applications with minimal friction
2. **Security Engineers**: Need attestable, verifiable infrastructure
3. **AI/ML Engineers**: Building private AI agents and inference systems
4. **Blockchain Developers**: Building cross-chain apps with confidential computing
5. **Enterprise Architects**: Seeking vendor lock-in avoidance and portable TEE solutions

### Use Cases (Real-World Applications)
1. **AI Agents**: ai16z Eliza framework runs on dstack TEE infrastructure
2. **Confidential AI Inference**: Private LLMs with nVIDIA GPU and Intel TDX support
3. **Programmable Privacy**: Encifher's TEE co-processor built on dstack
4. **Ethereum Layer 2**: First Op-Succinct Layer 2 on Ethereum by Phala
5. **Zero-Knowledge Proofs**: ZK computations in TEE
6. **Web2-Web3 Identity**: Linking Web2 accounts to Web3 via TEE
7. **Verifiable Frontends**: Trust guarantees for web applications
8. **Blockchain Games**: Secure game logic execution
9. **Timelock Decryption**: NTS-based timelock systems
10. **Tor Hidden Services**: Hosting Tor services in TEE

## Repository Structure

### Main Repositories (GitHub: dstack-TEE)
1. **dstack** (Primary): 310+ stars, Rust, Apache 2.0
2. **dstack-examples**: 18 stars, Python, Apache 2.0
   - attestation (configid-based, rtmr3-based)
   - custom-domain
   - ssh-over-gateway
   - tcp-port-forwarding
   - tor-hidden-service
   - launcher
   - webshell
   - prelaunch-script
   - lightclient
   - timelock-nts
   - private-docker-image-deployment
3. **meta-dstack**: Python, MIT
4. **Supporting repos**: sysbox-installer, webpki, tee-controlled-key, replicatoor

## Branding & Messaging

### Value Propositions
- **Developer-Friendly**: Uses familiar Docker Compose workflows
- **Security-First**: Built-in attestation, encryption, and zero-trust principles
- **Vendor Independence**: Decentralized trust model, no hardware lock-in
- **Production-Ready**: Linux Foundation governance, enterprise confidence
- **Open Source**: Apache 2.0 license, community-driven

### Key Differentiators
- Only TEE SDK with Linux Foundation backing
- Docker-native approach (not custom tooling)
- Decentralized KMS (not tied to specific hardware)
- Active community with 12+ PRs and 19 issues
- Real production use cases (AI agents, Layer 2s, privacy protocols)

## Competitive Landscape

### TEE Benefits (General)
- Code & data protection at runtime (data-in-use security)
- Hardware-level isolation
- Remote attestation for verification
- Compliance support (GDPR, CCPA)
- No performance degradation
- Multi-party computation enablement

### dstack Advantages
- Simplifies TEE deployment (minutes vs. days)
- No application code changes required
- Built-in secret management
- Automatic certificate management
- Web-based dashboard
- REST API for monitoring

## Community & Ecosystem

### Partnerships
- **Linux Foundation**: Neutral governance, IP protection
- **Phala Network**: Lead contributor, Phala Cloud managed service
- **Flashbots**: Strategic collaboration (current focus)
- **ai16z**: Eliza framework integration
- **0G, Morpheus, Lumerin**: AI infrastructure collaborations
- **Encifher**: Privacy protocol built on dstack

### Resources
- **Docs**: docs.phala.com/dstack/overview
- **GitHub**: github.com/dstack-TEE
- **Main Repo**: github.com/Dstack-TEE/dstack
- **Examples**: github.com/Dstack-TEE/dstack-examples
- **License**: Apache 2.0

## Strategic Direction (2025)

### Goals
1. Establish dstack as **leading open-source TEE SDK**
2. Expand developer adoption beyond Phala ecosystem
3. Build thought leadership in confidential computing space
4. Strengthen Flashbots collaboration and integration
5. Launch Phala Cloud as AI-ready TEE platform
6. Grow community contributions and governance participation

### Messaging Priorities
- Linux Foundation credibility
- Production-ready with real use cases
- Developer experience and ease of use
- Security and verifiability
- Vendor independence and portability
- Open-source and community-driven

## Technical Requirements

### Quick Start
```bash
# Dependencies (Ubuntu 24.04)
apt install build-essential chrpath diffstat lz4 wireguard-tools xorriso rustc

# Clone and build
git clone https://github.com/Dstack-TEE/dstack
cd dstack
# Follow README for host setup

# Launch services
# - KMS
# - Gateway
# - VMM

# Deploy via dashboard
# Upload docker-compose.yaml
# Access at <id>-<port>.domain
```

### Deployment Patterns
- Upload docker-compose.yaml via web dashboard
- Environment variables encrypted client-side
- Automatic ingress rule generation
- Container logs via REST API
- TDX quote extraction for attestation
- Certificate Transparency monitoring

## Website Strategy (dstack.info)

### Sections
1. **Hero**: Bold value prop, Linux Foundation badge, CTAs
2. **What is dstack**: Technical overview, architecture visual
3. **Use Cases**: Real-world applications with logos/names
4. **Features**: Developer benefits, security guarantees
5. **Examples**: Showcase repository examples with links
6. **Getting Started**: Quick start guide, installation
7. **Ecosystem**: Partners, community, Flashbots
8. **Resources**: Docs, GitHub, guides, API reference

### Design Direction
- Modern, tech-forward aesthetic
- Dark theme with purple/blue accents (Phala brand colors)
- Responsive, mobile-first
- Fast-loading, minimal dependencies
- SEO-optimized for "TEE SDK", "confidential computing", "Docker TEE"
- Clear CTAs for developers and enterprises

### Key Messages
- "Deploy confidential applications in minutes"
- "The open-source TEE SDK trusted by [partners]"
- "Linux Foundation project with enterprise backing"
- "From local Docker to production TEE with zero code changes"
- "Secure AI, verifiable computation, privacy-preserving apps"

## Content Opportunities (Thought Leadership)

### Blog Topics
- Why confidential computing matters for AI
- Deploying your first AI agent in TEE
- TEE vs. traditional security models
- Building trust in decentralized systems
- Flashbots + dstack: MEV protection in TEE
- The future of verifiable computation

### Technical Deep Dives
- Remote attestation explained
- Decentralized key management architecture
- Zero-Trust HTTPS implementation
- Migrating Docker apps to TEE
- Performance benchmarks: TEE overhead
- Security audit findings and responses

### Case Studies
- ai16z Eliza framework on dstack
- Encifher's privacy protocol
- Phala's Op-Succinct L2
- Tor hidden services in production
- Private ML inference at scale

## Metrics to Track

### Adoption Metrics
- GitHub stars/forks/contributors
- Docker pulls of CVM images
- Active deployments on Phala Cloud
- Developer signups and first deployments
- Community engagement (Discord, GitHub Discussions)

### Thought Leadership Metrics
- Website traffic to dstack.info
- Blog post engagement
- Conference talks and workshops
- Social media reach
- Developer advocate program growth
- Integration partnerships

## Next Steps

### Immediate (Website Launch)
- [x] Research and gather all project context
- [x] Design website structure and messaging
- [ ] Build responsive dstack.info website
- [ ] Deploy to hosting (GitHub Pages, Netlify, Vercel)
- [ ] Set up analytics and monitoring

### Short Term (Q4 2025)
- Establish regular blog cadence
- Create video tutorials and demos
- Launch developer advocate program
- Organize hackathons and workshops
- Expand Flashbots collaboration visibility

### Long Term (2026+)
- Annual dstack conference or track
- Developer certification program
- Enterprise support offerings
- Ecosystem grants program
- Academic research partnerships

---

**Last Updated:** October 23, 2025
**Maintained by:** Flashbots x dstack team
**Primary Contact:** [To be added]
