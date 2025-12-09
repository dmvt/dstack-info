# Server State Reference Document

**Server:** 173.231.234.133
**Snapshot Date:** 2025-12-09
**Purpose:** Reference for comparing tutorial results against known working state

---

## System Information

```
OS: Ubuntu 24.04.3 LTS (Noble Numbat)
Kernel: 6.8.0-1028-intel
CPU: 128 cores
Memory: 1.0 TiB
Disk: 98G (33% used)
```

---

## Running Services

### Systemd Services

| Service | Status | Notes |
|---------|--------|-------|
| `dstack-vmm.service` | enabled, running | VMM on 127.0.0.1:9080 |
| `pccs.service` | enabled, running | PCCS on 127.0.0.1:8081 |
| `qgsd.service` | enabled, running | Quote Generation Service |
| `docker.service` | enabled, running | Docker daemon |

### Docker Containers

| Container | Image | Status | Ports |
|-----------|-------|--------|-------|
| registry | registry:2 | Up | 0.0.0.0:443->443 |
| gramine-sealing-key-provider | key-provider-build-gramine-sealing-key-provider | Up | 127.0.0.1:3443->3443 |
| aesmd | key-provider-build-aesmd | Up | (host network) |

### Port Bindings

| Port | Process | Purpose |
|------|---------|---------|
| 443 | docker-proxy (registry) | Docker registry HTTPS |
| 3443 | docker-proxy (gramine) | Gramine key provider |
| 8081 | node (pccs) | PCCS service |
| 9080 | dstack-vmm | VMM API |
| 9100-9103 | passt.real | CVM port forwarding |

---

## Device Files

### SGX Devices
```
/dev/sgx_enclave   (10, 125) - sgx group
/dev/sgx_provision (10, 126) - sgx_prv group
/dev/sgx_vepc      (10, 124) - sgx group
```

### Groups
```
sgx:x:995:qgsd
sgx_prv:x:1001:qgsd
```

---

## Critical Configuration Files

### VMM Configuration (`/etc/dstack/vmm.toml`)

```toml
workers = 16
max_blocking = 64
ident = "dstack VMM"
address = "127.0.0.1:9080"
kms_url = "http://127.0.0.1:8081"
image_path = "/var/lib/dstack/images"

[cvm]
kms_urls = ["http://127.0.0.1:8081"]
gateway_urls = ["http://127.0.0.1:8082"]
cid_start = 1000
cid_pool_size = 1000
max_allocable_vcpu = 124
max_allocable_memory_in_mb = 1015048

[cvm.networking]
mode = "passt"

[cvm.port_mapping]
enabled = true
address = "127.0.0.1"
range = [{ protocol = "tcp", from = 1, to = 20000 }]

[gateway]
base_domain = "hosted.dstack.info"
port = 8082

[auth]
enabled = true
tokens = ["f32d27e1323d4add9707d8c9f85a199bfba6f74c36a28eb93987a185cc5f204f"]

[key_provider]
enabled = true
address = "127.0.0.1"
port = 3443
```

### PCCS Configuration (`/opt/intel/sgx-dcap-pccs/config/default.json`)

```json
{
    "HTTPS_PORT": 8081,
    "hosts": "127.0.0.1",
    "uri": "https://api.trustedservices.intel.com/sgx/certification/v4/",
    "ApiKey": "fab7491d89a64f40a2ea310d5cf6947b",
    "CachingFillMode": "LAZY"
}
```

**CRITICAL:** The Intel API key must be obtained from Intel's portal.

### VMM Service File (`/etc/systemd/system/dstack-vmm.service`)

```ini
[Unit]
Description=dstack Virtual Machine Monitor
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/dstack-vmm --config /etc/dstack/vmm.toml serve
Restart=always
RestartSec=5
ProtectSystem=strict
ReadWritePaths=/var/run/dstack /var/log/dstack /var/lib/dstack /tmp

[Install]
WantedBy=multi-user.target
```

---

## Directory Structure

### dstack Directories
```
/var/lib/dstack/
├── images/
│   └── dstack-0.5.5/
│       ├── bzImage
│       ├── initramfs.cpio.gz
│       ├── rootfs.img.verity
│       ├── ovmf.fd
│       ├── metadata.json
│       └── sha256sum.txt

/var/run/dstack/
├── supervisor.pid
└── supervisor.sock

/usr/local/bin/
├── dstack-vmm (v0.5.5)
└── dstack-supervisor
```

