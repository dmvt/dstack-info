```
root@fervent-heron:~# cd /root/tdx
root@fervent-heron:~/tdx# vi setup-tdx-config
root@fervent-heron:~/tdx# ./setup-tdx-host.sh
Get:1 http://security.ubuntu.com/ubuntu noble-security InRelease [126 kB]
Hit:2 http://archive.ubuntu.com/ubuntu noble InRelease                                                                                           
Get:3 http://security.ubuntu.com/ubuntu noble-security/main amd64 Components [21.5 kB]                          
Get:4 http://security.ubuntu.com/ubuntu noble-security/universe amd64 Components [52.3 kB]         
Get:5 http://security.ubuntu.com/ubuntu noble-security/restricted amd64 Components [212 B]
Get:6 http://security.ubuntu.com/ubuntu noble-security/multiverse amd64 Components [208 B]
Get:7 http://archive.ubuntu.com/ubuntu noble-updates InRelease [126 kB]             
Hit:8 https://ppa.launchpadcontent.net/kobuk-team/tdx-release/ubuntu noble InRelease
Get:9 http://archive.ubuntu.com/ubuntu noble-backports InRelease [126 kB]
Get:10 http://archive.ubuntu.com/ubuntu noble-updates/main amd64 Packages [1573 kB]
Get:11 http://archive.ubuntu.com/ubuntu noble-updates/main amd64 Components [175 kB]
Get:12 http://archive.ubuntu.com/ubuntu noble-updates/universe amd64 Packages [1498 kB]
Get:13 http://archive.ubuntu.com/ubuntu noble-updates/universe amd64 Components [378 kB]
Get:14 http://archive.ubuntu.com/ubuntu noble-updates/restricted amd64 Components [212 B]
Get:15 http://archive.ubuntu.com/ubuntu noble-updates/multiverse amd64 Components [940 B]
Get:16 http://archive.ubuntu.com/ubuntu noble-backports/main amd64 Components [7144 B]
Get:17 http://archive.ubuntu.com/ubuntu noble-backports/universe amd64 Components [11.0 kB]
Get:18 http://archive.ubuntu.com/ubuntu noble-backports/restricted amd64 Components [216 B]
Get:19 http://archive.ubuntu.com/ubuntu noble-backports/multiverse amd64 Components [212 B]
Fetched 4097 kB in 2s (2657 kB/s)                                 
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
66 packages can be upgraded. Run 'apt list --upgradable' to see them.
PPA publishes dbgsym, you may need to include 'main/debug' component
Repository: 'Types: deb
URIs: https://ppa.launchpadcontent.net/kobuk-team/tdx-release/ubuntu/
Suites: noble
Components: main
'
Description:
This package archive contains required components to enable TDX for both host and guest VM.
TDX is a Intel hardware solution for Confidential Computing.
To get an introduction on TDX, you can visit the link: https://cdrdv2.intel.com/v1/dl/getContent/690419

The current supported Ubuntu series are:
  - Ubuntu 25.04 (Plucky)
  - Ubuntu 24.04 (Noble)

No longer supported:
  - Ubuntu 24.10 (Oracular)
  - Ubuntu 23.10 (Mantic)

For installation instructions, please visit : https://github.com/canonical/tdx
More info: https://launchpad.net/~kobuk-team/+archive/ubuntu/tdx-release
Adding repository.
Found existing deb entry in /etc/apt/sources.list.d/kobuk-team-ubuntu-tdx-release-noble.sources
Hit:1 http://archive.ubuntu.com/ubuntu noble InRelease
Hit:2 http://archive.ubuntu.com/ubuntu noble-updates InRelease                                                                         
Hit:3 http://archive.ubuntu.com/ubuntu noble-backports InRelease                                                                       
Hit:4 http://security.ubuntu.com/ubuntu noble-security InRelease                                                 
Hit:5 https://ppa.launchpadcontent.net/kobuk-team/tdx-release/ubuntu noble InRelease
Reading package lists... Done
Package: *
Pin: release o=LP-PPA-kobuk-team-tdx-release
Pin-Priority: 4000
Unattended-Upgrade::Allowed-Origins {
  "LP-PPA-kobuk-team-tdx-release:noble";
};
Unattended-Upgrade::Allow-downgrade "true";
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
linux-image-intel is already the newest version (6.8.0-1028.35).
qemu-system-x86 is already the newest version (2:8.2.2+ds-0ubuntu1.4+tdx1.1).
libvirt-daemon-system is already the newest version (10.0.0-2ubuntu8.3+tdx1.2).
libvirt-clients is already the newest version (10.0.0-2ubuntu8.3+tdx1.2).
ovmf is already the newest version (2024.02-3+tdx1.0).
The following packages were automatically installed and are no longer required:
  linux-headers-6.8.0-57 linux-headers-6.8.0-57-generic linux-image-6.8.0-57-generic linux-modules-6.8.0-57-generic linux-tools-6.8.0-57
  linux-tools-6.8.0-57-generic
Use 'apt autoremove' to remove them.
0 upgraded, 0 newly installed, 0 to remove and 66 not upgraded.
Sourcing file `/etc/default/grub'
Sourcing file `/etc/default/grub.d/50-cloudimg-settings.cfg'
Sourcing file `/etc/default/grub.d/99-tdx-kernel.cfg'
Generating grub configuration file ...
Found linux image: /boot/vmlinuz-6.8.0-1028-intel
Found initrd image: /boot/initrd.img-6.8.0-1028-intel
Found linux image: /boot/vmlinuz-6.8.0-86-generic
Found initrd image: /boot/initrd.img-6.8.0-86-generic
Found linux image: /boot/vmlinuz-6.8.0-57-generic
Found initrd image: /boot/initrd.img-6.8.0-57-generic
Warning: os-prober will not be executed to detect other bootable partitions.
Systems on them will not be added to the GRUB boot configuration.
Check GRUB_DISABLE_OS_PROBER documentation entry.
Adding boot menu entry for UEFI Firmware Settings ...
done
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
linux-modules-extra-6.8.0-1028-intel is already the newest version (6.8.0-1028.35).
The following packages were automatically installed and are no longer required:
  linux-headers-6.8.0-57 linux-headers-6.8.0-57-generic linux-image-6.8.0-57-generic linux-modules-6.8.0-57-generic linux-tools-6.8.0-57
  linux-tools-6.8.0-57-generic
