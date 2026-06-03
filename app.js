import { DOMAINS, MATURITY_DIMENSIONS, CONTROLS, TOPOLOGY_ZONES, CONNECTION_TYPES, TOPOLOGY_RULES } from "./questions.js";

class AdvancedOTAssessmentApp {
  constructor() {
    this.activeTab = "topology";
    
    // Application State
    this.topologyConnections = {
      "enterprise_safety": "none",
      "enterprise_control": "direct",
      "enterprise_operations": "permissive_firewall",
      "operations_safety": "permissive_firewall",
      "control_safety": "direct"
    };
    
    this.grades = {}; // Format: { C1: { P: 0, T: 0, L: 0, A: 0 }, ... }
    
    // Initialize empty grades
    CONTROLS.forEach(c => {
      this.grades[c.id] = { P: 0, T: 0, L: 0, A: 0 };
    });
    
    // Cache DOM Elements
    this.elements = {
      // Tab Links
      tabLinks: document.querySelectorAll(".tab-link"),
      tabContents: document.querySelectorAll(".tab-content"),
      
      // Modeler Elements
      topologySelectsContainer: document.getElementById("topology-selects-container"),
      topologyAlertsContainer: document.getElementById("topology-alerts-container"),
      
      // Matrix Input Elements
      matrixContainer: document.getElementById("matrix-container"),
      
      // Results Elements
      overallMaturityNumber: document.getElementById("overall-maturity-number"),
      overallMaturityText: document.getElementById("overall-maturity-text"),
      radialProgress: document.getElementById("radial-progress"),
      pctIec: document.getElementById("pct-iec"),
      pctNerc: document.getElementById("pct-nerc"),
      pctNca: document.getElementById("pct-nca"),
      pctHcis: document.getElementById("pct-hcis"),
      radarChartContainer: document.getElementById("radar-chart-container"),
      domainBarsContainer: document.getElementById("domain-bars-container"),
      timelineContainer: document.getElementById("timeline-container"),
      architectureGapsList: document.getElementById("architecture-gaps-list"),
      architectureGapsSection: document.getElementById("architecture-gaps-section"),
      
      // Action Elements
      btnExportJson: document.getElementById("btn-export-json"),
      btnImportJson: document.getElementById("btn-import-json"),
      fileInput: document.getElementById("file-input"),
      btnPrintPdf: document.getElementById("btn-print-pdf"),
      btnRestart: document.getElementById("btn-restart"),
      btnGenerateReport: document.getElementById("btn-generate-report"),
      
      // Form Elements
      leadForm: document.getElementById("lead-form"),
      formSubmitBtn: document.getElementById("form-submit-btn"),
      submitSuccessAlert: document.getElementById("submit-success-alert")
    };
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.loadState();
    this.renderTopologyModeler();
    this.renderMaturityMatrix();
    this.evaluateTopology();
    this.switchTab(this.activeTab);
  }
  
  setupEventListeners() {
    // Tab switching
    this.elements.tabLinks.forEach(link => {
      link.addEventListener("click", () => {
        this.switchTab(link.dataset.tab);
      });
    });
    
    // Action trigger on assessment completion
    if (this.elements.btnGenerateReport) {
      this.elements.btnGenerateReport.addEventListener("click", () => {
        this.switchTab("results");
      });
    }
    
    // Global Actions
    this.elements.btnExportJson.addEventListener("click", () => this.exportStateToJSON());
    this.elements.btnImportJson.addEventListener("click", () => this.elements.fileInput.click());
    this.elements.fileInput.addEventListener("change", (e) => this.importStateFromJSON(e));
    this.elements.btnPrintPdf.addEventListener("click", () => window.print());
    this.elements.btnRestart.addEventListener("click", () => this.restartAssessment());
    
    // Form Submit
    this.elements.leadForm.addEventListener("submit", (e) => this.handleLeadSubmit(e));
  }
  
  loadState() {
    try {
      const saved = localStorage.getItem("ot_cyber_advanced_audit_state");
      if (saved) {
        const state = JSON.parse(saved);
        this.topologyConnections = state.topologyConnections || this.topologyConnections;
        this.grades = state.grades || this.grades;
        this.activeTab = state.activeTab || "topology";
      }
    } catch (e) {
      console.error("Failed to load local storage state:", e);
    }
  }
  
