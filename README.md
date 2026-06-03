# OT/ICS Cybersecurity Assessment Platform

A structured, client-side self-assessment tool designed for industrial facilities to evaluate their Operational Technology (OT) cybersecurity posture against **IEC 62443**, **NERC CIP**, and **Saudi NCA ECC/CSCC** controls.

## 🌟 Key Features

- **100% Client-Side Processing**: Designed to address regulatory and confidentiality concerns. No network topology or compliance data is transmitted to external servers; all operations are executed in browser memory.
- **Standards Mapping**: Cross-references questions to specific clauses in:
  - **IEC 62443** (Zones & Conduits, System Requirements)
  - **NERC CIP** (ESP, electronic access controls, backup/restoration)
  - **Saudi NCA ECC-1:2018 / CSCC-1:2019**
- **Dynamic Dashboard**: Computes maturity scores (Level 1–4 index) and renders a visual SVG radar chart mapping vectors across domains.
- **Actionable Remediation Roadmap**: Automatically filters high, medium, and low-priority mitigation recommendations based on the target gaps, mapping out cost (`$`) and operational effort details.
- **Local Import/Export**: Users can export assessment data to a local `.json` file and reload it later.
- **Print to PDF Layout**: Optimized CSS print layout that reformats the dashboard into a clean, professional, print-ready document.

## 🛠️ Tech Stack

- **Structure**: Semantic HTML5
- **Styling**: Vanilla CSS (Responsive, dark-themed, glassmorphic layout)
- **Logic**: Vanilla ES Modules JavaScript
- **No Build Dependencies**: Lightweight, offline-capable, and zero-install footprint.

## 🚀 How to Run Locally

You can launch the project using any local static web server. 

### Using Python:
```bash
python -m http.server 8080
```
Then visit **`http://localhost:8080`** in your browser.

### Using Node.js:
```bash
npx http-server -p 8080
```
Then visit **`http://localhost:8080`** in your browser.
