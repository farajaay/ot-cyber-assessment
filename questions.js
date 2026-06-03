// OT/ICS Cybersecurity Assessment Questions
// Mapped to IEC 62443, NERC CIP, and Saudi NCA ECC/CSCC standards.
export const DOMAINS = {
  NS: {
    id: "NS",
    title: "Network Segmentation & Perimeter Security",
    description: "Protection of industrial networks from unauthorized access and separation of logical zones.",
    color: "#2563eb"
  },
  AC: {
    id: "AC",
    title: "Access Control & Identity Management",
    description: "Authentication, authorization, and management of user and system privileges in the OT environment.",
    color: "#059669"
  },
  AV: {
    id: "AV",
    title: "Asset Governance & Vulnerabilities",
    description: "Tracking assets, hardware/software lifecycles, and managing software security updates.",
    color: "#d97706"
  },
  TR: {
    id: "TR",
    title: "Threat Monitoring & Incident Response",
    description: "Real-time visibility, security logging, anomaly detection, and operational recovery readiness.",
    color: "#dc2626"
  },
  DR: {
    id: "DR",
    title: "Business Continuity & Disaster Recovery",
    description: "Physical environment protection, power redundancy, backups, and bare-metal restoration capabilities.",
    color: "#7c3aed"
  }
};

