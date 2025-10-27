# Blog Posts & Articles

Community articles, guides, and announcements about dstack from Phala Network, Flashbots, and the broader ecosystem.

---

## Official Announcements

### [Phala Announces dstack as a Linux Foundation Project](https://phala.com/posts/dstack-linux-foundation)
**Published:** September 18, 2025

Phala announces dstack's transition to Linux Foundation governance, ensuring independent, community-driven development. The move provides neutral stewardship while Phala continues as a lead contributor. Learn about the strategic reasoning, governance structure, and what this means for the project's future.

**Topics:** Linux Foundation, Governance, Open Source, Community

---

## Technical Deep Dives

### [Detailed Analysis of Phala Cloud's Decentralized Root of Trust, KMS Protocol, and ZKP Enhancement](https://phala.com/posts/detailed-analysis-of-phala-clouds-decentralized-root-of-trust-kms-protocol-and-zkp-enhancement)
**Published:** April 4, 2025

Comprehensive technical analysis of dstack's architecture, including the decentralized root of trust, KMS protocol design, and integration with Zero-Knowledge Proofs. Covers blockchain-based key governance, deterministic key derivation, and performance benchmarks showing overhead below 20% for complex workloads.

**Topics:** Architecture, KMS Protocol, Zero-Knowledge Proofs, Performance, Security

**Key Metrics:**
- 1,000+ teams deployed
- 2,600+ vCPUs in production
- <20% overhead for zkEVMs, ZK-TLS, zkRollups, zkMLs

---

## Platform & Product

### [Phala Cloud: The Next Chapter in Decentralized Confidential Computing](https://phala.com/posts/phala-cloud-the-next-chapter-in-decentralized-confidential-computing)
**Published:** April 1, 2025

Introduction to Phala Cloud, the managed dstack platform. Explains how Phala Cloud abstracts TEE complexity while maintaining the transparency and reproducibility of the open-source dstack SDK. Covers the decentralized node network approach and remote attestation verification.

**Topics:** Phala Cloud, Managed Services, TEE, Decentralization

---

## Tutorials & Guides

### [Zero Trust HTTPS: How to Setup Custom Domains on Phala Cloud](https://phala.com/posts/zero-trust-https-how-to-setup-custom-domains-on-phala-cloud)
**Published:** April 21, 2025

Step-by-step guide to deploying applications with custom domains and automated TLS certificates. Demonstrates dstack-ingress container capabilities, Cloudflare DNS automation, Let's Encrypt integration, and cryptographic proof that certificates are generated within TEE. Shows certificate persistence across redeployments.

**Topics:** Zero-Trust HTTPS, TLS Certificates, Custom Domains, DNS, Attestation

**Learn:** Docker Compose deployment, Environment variables, Certificate management, TEE attestation

---

### [Get Started on Phala Cloud with CLI](https://phala.com/posts/get-started-on-phala-cloud-with-cli)
**Published:** March 26, 2025

Practical guide to the Phala Cloud CLI for deploying and managing confidential applications. Includes examples of remote attestation, key derivation through KMS, and running Jupyter notebooks in CVMs. Features sample code from dstack SDK for testing attestation and cryptographic operations.

**Topics:** CLI, Getting Started, Remote Attestation, Key Management, Python SDK

**Examples:** Ethereum key derivation, Solana key derivation, Jupyter notebooks in TEE

---

## Comparisons & Analysis

### [Phala Cloud vs Azure Confidential Computing: Which Confidential Cloud Fits Your Build?](https://phala.com/posts/Phala-Cloud-vs-Azure)
**Published:** 2025

Comparative analysis of Phala Cloud (built on dstack) versus Azure Confidential Computing. Examines differences in architecture, trust models, decentralization, and use cases. Helps developers understand when dstack's decentralized approach offers advantages over centralized cloud providers.

**Topics:** Comparison, Azure, Confidential Computing, Trust Models, Decentralization

---

## Ecosystem Integrations

### [Phala Network x Primus: Bringing Trustless zkTLS to Life with TEE](https://phala.com/posts/phala-network-x-primus-bringing-trustless-zktls-to-life-with-tee)
**Published:** 2025

Case study of Primus attestors running inside TEE environments using dstack. Demonstrates real-world integration of zkTLS with trusted execution environments for trustless, verifiable TLS proofs. Shows how dstack enables novel cryptographic protocols.

