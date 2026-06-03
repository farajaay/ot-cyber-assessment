// OT/ICS Cybersecurity Assessment Questions
// Mapped to IEC 62443, NERC CIP, and Saudi NCA ECC/CSCC standards.
export const DOMAINS = {
  NS: {
    id: "NS",
    title: "Network Segmentation & Perimeter Security",
    description: "Protection of industrial networks from unauthorized access and separation of logical zones.",
    color: "#00F2FE"
  },
  AC: {
    id: "AC",
    title: "Access Control & Identity Management",
    description: "Authentication, authorization, and management of user and system privileges in the OT environment.",
    color: "#00F5A0"
  },
  AV: {
    id: "AV",
    title: "Asset Governance & Vulnerabilities",
    description: "Tracking assets, hardware/software lifecycles, and managing software security updates.",
    color: "#FFD200"
  },
  TR: {
    id: "TR",
    title: "Threat Monitoring & Incident Response",
    description: "Real-time visibility, security logging, anomaly detection, and operational recovery readiness.",
    color: "#FF5E62"
  },
  DR: {
    id: "DR",
    title: "Business Continuity & Disaster Recovery",
    description: "Physical environment protection, power redundancy, backups, and bare-metal restoration capabilities.",
    color: "#A259FF"
  }
};

export const QUESTIONS = [
  // 1. Network Segmentation & Perimeter Security
  {
    id: "Q1",
    domain: "NS",
    text: "How is your industrial network segmented from your corporate (IT) network?",
    standards: {
      iec: "IEC 62443-3-3 (SR 5.2)",
      nerc: "NERC CIP-005 (ESP)",
      nca: "NCA ECC-2-4-2"
    },
    choices: [
      {
        level: 0,
        text: "Flat network: OT devices are directly connected to the IT network with no firewalls or segregation.",
        score: 0
      },
      {
        level: 1,
        text: "Basic isolation: A single shared firewall is in place, but rule configurations are permissive or unmanaged.",
        score: 1
      },
      {
        level: 2,
        text: "Segmented Architecture: Dedicated enterprise firewalls segregate IT and OT. Traffic is strictly controlled by port/IP restrictions.",
        score: 2
      },
      {
        level: 3,
        text: "Micro-segmentation: Internal OT networks are segmented into functional Zones & Conduits based on criticality, with active traffic inspection.",
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
    text: "Is there a functional Industrial DMZ (IDMZ) deployed between the IT and OT networks?",
    standards: {
      iec: "IEC 62443-3-3 (SR 5.1 / 5.2)",
      nerc: "NERC CIP-005-5 (R1)",
      nca: "NCA ECC-2-4-2-2"
    },
    choices: [
      {
        level: 0,
        text: "No IDMZ: Servers (like historians or license managers) span both IT and OT networks directly.",
        score: 0
      },
      {
        level: 1,
        text: "Dual-homed systems: Shared servers have dual network cards, one connected to IT and one to OT, without a DMZ.",
        score: 1
      },
      {
        level: 2,
        text: "Structured IDMZ: A dedicated DMZ exists. Data transfer occurs via intermediate servers (proxies, replica databases) located in the IDMZ.",
        score: 2
      },
      {
        level: 3,
        text: "Hardened IDMZ: Full DMZ architecture with strictly inspected data unidirectional replication (e.g., data diodes or secure proxies).",
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
    text: "How is vendor/staff remote engineering access to the OT network secured?",
    standards: {
      iec: "IEC 62443-3-3 (SR 1.1 / 1.2)",
      nerc: "NERC CIP-005-5 (R2)",
      nca: "NCA ECC-2-4-3"
    },
    choices: [
      {
        level: 0,
        text: "Unrestricted: Vendors use consumer tools (e.g., TeamViewer, AnyDesk) that bypass corporate firewalls.",
        score: 0
      },
      {
        level: 1,
        text: "Basic VPN: Users connect via a VPN directly into the OT network, authenticated by password only.",
        score: 1
      },
      {
        level: 2,
        text: "Secure Gateways: Access requires Multi-Factor Authentication (MFA) via a VPN, landing on a jump host inside the IDMZ.",
        score: 2
      },
      {
        level: 3,
        text: "Managed & Audited: MFA jump host access with on-demand (just-in-time) approval workflows, session recording, and automatic termination.",
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
    text: "How are credentials managed for HMIs, PLCs, and servers in the OT network?",
    standards: {
      iec: "IEC 62443-4-2 (EDR 1.1 / 1.2)",
      nerc: "NERC CIP-007-6 (R5)",
      nca: "NCA ECC-2-3"
    },
    choices: [
      {
        level: 0,
        text: "Shared defaults: Factory default credentials are used, or shared passwords (e.g. 'operator123') are written on monitors/desks.",
        score: 0
      },
      {
        level: 1,
        text: "Unique but static: Standard devices have customized passwords, but they are identical across the plant and changed rarely.",
        score: 1
      },
      {
        level: 2,
        text: "Individual Accounts: Staff have unique personal logins for major OT applications, with standard complexity policies enforced.",
        score: 2
      },
      {
        level: 3,
        text: "Centralized Identity (RBAC): Centralized authentication (e.g., OT Active Directory) with Role-Based Access Control and automated password vaulting.",
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
    text: "What levels of privilege restrictions and workstation hardening are applied?",
    standards: {
      iec: "IEC 62443-4-2 (EDR 2.1 / 2.3)",
      nerc: "NERC CIP-007-6 (R2 / R5)",
      nca: "NCA ECC-2-3-2"
    },
    choices: [
      {
        level: 0,
        text: "No restrictions: HMIs run with permanent local Administrator privileges; USB ports, CMD, and browsers are active and open.",
        score: 0
      },
      {
        level: 1,
        text: "Minor restrictions: Local admin is reserved, but non-essential software (browsers, email, office tools) remains installed on HMIs.",
        score: 1
      },
      {
        level: 2,
        text: "Hardened configurations: Workstations are locked down using GPOs. Non-essential services, protocols, and unused physical ports are disabled.",
        score: 2
      },
      {
        level: 3,
        text: "Continuous Integrity: Workstations are fully hardened, utilize application whitelisting (AppLocker/EDR), and log deviations automatically.",
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
    text: "How are wireless networks and portable media (USBs, engineering laptops) governed?",
    standards: {
      iec: "IEC 62443-3-3 (SR 1.6) / IEC 62443-4-2",
      nerc: "NERC CIP-010-3 (R4)",
      nca: "NCA ECC-2-21-2"
    },
    choices: [
      {
        level: 0,
        text: "Unregulated: Anyone can connect USB devices or laptops. Open or weakly encrypted Wi-Fi reaches the OT floor.",
        score: 0
      },
      {
        level: 1,
        text: "Policy only: Written policies exist prohibiting personal USBs, but no technical enforcement or scanning is configured.",
        score: 1
      },
      {
        level: 2,
        text: "Enforced restrictions: USB ports are disabled via GPO/software. External files must pass through a dedicated scanner kiosk. Wi-Fi uses WPA3 Enterprise.",
        score: 2
      },
      {
        level: 3,
        text: "Zero-Trust Portable Media: Secure isolated kiosk scans, encrypts, and signs approved files on managed USB keys. Unauthorized USBs trigger SOC alerts.",
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
    text: "What is the accuracy and mechanism of your OT hardware and software inventory?",
    standards: {
      iec: "IEC 62443-2-1 / IEC 62443-2-4",
      nerc: "NERC CIP-002-5.1",
      nca: "NCA ECC-2-2-2"
    },
    choices: [
      {
        level: 0,
        text: "No inventory: No documentation of assets; engineers find devices manually during downtime.",
        score: 0
      },
      {
        level: 1,
        text: "Static spreadsheets: An Excel file lists IP addresses and basic descriptions, updated manually or on a major upgrade.",
        score: 1
      },
      {
        level: 2,
        text: "Semi-automated / Regular Audits: Inventories are updated quarterly, including software versions, firmware levels, and device models.",
        score: 2
      },
      {
        level: 3,
        text: "Continuous Asset Discovery: Passive monitoring tools continuously discover devices, mapping firmware versions and software bills of materials (SBOM) automatically.",
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
    text: "How are software and firmware vulnerabilities patched and managed in your OT environment?",
    standards: {
      iec: "IEC 62443-2-4 (SP 03.01 - 03.09)",
      nerc: "NERC CIP-007-6 (R1 / R2)",
      nca: "NCA ECC-2-12"
    },
    choices: [
      {
        level: 0,
        text: "No patching: Devices are installed and left indefinitely. No vulnerability monitoring is performed.",
        score: 0
      },
      {
        level: 1,
        text: "Reactive patching: Systems are patched only after an incident, major audit failure, or when vendor upgrades require it.",
        score: 1
      },
      {
        level: 2,
        text: "Risk-based testing: Patches are monitored, tested on non-production systems, and deployed during planned maintenance windows.",
        score: 2
      },
      {
        level: 3,
        text: "Structured & Shielded: Formal vulnerability management lifecycle. Virtual patching (IPS) shields unpatchable legacy systems; vendors certify patches.",
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
    text: "How is the integrity of supply-chain software and OEM firmware verified?",
    standards: {
      iec: "IEC 62443-4-1 (Secure Lifecycle) / IEC 62443-2-4",
      nerc: "NERC CIP-013-1 (R1 / R2)",
      nca: "NCA ECC-2-19"
    },
    choices: [
      {
        level: 0,
        text: "Untrusted: Firmware and configuration files are downloaded from unsecured sites, or provided on loose USBs by contractors.",
        score: 0
      },
      {
        level: 1,
        text: "Basic hashing: Hashes are verified manually if the vendor site prominently displays them, but this is optional.",
        score: 1
      },
      {
        level: 2,
        text: "Contractor SLA: Supply-chain contracts mandate security standards. Firmware is obtained only via secure vendor portals and hashes are verified.",
        score: 2
      },
      {
        level: 3,
        text: "Cryptographic validation: Secure Boot validation on controllers, cryptographic verification of firmware signatures, and SBOM validation on all upgrades.",
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
    text: "What security logging and monitoring capabilities exist in the OT environment?",
    standards: {
      iec: "IEC 62443-3-3 (SR 6.1 / 6.2)",
      nerc: "NERC CIP-007-6 (R3)",
      nca: "NCA ECC-2-8"
    },
    choices: [
      {
        level: 0,
        text: "No monitoring: Log files are disabled or ignored. Event logs are overwritten quickly due to lack of space.",
        score: 0
      },
      {
        level: 1,
        text: "Local logging: Individual servers and switches write logs to local drives. Investigation is purely post-incident.",
        score: 1
      },
      {
        level: 2,
        text: "Centralized Syslog: Critical server and firewall logs are forwarded to a central SIEM server located in the IT zone or a dedicated OT server.",
        score: 2
      },
      {
        level: 3,
        text: "Managed OT-SOC: Real-time analysis of OT protocol logs with specialized alert correlations, monitored 24/7 by an OT-competent Security Operations Center.",
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
    text: "Is there a documented Incident Response Plan (IRP) for OT, and how often is it tested?",
    standards: {
      iec: "IEC 62443-2-1 / IEC 62443-2-4",
      nerc: "NERC CIP-008-6 (R1 / R2)",
      nca: "NCA ECC-2-16"
    },
    choices: [
      {
        level: 0,
        text: "No IRP: No plan. Actions during an event are reactive, relying on vendor calls or physical plant shutdowns.",
        score: 0
      },
      {
        level: 1,
        text: "IT-aligned plan: A generic corporate IT incident response plan is referenced, but lacks details on OT protocols or physical process impacts.",
        score: 1
      },
      {
        level: 2,
        text: "OT-specific IRP: A documented, separate plan with defined roles, safety-first playbooks, and clear communication guidelines.",
        score: 2
      },
      {
        level: 3,
        text: "Fully simulated IRP: Annual joint tabletop exercises and Red Team simulations involving control room operators, engineering, safety, and leadership.",
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
    text: "What network traffic visibility and intrusion detection (IDS) are deployed inside the OT network?",
    standards: {
      iec: "IEC 62443-3-3 (SR 6.1 / 6.2)",
      nerc: "NERC CIP-007-6 (R3)",
      nca: "NCA ECC-2-8"
    },
    choices: [
      {
        level: 0,
        text: "None: No network visibility inside the OT environment. Firewall logs are the only network records.",
        score: 0
      },
      {
        level: 1,
        text: "IT IDS: Standard intrusion detection systems are placed on IT-OT routers, but they do not parse industrial protocols (e.g. Modbus, DNP3).",
        score: 1
      },
      {
        level: 2,
        text: "OT IDS Passive: SPAN/Mirror ports feed network traffic to an OT-specific IDS that detects protocol deviations and known industrial signatures.",
        score: 2
      },
      {
        level: 3,
        text: "DPI & Behavioral Analysis: Deep Packet Inspection (DPI) checks the payloads of industrial commands, mapping baseline traffic patterns to detect anomalies.",
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
    text: "What is your backup strategy for engineering project files, PLC logic, and HMI configurations?",
    standards: {
      iec: "IEC 62443-2-4 (SP 09.01 - 09.05)",
      nerc: "NERC CIP-009-6 (R1)",
      nca: "NCA ECC-2-9"
    },
    choices: [
      {
        level: 0,
        text: "No backups: No backup of PLC code or HMI configurations. Rebuilding requires OEM support or starting from scratch.",
        score: 0
      },
      {
        level: 1,
        text: "Ad-hoc backups: Engineers keep backups of PLC code on personal laptops or shared drives. No schedule is defined.",
        score: 1
      },
      {
        level: 2,
        text: "Systematic backups: Automated scheduled backups are captured. Backups are stored on a separate server, with a weekly copy kept offline.",
        score: 2
      },
      {
        level: 3,
        text: "Immutable Version Control: Backups are stored in an immutable, version-controlled OT code repository. Automated hashes verify changes from active controllers.",
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
    text: "How frequently and thoroughly are backup restorations tested for OT systems?",
    standards: {
      iec: "IEC 62443-2-4 (SP 09.04)",
      nerc: "NERC CIP-009-6 (R2)",
      nca: "NCA ECC-2-9-2"
    },
    choices: [
      {
        level: 0,
        text: "Never tested: Backups have never been restored. The ability to restore from files is unverified.",
        score: 0
      },
      {
        level: 1,
        text: "Theoretical check: Backups are verified as completed via log checklists, but actual restoration is rarely executed.",
        score: 1
      },
      {
        level: 2,
        text: "Regular recovery drills: Restore drills are performed annually on a dedicated offline test bench, covering HMIs and PLCs.",
        score: 2
      },
      {
        level: 3,
        text: "Full bare-metal validation: Comprehensive Disaster Recovery testing is conducted, simulating a complete plant loss to validate restoration timelines (RTO/RPO).",
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
    text: "What physical security controls and utility redundancy (UPS, generators) protect critical OT locations?",
    standards: {
      iec: "IEC 62443-3-3 (SR 7.1 / 7.2)",
      nerc: "NERC CIP-006-6 (Physical Security)",
      nca: "NCA ECC-2-20"
    },
    choices: [
      {
        level: 0,
        text: "Unsecured: Control rooms are unlocked, cabinet doors are open. Power is single-feed with no UPS or generator support.",
        score: 0
      },
      {
        level: 1,
        text: "Basic control: Key locks exist on control room doors. Basic consumer-grade UPS devices back up critical servers for <15 minutes.",
        score: 1
      },
      {
        level: 2,
        text: "Hardened: Access to control room is card-controlled and monitored. Industrial-grade UPS and generator backup exist, supporting operations for hours.",
        score: 2
      },
      {
        level: 3,
        text: "Defense-in-depth: Biometric physical access, continuous CCTV tracking, environmental monitors in cabinets, redundant UPS lines, and automatic failovers.",
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
