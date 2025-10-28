# Community Calls

Monthly community calls bringing together dstack core contributors, users, and ecosystem partners to discuss development progress, use cases, and technical challenges.

---

## Upcoming Calls

**Next Call:** TBA
**Format:** Google Meet + YouTube Live Stream
**How to Join:** Announcements posted in [GitHub Issues](https://github.com/Dstack-TEE/dstack/issues) and community channels

---

## Call #1 - October 2024

**Date:** October 2024
**Recording:** [Watch on YouTube](https://www.youtube.com/live/NIi9xk98now)

### Participants

**Phala Network Team:**
- Hong (CTO & Co-founder) - dstack architecture and specifications
- Marvin (Co-founder)
- Dylan Kawalik (Developer Relations) - Zero-knowledge proofs and cryptography
- Joshua (Developer Relations) - Integrations and deployments

**Flashbots Team:**
- Andrew - Social media automation, architecture planning
- Ian - Backend infrastructure and server administration
- LSDan (Quartermaster) - Backend infrastructure coordination
- Chuqiao - VPC, networking, and protocol development
- James - Prosocial interventions and data science
- Tina (Steward) - Community coordination

**Secret Labs:**
- Alex - Secret VM development, verifiable message signing

**Community Contributors:**
- Raymond - Alternative RA-TLS implementations, tunneling systems
- Francesco (Chimbon) - Infrastructure and use cases exploration

### Key Topics Discussed

#### 1. dstack VPC & Distributed Database Architecture

Hong presented the dstack VPC (Virtual Private Cloud) design, enabling multiple CVMs to communicate securely:

**Core Concept:**
- Connect multiple CVM instances using VPN (WireGuard) running inside TEEs
- Encrypted memory in CVMs + encrypted VPN = true private cloud network
- Enables distributed databases, load balancing, and redundancy

**Technical Implementation:**
- Uses Headscale (coordinator) + Tailscale (VPN client)
- Coordinator distributes shared keys to authenticated CVMs
- Remote attestation ensures all nodes are running in genuine TEEs
- MongoDB deployment example with distributed replication

**Key Features:**
- VPC Server App ID-based authentication
- Automatic IP address assignment within VPC
- Bootstrap agents for database configuration
- Service mesh for RA-based app-to-app communication

**Repository:** Experimental implementation in dstack-VPC repo with Docker Compose examples

#### 2. Browser Verification & Remote Attestation

Discussion on solving the "last mile" trust problem in browsers:

**Challenge:**
- Browsers can't verify TLS certificate x509 extensions
- Need to prove TE attestation to end users without plugins

**Proposed Solutions:**

**Service Worker Approach (Raymond):**
- Inject service worker to intercept domain requests
- Service worker creates direct connection to TE
- Verifies attestation and quote with embedded metadata
- Establishes authenticated encryption channel
- Can be packaged as browser extension or embedded in app

**VPN Verification Layer (Hong):**
- VPN-like client running locally (not actual VPN)
- Intercepts traffic to TE-controlled domains
- Adds verification layer without changing user experience
- Works on platforms where extensions aren't available (iOS)

**Transparency & Monitoring:**
- CT log-style monitoring for attestations
- Periodic verification published to blockchain
- Public endpoints for proactive attestation checks
- Embedded widgets showing real-time verification status

#### 3. Verifiable Message Signing (Secret Labs)

Alex from Secret Labs presented their contribution to dstack:

**Concept:**
- TE generates key pairs at startup
- Public keys embedded in attestation report data
- TE signs arbitrary messages with private key
- Message + signature + attestation = portable, forever-verifiable proof

**Use Cases:**
- Soulbound tokens proving CAPTCHA completion in TE
- Long-lasting proofs that outlive the original VM
- Trustless verification without live attestation connection

**Status:** In discussion for contribution to dstack SDK

#### 4. Roadmap & Development Priorities

Hong outlined the dstack development roadmap:

**Security Audits (In Progress):**
- ✅ Core operating system audit completed
- 🔄 KMS protocol audit (key management, app ownership, upgrades)
- 🔄 Networking layer audit (gateway, ingress, VPC)

**Major Development Tracks:**

**Enterprise Features:**
- Kubernetes integration / orchestration layer
- Microservices architecture support
- Multi-CVM coordination patterns
- VPC for production-scale deployments

**Stability & Reliability:**
- Expanded test coverage
- Better light client support for blockchain communication
- Build system improvements (Yocto alternatives)
- Enhanced observability and monitoring

**Developer Experience:**
- Improved documentation and contribution guidelines
- Community building and engagement
- Better onboarding materials
- Reference implementations and examples

#### 5. dstack Examples Repository

Andrew highlighted the dstack-examples repo as entry point for contributors:

**Purpose:**
- Starting points and tips for building with dstack
- Application examples (Tor hidden service, Minecraft server)
- Networking utilities (ingress, SSH over gateway)
- Reference implementations for common patterns

**Contribution Path:**
1. Start with application-layer examples in dstack-examples
2. Validate and iterate on patterns
3. Mature implementations can move to core dstack repo

**Design Philosophy:**
- Layered architecture: Base image → KMS → Gateway → Applications
- Each layer optional and replaceable
- Build on top without modifying core components

**Example Criteria:**
- Clear security model and trust assumptions
- Articulated "why" for using TEE
- Reproducible builds preferred (but not required for initial submission)

#### 6. DevOps & Orchestration Tooling

LSDan discussed Flashbots' work on production deployment tooling:

**Focus Areas:**
- VPN-based decentralization and authentication mechanisms
- Ansible playbooks for enterprise deployment orchestration
- Familiar tooling for traditional DevOps teams

**Goals:**
- Bridge gap between dstack's VM deployment and complex orchestration
- Provide enterprise-standard automation patterns
- Handle coordination complexity (blockchain checks, VPN setup, etc.)

**Rationale:**
- Ansible has >50% enterprise market share
- Roles-based approach for modular tasks
- Complements dstack's VM orchestration with app-layer automation

### Technical Discussions

**Trust Models:**
- Distinction between centrally-administered high availability vs. fully decentralized systems
- Current VPC design is centrally administered but can evolve to decentralized governance
- Headscale coordinator could be replaced with redundant, blockchain-controlled servers
- Whitelist management via smart contracts for fully permissionless networks

**Liveness & Availability:**
- Key manager protocol enables stateless node replication
- Many apps share one key manager network
- Encrypted state can use MongoDB replication or strongly consistent databases
- Disk encryption keys managed by KMS for portable encrypted backups

**Cloudflare & MitM Prevention:**
- dstack Gateway runs TLS termination inside TEE
- CAA records prevent certificate issuance outside TEE
- Direct connections bypass Cloudflare proxy
- Custom domains with automated Let's Encrypt certificates

### Community Feedback

**Challenges Identified:**
- Limited engineering resources dedicated to dstack core
- Need for more contributors from broader ecosystem
- Browser verification remains unsolved without extensions
- Documentation and onboarding need improvement

**Strengths Highlighted:**
- Strong architectural foundation with layered design
- Active collaboration between Phala, Flashbots, Secret Labs
- Clear separation of concerns enables independent development
- Growing collection of reference implementations

### Resources Mentioned

- **dstack VPC Repository:** Experimental VPC implementation with examples
- **dstack Examples Repository:** Application and integration examples
- **Private AI Chat Playground:** Real-time attestation verification demo
- **Secret VM:** Alternative confidential VM implementation from Secret Labs

### Action Items

1. **For Contributors:**
   - Explore dstack-examples repository for entry points
   - Submit examples and use cases
   - Join community discussions on GitHub Issues

2. **For Core Team:**
   - Continue security audits
   - Expand documentation and contribution guidelines
   - Develop Kubernetes/orchestration layer
   - Foster ecosystem collaboration

3. **For Ecosystem Partners:**
   - Share learnings across different TE implementations
   - Contribute complementary tooling and patterns
   - Collaborate on standards and interoperability

### Next Call

**Format:** Will include more structured show-and-tell sessions
**Notice:** 48-72 hours advance notice via GitHub and community channels
**Call for Topics:** Submit suggestions via GitHub Issues

---

## How to Participate

### Join Future Calls

- **Watch for announcements:** GitHub Issues and community channels
- **Propose topics:** Open discussion in [GitHub Issues](https://github.com/Dstack-TEE/dstack/issues)
- **Share your work:** Request time to present demos or use cases

### Between Calls

- **TE Cattle Telegram:** Daily discussions and support
- **GitHub Issues:** Technical discussions and feature requests
- **dstack Examples:** Submit PRs with your implementations

### Present at Community Calls

Want to showcase your dstack project or discuss a technical challenge?

1. Open an issue in [GitHub](https://github.com/Dstack-TEE/dstack/issues) with your topic
2. Tag it as "community-call"
3. Provide brief description of what you'd like to discuss

We welcome:
- **Use case demos:** Show what you've built with dstack
- **Technical deep dives:** Architecture patterns, optimizations, integrations
- **Research presentations:** Academic work, novel protocols, security analysis
- **Ecosystem updates:** Related projects, partnerships, integrations

---

## Call Guidelines

### For Presenters

- **Time allocation:** 10-15 minutes per topic
- **Format:** Live demo preferred, slides welcome
- **Preparation:** Share materials 24 hours in advance when possible
- **Recording:** All calls are recorded and published on YouTube

### For Participants

- **Questions:** Use chat for questions during presentations
- **Respect:** Follow [Code of Conduct](https://github.com/Dstack-TEE/dstack/blob/master/CODE_OF_CONDUCT.md)
- **Engagement:** Cameras optional, but encouraged for speakers
- **Follow-up:** Continue discussions in GitHub Issues after call

---

## Archive

All community call recordings are available on YouTube. Summaries and notes are published here after each call.

**Previous Calls:**
- [Call #1 - October 2024](#call-1---october-2024) - VPC Architecture, Browser Verification, Roadmap

---

*For questions about community calls, open an issue on [GitHub](https://github.com/Dstack-TEE/dstack/issues) or reach out in community channels.*