Use 'apt autoremove' to remove them.
0 upgraded, 0 newly installed, 0 to remove and 66 not upgraded.
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
software-properties-common is already the newest version (0.99.49.3).
The following packages were automatically installed and are no longer required:
  linux-headers-6.8.0-57 linux-headers-6.8.0-57-generic linux-image-6.8.0-57-generic linux-modules-6.8.0-57-generic linux-tools-6.8.0-57
  linux-tools-6.8.0-57-generic
Use 'apt autoremove' to remove them.
0 upgraded, 0 newly installed, 0 to remove and 66 not upgraded.
PPA publishes dbgsym, you may need to include 'main/debug' component
Repository: 'Types: deb
URIs: https://ppa.launchpadcontent.net/kobuk-team/tdx-attestation-release/ubuntu/
Suites: noble
Components: main
'
Description:
This package archive contains required components to enable TDX attestation for both host and guest VM.
TDX is a Intel hardware solution for Confidential Computing.
To get an introduction on TDX, you can visit the link: https://cdrdv2.intel.com/v1/dl/getContent/690419

The current supported Ubuntu series are:
  - Ubuntu 24.10 (Oracular)
  - Ubuntu 24.04 (Noble)

No longer supported:
  - Ubuntu 23.10 (Mantic)

For detailed instructions, please visit : https://github.com/canonical/tdx
More info: https://launchpad.net/~kobuk-team/+archive/ubuntu/tdx-attestation-release
Adding repository.
Hit:1 http://security.ubuntu.com/ubuntu noble-security InRelease
Hit:2 http://archive.ubuntu.com/ubuntu noble InRelease                                                          
Hit:3 http://archive.ubuntu.com/ubuntu noble-updates InRelease                   
Hit:4 http://archive.ubuntu.com/ubuntu noble-backports InRelease
Get:5 https://ppa.launchpadcontent.net/kobuk-team/tdx-attestation-release/ubuntu noble InRelease [24.1 kB]
Hit:6 https://ppa.launchpadcontent.net/kobuk-team/tdx-release/ubuntu noble InRelease
Get:7 https://ppa.launchpadcontent.net/kobuk-team/tdx-attestation-release/ubuntu noble/main amd64 Packages [4236 B]
Get:8 https://ppa.launchpadcontent.net/kobuk-team/tdx-attestation-release/ubuntu noble/main Translation-en [2412 B]
Fetched 30.8 kB in 1s (42.7 kB/s)         
Reading package lists... Done
Package: *
Pin: release o=LP-PPA-kobuk-team-tdx-attestation-release
Pin-Priority: 4000
Unattended-Upgrade::Allowed-Origins {
  "LP-PPA-kobuk-team-tdx-attestation-release:noble";
};
Unattended-Upgrade::Allow-downgrade "true";
Hit:1 http://security.ubuntu.com/ubuntu noble-security InRelease
Hit:2 https://ppa.launchpadcontent.net/kobuk-team/tdx-attestation-release/ubuntu noble InRelease             
Hit:3 http://archive.ubuntu.com/ubuntu noble InRelease                      
Hit:4 https://ppa.launchpadcontent.net/kobuk-team/tdx-release/ubuntu noble InRelease
Hit:5 http://archive.ubuntu.com/ubuntu noble-updates InRelease
Hit:6 http://archive.ubuntu.com/ubuntu noble-backports InRelease
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
66 packages can be upgraded. Run 'apt list --upgradable' to see them.
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
The following packages were automatically installed and are no longer required:
  linux-headers-6.8.0-57 linux-headers-6.8.0-57-generic linux-image-6.8.0-57-generic linux-modules-6.8.0-57-generic linux-tools-6.8.0-57
  linux-tools-6.8.0-57-generic