  saveState() {
    try {
      const state = {
        topologyConnections: this.topologyConnections,
        grades: this.grades,
        activeTab: this.activeTab
      };
      localStorage.setItem("ot_cyber_advanced_audit_state", JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save local storage state:", e);
    }
  }
  
  switchTab(tabId) {
    this.activeTab = tabId;
    this.saveState();
    
    this.elements.tabLinks.forEach(link => {
      if (link.dataset.tab === tabId) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
    
    this.elements.tabContents.forEach(content => {
      if (content.id === `tab-content-${tabId}`) {
        content.style.display = "block";
      } else {
        content.style.display = "none";
      }
    });
    
    if (tabId === "results") {
      this.showResults();
    }
  }
  
  /* =========================================================================
     1. OT Boundary Topology Modeler
     ========================================================================= */
  renderTopologyModeler() {
    this.elements.topologySelectsContainer.innerHTML = "";
    
    // Render selectors for the 5 key boundaries
    const boundaryPairs = [
      { id: "enterprise_safety", name: "Enterprise Zone to Safety Systems", desc: "Corporate LAN directly to Level 0 Safety Instrumented systems (SIS)", key: "enterprise_safety" },
      { id: "enterprise_control", name: "Enterprise Zone to Process Control", desc: "Corporate LAN to Level 1/2 PLC networks", key: "enterprise_control" },
      { id: "enterprise_operations", name: "Enterprise Zone to Operations", desc: "Corporate LAN to Level 3 SCADA databases/historians", key: "enterprise_operations" },
      { id: "operations_safety", name: "Operations Zone to Safety Systems", desc: "Level 3 SCADA servers directly to Level 0 Safety Systems", key: "operations_safety" },
      { id: "control_safety", name: "Process Control to Safety Systems", desc: "Level 1/2 controllers to Level 0 Safety System controllers", key: "control_safety" }
    ];
    
    boundaryPairs.forEach(pair => {
      const row = document.createElement("tr");
      
      let optionsHTML = "";
      Object.values(CONNECTION_TYPES).forEach(type => {
        const isSelected = this.topologyConnections[pair.key] === type.id;
        optionsHTML += `<option value="${type.id}" ${isSelected ? "selected" : ""}>${type.name}</option>`;
      });
      
      row.innerHTML = `
        <td>
          <div class="zone-label">${pair.name}</div>
          <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">${pair.desc}</div>
        </td>
        <td>
          <select class="connection-select" data-key="${pair.key}">
            ${optionsHTML}
          </select>
        </td>
      `;
      
      // Bind event listener to connection select fields
      const select = row.querySelector("select");
      select.addEventListener("change", (e) => {
        this.topologyConnections[pair.key] = e.target.value;
        this.saveState();
        this.evaluateTopology();
      });
      
      this.elements.topologySelectsContainer.appendChild(row);
    });
  }
  
  evaluateTopology() {
    this.elements.topologyAlertsContainer.innerHTML = "";
    const activeViolations = [];
    
    TOPOLOGY_RULES.forEach(rule => {
      // Find the active connection value for this rule
      const key = `${rule.zoneA}_${rule.zoneB}`;
      const activeConn = this.topologyConnections[key];
      
      if (rule.forbidden.includes(activeConn)) {
        activeViolations.push(rule);
        
        // Render rule validation card on modeler screen
        const alertCard = document.createElement("div");
        alertCard.className = `rule-alert-card severity-${rule.severity.toLowerCase()} fade-in`;
        alertCard.innerHTML = `
          <div class="rule-header">
            <span>${rule.severity} ARCHITECTURAL VIOLATION</span>
            <span class="rule-standard">${rule.standard}</span>
          </div>
          <div>${rule.message}</div>
          <div style="font-size: 0.75rem; font-weight: 600; margin-top: 5px;">Active configuration: ${CONNECTION_TYPES[activeConn].name}</div>
        `;
        this.elements.topologyAlertsContainer.appendChild(alertCard);
      }
    });
    
    if (activeViolations.length === 0) {
      this.elements.topologyAlertsContainer.innerHTML = `
        <div style="text-align: center; color: var(--accent-green); background: #ecfdf5; border: 1px solid #a7f3d0; padding: 2rem; border-radius: 8px; font-weight: 600; font-size: 0.9rem;">
          ✓ Zone boundary architecture is compliant with basic zoning rules. No structural bypasses detected.
        </div>
      `;
    }
    
    return activeViolations;
  }
  
  /* =========================================================================
     2. Multi-Dimensional Maturity Matrix
     ========================================================================= */
  renderMaturityMatrix() {
    this.elements.matrixContainer.innerHTML = "";
    
    CONTROLS.forEach(control => {
      const block = document.createElement("div");
      block.className = "control-block";
      
      const domain = DOMAINS[control.domain];
      
      block.innerHTML = `
        <div class="control-header">
          <span class="control-domain-badge" style="background-color: ${domain.color};">${domain.id}</span>
          <span class="control-title">${control.title}</span>
        </div>
        <div class="control-description">${control.description}</div>
        <div class="matrix-grid"></div>
      `;
      
      const grid = block.querySelector(".matrix-grid");
      
      // Render the 4 C2M2 maturity dimensions for this control requirement
      Object.values(MATURITY_DIMENSIONS).forEach(dim => {
        const card = document.createElement("div");
        card.className = "dimension-card";
        
        card.innerHTML = `
          <div class="dimension-header-text" title="${dim.desc}">${dim.name}</div>
          <div class="grade-btn-group">
            <button class="grade-btn" data-val="0" title="Not Existent / Absent">L0</button>
            <button class="grade-btn" data-val="1" title="Draft Policy / Ad-hoc Setup">L1</button>
            <button class="grade-btn" data-val="2" title="Approved / Technically Implemented">L2</button>
            <button class="grade-btn" data-val="3" title="Continuously Audited / Optimized">L3</button>
          </div>
        `;
        
        const buttons = card.querySelectorAll(".grade-btn");
        const activeScore = this.grades[control.id][dim.id];
        
        buttons.forEach(btn => {
          const val = parseInt(btn.dataset.val);
          if (val === activeScore) {
            btn.classList.add("selected");
          }
          
          btn.addEventListener("click", () => {
            buttons.forEach(b => b.classList.remove("selected"));
            btn.classList.add("selected");
            
            // Save state
            this.grades[control.id][dim.id] = val;
            this.saveState();
          });
        });
        
        grid.appendChild(card);
      });
      
      this.elements.matrixContainer.appendChild(block);
    });
  }
  
  /* =========================================================================
     3. Score Aggregations & Dashboard Logic
     ========================================================================= */
  showResults() {
    this.elements.resultsContainer.style.display = "block";
    this.elements.resultsContainer.classList.add("fade-in");
    
    // 1. Calculations
    const scores = this.calculateScores();
    
    // 2. Main Metrics Rendering
    this.renderMaturityIndex(scores.overallScore);
    this.renderStandardComplaince(scores.standardsPct);
    
    // 3. Topology Breach Report List
    this.renderTopologyBreaches();
    
    // 4. SVG Graphical Renderers
    this.renderDomainBars(scores.domainScores);
    this.renderRadarChart(scores.domainScores);
    
    // 5. Gantt Timeline Timeline Compiler
    this.renderPhasedTimeline(scores.remediations);
  }
  
  calculateScores() {
    let totalScore = 0;
    const maxPossibleScore = CONTROLS.length * 4 * 3; // 10 controls * 4 dimensions * max score 3 = 120
    
    const domainTotals = {};
    const domainCounts = {};
    
    // C2M2 Dimension Tracking
    const dimensionTotals = { P: 0, T: 0, L: 0, A: 0 };
    const dimensionCounts = { P: 0, T: 0, L: 0, A: 0 };
    
    Object.keys(DOMAINS).forEach(d => {
      domainTotals[d] = 0;
      domainCounts[d] = 0;
    });
    
    const remediationsList = [];
    
    CONTROLS.forEach(c => {
      const controlGrades = this.grades[c.id];
      
      Object.keys(MATURITY_DIMENSIONS).forEach(dim => {
        const grade = controlGrades[dim] || 0;
        totalScore += grade;
        
        domainTotals[c.domain] += grade;
        domainCounts[c.domain]++;
        
        dimensionTotals[dim] += grade;
        dimensionCounts[dim]++;
        
        // If a control dimension falls below standard Level 2, we schedule remediation
        if (grade < 2) {
          remediationsList.push({
            controlId: c.id,
            controlTitle: c.title,
            domain: c.domain,
            dimensionId: dim,
            dimensionName: MATURITY_DIMENSIONS[dim].name,
            action: c.remediations[dim],
            score: grade
          });
        }
      });
    });
    
    // Compute standardized indices (0.0 - 3.0 scale)
    const overallScore = (totalScore / maxPossibleScore) * 3;
    
    const domainScores = {};
    Object.keys(DOMAINS).forEach(d => {
      domainScores[d] = (domainTotals[d] / (domainCounts[d] * 3)) * 3;
    });
    
    // Standard-specific weighted index algorithms
    // @ts-ignore
    // IEC 62443: Weighted focus across all operational levels
    const pPct = (dimensionTotals.P / (dimensionCounts.P * 3));
    const tPct = (dimensionTotals.T / (dimensionCounts.T * 3));
    const lPct = (dimensionTotals.L / (dimensionCounts.L * 3));
    const aPct = (dimensionTotals.A / (dimensionCounts.A * 3));
    
    const iecScore = Math.round((pPct * 0.25 + tPct * 0.45 + lPct * 0.15 + aPct * 0.15) * 100);
    // NERC CIP: Technical enforcement focus (70% tech, 30% audit)
    const nercScore = Math.round((tPct * 0.70 + aPct * 0.30) * 100);
    // NCA ECC: Governance and audit verification focus (40% policy, 20% training, 40% audit)
    const ncaScore = Math.round((pPct * 0.40 + lPct * 0.20 + aPct * 0.40) * 100);

    // HCIS SEC-10 Compliance: Weighted heavily on perimeter safety and core operational resilience controls
    const getControlAvg = (cId) => {
      const grades = this.grades[cId];
      return (grades.P + grades.T + grades.L + grades.A) / 12.0; // 4 dimensions * max 3 = 12
    };
    const c1 = getControlAvg("C1");
    const c2 = getControlAvg("C2");
    const c3 = getControlAvg("C3");
    const c4 = getControlAvg("C4");
    const c5 = getControlAvg("C5");
    const c6 = getControlAvg("C6");
    const c7 = getControlAvg("C7");
    const c8 = getControlAvg("C8");
    const c9 = getControlAvg("C9");
    const c10 = getControlAvg("C10");
    const hcisScore = Math.round(((c1 * 0.20) + (c2 * 0.20) + (c4 * 0.15) + (c7 * 0.15) + (c9 * 0.15) + ((c3 + c5 + c6 + c8 + c10) / 5 * 0.15)) * 100);
    
    return {
      overallScore: Number(overallScore.toFixed(2)),
      domainScores,
      standardsPct: {
        iec: Math.min(100, Math.max(0, iecScore)),
        nerc: Math.min(100, Math.max(0, nercScore)),
        nca: Math.min(100, Math.max(0, ncaScore)),
        hcis: Math.min(100, Math.max(0, hcisScore))
      },
      remediations: remediationsList
    };
  }
  
  renderMaturityIndex(score) {
    this.elements.overallMaturityNumber.innerText = score.toFixed(1);
    
    let text = "Ad-hoc (Level 1)";
    if (score > 2.6) {
      text = "Optimized (Level 4)";
    } else if (score > 1.8) {
      text = "Managed (Level 3)";
    } else if (score > 0.9) {
      text = "Developing (Level 2)";
    }
    
    this.elements.overallMaturityText.innerText = text;
    
    // Adjust radial gauge meter (dashoffset formula: 440 - (440 * pct))
    const pct = score / 3.0;
    const offset = 440 - (440 * pct);
    this.elements.radialProgress.style.strokeDashoffset = offset;
  }
  
  renderStandardComplaince(standards) {
    this.elements.pctIec.innerText = `${standards.iec}%`;
    this.elements.pctNerc.innerText = `${standards.nerc}%`;
    this.elements.pctNca.innerText = `${standards.nca}%`;
    this.elements.pctHcis.innerText = `${standards.hcis}%`;
  }
  
  renderTopologyBreaches() {
    this.elements.architectureGapsList.innerHTML = "";
    const violations = this.evaluateTopology();
    
    if (violations.length === 0) {
      this.elements.architectureGapsSection.style.display = "none";
      return;
    }
    
    this.elements.architectureGapsSection.style.display = "block";
    violations.forEach(v => {
      const item = document.createElement("div");
      item.className = `rule-alert-card severity-${v.severity.toLowerCase()}`;
      item.style.marginBottom = "0.5rem";
      item.innerHTML = `
        <div class="rule-header">
          <span>${v.severity} Architecture Defect</span>
          <span class="rule-standard">${v.standard}</span>
        </div>
        <div>${v.message}</div>
      `;
      this.elements.architectureGapsList.appendChild(item);
    });
  }
  
  renderDomainBars(domainScores) {
    this.elements.domainBarsContainer.innerHTML = "";
    
    Object.values(DOMAINS).forEach(domain => {
      const score = domainScores[domain.id];
      const pct = (score / 3.0) * 100;
      
      const barWrapper = document.createElement("div");
      barWrapper.className = "bar-wrapper";
      barWrapper.innerHTML = `
        <div class="bar-labels">
          <span class="bar-title">${domain.title}</span>
          <span class="bar-score" style="color: ${domain.color}">${score.toFixed(1)} / 3.0</span>
        </div>
        <div class="bar-outer">
          <div class="bar-inner" style="width: 0%; background: ${domain.color}"></div>
        </div>
      `;
      
      this.elements.domainBarsContainer.appendChild(barWrapper);
      
      setTimeout(() => {
        const inner = barWrapper.querySelector(".bar-inner");
        if (inner) inner.style.width = `${pct}%`;
      }, 100);
    });
  }
  
  renderRadarChart(domainScores) {
    this.elements.radarChartContainer.innerHTML = "";
    
    const size = 240;
    const center = size / 2;
    const maxVal = 3.0;
    const radius = 80;
    const domainKeys = Object.keys(DOMAINS);
    const numPoints = domainKeys.length;
    
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
    svg.style.overflow = "visible";
    
    const getCoordinates = (index, value) => {
      const angle = (index * 2 * Math.PI) / numPoints - Math.PI / 2;
      const r = (value / maxVal) * radius;
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle)
      };
    };
    
    // Draw concentric grids (Levels 1, 2, 3)
    [1.0, 2.0, 3.0].forEach(level => {
      const points = [];
      for (let i = 0; i < numPoints; i++) {
        const coord = getCoordinates(i, level);
        points.push(`${coord.x},${coord.y}`);
      }
      
      const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      polygon.setAttribute("points", points.join(" "));
      polygon.setAttribute("fill", "none");
      polygon.setAttribute("stroke", "rgba(0, 0, 0, 0.08)");
      polygon.setAttribute("stroke-width", "1");
      svg.appendChild(polygon);
      
      const firstCoord = getCoordinates(0, level);
      const labelText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      labelText.setAttribute("x", firstCoord.x + 4);
      labelText.setAttribute("y", firstCoord.y + 3);
      labelText.setAttribute("fill", "rgba(0, 0, 0, 0.4)");
      labelText.setAttribute("font-size", "7px");
      labelText.setAttribute("font-family", "JetBrains Mono");
      labelText.textContent = `L${level}`;
      svg.appendChild(labelText);
    });
    
    // Draw grid axes
    domainKeys.forEach((key, i) => {
      const outerCoord = getCoordinates(i, maxVal);
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", center);
      line.setAttribute("y1", center);
      line.setAttribute("x2", outerCoord.x);
      line.setAttribute("y2", outerCoord.y);
      line.setAttribute("stroke", "rgba(0, 0, 0, 0.06)");
      line.setAttribute("stroke-width", "1");
      svg.appendChild(line);
      
      const labelDistance = maxVal + 0.45;
      const textCoord = getCoordinates(i, labelDistance);
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      
      let textAnchor = "middle";
      if (textCoord.x > center + 10) textAnchor = "start";
      if (textCoord.x < center - 10) textAnchor = "end";
      
      text.setAttribute("x", textCoord.x);
      text.setAttribute("y", textCoord.y + 3);
      text.setAttribute("fill", DOMAINS[key].color);
      text.setAttribute("font-size", "9px");
      text.setAttribute("font-family", "Inter");
      text.setAttribute("font-weight", "bold");
      text.setAttribute("text-anchor", textAnchor);
      text.textContent = key;
      svg.appendChild(text);
    });
    
    // Draw user score polygon
    const userPoints = [];
    domainKeys.forEach((key, i) => {
      const coord = getCoordinates(i, domainScores[key]);
      userPoints.push(`${coord.x},${coord.y}`);
    });
    
    const userPolygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    userPolygon.setAttribute("points", userPoints.join(" "));
    userPolygon.setAttribute("fill", "rgba(37, 99, 235, 0.08)");
    userPolygon.setAttribute("stroke", "var(--accent-cyan)");
    userPolygon.setAttribute("stroke-width", "2");
    userPolygon.setAttribute("stroke-linejoin", "round");
    
    userPolygon.style.filter = "drop-shadow(0 2px 4px rgba(37, 99, 235, 0.15))";
    
    svg.appendChild(userPolygon);
    
    // Nodes dots
    domainKeys.forEach((key, i) => {
      const coord = getCoordinates(i, domainScores[key]);
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", coord.x);
      circle.setAttribute("cy", coord.y);
      circle.setAttribute("r", "3.5");
      circle.setAttribute("fill", "#ffffff");
      circle.setAttribute("stroke", DOMAINS[key].color);
      circle.setAttribute("stroke-width", "1.5");
      svg.appendChild(circle);
    });
    
    this.elements.radarChartContainer.appendChild(svg);
  }
  
  /* =========================================================================
     4. Gantt Timeline Remediation Scheduler
     ========================================================================= */
  renderPhasedTimeline(remediations) {
    this.elements.timelineContainer.innerHTML = "";
    
    // Define 4 phases
    const phases = [
      {
        id: "P1",
        title: "Phase 1: Perimeter Isolation & Ingress Containment",
        time: "Months 1 - 2",
        criteria: (task) => task.controlId === "C2" || task.controlId === "C3" || task.dimensionId === "T"
      },
      {
        id: "P2",
        title: "Phase 2: Segmented Architectures & Endpoint Hardening",
        time: "Months 3 - 4",
        criteria: (task) => task.controlId === "C1" || task.controlId === "C4" || task.dimensionId === "P"
      },
      {
        id: "P3",
        title: "Phase 3: Threat Ingestion, Monitoring & Incident Readiness",
        time: "Months 5 - 6",
        criteria: (task) => task.controlId === "C7" || task.controlId === "C8" || task.controlId === "C5"
      },
      {
        id: "P4",
        title: "Phase 4: Resilience Engineering & Compliance Verification",
        time: "Months 7+",
        criteria: (task) => task.controlId === "C9" || task.controlId === "C10" || task.controlId === "C6"
      }
    ];
    
    // Check if there are any topology violations and inject them as topmost critical tasks in Phase 1
    const topologyViolations = this.evaluateTopology();
    const topologyTasks = topologyViolations.map(v => ({
      controlTitle: `Topology: ${v.zoneA.toUpperCase()}-${v.zoneB.toUpperCase()}`,
      dimensionName: "Architecture",
      action: v.message,
      effort: "High",
      cost: v.severity === "CRITICAL" ? "$$$" : "$$"
    }));
    
    let totalTasksScheduled = 0;
    
    phases.forEach((phase, pIdx) => {
      // Filter tasks matching this phase criteria
      let phaseTasks = remediations.filter(task => phase.criteria(task));
      
      // Inject topology tasks into Phase 1
      if (pIdx === 0 && topologyTasks.length > 0) {
        phaseTasks = [...topologyTasks, ...phaseTasks];
      }
      
      if (phaseTasks.length === 0) return;
      
      totalTasksScheduled += phaseTasks.length;
      
      const phaseDiv = document.createElement("div");
      phaseDiv.className = "timeline-phase fade-in";
      
      phaseDiv.innerHTML = `
        <div class="phase-title">${phase.title}</div>
        <div class="phase-time">${phase.time}</div>
        <div class="phase-tasks"></div>
      `;
      
      const tasksContainer = phaseDiv.querySelector(".phase-tasks");
      
      phaseTasks.forEach(task => {
        // Effort / Cost parameters
        const effort = task.effort || (task.dimensionId === "T" || task.dimensionId === "A" ? "Medium" : "Low");
        const cost = task.cost || (task.dimensionId === "T" ? "$$" : "$");
        
        const taskCard = document.createElement("div");
        taskCard.className = "task-card";
        
        taskCard.innerHTML = `
          <div class="task-details">
            <div class="task-title">${task.controlTitle} (${task.dimensionName})</div>
            <div class="task-action">${task.action}</div>
          </div>
          <div class="task-meta">
            <span class="task-pill effort">Effort: ${effort}</span>
            <span class="task-pill cost">Cost: ${cost}</span>
          </div>
        `;
        
        tasksContainer.appendChild(taskCard);
      });
      
      this.elements.timelineContainer.appendChild(phaseDiv);
    });
    
    if (totalTasksScheduled === 0) {
      this.elements.timelineContainer.innerHTML = `
        <div style="text-align: center; color: var(--accent-green); padding: 3rem; font-weight: 600;">
          ✓ Fully Compliant. No remediation actions are required in the project roadmap.
        </div>
      `;
    }
  }
  
  /* =========================================================================
     5. JSON Export/Import & Lifecycle Utilities
     ========================================================================= */
  exportStateToJSON() {
    const dataStr = JSON.stringify({
      topologyConnections: this.topologyConnections,
      grades: this.grades,
      exportedAt: new Date().toISOString()
    }, null, 2);
    
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `ot-advanced-audit-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }
  
  importStateFromJSON(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const state = JSON.parse(e.target.result);
        
        if (state && state.grades && state.topologyConnections) {
          this.grades = state.grades;
          this.topologyConnections = state.topologyConnections;
          this.saveState();
          
          this.renderTopologyModeler();
          this.renderMaturityMatrix();
          this.evaluateTopology();
          this.switchTab(this.activeTab);
          
          alert("Audit configuration data imported successfully!");
        } else {
          alert("Invalid backup file structure.");
        }
      } catch (err) {
        alert("Failed to parse JSON file: " + err.message);
      }
    };
    reader.readAsText(file);
    
    this.elements.fileInput.value = "";
  }
  
  restartAssessment() {
    if (confirm("Are you sure you want to clear your current progress and restart the audit?")) {
      CONTROLS.forEach(c => {
        this.grades[c.id] = { P: 0, T: 0, L: 0, A: 0 };
      });
      
      this.topologyConnections = {
        "enterprise_safety": "none",
        "enterprise_control": "direct",
        "enterprise_operations": "permissive_firewall",
        "operations_safety": "permissive_firewall",
        "control_safety": "direct"
      };
      
      this.activeTab = "topology";
      this.saveState();
      
      this.renderTopologyModeler();
      this.renderMaturityMatrix();
      this.evaluateTopology();
      this.switchTab(this.activeTab);
    }
  }
  
  handleLeadSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById("contact-name").value.trim();
    const company = document.getElementById("contact-company").value.trim();
    const email = document.getElementById("contact-email").value.trim();
    
    if (!name || !company || !email) {
      alert("Please fill in all required fields (Name, Company, Email).");
      return;
    }
    
    this.elements.formSubmitBtn.disabled = true;
    this.elements.formSubmitBtn.innerText = "Transmitting secure audit profiles...";
    
    setTimeout(() => {
      this.elements.leadForm.style.display = "none";
      this.elements.submitSuccessAlert.style.display = "block";
      this.elements.submitSuccessAlert.classList.add("fade-in");
    }, 1500);
  }
}

// Instantiate on load
window.addEventListener("DOMContentLoaded", () => {
  new AdvancedOTAssessmentApp();
});
