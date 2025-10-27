# Glossary

Technical terms, acronyms, and concepts used throughout dstack documentation.

---

## Core Concepts

### dstack
Open-source SDK for deploying confidential applications in Trusted Execution Environments (TEEs). Transforms Docker containers into verifiable, attestable confidential VMs with blockchain-based key management.

### TEE (Trusted Execution Environment)
Hardware-isolated execution environment that protects code and data from external access, even from privileged system software, cloud providers, or physical access to the host. Examples include Intel TDX, AMD SEV, and ARM TrustZone.

### CVM (Confidential Virtual Machine)
Virtual machine running inside a TEE that provides hardware-level isolation and cryptographic attestation. In dstack, CVMs are created from Docker containers and run applications with strong confidentiality guarantees.

### Attestation
Cryptographic process that proves a CVM is running authentic, unmodified code inside a genuine TEE. Attestation produces a "quote" that can be verified by remote parties to establish trust before sharing secrets.

---

## dstack Components

### dstack-vmm (Virtual Machine Monitor)
Component that manages the lifecycle of CVMs. Handles VM creation, configuration, monitoring, and termination. Formerly called "teepod" in earlier versions.

**Key Functions:**
- Converts Docker containers to CVM images
- Manages VM resources (CPU, memory, storage)
- Provides management APIs for deployment and monitoring

### dstack-gateway
TLS termination proxy and network gateway for CVMs. Routes external traffic to applications running inside CVMs while maintaining Zero-Trust HTTPS guarantees. Formerly called "tproxy" in earlier versions.