**Topics:** zkTLS, Primus, Integration, Zero-Knowledge, Protocols

---

## Flashbots Community

### [Dstack: Speedrunning a P2P Confidential VM](https://collective.flashbots.net/t/dstack-speedrunning-a-p2p-confidential-vm/3876)
**Published:** September 25, 2024

Prototype for peer-to-peer self-replicating confidential virtual machines (CVMs) designed to streamline deployment and management of TEEs on blockchain networks. Features permissionless onboarding where new nodes post registration messages and provide attestation quotes, with existing nodes verifying credentials before sharing encryption keys. All DCAP quote handling is kept off-chain for low gas costs. The replicatoor key derives TLS certificates enabling HTTPS across all nodes with Certificate Transparency log support.

**Topics:** P2P Networks, Attestation, TLS Certificates, Container Orchestration, Smart Contracts

**Technical Details:** Under 1,000 lines of Python and Bash; supports TDX DCAP attestations with dummy service fallback; includes on-chain SHA256 hash tracking for automatic container reloading

---

### [Modularizing Dstack: SDKs and Default Patterns for Creating P2P CVM Clusters](https://collective.flashbots.net/t/modularizing-dstack-sdks-and-default-patterns-for-creating-p2p-cvm-clusters/4194)
**Published:** December 1, 2024

Introduces a modular library approach for building dstack implementations as an off-chain computation layer using TEEs. Rather than enforcing a single standard, the framework provides empty bundled building blocks that implementors fill based on their specific requirements around encryption, data handling, chain selection, and migration control. Features trait-based abstractions in Rust with swappable components for attestation, cryptography, and chain communication.

**Topics:** Modular Architecture, SDKs, Rust, Design Patterns, Customization

**Components:** dstack-core for standardized interfaces; example "new-york" implementation using x25519 Diffie-Hellman, Stellar communications network, and dummy TDX DCAP

---

### [Replicatoor: Upgrade Controlled Migration Module for Dstack](https://collective.flashbots.net/t/replicatoor-upgrade-controlled-migration-module-for-dstack/4148)
**Published:** November 22, 2024

Minimalist approach for securely migrating and upgrading dstack applications within TEEs. Facilitates transfer of secret state from existing nodes to new nodes during application upgrades through a three-round process: new node prepares request with public key and quote, old node encrypts secure file and validates quote against UpgradeOperator smart contract reference values, and new node decrypts file. Implemented as a 250-line Python module that can be packaged in application containers or as a standalone microservice.

**Topics:** Migration, Upgrades, State Transfer, Smart Contracts, Security

**Implementation:** 250 lines of Python; no special CVM support required; operates without KMS or proxies; includes UpgradeOperator smart contract for quote validation

---

## Additional Resources

### Dynamic NFTs Guide
[Guide: Dynamic NFTs That Evolve](https://phala.com/posts/guide-dynamic-nfts-that-evolve)

While not exclusively about dstack, this guide shows applications built using TEE technology that dstack enables.

---

## Stay Updated

For the latest blog posts and announcements:
- **Phala Blog:** [phala.com/blog](https://phala.com/blog)
- **Flashbots Writings:** [writings.flashbots.net](https://writings.flashbots.net)
- **Flashbots Collective:** [collective.flashbots.net](https://collective.flashbots.net)
- **GitHub Issues:** [github.com/Dstack-TEE/dstack/issues](https://github.com/Dstack-TEE/dstack/issues)
- **Twitter/X:** Follow [@PhalaNetwork](https://twitter.com/PhalaNetwork) and [@FlashbotsFDN](https://twitter.com/FlashbotsFDN) for updates

---

## Write About dstack

Building something with dstack? We'd love to feature your story! Share your blog posts, tutorials, or case studies:
- Open an issue on [GitHub](https://github.com/Dstack-TEE/dstack/issues)
- Submit a PR to the [dstack repository](https://github.com/Dstack-TEE/dstack)
- Tag [@PhalaNetwork](https://twitter.com/PhalaNetwork) on Twitter

---

## Privacy & Terms

All linked content is publicly available on phala.com, flashbots.net, and collective.flashbots.net. Links are provided for educational and reference purposes. For privacy policies and terms:
- Phala Network: [phala.com](https://phala.com)
- Flashbots: [flashbots.net](https://flashbots.net)