Use 'apt autoremove' to remove them.
The following additional packages will be installed:
  cracklib-runtime libcares2 libcrack2 libnode109 libsgx-ae-id-enclave libsgx-ae-pce libsgx-ae-tdqe libsgx-enclave-common1 libsgx-pce-logic1 libsgx-tdx-logic1
  libsgx-urts2 node-acorn node-busboy node-cjs-module-lexer node-undici node-xtend nodejs nodejs-doc sgx-setup wamerican
Suggested packages:
  npm
The following NEW packages will be installed:
  cracklib-runtime libcares2 libcrack2 libnode109 libsgx-ae-id-enclave libsgx-ae-pce libsgx-ae-tdqe libsgx-enclave-common1 libsgx-pce-logic1 libsgx-tdx-logic1
  libsgx-urts2 node-acorn node-busboy node-cjs-module-lexer node-undici node-xtend nodejs nodejs-doc sgx-dcap-pccs sgx-setup tdx-qgs wamerican
0 upgraded, 22 newly installed, 0 to remove and 66 not upgraded.
Need to get 30.0 MB of archives.
After this operation, 140 MB of additional disk space will be used.
Get:1 http://archive.ubuntu.com/ubuntu noble/main amd64 libcrack2 amd64 2.9.6-5.1build2 [29.0 kB]
Get:2 http://archive.ubuntu.com/ubuntu noble/main amd64 cracklib-runtime amd64 2.9.6-5.1build2 [147 kB]
Get:3 http://archive.ubuntu.com/ubuntu noble/main amd64 libcares2 amd64 1.27.0-1.0ubuntu1 [73.7 kB]
Get:4 http://archive.ubuntu.com/ubuntu noble/universe amd64 node-xtend all 4.0.2-3 [3902 B]  
Get:5 http://archive.ubuntu.com/ubuntu noble/universe amd64 nodejs amd64 18.19.1+dfsg-6ubuntu5 [306 kB]
Get:6 http://archive.ubuntu.com/ubuntu noble/universe amd64 node-acorn all 8.8.1+ds+~cs25.17.7-2 [115 kB]
Get:7 http://archive.ubuntu.com/ubuntu noble/universe amd64 node-cjs-module-lexer all 1.2.3+dfsg-1 [32.1 kB]
Get:8 http://archive.ubuntu.com/ubuntu noble/universe amd64 node-busboy all 1.6.0+~cs2.6.0-2 [17.3 kB]  
Get:9 http://archive.ubuntu.com/ubuntu noble/universe amd64 node-undici all 5.26.3+dfsg1+~cs23.10.12-2 [325 kB]
Get:10 http://archive.ubuntu.com/ubuntu noble/universe amd64 libnode109 amd64 18.19.1+dfsg-6ubuntu5 [11.6 MB]
Get:11 http://archive.ubuntu.com/ubuntu noble/universe amd64 nodejs-doc all 18.19.1+dfsg-6ubuntu5 [3552 kB]
Get:12 http://archive.ubuntu.com/ubuntu noble/main amd64 wamerican all 2020.12.07-2 [236 kB]   
Get:13 https://ppa.launchpadcontent.net/kobuk-team/tdx-attestation-release/ubuntu noble/main amd64 libsgx-ae-id-enclave amd64 1.21-0ubuntu2.2 [80.4 kB]
Get:14 https://ppa.launchpadcontent.net/kobuk-team/tdx-attestation-release/ubuntu noble/main amd64 libsgx-ae-pce amd64 1.21-0ubuntu2.2 [863 kB]
Get:15 https://ppa.launchpadcontent.net/kobuk-team/tdx-attestation-release/ubuntu noble/main amd64 libsgx-ae-tdqe amd64 1.21-0ubuntu2.2 [888 kB]
Get:16 https://ppa.launchpadcontent.net/kobuk-team/tdx-attestation-release/ubuntu noble/main amd64 libsgx-enclave-common1 amd64 2.23.100.2-0ubuntu1 [19.6 kB]
Get:17 https://ppa.launchpadcontent.net/kobuk-team/tdx-attestation-release/ubuntu noble/main amd64 libsgx-urts2 amd64 2.23.100.2-0ubuntu1 [55.8 kB]
Get:18 https://ppa.launchpadcontent.net/kobuk-team/tdx-attestation-release/ubuntu noble/main amd64 libsgx-pce-logic1 amd64 1.21-0ubuntu2.2 [9116 B]
Get:19 https://ppa.launchpadcontent.net/kobuk-team/tdx-attestation-release/ubuntu noble/main amd64 libsgx-tdx-logic1 amd64 1.21-0ubuntu2.2 [20.0 kB]
Get:20 https://ppa.launchpadcontent.net/kobuk-team/tdx-attestation-release/ubuntu noble/main amd64 sgx-dcap-pccs amd64 1.21-0ubuntu1 [11.5 MB]
Get:21 https://ppa.launchpadcontent.net/kobuk-team/tdx-attestation-release/ubuntu noble/main amd64 sgx-setup amd64 2.23.100.2-0ubuntu1 [1822 B]                      
Get:22 https://ppa.launchpadcontent.net/kobuk-team/tdx-attestation-release/ubuntu noble/main amd64 tdx-qgs amd64 1.21-0ubuntu2.2 [79.8 kB]                           
Fetched 30.0 MB in 22s (1347 kB/s)                                                                                                                                   
Preconfiguring packages ...
Selecting previously unselected package libcrack2:amd64.
(Reading database ... 135768 files and directories currently installed.)
Preparing to unpack .../00-libcrack2_2.9.6-5.1build2_amd64.deb ...
Unpacking libcrack2:amd64 (2.9.6-5.1build2) ...
Selecting previously unselected package cracklib-runtime.
Preparing to unpack .../01-cracklib-runtime_2.9.6-5.1build2_amd64.deb ...
Unpacking cracklib-runtime (2.9.6-5.1build2) ...
Selecting previously unselected package libcares2:amd64.
Preparing to unpack .../02-libcares2_1.27.0-1.0ubuntu1_amd64.deb ...
Unpacking libcares2:amd64 (1.27.0-1.0ubuntu1) ...
Selecting previously unselected package node-xtend.
Preparing to unpack .../03-node-xtend_4.0.2-3_all.deb ...
Unpacking node-xtend (4.0.2-3) ...
Selecting previously unselected package nodejs.
Preparing to unpack .../04-nodejs_18.19.1+dfsg-6ubuntu5_amd64.deb ...
Unpacking nodejs (18.19.1+dfsg-6ubuntu5) ...
Selecting previously unselected package node-acorn.
Preparing to unpack .../05-node-acorn_8.8.1+ds+~cs25.17.7-2_all.deb ...
Unpacking node-acorn (8.8.1+ds+~cs25.17.7-2) ...
Selecting previously unselected package node-cjs-module-lexer.
Preparing to unpack .../06-node-cjs-module-lexer_1.2.3+dfsg-1_all.deb ...
Unpacking node-cjs-module-lexer (1.2.3+dfsg-1) ...
Selecting previously unselected package node-busboy.
Preparing to unpack .../07-node-busboy_1.6.0+~cs2.6.0-2_all.deb ...
Unpacking node-busboy (1.6.0+~cs2.6.0-2) ...
Selecting previously unselected package node-undici.
Preparing to unpack .../08-node-undici_5.26.3+dfsg1+~cs23.10.12-2_all.deb ...
Unpacking node-undici (5.26.3+dfsg1+~cs23.10.12-2) ...
Selecting previously unselected package libnode109:amd64.
Preparing to unpack .../09-libnode109_18.19.1+dfsg-6ubuntu5_amd64.deb ...
Unpacking libnode109:amd64 (18.19.1+dfsg-6ubuntu5) ...
Selecting previously unselected package libsgx-ae-id-enclave.
Preparing to unpack .../10-libsgx-ae-id-enclave_1.21-0ubuntu2.2_amd64.deb ...
Unpacking libsgx-ae-id-enclave (1.21-0ubuntu2.2) ...
Selecting previously unselected package libsgx-ae-pce.
Preparing to unpack .../11-libsgx-ae-pce_1.21-0ubuntu2.2_amd64.deb ...
Unpacking libsgx-ae-pce (1.21-0ubuntu2.2) ...
Selecting previously unselected package libsgx-ae-tdqe.
Preparing to unpack .../12-libsgx-ae-tdqe_1.21-0ubuntu2.2_amd64.deb ...
Unpacking libsgx-ae-tdqe (1.21-0ubuntu2.2) ...
Selecting previously unselected package libsgx-enclave-common1.
Preparing to unpack .../13-libsgx-enclave-common1_2.23.100.2-0ubuntu1_amd64.deb ...
Unpacking libsgx-enclave-common1 (2.23.100.2-0ubuntu1) ...
Selecting previously unselected package libsgx-urts2.
Preparing to unpack .../14-libsgx-urts2_2.23.100.2-0ubuntu1_amd64.deb ...
Unpacking libsgx-urts2 (2.23.100.2-0ubuntu1) ...
Selecting previously unselected package libsgx-pce-logic1.
Preparing to unpack .../15-libsgx-pce-logic1_1.21-0ubuntu2.2_amd64.deb ...
Unpacking libsgx-pce-logic1 (1.21-0ubuntu2.2) ...
Selecting previously unselected package libsgx-tdx-logic1.
Preparing to unpack .../16-libsgx-tdx-logic1_1.21-0ubuntu2.2_amd64.deb ...
Unpacking libsgx-tdx-logic1 (1.21-0ubuntu2.2) ...
Selecting previously unselected package nodejs-doc.
Preparing to unpack .../17-nodejs-doc_18.19.1+dfsg-6ubuntu5_all.deb ...
Unpacking nodejs-doc (18.19.1+dfsg-6ubuntu5) ...
Selecting previously unselected package sgx-dcap-pccs.
Preparing to unpack .../18-sgx-dcap-pccs_1.21-0ubuntu1_amd64.deb ...
Unpacking sgx-dcap-pccs (1.21-0ubuntu1) ...
Selecting previously unselected package sgx-setup.
Preparing to unpack .../19-sgx-setup_2.23.100.2-0ubuntu1_amd64.deb ...
Unpacking sgx-setup (2.23.100.2-0ubuntu1) ...
Selecting previously unselected package tdx-qgs.
Preparing to unpack .../20-tdx-qgs_1.21-0ubuntu2.2_amd64.deb ...
Unpacking tdx-qgs (1.21-0ubuntu2.2) ...
Selecting previously unselected package wamerican.
Preparing to unpack .../21-wamerican_2020.12.07-2_all.deb ...
Unpacking wamerican (2020.12.07-2) ...
Setting up sgx-setup (2.23.100.2-0ubuntu1) ...
Setting up libsgx-ae-tdqe (1.21-0ubuntu2.2) ...
Setting up node-cjs-module-lexer (1.2.3+dfsg-1) ...
Setting up libsgx-ae-id-enclave (1.21-0ubuntu2.2) ...
Setting up wamerican (2020.12.07-2) ...
Setting up libcares2:amd64 (1.27.0-1.0ubuntu1) ...
Setting up libcrack2:amd64 (2.9.6-5.1build2) ...
Setting up nodejs-doc (18.19.1+dfsg-6ubuntu5) ...
Setting up libsgx-enclave-common1 (2.23.100.2-0ubuntu1) ...
Setting up node-xtend (4.0.2-3) ...
Setting up libsgx-ae-pce (1.21-0ubuntu2.2) ...
Setting up node-busboy (1.6.0+~cs2.6.0-2) ...
Setting up libsgx-urts2 (2.23.100.2-0ubuntu1) ...
Setting up cracklib-runtime (2.9.6-5.1build2) ...
Setting up node-undici (5.26.3+dfsg1+~cs23.10.12-2) ...
Setting up libsgx-pce-logic1 (1.21-0ubuntu2.2) ...
Setting up libsgx-tdx-logic1 (1.21-0ubuntu2.2) ...
Setting up tdx-qgs (1.21-0ubuntu2.2) ...
Created symlink /etc/systemd/system/multi-user.target.wants/qgsd.service → /usr/lib/systemd/system/qgsd.service.
Setting up node-acorn (8.8.1+ds+~cs25.17.7-2) ...
Setting up libnode109:amd64 (18.19.1+dfsg-6ubuntu5) ...
Setting up nodejs (18.19.1+dfsg-6ubuntu5) ...
update-alternatives: using /usr/bin/nodejs to provide /usr/bin/js (js) in auto mode
Setting up sgx-dcap-pccs (1.21-0ubuntu1) ...
Created symlink /etc/systemd/system/multi-user.target.wants/pccs.service → /usr/lib/systemd/system/pccs.service.
Processing triggers for man-db (2.12.0-4build2) ...
Processing triggers for libc-bin (2.39-0ubuntu8.6) ...
Scanning processes...                                                                                                                                                 
Scanning processor microcode...                                                                                                                                       
Scanning linux images...                                                                                                                                              

