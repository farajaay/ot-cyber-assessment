// Advanced OT/ICS Cybersecurity Audit Definitions
// Conforming to IEC 62443, NERC CIP, and Saudi NCA guidelines.

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

export const MATURITY_DIMENSIONS = {
  P: { id: "P", name: "Policy & Governance", desc: "Written and approved operating procedures (SOPs)." },
  T: { id: "T", name: "Technical Implementation", desc: "Active logical and physical hardware/software controls." },
  L: { id: "L", name: "People & Competency", desc: "Training, awareness, and qualification of operational staff." },
  A: { id: "A", name: "Auditing & Verification", desc: "Periodic compliance logging, audits, and configuration reviews." }
};

export const CONTROLS = [
  // Network Segmentation
  {
    id: "C1",
    domain: "NS",
    title: "Boundary Protection & IDMZ Staging",
    description: "Deployment of stateful firewall perimeters separating the Enterprise network from control segments, utilizing an Industrial DMZ (IDMZ) to terminate direct connections.",
    standards: { iec: "IEC 62443-3-3 (SR 5.2)", nerc: "NERC CIP-005 (ESP)", nca: "NCA ECC-2-4-2" },
    remediations: {
      P: "Draft and approve a dedicated Boundary Protection and Network Security Governance Policy.",
      T: "Deploy a hardened boundary firewall separating IT and OT, routing all cross-zone traffic through intermediate store-and-forward proxies inside a dedicated IDMZ segment.",
      L: "Conduct annual training for engineering and corporate IT teams on IACS boundary rules and forbidden dual-homing configurations.",
      A: "Schedule quarterly configurations audits and connection tests of the IDMZ firewalls to detect unauthorized rules."
    }
  },
  {
    id: "C2",
    domain: "NS",
    title: "Transient Remote Access Security",
    description: "Governance, authentication, and logging of external vendor and internal engineering remote sessions traversing critical system segments.",
    standards: { iec: "IEC 62443-3-3 (SR 1.1/1.2)", nerc: "NERC CIP-005-5 (R2)", nca: "NCA ECC-2-4-3" },
    remediations: {
      P: "Implement a Remote Access Authorization and Permitting Policy detailing workflow sign-offs.",
      T: "Deploy a Multi-Factor Authentication (MFA) VPN landing on a Jump Host within the IDMZ, configured with command blocklists and full session recording.",
      L: "Train third-party contractors and local engineering staff on secure VPN token handling and Jump Host session behaviors.",
      A: "Conduct monthly audits of remote connection logs, cross-referencing session durations against active permits-to-work."
    }
  },
  // Access Control
  {
    id: "C3",
    domain: "AC",
    title: "Identity Governance & Privilege Control",
    description: "Management of HMI, server, and engineering workstation accounts, restricting elevated privileges according to the principle of least privilege.",
    standards: { iec: "IEC 62443-4-2 (EDR 1.1/1.2)", nerc: "NERC CIP-007-6 (R5)", nca: "NCA ECC-2-3" },
    remediations: {
      P: "Establish an IACS Account Provisioning Policy defining corporate identity validation and role profiles.",
      T: "Decommission shared accounts on all workstations, integrate assets with an offline OT Active Directory, and deploy a Privileged Access Management (PAM) vault.",
      L: "Educate operators and system engineers on the risks of administrative bypasses and personal account hygiene.",
      A: "Perform bi-annual reviews of account groups, immediately revoking access keys for transferred or terminated personnel."
    }
  },
  {
    id: "C4",
    domain: "AC",
    title: "Endpoint Hardening & Media Restriction",
    description: "Disabling unnecessary services and ports on Windows/Linux nodes, coupled with strict authorization of USB storage media.",
    standards: { iec: "IEC 62443-4-2 (EDR 2.1/2.3)", nerc: "NERC CIP-010-3 (R4)", nca: "NCA ECC-2-3-2" },
    remediations: {
      P: "Establish a standardized IACS Endpoint Hardening Checklist and a Portable Media Policy.",
      T: "Block USB mass storage interfaces via Active Directory GPOs, deploy an isolated scanning kiosk for file ingress, and implement application whitelisting.",
      L: "Train operations and contractor personnel on safe file ingestion procedures using the scanning kiosk.",
      A: "Perform monthly configuration audits on workstations to verify that unauthorized services remain disabled."
    }
  },
  // Asset Governance
  {
    id: "C5",
    domain: "AV",
    title: "Asset Inventory & Lifecycle Management",
    description: "Maintaining an accurate registry of physical, logical, and software assets deployed inside the IACS network.",
    standards: { iec: "IEC 62443-2-1", nerc: "NERC CIP-002-5.1", nca: "NCA ECC-2-2-2" },
    remediations: {
      P: "Approve an Asset Management and Lifecycle Governance Procedure, assigning owners to critical systems.",
      T: "Deploy a passive OT asset discovery utility (e.g. Grassmarlin, Claroty) to map active components and capture MAC/IP profiles.",
      L: "Train site engineers to catalog new hardware and update central registries during maintenance updates.",
      A: "Conduct biannual physical audits of cabinets, cross-referencing findings against active network connection lists."
    }
  },
  {
    id: "C6",
    domain: "AV",
    title: "Patch & Vulnerability Lifecycle Management",
    description: "Evaluating software/firmware alerts, testing vendor-approved updates, and implementing compensating controls (virtual patching).",
    standards: { iec: "IEC 62443-2-4 (SP 03.01)", nerc: "NERC CIP-007-6 (R1/R2)", nca: "NCA ECC-2-12" },
    remediations: {
      P: "Draft an IACS-specific Vulnerability Staging and Patching Policy, defining target patching timelines based on CVSS scores.",
      T: "Configure an offline WSUS server for HMI patching, build a dedicated staging test rig, and apply IPS virtual patching for legacy controllers.",
      L: "Educate maintenance planners on coordinating security updates with scheduled production shutdowns.",
      A: "Track and audit the Mean Time to Remediate (MTTR) for critical vulnerabilities across IACS zones."
    }
  },
  // Threat Monitoring
  {
    id: "C7",
    domain: "TR",
    title: "Event Log Management & SOC Integration",
    description: "Centralized streaming of security logs from firewalls, switches, and workstations, with active alerting for anomalous events.",
    standards: { iec: "IEC 62443-3-3 (SR 6.1)", nerc: "NERC CIP-007-6 (R3)", nca: "NCA ECC-2-8" },
    remediations: {
      P: "Develop an Event Logging and Security Incident Governance Framework.",
      T: "Deploy a centralized Syslog collector inside the OT network, write logic filters to capture administrative anomalies, and integrate feeds with an OT-specific SIEM.",
      L: "Train security analysts on industrial protocol anomalies (e.g., unexpected PLC program writes, controller restarts).",
      A: "Conduct monthly validation runs to confirm that all endpoints successfully forward logs to the collection server."
    }
  },
  {
    id: "C8",
    domain: "TR",
    title: "Incident Response Playbooks & Testing",
    description: "Formulating emergency procedures for OT-specific scenarios (e.g., controller overrides, ransomware) and performing periodic validation exercises.",
    standards: { iec: "IEC 62443-2-4", nerc: "NERC CIP-008-6", nca: "NCA ECC-2-16" },
    remediations: {
      P: "Develop IACS incident playbooks detailing physical containment steps that prioritize process safety over network isolation.",
      T: "Deploy local backup terminals, isolated control loops, and direct safety switches for emergency containment.",
      L: "Conduct annual joint tabletop simulation drills involving operations, IT security, plant managers, and regulatory bodies.",
      A: "Review and update response playbooks within 30 days of every tabletop exercise or historical security event."
    }
  },
  // Disaster Recovery
  {
    id: "C9",
    domain: "DR",
    title: "Immutable Backup Architecture",
    description: "Maintaining secure, version-controlled copies of HMI operating system drives, SCADA databases, network configs, and PLC program binaries.",
    standards: { iec: "IEC 62443-2-4 (SP 09.01)", nerc: "NERC CIP-009-6 (R1)", nca: "NCA ECC-2-9" },
    remediations: {
      P: "Approve a Disaster Recovery and Backup Policy, establishing strict Recovery Time (RTO) and Recovery Point (RPO) targets.",
      T: "Configure automated scheduled backups stored on an isolated backup server, rotating an offline air-gapped backup copy weekly.",
      L: "Instruct system administrators and field engineers on check-in workflows for PLC programming files.",
      A: "Implement automated checksum audits to verify that backed-up binary codes match running PLC processes."
    }
  },
  {
    id: "C10",
    domain: "DR",
    title: "Bare-Metal Restoration Testing",
    description: "Validating that backup archives can successfully rebuild operational configurations in the event of hardware destruction.",
    standards: { iec: "IEC 62443-2-4 (SP 09.04)", nerc: "NERC CIP-009-6 (R2)", nca: "NCA ECC-2-9-2" },
    remediations: {
      P: "Incorporate formal recovery validation criteria into the Business Continuity Plan.",
      T: "Maintain a dedicated offline test rig with spare PLCs, HMIs, and switches to run full-scope bare-metal recovery tests.",
      L: "Train site maintenance teams to execute emergency rebuild procedures without relying on external vendor support.",
      A: "Conduct annual audited bare-metal restoration drills, reporting actual recovery speeds against target RTO/RPO limits."
    }
  }
];