**Key Functions:**
- TLS certificate management (Let's Encrypt integration)
- Automatic DNS configuration
- Traffic routing and load balancing
- Certificate attestation proofs

### dstack-kms (Key Management System)
Decentralized key management protocol using blockchain-based governance and deterministic key derivation. Enables CVMs to derive cryptographic keys based on their attested identity without centralized trust.

**Key Functions:**
- Blockchain-based root of trust
- Deterministic key derivation
- App authorization via smart contracts
- Support for multiple blockchain networks

### Guest Agent
Service running inside CVMs that provides the runtime API for applications. Handles key derivation requests, attestation quote generation, event emission, and communication with the host VMM.

---

## Attestation & Security

### Quote
Cryptographically signed attestation report produced by TEE hardware. Contains measurements of the VM's code, configuration, and runtime state. Can be verified by remote parties to establish trust.

### DCAP (Data Center Attestation Primitives)
Intel's framework for attestation in data center environments. Provides the infrastructure for generating and verifying TDX attestation quotes without relying on Intel's online services.

### RTMR (Runtime Measurement Register)
Registers in TDX that accumulate measurements of the VM's boot process and runtime state. Used to cryptographically bind VM identity to its actual code and configuration.

**Key RTMRs in dstack:**
- RTMR[0]: TD firmware measurements
- RTMR[1]: Operating system and bootloader
- RTMR[2]: Application containers and configuration
- RTMR[3]: KMS endpoint and security policies

### MRTD (Measurement Register of TDX Module)
Hash measurement of the Intel TDX module code that provides the TEE isolation. Verifies the authenticity of the TEE implementation itself.

### TCB (Trusted Computing Base)
The set of hardware, firmware, and software components that security depends on. In dstack, the TCB includes the TDX hardware, firmware, kernel, and minimal runtime—explicitly excluding the cloud provider and host OS.

### Root of Trust
The foundational security anchor that all other trust derives from. In dstack, this is decentralized across blockchain networks rather than relying on a single authority or cloud provider.

---

## Cryptography & Protocols

### zkTLS (Zero-Knowledge TLS)
Cryptographic protocol that proves facts about TLS connections without revealing the underlying data. Used in applications like Primus to create verifiable proofs of web data.

### Zero-Trust HTTPS (ZT-HTTPS)
TLS certificate management where certificates are generated inside TEEs with cryptographic proof that the private key has never been exposed. Enables HTTPS without trusting certificate authorities or infrastructure providers.

### KDF (Key Derivation Function)
Cryptographic function that derives keys from a master secret and additional context. dstack uses KDFs to generate application-specific keys based on attested VM identity.

### dm-verity
Linux kernel feature that provides transparent integrity checking of block devices. dstack uses dm-verity for read-only rootfs to ensure the operating system hasn't been tampered with.

### LUKS (Linux Unified Key Setup)
Disk encryption specification used in Linux. dstack validates LUKS headers to ensure encrypted data volumes are properly configured.

---

## Networking & Communication

### vsock (Virtual Socket)
Communication channel between host and guest VMs that bypasses the network stack. dstack uses vsock for efficient host-guest API communication.

### Wireguard
Modern VPN protocol used by dstack for secure networking between CVMs and gateways. Provides encrypted peer-to-peer connections with minimal overhead.

### Port Mapping
Configuration that routes external network traffic to services running inside CVMs. Managed by dstack-gateway and configured via App Compose.

---

## Development & Deployment

### App Compose
JSON or YAML configuration file that defines how to deploy an application in dstack. Specifies containers, environment variables, port mappings, resource requirements, and security policies. Based on Docker Compose with dstack-specific extensions.

### Normalized App Compose
Canonical serialization format for App Compose that produces deterministic hashes. Ensures the same logical configuration always produces the same measurement, critical for attestation and verification.

### App ID
Unique identifier for an application derived from its App Compose configuration. Used for key derivation and access control in the KMS.

### Replicatoor
Migration and upgrade pattern for dstack applications. Enables secure transfer of secrets from old CVMs to new ones during upgrades, validated via attestation quotes and smart contract policies.

---

## Infrastructure Terms

### TDX (Trust Domain Extensions)
Intel's TEE technology that provides hardware-level isolation for virtual machines. Current primary TEE platform supported by dstack.

### QEMU
Open-source machine emulator and virtualizer. dstack uses QEMU with TDX support to run CVMs.

### ACME (Automated Certificate Management Environment)
Protocol for automated certificate issuance and renewal. dstack integrates with Let's Encrypt via ACME for automatic TLS certificates.

### Certificate Transparency (CT)
Public log system for TLS certificates that enables detection of misissued certificates. dstack-gateway publishes certificates to CT logs for passive auditability.

---

## Smart Contracts & Blockchain

### AppAuth Contract
Smart contract that defines which CVMs (by attestation quote) are authorized to access specific cryptographic keys. Acts as access control policy for the decentralized KMS.

### UpgradeOperator Contract
Smart contract used in Replicatoor pattern that validates attestation quotes during application upgrades. Defines which new VMs are authorized to receive secrets from old VMs.

### mr_config_id
Measurement identifier derived from VM configuration. Used in smart contracts to identify and authorize specific VM configurations. Version 2 introduces enhanced format for better compatibility.

---

## Project History & Legacy Terms

### teepod
**Legacy name** for what is now **dstack-vmm**. You may encounter this term in older documentation, forum posts, or changelogs.

### tproxy
**Legacy name** for what is now **dstack-gateway**. You may encounter this term in older documentation, forum posts, or changelogs.

### tappd
**Legacy name** for guest agent components in early versions. Now integrated into the guest agent framework.

---

## Ecosystem & Services

### Phala Cloud
Managed dstack platform operated by Phala Network. Provides hosted infrastructure for running dstack applications without managing your own TEE hardware. Uses the same open-source dstack SDK for reproducibility and transparency.

### Phala Network
Original creator and lead contributor to dstack. Blockchain platform focused on confidential computing and TEE technology.

### Flashbots
Research and development organization working on MEV (Maximal Extractable Value) mitigation and blockchain infrastructure. Active contributor to dstack development and ecosystem.

### Linux Foundation
Neutral open-source governance organization. dstack transitioned to Linux Foundation stewardship in 2025 to ensure independent, community-driven development.

---

## Acronyms Quick Reference

| Acronym | Full Name |
|---------|-----------|
| ACME | Automated Certificate Management Environment |
| CVM | Confidential Virtual Machine |
| DCAP | Data Center Attestation Primitives |
| KDF | Key Derivation Function |
| KMS | Key Management System |
| LUKS | Linux Unified Key Setup |
| MEV | Maximal Extractable Value |
| MRTD | Measurement Register of TDX Module |
| P2P | Peer-to-Peer |
| RTMR | Runtime Measurement Register |
| TCB | Trusted Computing Base |
| TDX | Trust Domain Extensions (Intel) |
| TEE | Trusted Execution Environment |
| VM | Virtual Machine |
| VMM | Virtual Machine Monitor |
| zkTLS | Zero-Knowledge TLS |
| ZT-HTTPS | Zero-Trust HTTPS |

---

## Related Resources

- **[Security Guide](https://github.com/Dstack-TEE/dstack/blob/master/docs/security-guide/security-guide.md)**: Security best practices and threat model
- **[Architecture Overview](https://github.com/Dstack-TEE/dstack/blob/master/CLAUDE.md)**: System architecture documentation
- **[FAQ](https://github.com/Dstack-TEE/dstack/blob/master/docs/faq.md)**: Common questions and troubleshooting

---

## Contributing

Found a term that's missing or unclear? Please contribute:
- Open an issue on [GitHub](https://github.com/Dstack-TEE/dstack/issues)
- Submit a pull request to [dstack repository](https://github.com/Dstack-TEE/dstack)
- Ask questions in [GitHub Issues](https://github.com/Dstack-TEE/dstack/issues)

---

*Last updated: October 2024*