### Home Directory
```
/home/ubuntu/
├── dstack/                    # Main dstack repo (cloned)
│   ├── key-provider-build/    # Gramine key provider source
│   ├── vmm/                   # VMM CLI tools
│   └── kms/                   # KMS source
├── kms-deployment/            # Original KMS deploy files
├── kms-deploy-v2/             # Fixed KMS deploy files
└── registry-certs/            # Registry SSL certs backup
```

---

## Guest Image Details

**Version:** dstack-0.5.5
**Location:** `/var/lib/dstack/images/dstack-0.5.5/`

```json
{
    "bios": "ovmf.fd",
    "kernel": "bzImage",
    "initrd": "initramfs.cpio.gz",
    "rootfs": "rootfs.img.verity",
    "version": "0.5.5",
    "git_revision": "9932ef470cd648c46f6c01156586a161a78f4308",
    "is_dev": false
}
```

---

## Gramine Key Provider Setup

### Location
`~/dstack/key-provider-build/`

### Docker Compose (`docker-compose.yaml`)
```yaml
services:
  aesmd:
    container_name: aesmd
    build:
      context: .
      dockerfile: Dockerfile.aesmd
    privileged: true
    devices:
      - "/dev/sgx_enclave:/dev/sgx_enclave"
      - "/dev/sgx_provision:/dev/sgx_provision"
    volumes:
      - "./sgx_default_qcnl.conf:/etc/sgx_default_qcnl.conf"
      - "aesmd:/var/run/aesmd/"
    network_mode: "host"

  gramine-sealing-key-provider:
    container_name: gramine-sealing-key-provider
    build:
      context: .
      dockerfile: Dockerfile.key-provider
    privileged: true
    devices:
      - "/dev/sgx_enclave:/dev/sgx_enclave"
      - "/dev/sgx_provision:/dev/sgx_provision"
    depends_on:
      - aesmd
    volumes:
      - "aesmd:/var/run/aesmd/"
    ports:
      - "127.0.0.1:3443:3443"
```

### QCNL Config (`sgx_default_qcnl.conf`)
```json
{
  "pccs_url": "https://127.0.0.1:8081/sgx/certification/v4/",
  "use_secure_cert": false,
  "retry_times": 6,
  "retry_delay": 10
}
```

---

## Docker Registry Setup

### Container Run Command
```bash
docker run -d \
  --name registry \
  --restart always \
  -p 443:443 \
  -v /etc/docker/registry/certs:/certs:ro \
  -v /var/lib/registry:/var/lib/registry \
  -e REGISTRY_HTTP_ADDR=0.0.0.0:443 \
  -e REGISTRY_HTTP_TLS_CERTIFICATE=/certs/fullchain.pem \
  -e REGISTRY_HTTP_TLS_KEY=/certs/privkey.pem \
  registry:2
```

### SSL Certificates
```
Source: /etc/letsencrypt/live/registry.hosted.dstack.info/
Copied to: /etc/docker/registry/certs/
  - fullchain.pem
  - privkey.pem
Expiry: Mar 8 2026
```

### Cached Images
```
registry.hosted.dstack.info/dstack-kms:latest
registry.hosted.dstack.info/dstack-kms:fixed
```

---

## KMS CVM Deployment (Working Recipe)

### Fixed Image Build (`~/kms-deploy-v2/`)

**Dockerfile:**
```dockerfile
FROM registry.hosted.dstack.info/dstack-kms:latest
COPY auth-eth.env /etc/kms/auth-eth.env
```

**auth-eth.env (CRITICAL FIX):**
```bash
HOST=127.0.0.1
PORT=9200
ETH_RPC_URL=https://ethereum-sepolia.publicnode.com  # NOT Alchemy!
KMS_CONTRACT_ADDR=0xe6c23bfE4686E28DcDA15A1996B1c0C549656E26
```

**docker-compose.yaml:**
```yaml
services:
  kms:
    image: registry.hosted.dstack.info/dstack-kms:fixed
    ports:
      - "9100:9100"
    volumes:
      - /var/run/dstack.sock:/var/run/dstack.sock
      - kms-certs:/etc/kms/certs
    environment:
      - RUST_LOG=info
      - KMS_DOMAIN=kms.hosted.dstack.info
    restart: unless-stopped
volumes:
  kms-certs:
```