Running kernel seems to be up-to-date.

The processor microcode seems to be up-to-date.

No services need to be restarted.

No containers need to be restarted.

No user sessions are running outdated binaries.

No VM guests are running outdated hypervisor (qemu) binaries on this host.
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
The following packages were automatically installed and are no longer required:
  linux-headers-6.8.0-57 linux-headers-6.8.0-57-generic linux-image-6.8.0-57-generic linux-modules-6.8.0-57-generic linux-tools-6.8.0-57
  linux-tools-6.8.0-57-generic
Use 'apt autoremove' to remove them.
The following NEW packages will be installed:
  libsgx-dcap-default-qpl
0 upgraded, 1 newly installed, 0 to remove and 66 not upgraded.
Need to get 1209 kB of archives.
After this operation, 3525 kB of additional disk space will be used.
Get:1 https://ppa.launchpadcontent.net/kobuk-team/tdx-attestation-release/ubuntu noble/main amd64 libsgx-dcap-default-qpl amd64 1.21-0ubuntu2.2 [1209 kB]
Fetched 1209 kB in 2s (490 kB/s)                  
Selecting previously unselected package libsgx-dcap-default-qpl.
(Reading database ... 146238 files and directories currently installed.)
Preparing to unpack .../libsgx-dcap-default-qpl_1.21-0ubuntu2.2_amd64.deb ...
Unpacking libsgx-dcap-default-qpl (1.21-0ubuntu2.2) ...
Setting up libsgx-dcap-default-qpl (1.21-0ubuntu2.2) ...
Processing triggers for libc-bin (2.39-0ubuntu8.6) ...
Scanning processes...                                                                                                                                                 
Scanning processor microcode...                                                                                                                                       
Scanning linux images...                                                                                                                                              