// Topology Rules Definitions
export const TOPOLOGY_ZONES = {
  enterprise: { id: "enterprise", name: "Enterprise Zone (IT LAN)", level: "Level 4/5" },
  idmz: { id: "idmz", name: "Industrial DMZ (IDMZ)", level: "Level 3.5" },
  operations: { id: "operations", name: "Operations Zone (Level 3 SCADA)", level: "Level 3" },
  control: { id: "control", name: "Process Control Zone (Level 1/2 PLCs)", level: "Level 1/2" },
  safety: { id: "safety", name: "Safety Instrumented Systems (SIS)", level: "Level 0" }
};

export const CONNECTION_TYPES = {
  none: { id: "none", name: "Air Gapped / Disconnected", security: 3 },
  unidirectional: { id: "unidirectional", name: "Unidirectional Gateway (Data Diode)", security: 3 },
  secure_firewall: { id: "secure_firewall", name: "Hardened Stateful Firewall (Least Privilege)", security: 2 },
  permissive_firewall: { id: "permissive_firewall", name: "Permissive Firewall (Broad Ports/No Proxy)", security: 1 },
  direct: { id: "direct", name: "Direct Connection (Unrestricted Routing)", security: 0 }
};

export const TOPOLOGY_RULES = [
  {
    id: "TR1",
    zoneA: "enterprise",
    zoneB: "safety",
    forbidden: ["direct", "permissive_firewall", "secure_firewall"],
    severity: "CRITICAL",
    message: "Critical Boundary Bypass: Safety Instrumented Systems (SIS / Level 0) must remain strictly air-gapped from the corporate Enterprise segment.",
    standard: "IEC 62443-3-3 (SR 5.2) / NERC CIP-005"
  },
  {
    id: "TR2",
    zoneA: "enterprise",
    zoneB: "control",
    forbidden: ["direct", "permissive_firewall"],
    severity: "CRITICAL",
    message: "Insecure Controller Exposure: The corporate Enterprise network has direct or poorly-filtered routing to Process Control Zones (Level 1/2 PLCs), bypassing boundary safeguards.",
    standard: "IEC 62443-3-3 (SR 5.2) / NERC CIP-005"
  },
  {
    id: "TR3",
    zoneA: "enterprise",
    zoneB: "operations",
    forbidden: ["direct", "permissive_firewall"],
    severity: "HIGH",
    message: "Missing IDMZ Staging: Enterprise assets communicate directly with Operations (Level 3 SCADA) without intermediate database replication or proxy gateways in the Industrial DMZ.",
    standard: "IEC 62443-3-3 (SR 5.1)"
  },
  {
    id: "TR4",
    zoneA: "operations",
    zoneB: "safety",
    forbidden: ["direct", "permissive_firewall"],
    severity: "CRITICAL",
    message: "Unprotected Safety Boundary: Safety Instrumented Systems (SIS / Level 0) are connected to Level 3 Operations using direct or permissive controls. Compromise of SCADA servers will impact safety shutoff loops.",
    standard: "IEC 62443-3-3 (SR 5.2)"
  },
  {
    id: "TR5",
    zoneA: "control",
    zoneB: "safety",
    forbidden: ["direct"],
    severity: "HIGH",
    message: "Direct Control-to-SIS Routing: Level 1/2 Controllers bridge directly to Level 0 Safety Instrumented Systems. Traffic should transit via a security firewall to isolate safety loops.",
    standard: "IEC 62443-3-3 (SR 5.2)"
  }
];