### Deployment Commands
```bash
cd ~/dstack/vmm

# Generate app-compose.json
./vmm-cli.py --url http://127.0.0.1:9080 compose \
  --name kms-fixed2 \
  --docker-compose ~/kms-deploy-v2/docker-compose.yaml \
  --local-key-provider \
  --output ~/kms-deploy-v2/app-compose.json

# Deploy CVM
./vmm-cli.py --url http://127.0.0.1:9080 deploy \
  --name kms-fixed2 \
  --image dstack-0.5.5 \
  --compose ~/kms-deploy-v2/app-compose.json \
  --vcpu 2 \
  --memory 4096 \
  --disk 20 \
  --port tcp:127.0.0.1:9103:9100
```

### Working KMS Endpoint
```bash
curl -sk https://127.0.0.1:9103/prpc/KMS.GetMeta
# Response time: < 0.25 seconds
```

---

## Installed Packages (Key)

### Intel/SGX/TDX Packages
```
libsgx-ae-id-enclave
libsgx-ae-pce
libsgx-ae-tdqe
libsgx-dcap-default-qpl
libsgx-enclave-common1
libsgx-pce-logic1
libsgx-tdx-logic1
libsgx-urts2
linux-image-6.8.0-1028-intel
linux-modules-6.8.0-1028-intel
linux-modules-extra-6.8.0-1028-intel
ovmf (2024.02-3+tdx1.0)
qemu-* (2:8.2.2+ds-0ubuntu1.4+tdx1.1)
libvirt-* (10.0.0-2ubuntu8.3+tdx1.2)
```

---

## Known Issues and Fixes

### Issue 1: GetMeta Hangs
**Symptom:** `curl` to KMS GetMeta hangs indefinitely
**Root Cause:** Default image uses `https://eth-sepolia.g.alchemy.com/v2/demo` which returns HTTP 429 (rate limited)
**Fix:** Build custom image with `ETH_RPC_URL=https://ethereum-sepolia.publicnode.com`

### Issue 2: CVM Hangs at Time Sync
**Symptom:** CVM boot log shows "Waiting for the system time to be synchronized"
**Root Cause:** `--secure-time` flag was used
**Fix:** Deploy without `--secure-time` flag

### Issue 3: VMM CLI Connection Refused
**Symptom:** `ConnectionRefusedError` when using vmm-cli.py
**Fix:** Use `--url http://127.0.0.1:9080` flag explicitly

---

## Verification Commands

### Check SGX Devices
```bash
ls -la /dev/sgx*
```

### Check Services
```bash
systemctl status dstack-vmm pccs qgsd
```

### Check Docker Containers
```bash
docker ps | grep -E "(registry|gramine|aesmd)"
```

### Check Key Provider
```bash
curl -sk https://127.0.0.1:3443/ 2>&1 | head -5
```

### Check Registry
```bash
curl -sk https://registry.hosted.dstack.info/v2/_catalog
```

### Check PCCS
```bash
curl -sk https://127.0.0.1:8081/sgx/certification/v4/rootcacrl | head -c 100
```

### Check KMS
```bash
time curl -sk https://127.0.0.1:9103/prpc/KMS.GetMeta | head -c 200
```

---

## Contract Addresses (Sepolia Testnet)

```
KMS Contract: 0xe6c23bfE4686E28DcDA15A1996B1c0C549656E26
App Auth Implementation: 0xc308574F9A0c7d144d7AD887785D25C386D32B54
Chain ID: 11155111 (Sepolia)
```

---

## Critical Secrets (Locations Only)

| Secret | Location |
|--------|----------|
| Intel PCCS API Key | `/opt/intel/sgx-dcap-pccs/config/default.json` |
| VMM Auth Token | `/etc/dstack/vmm.toml` |
| Registry SSL Certs | `/etc/docker/registry/certs/` |

---

## Network Configuration

**Primary Public IP:** 173.231.234.133
**Firewall:** Inactive (ufw)
**DNS Domain:** hosted.dstack.info

---

## Comparison Checklist

When redeploying, verify these match:

- [ ] Kernel is `6.8.0-1028-intel` or newer TDX kernel
- [ ] SGX devices exist (`/dev/sgx_enclave`, `/dev/sgx_provision`, `/dev/sgx_vepc`)
- [ ] PCCS has Intel API key configured
- [ ] QGSD service is running
- [ ] Gramine key provider running on 127.0.0.1:3443
- [ ] Registry running on 443 with valid SSL
- [ ] VMM running on 127.0.0.1:9080
- [ ] Guest image `dstack-0.5.5` exists in `/var/lib/dstack/images/`
- [ ] KMS image uses PublicNode RPC (not Alchemy)
- [ ] KMS deploys with `--local-key-provider` flag
- [ ] KMS deploys WITHOUT `--secure-time` flag