Running kernel seems to be up-to-date.

The processor microcode seems to be up-to-date.

No services need to be restarted.

No containers need to be restarted.

No user sessions are running outdated binaries.

No VM guests are running outdated hypervisor (qemu) binaries on this host.
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
The following packages were automatically installed and are no longer required:
  linux-headers-6.8.0-57 linux-headers-6.8.0-57-generic linux-image-6.8.0-57-generic linux-modules-6.8.0-57-generic linux-tools-6.8.0-57
  linux-tools-6.8.0-57-generic
Use 'apt autoremove' to remove them.
The following additional packages will be installed:
  libmpa-network1 libmpa-uefi1
The following NEW packages will be installed:
  libmpa-network1 libmpa-uefi1 sgx-ra-service
0 upgraded, 3 newly installed, 0 to remove and 66 not upgraded.
Need to get 50.6 kB of archives.
After this operation, 193 kB of additional disk space will be used.
Get:1 https://ppa.launchpadcontent.net/kobuk-team/tdx-attestation-release/ubuntu noble/main amd64 libmpa-network1 amd64 1.21-0ubuntu2.2 [14.0 kB]
Get:2 https://ppa.launchpadcontent.net/kobuk-team/tdx-attestation-release/ubuntu noble/main amd64 libmpa-uefi1 amd64 1.21-0ubuntu2.2 [12.9 kB]
Get:3 https://ppa.launchpadcontent.net/kobuk-team/tdx-attestation-release/ubuntu noble/main amd64 sgx-ra-service amd64 1.21-0ubuntu2.2 [23.8 kB]
Fetched 50.6 kB in 1s (76.1 kB/s)         
Selecting previously unselected package libmpa-network1.
(Reading database ... 146246 files and directories currently installed.)
Preparing to unpack .../libmpa-network1_1.21-0ubuntu2.2_amd64.deb ...
Unpacking libmpa-network1 (1.21-0ubuntu2.2) ...
Selecting previously unselected package libmpa-uefi1.
Preparing to unpack .../libmpa-uefi1_1.21-0ubuntu2.2_amd64.deb ...
Unpacking libmpa-uefi1 (1.21-0ubuntu2.2) ...
Selecting previously unselected package sgx-ra-service.
Preparing to unpack .../sgx-ra-service_1.21-0ubuntu2.2_amd64.deb ...
Unpacking sgx-ra-service (1.21-0ubuntu2.2) ...
Setting up libmpa-uefi1 (1.21-0ubuntu2.2) ...
Setting up libmpa-network1 (1.21-0ubuntu2.2) ...
Setting up sgx-ra-service (1.21-0ubuntu2.2) ...
Created symlink /etc/systemd/system/multi-user.target.wants/mpa_registration_tool.service → /usr/lib/systemd/system/mpa_registration_tool.service.
Processing triggers for libc-bin (2.39-0ubuntu8.6) ...
Scanning processes...                                                                                                                                                 
Scanning processor microcode...                                                                                                                                       
Scanning linux images...                                                                                                                                              