export const QUESTIONS = [
  // 1. Network Segmentation & Perimeter Security
  {
    id: "Q1",
    domain: "NS",
    text: "What is the implementation status of logical and physical network segmentation between the corporate Enterprise network and the IACS (Industrial Automation and Control Systems) zones?",
    standards: {
      iec: "IEC 62443-3-3 (SR 5.2)",
      nerc: "NERC CIP-005 (ESP)",
      nca: "NCA ECC-2-4-2"
    },
    choices: [
      {
        level: 0,
        text: "Unrestricted Layer 2/3 connectivity: Corporate Enterprise assets and critical IACS controllers reside on a shared, flat broadcast domain with no firewall boundaries.",
        score: 0
      },
      {
        level: 1,
        text: "Rudimentary perimeter isolation: A shared perimeter firewall separates IT/OT segments, but rule configurations are overly permissive, allowing direct routing without deep packet inspection or active session monitoring.",
        score: 1
      },
      {
        level: 2,
        text: "Dedicated boundary firewalls are deployed at the IT/OT perimeter. Access control lists (ACLs) are configured on a strict 'least privilege' model, restricting traversal to essential protocols with stateful traffic inspection.",
        score: 2
      },
      {
        level: 3,
        text: "Defense-in-Depth Zoning: Micro-segmentation is implemented within the OT network. Controllers, safety instrumented systems (SIS), and operator workstations are segmented into discrete Zones and Conduits conforming to the IEC 62443-3-3 zoning model.",
        score: 3
      }
    ],
    recommendations: {
      0: {
        priority: "CRITICAL",
        effort: "High",
        cost: "$$$",
        action: "Deploy a dedicated perimeter firewall between the IT and OT networks immediately. Establish a strict default-deny policy.",
        rationale: "A flat network allows a single compromised IT asset (like a phishing email) to pivot and directly control or damage physical PLC/SCADA systems."
      },
      1: {
        priority: "HIGH",
        effort: "Medium",
        cost: "$$",
        action: "Review and harden firewall rules. Transition from a shared firewall to dedicated IT-OT gateway firewalls with logging enabled.",
        rationale: "Permissive rules or shared firewalls degrade security boundaries and make it easier for malware to traverse network perimeters."
      },
      2: {
        priority: "MEDIUM",
        effort: "Medium",
        cost: "$$",
        action: "Define OT internal security zones (per IEC 62443-3-3) based on process criticality (e.g., safety systems, controllers, HMI). Implement internal firewalls or VLAN ACLs.",
        rationale: "Lateral movement within the OT environment must be contained to prevent localized issues from spreading to other process lines."
      },
      3: {
        priority: "LOW",
        effort: "Low",
        cost: "$",
        action: "Conduct bi-annual automated audits of the firewall configuration and zone traversal rules.",
        rationale: "Periodic validation maintains compliance and detects unauthorized 'rule creep' resulting from operational adjustments."
      }
    }
  },
  {
    id: "Q2",
    domain: "NS",
    text: "How is logical traffic isolation and intermediate data transit governed between the Enterprise and IACS zones?",
    standards: {
      iec: "IEC 62443-3-3 (SR 5.1 / 5.2)",
      nerc: "NERC CIP-005-5 (R1)",
      nca: "NCA ECC-2-4-2-2"
    },
    choices: [
      {
        level: 0,
        text: "No intermediate transit zone: Distributed databases, historians, and license servers bridge both networks via multi-homed NIC configurations without logical isolation.",
        score: 0
      },
      {
        level: 1,
        text: "Shared boundary zone: A Demilitarized Zone (DMZ) is established, but servers within it directly query both IT and OT assets without intermediate staging, replica brokers, or application proxies.",
        score: 1
      },
      {
        level: 2,
        text: "Structured Industrial DMZ (IDMZ): An isolated IDMZ is active. Direct traffic routing is prohibited; all data exchanges (e.g. historical data, patches) traverse staging replicas, proxies, or application gateways.",
        score: 2
      },
      {
        level: 3,
        text: "Hardened IDMZ with Unidirectional Gateways: Full compliance with IEC 62443-3-3 boundary protections. Traffic is filtered using stateful proxies, reverse proxies, and unidirectionally replicated databases (e.g. data diodes) to block return-channel vulnerabilities.",
        score: 3
      }
    ],
    recommendations: {
      0: {
        priority: "CRITICAL",
        effort: "High",
        cost: "$$$",
        action: "Design and implement an Industrial DMZ (IDMZ). Remove any servers directly bridging both networks.",
        rationale: "Direct connections between IT and OT break the boundary, creating a path for lateral malware propagation."
      },
      1: {
        priority: "CRITICAL",
        effort: "Medium",
        cost: "$$",
        action: "Decommission all dual-homed servers. Re-architect data ingestion to use a store-and-forward proxy in a dedicated IDMZ segment.",
        rationale: "Dual-homing is a high-risk practice because a compromise of the server OS bypasses all firewall controls entirely."
      },
      2: {
        priority: "MEDIUM",
        effort: "Medium",
        cost: "$$",
        action: "Ensure no interactive session (e.g. RDP, SSH) traverses the IDMZ directly. Enforce separate session termination at the IDMZ boundary.",
        rationale: "Direct IT-to-OT interactive sessions allow remote control capabilities to bypass boundary defenses."
      },
      3: {
        priority: "LOW",
        effort: "Low",
        cost: "$",
        action: "Optimize replication speeds and review proxy logs periodically for anomalous outbound connections.",
        rationale: "Ensures the replication mechanism does not become an exfiltration channel or bottleneck."
      }
    }
  },
  {
    id: "Q3",
    domain: "NS",
    text: "What authorization controls and auditing protocols govern transient vendor or internal engineering remote access into IACS networks?",
    standards: {
      iec: "IEC 62443-3-3 (SR 1.1 / 1.2)",
      nerc: "NERC CIP-005-5 (R2)",
      nca: "NCA ECC-2-4-3"
    },
    choices: [
      {
        level: 0,
        text: "Unmanaged remote ingress: Remote desktop utilities (e.g., TeamViewer, AnyDesk, Chrome Remote Desktop) are installed on IACS hosts, bypassing perimeter firewalls with static credentials.",
        score: 0
      },
      {
        level: 1,
        text: "Standard VPN access: Remote access is routed via a boundary Virtual Private Network (VPN) using single-factor static credentials, granting direct access to the general OT subnet.",
        score: 1
      },
      {
        level: 2,
        text: "Secure Multi-Factor Ingress: Ingress requires Multi-Factor Authentication (MFA) via a secure VPN, terminating on a hardened Jump Host inside the IDMZ with separate session validation.",
        score: 2
      },
      {
        level: 3,
        text: "Role-Based Just-in-Time (JIT) PAM Ingress: Remote access is disabled by default, activated only via temporary Permit-to-Work approvals. Connections require MFA, run via an isolated Jump Host, enforce command blocklists, and record full video sessions for forensic audit.",
        score: 3
      }
    ],
    recommendations: {
      0: {
        priority: "CRITICAL",
        effort: "Medium",
        cost: "$",
        action: "Block all outbound traffic to known remote control software domains. Mandate the suspension of unsupervised vendor connections.",
        rationale: "Consumer-grade remote access bypasses perimeter security and leaves the OT network open to untracked external access."
      },
      1: {
        priority: "HIGH",
        effort: "Medium",
        cost: "$$",
        action: "Enforce Multi-Factor Authentication (MFA) on the VPN and implement a Secure OT Jump Host in the IDMZ to terminate sessions.",
        rationale: "Static passwords are easily stolen via phishing or credential stuffing. Directly routing VPN clients into the OT subnet allows uncontrolled access."
      },
      2: {
        priority: "MEDIUM",
        effort: "Medium",
        cost: "$$",
        action: "Implement a 'Just-in-Time' (JIT) remote access policy where connections are disabled by default and activated only upon verified permit-to-work requests.",
        rationale: "Persistent remote access channels provide attackers with a 24/7 window to discover credentials and attempt entry."
      },
      3: {
        priority: "LOW",
        effort: "Low",
        cost: "$",
        action: "Perform quarterly audits of session logs and screen recordings for vendor remote sessions.",
        rationale: "Auditing session recordings verifies compliance with safety procedures and detects unauthorized modifications."
      }
    }
  },

  // 2. Access Control & Identity Management
  {
    id: "Q4",
    domain: "AC",
    text: "How is authentication, authorization, and administrative credential management governed across IACS assets (HMIs, PLCs, network infrastructure)?",
    standards: {
      iec: "IEC 62443-4-2 (EDR 1.1 / 1.2)",
      nerc: "NERC CIP-007-6 (R5)",
      nca: "NCA ECC-2-3"
    },
    choices: [
      {
        level: 0,
        text: "Shared defaults / Static credentials: Factory default credentials are left active on active network equipment/PLCs, or shared static passwords are utilized across operators.",
        score: 0
      },
      {
        level: 1,
        text: "Unique but unmanaged credentials: Individual assets have custom credentials, but passwords are changed infrequently and are shared between operations teams with no enforcement of complexity rules.",
        score: 1
      },
      {
        level: 2,
        text: "Role-Based Local Credentials: Staff authenticate using unique, individual local accounts. Access permissions conform to standardized roles, and password complexity/rotation rules are actively enforced.",
        score: 2
      },
      {
        level: 3,
        text: "Centralized Enterprise Identity Integration: Authentication is managed via a centralized directory (e.g., OT Active Directory) with Role-Based Access Control (RBAC), multi-factor policies, and automated Privileged Access Management (PAM) vaulting.",
        score: 3
      }
    ],
    recommendations: {
      0: {
        priority: "CRITICAL",
        effort: "Medium",
        cost: "$",
        action: "Perform a sweeping change to eliminate default passwords on all accessible HMI, switches, and PLCs. Ban written passwords.",
        rationale: "Default passwords for industrial controllers are public knowledge. Anyone with basic access can compromise defaults within seconds."
      },
      1: {
        priority: "HIGH",
        effort: "Medium",
        cost: "$",
        action: "Establish unique credentials per device. Group similar devices into security groups and issue unique, complex passwords for each group.",
        rationale: "Identical passwords across a plant mean a single device compromise exposes all other devices."
      },
      2: {
        priority: "MEDIUM",
        effort: "Medium",
        cost: "$$",
        action: "Integrate OT servers, workstations, and network equipment with a centralized authentication source (like an offline OT AD domain).",
        rationale: "Centralized identity enables rapid revocation of credentials for terminated employees and centralized audit logging."
      },
      3: {
        priority: "LOW",
        effort: "Low",
        cost: "$$",
        action: "Deploy an OT-compatible Privileged Access Management (PAM) vault for rotating administrative passwords.",
        rationale: "Automated rotation removes the human element from managing highly sensitive administrator credentials."
      }
    }
  },
  {
    id: "Q5",
    domain: "AC",
    text: "What level of system hardening, protocol restriction, and privilege limitation is applied to IACS endpoints?",
    standards: {
      iec: "IEC 62443-4-2 (EDR 2.1 / 2.3)",
      nerc: "NERC CIP-007-6 (R2 / R5)",
      nca: "NCA ECC-2-3-2"
    },
    choices: [
      {
        level: 0,
        text: "Default status: Local operator HMIs run permanently with local administrative privileges. General applications, browsers, command utilities, and unused logical/physical ports are enabled.",
        score: 0
      },
      {
        level: 1,
        text: "Basic account separation: Operator accounts run with reduced privileges, but non-essential software (browsers, legacy protocols) remains active and port services are left unhardened.",
        score: 1
      },
      {
        level: 2,
        text: "Hardened Configurations: Endpoints are hardened according to official baselines (e.g. CIS benchmarks). Non-essential services, unnecessary legacy protocols (e.g. SMBv1, Telnet), and physical USB/NIC interfaces are disabled.",
        score: 2
      },
      {
        level: 3,
        text: "Endpoint Integrity & Application Whitelisting: Systems utilize application whitelisting/allow-listing (AppLocker, EDR in block mode) to enforce absolute control over executing processes, accompanied by continuous configuration drift monitoring.",
        score: 3
      }
    ],
    recommendations: {
      0: {
        priority: "CRITICAL",
        effort: "Medium",
        cost: "$",
        action: "Remove administrative privileges from operator HMI accounts immediately. Remove general internet browsers and office software.",
        rationale: "Operators executing daily tasks with admin privileges can accidentally install malware, modify OS components, or bypass safety locks."
      },
      1: {
        priority: "HIGH",
        effort: "Medium",
        cost: "$",
        action: "Implement a baseline hardening checklist (e.g. CIS benchmarks) for Windows/Linux hosts, removing unnecessary services and ports.",
        rationale: "Unnecessary services and ports increase the attack surface, offering additional vectors for exploit payloads."
      },
      2: {
        priority: "MEDIUM",
        effort: "Medium",
        cost: "$$",
        action: "Implement Application Whitelisting (allow-listing) via Windows AppLocker or dedicated OT security software.",
        rationale: "Traditional signature-based antivirus often fails or is out-of-date in OT. Whitelisting ensures only trusted industrial applications can execute."
      },
      3: {
        priority: "LOW",
        effort: "Low",
        cost: "$",
        action: "Establish an automated compliance check to audit and report deviations from the hardened workstation base image.",
        rationale: "Ensures configuration drift does not re-introduce vulnerabilities over time."
      }
    }
  },
  {
    id: "Q6",
    domain: "AC",
    text: "How are wireless communications and transient physical interfaces (e.g. USB flash drives, contractor laptops) regulated in IACS zones?",
    standards: {
      iec: "IEC 62443-3-3 (SR 1.6) / IEC 62443-4-2",
      nerc: "NERC CIP-010-3 (R4)",
      nca: "NCA ECC-2-21-2"
    },
    choices: [
      {
        level: 0,
        text: "Unregulated: USB devices and engineering tools connect directly to critical controllers without screening. Unencrypted or weakly secured Wi-Fi networks penetrate IACS boundaries.",
        score: 0
      },
      {
        level: 1,
        text: "Policy-only restriction: Corporate policies prohibit unauthorized media and personal laptops, but there are no technical controls, endpoint blocks, or file scanning stations.",
        score: 1
      },
      {
        level: 2,
        text: "Technical validation: USB mass storage is disabled via Group Policy. Dynamic file ingestion must proceed through a dedicated scanning kiosk. Wireless channels enforce WPA3-Enterprise authentication.",
        score: 2
      },
      {
        level: 3,
        text: "Isolated Media Governance: Clean-room media gateways scan, verify, and digitally sign files. Strict endpoint rules prevent untrusted USB execution, and unauthorized ports automatically alert the SOC and trigger port shutdown.",
        score: 3
      }
    ],
    recommendations: {
      0: {
        priority: "CRITICAL",
        effort: "Medium",
        cost: "$",
        action: "Block USB storage access via Group Policies (GPO) across all OT endpoints. Audit and secure wireless access points.",
        rationale: "Stuxnet demonstrated that USBs are the primary vector for crossing the IT/OT air gap. Unencrypted Wi-Fi allows credential eavesdropping."
      },
      1: {
        priority: "HIGH",
        effort: "Medium",
        cost: "$$",
        action: "Deploy an OT media scanning kiosk. Establish a rule that no transient device (vendor laptop, flash drive) enters without scanning.",
        rationale: "Policies without enforcement fail due to human convenience. A dedicated scanning kiosk provides a physical barrier and verification."
      },
      2: {
        priority: "MEDIUM",
        effort: "Low",
        cost: "$",
        action: "Enable MAC address filtering, disable SSID broadcasting on OT Wi-Fi, and implement certificates (802.1X) for device authentication.",
        rationale: "Secures wireless media against brute-force attacks and unauthorized device attachment."
      },
      3: {
        priority: "LOW",
        effort: "Low",
        cost: "$",
        action: "Perform monthly rogue access point sweeps and analyze active endpoints for deviations.",
        rationale: "Detects unauthorized Wi-Fi bridges established by staff or vendors for convenience."
      }
    }
  },

  // 3. Asset Governance & Vulnerabilities
  {
    id: "Q7",
    domain: "AV",
    text: "What is the detection mechanism, granularity, and accuracy of your physical and logical IACS asset inventory?",
    standards: {
      iec: "IEC 62443-2-1 / IEC 62443-2-4",
      nerc: "NERC CIP-002-5.1",
      nca: "NCA ECC-2-2-2"
    },
    choices: [
      {
        level: 0,
        text: "Undocumented / Reactive inventory: No formal inventory exists. Assets are tracked reactively during physical plant outages or upgrades.",
        score: 0
      },
      {
        level: 1,
        text: "Manual static registries: Spreadsheet registers track IP allocations and general system descriptions, updated manually or on a yearly basis.",
        score: 1
      },
      {
        level: 2,
        text: "Validated automated scanning: Asset lists are audited quarterly. Inventories record detailed firmware revisions, software bills of material (SBOM), MAC addresses, and physical locations.",
        score: 2
      },
      {
        level: 3,
        text: "Continuous Passive Discovery: Specialized passive monitoring engines continuously inspect network traffic to discover assets in real-time, detailing configuration versions and firmware vulnerabilities without active disruption.",
        score: 3
      }
    ],
    recommendations: {
      0: {
        priority: "CRITICAL",
        effort: "Medium",
        cost: "$",
        action: "Conduct an immediate physical and logical sweep of the OT network. Catalog all PLCs, HMIs, switches, and servers.",
        rationale: "You cannot secure what you do not know exists. Unmanaged assets are target entries for intruders and vulnerabilities."
      },
      1: {
        priority: "HIGH",
        effort: "Medium",
        cost: "$",
        action: "Enhance the manual inventory structure to include firmware levels, vendor support status, and MAC addresses. Assign ownership to each asset.",
        rationale: "Static spreadsheets quickly go out of date. Enriching the metadata helps in assessing risk when new vulnerabilities are disclosed."
      },
      2: {
        priority: "MEDIUM",
        effort: "Medium",
        cost: "$$$",
        action: "Deploy an OT-passive monitoring tool (e.g., Dragos, Claroty, or open-source alternatives like Grassmarlin) to automatically discover and map assets.",
        rationale: "Passive tools discover network-connected devices in real-time without active probing, which can crash legacy PLCs."
      },
      3: {
        priority: "LOW",
        effort: "Low",
        cost: "$",
        action: "Integrate the OT asset management system with change control processes to update records automatically when hardware is modified.",
        rationale: "Maintains inventory integrity dynamically as plant configurations shift."
      }
    }
  },
  {
    id: "Q8",
    domain: "AV",
    text: "How are firmware vulnerabilities and operating system patches evaluated, tested, and deployed within the IACS environment?",
    standards: {
      iec: "IEC 62443-2-4 (SP 03.01 - 03.09)",
      nerc: "NERC CIP-007-6 (R1 / R2)",
      nca: "NCA ECC-2-12"
    },
    choices: [
      {
        level: 0,
        text: "No patching program: Operating systems, application packages, and controller firmware are left unpatched since factory deployment. Vulnerability reporting is absent.",
        score: 0
      },
      {
        level: 1,
        text: "Ad-hoc / Reactive patching: Security patches are only applied following a verified breach, major audit failure, or during complex multi-year upgrade projects.",
        score: 1
      },
      {
        level: 2,
        text: "Risk-prioritized deployment: Vulnerabilities are monitored weekly. Validated manufacturer patches are tested on replica test-beds and deployed during planned maintenance cycles.",
        score: 2
      },
      {
        level: 3,
        text: "Continuous Vulnerability Lifecycle: Structured lifecycle program. Vulnerability windows are mitigated via virtual patching (IPS rules), patches are certified by vendors before staging, and compensating controls protect legacy endpoints.",
        score: 3
      }
    ],
    recommendations: {
      0: {
        priority: "CRITICAL",
        effort: "Medium",
        cost: "$",
        action: "Establish a process to subscribe to ICS-CERT advisories for your specific vendor devices (e.g., Siemens, Rockwell, ABB).",
        rationale: "Failing to monitor vulnerabilities leaves the organization blind to publicly known exploits targetable by script kiddies."
      },
      1: {
        priority: "HIGH",
        effort: "Medium",
        cost: "$$",
        action: "Define a quarterly testing and patching schedule for critical HMI OS patches. Enforce vendor-approved firmware updates during shut-downs.",
        rationale: "Reactive patching is insufficient because attackers exploit vulnerabilities months before a major project upgrade is scheduled."
      },
      2: {
        priority: "MEDIUM",
        effort: "Medium",
        cost: "$$",
        action: "Implement virtual patching utilizing network intrusion prevention systems (IPS) rules to block exploit payloads targeting unpatched legacy systems.",
        rationale: "Many OT systems cannot be patched due to vendor warranty restrictions or uptime demands; network protection mitigates this risk."
      },
      3: {
        priority: "LOW",
        effort: "Low",
        cost: "$",
        action: "Develop an automated dashboard to track mean time to remediate (MTTR) for critical vulnerabilities inside OT.",
        rationale: "Improves operational metrics and ensures team response times align with risk tolerances."
      }
    }
  },
  {
    id: "Q9",
    domain: "AV",
    text: "What validation controls are enforced to verify the integrity and provenance of third-party IACS software and firmware packages?",
    standards: {
      iec: "IEC 62443-4-1 (Secure Lifecycle) / IEC 62443-2-4",
      nerc: "NERC CIP-013-1 (R1 / R2)",
      nca: "NCA ECC-2-19"
    },
    choices: [
      {
        level: 0,
        text: "No validation: System files and configurations are downloaded from arbitrary sources, or imported via third-party storage devices without hash or signature checks.",
        score: 0
      },
      {
        level: 1,
        text: "Basic hashing checks: Checksums (SHA-256) are occasionally checked if provided on the OEM's documentation portal, but verification is not mandatory.",
        score: 1
      },
      {
        level: 2,
        text: "Mandated Vendor Verification: Contract clauses require supply-chain verification. Software is obtained solely via authenticated vendor vaults, and cryptographic integrity is verified before ingestion.",
        score: 2
      },
      {
        level: 3,
        text: "Hardware Root-of-Trust: Firmware updates enforce digital signature verification in the bootloader. Secure Boot (TPM-backed) is active on controllers, and SBOM artifacts are audited dynamically for supply-chain risk.",
        score: 3
      }
    ],
    recommendations: {
      0: {
        priority: "CRITICAL",
        effort: "Low",
        cost: "$",
        action: "Mandate that no firmware or software is loaded into controllers unless downloaded directly from official OEM secure portals.",
        rationale: "Third-party download sites or loose USBs can carry backdoored firmware that permanently compromises physical devices."
      },
      1: {
        priority: "HIGH",
        effort: "Medium",
        cost: "$",
        action: "Incorporate cybersecurity requirements into supply chain vendor agreements. Require contractors to verify device integrity before connecting.",
        rationale: "Supply chain compromises occur when trusted vendor tools are infected and subsequently attached to your networks."
      },
      2: {
        priority: "MEDIUM",
        effort: "Medium",
        cost: "$$",
        action: "Define a secure firmware update policy that mandates cryptographic hash validation (SHA-256) and verifying manufacturer digital signatures.",
        rationale: "Ensures the firmware has not been modified in transit or altered by a malicious actor."
      },
      3: {
        priority: "LOW",
        effort: "Low",
        cost: "$",
        action: "Utilize hardware roots of trust (e.g. TPM chips) and enable secure boot configurations on all compatible RTUs/controllers.",
        rationale: "Prevents unauthorized code execution at the hardware bootloader level."
      }
    }
  },

  // 4. Threat Monitoring & Incident Response
  {
    id: "Q10",
    domain: "TR",
    text: "What architectural mechanism is deployed for event log aggregation, security monitoring, and correlation within the IACS network?",
    standards: {
      iec: "IEC 62443-3-3 (SR 6.1 / 6.2)",
      nerc: "NERC CIP-007-6 (R3)",
      nca: "NCA ECC-2-8"
    },
    choices: [
      {
        level: 0,
        text: "No aggregation / Inactive logs: Log generation is disabled on controllers, switches, and HMIs, or logs are overwritten rapidly due to local storage limits.",
        score: 0
      },
      {
        level: 1,
        text: "Local uncoordinated logging: Systems record security events to local event logs. Event investigation is purely reactive, occurring after a system failure or outage.",
        score: 1
      },
      {
        level: 2,
        text: "Centralized Syslog forwarding: Event logs from critical IACS endpoints, network firewalls, and directory servers are forwarded to a dedicated central log repository.",
        score: 2
      },
      {
        level: 3,
        text: "Integrated OT SIEM & 24/7 SOC: Logs are streamed to an OT-specific SIEM. Alert logic is correlated across industrial networks and audited 24/7 by a specialized industrial Security Operations Center.",
        score: 3
      }
    ],
    recommendations: {
      0: {
        priority: "CRITICAL",
        effort: "Medium",
        cost: "$",
        action: "Enable security logging on all Windows HMIs, network switches, and firewalls. Adjust retention policies to hold at least 30 days of data.",
        rationale: "Without logs, it is impossible to detect active intrusions or reconstruct what occurred during an incident."
      },
      1: {
        priority: "HIGH",
        effort: "Medium",
        cost: "$$",
        action: "Implement a centralized log server (Syslog) inside the OT environment. Aggregate events from critical network firewalls and domain controllers.",
        rationale: "Attackers routinely clear local logs to hide their tracks. Centralized aggregation prevents tampering."
      },
      2: {
        priority: "MEDIUM",
        effort: "Medium",
        cost: "$$$",
        action: "Integrate OT logs into a SIEM. Establish correlation rules specific to OT behavior (e.g., PLC programming changes outside maintenance hours).",
        rationale: "Standard IT rules trigger false alerts or miss critical industrial actions. Customized OT logs detect targeted attacks."
      },
      3: {
        priority: "LOW",
        effort: "Low",
        cost: "$",
        action: "Run quarterly validation drills to ensure all endpoints are successfully forwarding logs and rules are firing as expected.",
        rationale: "Validates that network changes or software upgrades have not broken log forwarding pipelines."
      }
    }
  },
  {
    id: "Q11",
    domain: "TR",
    text: "Is there an OT-specific Incident Response Plan (IRP) in place, and what is its operational testing frequency?",
    standards: {
      iec: "IEC 62443-2-1 / IEC 62443-2-4",
      nerc: "NERC CIP-008-6 (R1 / R2)",
      nca: "NCA ECC-2-16"
    },
    choices: [
      {
        level: 0,
        text: "No incident response capability: Incident mitigation relies on ad-hoc phone calls to system integrators or emergency manual plant shutdowns.",
        score: 0
      },
      {
        level: 1,
        text: "Unadapted IT response plans: Corporate IT incident plans are referenced, but they lack guidance on physical safety, chemical processes, or PLC containment.",
        score: 1
      },
      {
        level: 2,
        text: "Documented OT-Specific IRP: A dedicated incident plan details role matrices, emergency contact protocols, safety isolation procedures, and vendor escalation paths.",
        score: 2
      },
      {
        level: 3,
        text: "Simulated IRP Tabletop & Red Team validation: The OT-IRP is updated regularly and validated via annual simulated scenarios involving operators, system engineers, corporate executives, and national CERT partners.",
        score: 3
      }
    ],
    recommendations: {
      0: {
        priority: "CRITICAL",
        effort: "Medium",
        cost: "$",
        action: "Draft a basic emergency OT Incident Response card for operators. Define emergency contacts, isolation steps, and escalation numbers.",
        rationale: "Panic during an attack leads to errors that can compromise physical safety or worsen damage. Structured guidance keeps operations safe."
      },
      1: {
        priority: "HIGH",
        effort: "Medium",
        cost: "$",
        action: "Develop OT-specific playbooks for major scenarios: ransomware on HMIs, rogue controller commands, and safety system failure.",
        rationale: "IT plans often recommend 'isolating the network,' which in OT can cause a sudden process trip, safety valve releases, or equipment damage."
      },
      2: {
        priority: "MEDIUM",
        effort: "Medium",
        cost: "$",
        action: "Conduct an annual OT-specific tabletop exercise involving operations staff and IT security to run through escalation paths.",
        rationale: "Exercises reveal flaws in communication and clarify roles before a real crisis occurs."
      },
      3: {
        priority: "LOW",
        effort: "Low",
        cost: "$",
        action: "Integrate external partners (ICS vendors, national threat centers, or GCC CERTs) directly into your incident response contact trees.",
        rationale: "Establishes lines of communication for support during major state-sponsored campaigns."
      }
    }
  },
  {
    id: "Q12",
    domain: "TR",
    text: "What network visibility and deep protocol analysis capabilities are active inside the IACS network?",
    standards: {
      iec: "IEC 62443-3-3 (SR 6.1 / 6.2)",
      nerc: "NERC CIP-007-6 (R3)",
      nca: "NCA ECC-2-8"
    },
    choices: [
      {
        level: 0,
        text: "No network visibility: There is no logging or visibility of traffic moving laterally inside the OT environment.",
        score: 0
      },
      {
        level: 1,
        text: "Static border visibility: Firewall traffic logs at the boundary are analyzed, but internal network switches have no active mirroring or logging configurations.",
        score: 1
      },
      {
        level: 2,
        text: "Passive network monitoring (IDS): Switch mirror ports (SPAN) feed network traffic to a passive OT IDS to identify signature threats and anomalous network packets.",
        score: 2
      },
      {
        level: 3,
        text: "Deep Packet Inspection (DPI) & Baselining: Passive engines perform DPI to decode industrial commands (e.g. Modbus function codes, S7 Comm programming uploads) to alert on anomalous behavioral parameters.",
        score: 3
      }
    ],
    recommendations: {
      0: {
        priority: "HIGH",
        effort: "Medium",
        cost: "$$",
        action: "Review network configurations to confirm switch support for port mirroring (SPAN) to enable packet collection.",
        rationale: "Without internal visibility, an attacker who compromises a single jump host can pivot undetected throughout the entire PLC architecture."
      },
      1: {
        priority: "HIGH",
        effort: "Medium",
        cost: "$$$",
        action: "Replace or augment IT-centric network monitoring tools with OT-specific intrusion detection capabilities that parse industrial protocols.",
        rationale: "Standard IT IDS systems see Modbus or S7 Comm traffic as binary blobs, failing to detect command manipulation or logic uploads."
      },
      2: {
        priority: "MEDIUM",
        effort: "Medium",
        cost: "$$$",
        action: "Configure alerts for critical OT-specific commands (such as PLC stop, firmware download, or configuration rewrite) to trigger incident responses.",
        rationale: "These commands represent physical configuration changes and should never occur during standard production runs."
      },
      3: {
        priority: "LOW",
        effort: "Low",
        cost: "$",
        action: "Ensure threat intelligence feeds are updated monthly to include emerging indicators of compromise (IoCs) for industrial malware families.",
        rationale: "Guarantees detection profiles match current attacker tools and capabilities."
      }
    }
  },

  // 5. Business Continuity & Disaster Recovery
  {
    id: "Q13",
    domain: "DR",
    text: "What backup governance, storage isolation, and change tracing policies apply to IACS engineering project files, PLC logic, and HMI runtime parameters?",
    standards: {
      iec: "IEC 62443-2-4 (SP 09.01 - 09.05)",
      nerc: "NERC CIP-009-6 (R1)",
      nca: "NCA ECC-2-9"
    },
    choices: [
      {
        level: 0,
        text: "Absent backup capability: No copies of active controller configurations or HMI runtime environments exist. Recovery requires developer rebuilds or external support.",
        score: 0
      },
      {
        level: 1,
        text: "Uncoordinated manual backups: Engineering files are occasionally backed up by individual specialists to shared IT folders or local engineering laptops on a reactive basis.",
        score: 1
      },
      {
        level: 2,
        text: "Centralized scheduled backups: Automated backups execute on a weekly schedule. Backup copies are stored on isolated backup hosts, with an air-gapped weekly backup rotation.",
        score: 2
      },
      {
        level: 3,
        text: "Immutable Version Control: Backups are stored in version-controlled repositories (e.g. Git-based industrial version control). Differences between running PLC code and backups are audited automatically.",
        score: 3
      }
    ],
    recommendations: {
      0: {
        priority: "CRITICAL",
        effort: "Medium",
        cost: "$",
        action: "Perform a baseline backup of all PLC projects, HMI programs, and network switch configurations immediately. Save to secure external media.",
        rationale: "Ransomware targeting HMIs or a storage drive failure can permanently shut down a production line if configuration code is lost."
      },
      1: {
        priority: "HIGH",
        effort: "Medium",
        cost: "$$",
        action: "Implement a centralized, automated backup system for all servers and workstations. Store backups offline or in an isolated vault.",
        rationale: "Backups stored on writable network drives are encrypted by ransomware. Offline isolation is critical to survive targeted campaigns."
      },
      2: {
        priority: "MEDIUM",
        effort: "Medium",
        cost: "$$",
        action: "Adopt an OT version control system (e.g. Octoplant, Versiondog, or git-based systems) to monitor and trace changes in PLC code.",
        rationale: "Unintentional changes by engineers cause process issues; version history simplifies rolls back and speeds up troubleshooting."
      },
      3: {
        priority: "LOW",
        effort: "Low",
        cost: "$",
        action: "Verify backup integrity cryptographically to ensure stored images match current production baselines.",
        rationale: "Mitigates the risk of restoring corrupt or outdated configuration files during a disaster."
      }
    }
  },
  {
    id: "Q14",
    domain: "DR",
    text: "How are disaster recovery restoration runs and IACS bare-metal restore capabilities validated?",
    standards: {
      iec: "IEC 62443-2-4 (SP 09.04)",
      nerc: "NERC CIP-009-6 (R2)",
      nca: "NCA ECC-2-9-2"
    },
    choices: [
      {
        level: 0,
        text: "Untested recovery: The restoration process has never been executed or tested. Restore parameters remain theoretical.",
        score: 0
      },
      {
        level: 1,
        text: "Log verification only: Backup files are checked for completion logs, but actual restoration of operating system images or PLC code is not tested.",
        score: 1
      },
      {
        level: 2,
        text: "Staged restoration drills: Disaster recovery restores are executed annually on dedicated staging systems to verify configuration loads.",
        score: 2
      },
      {
        level: 3,
        text: "Full bare-metal restore validation: Live physical restoration simulations are conducted annually on redundant hot-standby systems to confirm restoration timelines (RTO/RPO) and data integrity.",
        score: 3
      }
    ],
    recommendations: {
      0: {
        priority: "CRITICAL",
        effort: "Medium",
        cost: "$",
        action: "Schedule a restoration test for a single non-critical HMI backup. Verify that files are readable and bootable.",
        rationale: "Many organizations discover their backups are corrupted or incomplete only during a critical recovery event."
      },
      1: {
        priority: "HIGH",
        effort: "Medium",
        cost: "$$",
        action: "Build a dedicated offline test environment (test rig) representing a slice of your plant's control system. Use it to conduct restore drills.",
        rationale: "Testing restorations on live production hosts can cause process interruptions. An offline rig allows testing without operational risk."
      },
      2: {
        priority: "MEDIUM",
        effort: "Medium",
        cost: "$",
        action: "Document formal restoration procedures for every critical system class. Standardize timelines for Recovery Time Objective (RTO).",
        rationale: "Clear procedures ensure that engineers can recover systems efficiently under stress, regardless of vendor availability."
      },
      3: {
        priority: "LOW",
        effort: "Low",
        cost: "$",
        action: "Include disaster recovery performance metrics in executive reports to demonstrate operational readiness.",
        rationale: "Upholds compliance and supports funding for physical security and infrastructure improvements."
      }
    }
  },
  {
    id: "Q15",
    domain: "DR",
    text: "What physical protection boundaries, environment sensors, and utility redundancies safeguard critical IACS control rooms and equipment cabinets?",
    standards: {
      iec: "IEC 62443-3-3 (SR 7.1 / 7.2)",
      nerc: "NERC CIP-006-6 (Physical Security)",
      nca: "NCA ECC-2-20"
    },
    choices: [
      {
        level: 0,
        text: "Unprotected: Cabinets and servers remain unlocked in shared spaces. Power is single-feed without battery backup, and environmental monitors are absent.",
        score: 0
      },
      {
        level: 1,
        text: "Basic barrier access: Key locks secure control doors and server cabinets. Standard commercial UPS arrays provide short battery support (<15 minutes) for core servers.",
        score: 1
      },
      {
        level: 2,
        text: "Hardened physical zoning: Access is badge-controlled and recorded. Cabinets reside in climate-controlled server rooms supported by dedicated industrial UPS arrays and generators.",
        score: 2
      },
      {
        level: 3,
        text: "Defense-in-depth security: Dual-factor biometric controls protect access, backed by continuous CCTV. Cabinets have environmental alarm units, and redundant power lines connect with automated automatic transfer switches.",
        score: 3
      }
    ],
    recommendations: {
      0: {
        priority: "CRITICAL",
        effort: "Medium",
        cost: "$$",
        action: "Install high-quality locks on control cabinet doors and control server rooms. Implement a basic UPS to protect controller power.",
        rationale: "An intruder with physical access can disconnect network lines, insert malicious USBs, or reset controllers in seconds."
      },
      1: {
        priority: "HIGH",
        effort: "Medium",
        cost: "$$",
        action: "Upgrade control room physical security. Log all entries. Test and maintain UPS battery health quarterly to prevent sudden shut downs.",
        rationale: "Sudden power cuts can corrupt PLC memory registers and crash running operating systems, causing production trips."
      },
      2: {
        priority: "MEDIUM",
        effort: "High",
        cost: "$$$",
        action: "Implement dual-source power lines for critical cabinets. Install CCTV monitoring targeting all physical access points to the OT networks.",
        rationale: "Utility failures should not disrupt critical safety lines. CCTV provides accountability and forensics for physical interventions."
      },
      3: {
        priority: "LOW",
        effort: "Low",
        cost: "$",
        action: "Audit physical key card access lists quarterly and revoke access for reassigned or departed personnel.",
        rationale: "Prevents credential bloat and unauthorized access by employees with expired credentials."
      }
    }
  }
];
