# Changelog

All notable changes to dstack are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.5] - 2025-10-20

### Added
- Rust implementation of dstack-verifier for improved performance
- Enhanced ext4 filesystem support for Confidential VMs
- Built-in swap configuration for CVMs
- Auto-reconnect feature when Wireguard connections get stuck

### Changed
- Improved gateway registration process on KMS
- SDK updates: Python 0.5.3, JavaScript 0.5.7, Rust 0.1.2

### Components
- KMS v0.5.5
- Gateway v0.5.5
- Verifier v0.5.5

## [0.5.4] - 2025-09-01

### Security
- **Critical Security Update**: Fixed LUKS header validation vulnerability

### Added
- Support for 255+ CPUs on CVMs
- One-shot VM mode for automatic termination after completion
- gRPC support for TLS termination proxy
- Enhanced JavaScript SDK with full browser compatibility
- Rust SDK with Borsh serialization support

### Performance
- Optimized CPU allocation for large-scale deployments
- Improved memory management for high-CPU configurations

## [0.5.3] - 2025-07-15

### Added
- Certificate hot-reloading capability for zero-downtime certificate updates
- Health check endpoints for monitoring and observability
- Configurable TLS versions and cryptography providers
- Option to disable GPU attachment for security-sensitive workloads
- ERC-165 support in KMS AppAuth contract for better smart contract compatibility

### Improved
- TLS configuration flexibility
- Certificate management workflows

## [0.5.2] - 2025-06-04

### Added
- Factory deployment optimization for AppAuth contracts
- Custom KMS/gateway URL support per CVM for multi-cluster deployments
- mr_config_id v2 implementation for enhanced attestation

### Improved
- Contract deployment efficiency
- Multi-tenancy support

## [0.5.1] - 2025-05-29

### Added
- Prometheus metrics API for comprehensive monitoring
- OS image hash verification for supply chain security
- Enhanced observability features

### Removed
- OpenSSL dependency from Rust SDK (replaced with pure Rust implementations)

### Security
- Improved image verification and validation

## [0.5.0] - 2025-05-16

### Added
- dm-verity enabled readonly rootfs for immutable system integrity
- Guest agent API: EmitEvent for application event streaming
- Initial Rust client crate for Rust ecosystem integration

### Security
- Rootfs integrity verification via dm-verity
- Enhanced boot security

### Changed
- Guest agent API expanded with event emission capabilities

## [0.3.3] - 2024-12-19

### Added
- Disk resizing support for running CVMs
- Base image upgrade capability for existing instances without recreation
- vsock-based guest API implementation for improved host-guest communication

### Improved
- Storage management flexibility
- Guest API performance via vsock

## [0.3.0] - 2024-11-15

### Added
- Production-ready TEE deployment system
- Docker container to CVM conversion
- Remote attestation APIs
- Decentralized key management system (KMS)
- Zero-Trust HTTPS (ZT-HTTPS) support
- Multi-language SDK support (Rust, Python, Go, JavaScript)

### Security
- Hardware-level TEE isolation
- Cryptographic attestation
- Client-side encrypted secrets management

---

## Version Support

| Version | Status | Supported Until |
|---------|--------|----------------|
| 0.5.x   | Active | Current |
| 0.3.x   | Legacy | 2025-12-31 |

## Upgrade Notes

### Upgrading to 0.5.x from 0.3.x

**Breaking Changes:**
- mr_config_id v2 format (backwards compatible migration available)
- Rust SDK OpenSSL removal (use native Rust crypto)

**Recommended Actions:**
1. Review security advisories before upgrading
2. Test certificate hot-reloading in staging
3. Update SDK dependencies to latest versions
4. Verify OS image hashes after upgrade

### Security Advisories

For security vulnerabilities and advisories, see:
- [Security Guide](docs/security-guide/security-guide.md)
- [Security Audit Report](docs/security/dstack-audit.pdf)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on submitting changes.

## Links

- [GitHub Repository](https://github.com/Dstack-TEE/dstack)
- [Documentation](https://dstack.info/docs.html)
- [Security Policy](https://github.com/Dstack-TEE/dstack/security/policy)