Running kernel seems to be up-to-date.

The processor microcode seems to be up-to-date.

No services need to be restarted.

No containers need to be restarted.

No user sessions are running outdated binaries.

No VM guests are running outdated hypervisor (qemu) binaries on this host.
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
The following packages were automatically installed and are no longer required:
  linux-headers-6.8.0-57 linux-headers-6.8.0-57-generic linux-image-6.8.0-57-generic linux-modules-6.8.0-57-generic linux-tools-6.8.0-57
  linux-tools-6.8.0-57-generic
Use 'apt autoremove' to remove them.
The following NEW packages will be installed:
  sgx-pck-id-retrieval-tool
0 upgraded, 1 newly installed, 0 to remove and 66 not upgraded.
Need to get 22.8 kB of archives.
After this operation, 71.7 kB of additional disk space will be used.
Get:1 https://ppa.launchpadcontent.net/kobuk-team/tdx-attestation-release/ubuntu noble/main amd64 sgx-pck-id-retrieval-tool amd64 1.21-0ubuntu2.2 [22.8 kB]
Fetched 22.8 kB in 0s (45.6 kB/s)                    
Selecting previously unselected package sgx-pck-id-retrieval-tool.
(Reading database ... 146266 files and directories currently installed.)
Preparing to unpack .../sgx-pck-id-retrieval-tool_1.21-0ubuntu2.2_amd64.deb ...
Unpacking sgx-pck-id-retrieval-tool (1.21-0ubuntu2.2) ...
Setting up sgx-pck-id-retrieval-tool (1.21-0ubuntu2.2) ...
Scanning processes...                                                                                                                                                 
Scanning processor microcode...                                                                                                                                       
Scanning linux images...                                                                                                                                              

Running kernel seems to be up-to-date.

The processor microcode seems to be up-to-date.

No services need to be restarted.

No containers need to be restarted.

No user sessions are running outdated binaries.

No VM guests are running outdated hypervisor (qemu) binaries on this host.
========================================================================
The host OS setup has been done successfully. Now, please enable Intel TDX in the BIOS.
========================================================================
root@fervent-heron:~/tdx# ls -la /usr/lib/x86_64-linux-gnu/libsgx-*
ls: cannot access '/usr/lib/x86_64-linux-gnu/libsgx-*': No such file or directory
root@fervent-heron:~/tdx# cat /etc/sgx_default_qcnl.conf
{
  // *** ATTENTION : This file is in JSON format so the keys are case sensitive. Don't change them.
  
  //PCCS server address
  "pccs_url": "https://localhost:8081/sgx/certification/v4/"

  // To accept insecure HTTPS certificate, set this option to false
  ,"use_secure_cert": false

  // You can use the Intel PCS or another PCCS to get quote verification collateral.  Retrieval of PCK 
  // Certificates will always use the PCCS described in pccs_url.  When collateral_service is not defined, both 
  // PCK Certs and verification collateral will be retrieved using pccs_url  
  //,"collateral_service": "https://api.trustedservices.intel.com/sgx/certification/v4/"

  // Type of update to TCB Info. Possible value: early, standard. Default is standard.
  // early indicates an early access to updated TCB Info provided as part of a TCB recovery event
  // (commonly the day of public disclosure of the items in scope)
  // standard indicates standard access to updated TCB Info provided as part of a TCB recovery event
  // (commonly approximately 6 weeks after public disclosure of the items in scope)
  //, "tcb_update_type" : "standard"

  // If you use a PCCS service to get the quote verification collateral, you can specify which PCCS API version is to be used.
  // The legacy 3.0 API will return CRLs in HEX encoded DER format and the sgx_ql_qve_collateral_t.version will be set to 3.0, while
  // the new 3.1 API will return raw DER format and the sgx_ql_qve_collateral_t.version will be set to 3.1. The pccs_api_version 
  // setting is ignored if collateral_service is set to the Intel PCS. In this case, the pccs_api_version is forced to be 3.1 
  // internally.  Currently, only values of 3.0 and 3.1 are valid.  Note, if you set this to 3.1, the PCCS use to retrieve 
  // verification collateral must support the new 3.1 APIs.
  //,"pccs_api_version": "3.1"

  // Maximum retry times for QCNL. If RETRY is not defined or set to 0, no retry will be performed.
  // It will first wait one second and then for all forthcoming retries it will double the waiting time.
  // By using retry_delay you disable this exponential backoff algorithm
  ,"retry_times": 6

  // Sleep this amount of seconds before each retry when a transfer has failed with a transient error
  ,"retry_delay": 10

  // If local_pck_url is defined, the QCNL will try to retrieve PCK cert chain from local_pck_url first,
  // and failover to pccs_url as in legacy mode.
  //,"local_pck_url": "http://localhost:8081/sgx/certification/v4/"

  // If local_pck_url is not defined, set pck_cache_expire_hours to a none-zero value will enable local cache. 
  // The PCK certificates will be cached in memory and then to the disk drive. 
  // The local cache files will be sequentially searched in the following directories until located in one of them:
  // Linux : $AZDCAP_CACHE, $XDG_CACHE_HOME, $HOME, $TMPDIR, /tmp/
  // Windows : $AZDCAP_CACHE, $LOCALAPPDATA\..\..\LocalLow
  // Please be aware that the environment variable pertains to the account executing the process that loads QPL,
  // not the account used to log in. For instance, if QPL is loaded by QGS, then those environment variables relate to
  // the "qgsd" account, which is the account that runs the QGS daemon.
  // You can remove the local cache files either manually or by using the QPL API, sgx_qpl_clear_cache. If you opt to
  // delete them manually, navigate to the aforementioned caching directories, find the folder named .dcap-qcnl, and delete it.
  // Restart the service after all cache folders were deleted. The same method applies to "verify_collateral_cache_expire_hours"
  ,"pck_cache_expire_hours": 168

  // To set cache expire time for quote verification collateral in hours
  // See the above comment for pck_cache_expire_hours for more information on the local cache.
  ,"verify_collateral_cache_expire_hours": 168

  // When the "local_cache_only" parameter is set to true, the QPL/QCNL will exclusively use PCK certificates 
  // from local cache files and will not request any PCK certificates from service providers, whether local or remote. 
  // To ensure that the PCK cache is available for use, an administrator must pre-populate the cache folders with 
  // the appropriate cache files. To generate these cache files for specific platforms, the administrator can use 
  // the PCCS admin tool. Once the cache files are generated, the administrator must distribute them to each platform 
  // that requires provisioning.
  ,"local_cache_only": false

  // You can add custom request headers and parameters to the get certificate API.
  // But the default PCCS implementation just ignores them. 
  //,"custom_request_options" : {
  //  "get_cert" : {
  //    "headers": {
  //      "head1": "value1"
  //    },
  //    "params": {
  //      "param1": "value1",
  //      "param2": "value2"
  //    }
  //  }
  //}
}
root@fervent-heron:~/tdx# ls -la /dev/tdx-*
ls: cannot access '/dev/tdx-*': No such file or directory
```