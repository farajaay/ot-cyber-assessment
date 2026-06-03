import { DOMAINS, QUESTIONS } from "./questions.js";

class OTAssessmentApp {
  constructor() {
    this.currentQuestionIndex = 0;
    this.answers = {}; // Format: { Q1: score, Q2: score, ... }
    this.isCompleted = false;
    this.activeFilter = "all";
    
    // Cache DOM Elements
    this.elements = {
      progressSidebar: document.getElementById("progress-sidebar"),
      questionContainer: document.getElementById("question-container"),
      resultsContainer: document.getElementById("results-container"),
      
      // Question UI Elements
      domainBadge: document.getElementById("domain-badge"),
      domainTitle: document.getElementById("domain-title"),
      questionMeta: document.getElementById("question-meta"),
      questionText: document.getElementById("question-text"),
      choicesList: document.getElementById("choices-list"),
      btnPrev: document.getElementById("btn-prev"),
      btnNext: document.getElementById("btn-next"),
      btnFinish: document.getElementById("btn-finish"),
      
      // Results Elements
      overallMaturityNumber: document.getElementById("overall-maturity-number"),
      overallMaturityText: document.getElementById("overall-maturity-text"),
      radialProgress: document.getElementById("radial-progress"),
      pctIec: document.getElementById("pct-iec"),
      pctNerc: document.getElementById("pct-nerc"),
      pctNca: document.getElementById("pct-nca"),
      radarChartContainer: document.getElementById("radar-chart-container"),
      domainBarsContainer: document.getElementById("domain-bars-container"),
      roadmapList: document.getElementById("roadmap-list"),
      filterButtons: document.querySelectorAll(".filter-btn"),
      
      // Action Buttons
      btnExportJson: document.getElementById("btn-export-json"),
      btnImportJson: document.getElementById("btn-import-json"),
      fileInput: document.getElementById("file-input"),
      btnPrintPdf: document.getElementById("btn-print-pdf"),
      btnEditAnswers: document.getElementById("btn-edit-answers"),
      btnRestart: document.getElementById("btn-restart"),
      
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
    this.renderSidebar();
    
    if (this.isCompleted) {
      this.showResults();
    } else {
      this.showQuestion(this.currentQuestionIndex);
    }
  }
  
  setupEventListeners() {
    // Nav buttons
    this.elements.btnPrev.addEventListener("click", () => this.navigateQuestion(-1));
    this.elements.btnNext.addEventListener("click", () => this.navigateQuestion(1));
    this.elements.btnFinish.addEventListener("click", () => this.finishAssessment());
    
    // Action buttons
    this.elements.btnExportJson.addEventListener("click", () => this.exportStateToJSON());
    this.elements.btnImportJson.addEventListener("click", () => this.elements.fileInput.click());
    this.elements.fileInput.addEventListener("change", (e) => this.importStateFromJSON(e));
    this.elements.btnPrintPdf.addEventListener("click", () => window.print());
    this.elements.btnEditAnswers.addEventListener("click", () => this.editAnswers());
    this.elements.btnRestart.addEventListener("click", () => this.restartAssessment());
    
    // Filters for Roadmap
    this.elements.filterButtons.forEach(btn => {
      btn.addEventListener("click", (e) => {
        this.elements.filterButtons.forEach(b => b.classList.remove("active"));
        e.target.classList.add("active");
        this.activeFilter = e.target.dataset.priority;
        this.renderRoadmap();
      });
    });
    
    // Contact Form Submit
    this.elements.leadForm.addEventListener("submit", (e) => this.handleLeadSubmit(e));
  }
  
  loadState() {
    try {
      const saved = localStorage.getItem("ot_cyber_assessment_state");
      if (saved) {
        const state = JSON.parse(saved);
        this.currentQuestionIndex = state.currentQuestionIndex || 0;
        this.answers = state.answers || {};
        this.isCompleted = state.isCompleted || false;
      }
    } catch (e) {
      console.error("Failed to load local state:", e);
    }
  }
  
  saveState() {
    try {
      const state = {
        currentQuestionIndex: this.currentQuestionIndex,
        answers: this.answers,
        isCompleted: this.isCompleted
      };
      localStorage.setItem("ot_cyber_assessment_state", JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save local state:", e);
    }
  }
  
  renderSidebar() {
    this.elements.progressSidebar.innerHTML = "";
    
    // Group questions by domains for sidebar grouping
    Object.values(DOMAINS).forEach((domain, index) => {
      const domainQs = QUESTIONS.filter(q => q.domain === domain.id);
      const isCurrentDomain = QUESTIONS[this.currentQuestionIndex].domain === domain.id;
      
      const allDone = domainQs.every(q => this.answers[q.id] !== undefined);
      const someDone = domainQs.some(q => this.answers[q.id] !== undefined);
      
      let statusClass = "";
      if (isCurrentDomain && !this.isCompleted) {
        statusClass = "active";
      } else if (allDone) {
        statusClass = "completed";
      }
      
      const item = document.createElement("li");
      item.className = `progress-item ${statusClass}`;
      
      // Click sidebar to jump to the first question in that domain
      item.addEventListener("click", () => {
        if (this.isCompleted) return;
        const qIndex = QUESTIONS.findIndex(q => q.domain === domain.id);
        if (qIndex !== -1) {
          this.currentQuestionIndex = qIndex;
          this.showQuestion(this.currentQuestionIndex);
          this.renderSidebar();
        }
      });
      
      item.innerHTML = `
        <div class="step-indicator">
          ${allDone ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>` : index + 1}
        </div>
        <div class="step-name" title="${domain.title}">
          ${domain.title}
        </div>
      `;
      
      this.elements.progressSidebar.appendChild(item);
    });
  }
  
  showQuestion(index) {
    if (this.isCompleted) return;
    
    this.elements.questionContainer.style.display = "block";
    this.elements.resultsContainer.style.display = "none";
    
    const question = QUESTIONS[index];
    const domain = DOMAINS[question.domain];
    
    // Set domain styling
    this.elements.domainBadge.innerText = domain.id;
    this.elements.domainBadge.style.backgroundColor = `${domain.color}20`;
    this.elements.domainBadge.style.color = domain.color;
    this.elements.domainBadge.style.border = `1px solid ${domain.color}40`;
    
    this.elements.domainTitle.innerText = domain.title;
    
    // Metadata / Standards Mapped
    this.elements.questionMeta.innerHTML = `
      <span>Standard Mappings:</span>
      <span class="standards-tag">${question.standards.iec}</span>
      <span class="standards-tag">${question.standards.nerc}</span>
      <span class="standards-tag">${question.standards.nca}</span>
    `;
    
    this.elements.questionText.innerText = question.text;
    
    // Render Choices
    this.elements.choicesList.innerHTML = "";
    question.choices.forEach((choice, cIdx) => {
      const choiceCard = document.createElement("div");
      
      const isSelected = this.answers[question.id] === choice.score;
      choiceCard.className = `choice-card ${isSelected ? "selected" : ""}`;
      
      choiceCard.innerHTML = `
        <div class="radio-indicator"></div>
        <div class="choice-content">
          <div class="choice-level">Level ${choice.level}</div>
          <div class="choice-text">${choice.text}</div>
        </div>
      `;
      
      choiceCard.addEventListener("click", () => {
        // Save answer
        this.answers[question.id] = choice.score;
        this.saveState();
        
        // Visual updates
        const selectedPrev = this.elements.choicesList.querySelector(".choice-card.selected");
        if (selectedPrev) selectedPrev.classList.remove("selected");
        choiceCard.classList.add("selected");
        
        // Enable buttons
        this.updateNavButtonsState();
        this.renderSidebar();
      });
      
      this.elements.choicesList.appendChild(choiceCard);
    });
    
    this.updateNavButtonsState();
  }
  
  updateNavButtonsState() {
    this.elements.btnPrev.disabled = this.currentQuestionIndex === 0;
    
    const hasAnsweredCurrent = this.answers[QUESTIONS[this.currentQuestionIndex].id] !== undefined;
    const isLastQuestion = this.currentQuestionIndex === QUESTIONS.length - 1;
    
    if (isLastQuestion) {
      this.elements.btnNext.style.display = "none";
      this.elements.btnFinish.style.display = "inline-flex";
      this.elements.btnFinish.disabled = !hasAnsweredCurrent;
    } else {
      this.elements.btnNext.style.display = "inline-flex";
      this.elements.btnFinish.style.display = "none";
      this.elements.btnNext.disabled = !hasAnsweredCurrent;
    }
  }
  
  navigateQuestion(direction) {
    const nextIndex = this.currentQuestionIndex + direction;
    if (nextIndex >= 0 && nextIndex < QUESTIONS.length) {
      this.currentQuestionIndex = nextIndex;
      
      // Animate container out and in
      this.elements.questionContainer.classList.remove("fade-in");
      void this.elements.questionContainer.offsetWidth; // Trigger reflow
      this.elements.questionContainer.classList.add("fade-in");
      
      this.showQuestion(this.currentQuestionIndex);
      this.renderSidebar();
      this.saveState();
    }
  }
  
  finishAssessment() {
    // Verify all answered
    const allAnswered = QUESTIONS.every(q => this.answers[q.id] !== undefined);
    if (!allAnswered) {
      alert("Please complete all questions before finishing.");
      return;
    }
    
    this.isCompleted = true;
    this.saveState();
    this.showResults();
    this.renderSidebar();
  }
  
  showResults() {
    this.elements.questionContainer.style.display = "none";
    this.elements.resultsContainer.style.display = "block";
    this.elements.resultsContainer.classList.add("fade-in");
    
    const scores = this.calculateScores();
    this.renderMaturityScore(scores.overallScore);
    this.renderStandardsCompliance(scores.standardsPct);
    this.renderDomainBars(scores.domainScores);
    this.renderRadarChart(scores.domainScores);
    this.renderRoadmap();
  }
  
  calculateScores() {
    let totalScore = 0;
    let maxTotalScore = QUESTIONS.length * 3; // 15 questions * max score 3
    
    const domainTotals = {};
    const domainCounts = {};
    
    // Standard-specific tracking
    const standardScores = { iec: 0, nerc: 0, nca: 0 };
    const standardCounts = { iec: 0, nerc: 0, nca: 0 };
    
    Object.keys(DOMAINS).forEach(d => {
      domainTotals[d] = 0;
      domainCounts[d] = 0;
    });
    
    QUESTIONS.forEach(q => {
      const ans = this.answers[q.id] || 0;
      totalScore += ans;
      
      domainTotals[q.domain] += ans;
      domainCounts[q.domain]++;
      
      // All questions map to standard schemas. We benchmark relative level achieved (out of 3)
      standardScores.iec += ans;
      standardCounts.iec += 3;
      
      standardScores.nerc += ans;
      standardCounts.nerc += 3;
      
      standardScores.nca += ans;
      standardCounts.nca += 3;
    });
    
    const overallScore = (totalScore / maxTotalScore) * 3; // Standardize to 0 - 3 range
    
    const domainScores = {};
    Object.keys(DOMAINS).forEach(d => {
      domainScores[d] = (domainTotals[d] / (domainCounts[d] * 3)) * 3; // 0 - 3 range
    });
    
    return {
      overallScore: Number(overallScore.toFixed(2)),
      domainScores,
      standardsPct: {
        iec: Math.round((standardScores.iec / standardCounts.iec) * 100),
        nerc: Math.round((standardScores.nerc / standardCounts.nerc) * 100),
        nca: Math.round((standardScores.nca / standardCounts.nca) * 100)
      }
    };
  }
  
  renderMaturityScore(score) {
    this.elements.overallMaturityNumber.innerText = score.toFixed(1);
    
    let text = "Ad-hoc (Level 1)";
    if (score > 2.7) {
      text = "Optimized (Level 4)";
    } else if (score > 2.0) {
      text = "Managed (Level 3)";
    } else if (score > 1.0) {
      text = "Developing (Level 2)";
    }
    
    this.elements.overallMaturityText.innerText = text;
    
    // Animate radial SVG gauge (dashoffset formula: 440 - (440 * pct))
    const pct = score / 3.0;
    const offset = 440 - (440 * pct);
    this.elements.radialProgress.style.strokeDashoffset = offset;
  }
  
  renderStandardsCompliance(standards) {
    this.elements.pctIec.innerText = `${standards.iec}%`;
    this.elements.pctNerc.innerText = `${standards.nerc}%`;
    this.elements.pctNca.innerText = `${standards.nca}%`;
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
          <div class="bar-inner" style="width: 0%; background: linear-gradient(90deg, ${domain.color}a0, ${domain.color})"></div>
        </div>
      `;
      
      this.elements.domainBarsContainer.appendChild(barWrapper);
      
      // Delay animation slightly to show transition
      setTimeout(() => {
        const inner = barWrapper.querySelector(".bar-inner");
        if (inner) inner.style.width = `${pct}%`;
      }, 100);
    });
  }
  
  renderRadarChart(domainScores) {
    this.elements.radarChartContainer.innerHTML = "";
    
    const size = 260;
    const center = size / 2;
    const maxVal = 3.0;
    const radius = 90;
    const domainKeys = Object.keys(DOMAINS);
    const numPoints = domainKeys.length;
    
    // Create SVG Element
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
    svg.style.overflow = "visible";
    
    // Helper to calculate X/Y based on value and index
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
      polygon.setAttribute("stroke", "rgba(255, 255, 255, 0.05)");
      polygon.setAttribute("stroke-width", "1");
      svg.appendChild(polygon);
      
      // Add level label on first axis
      const firstCoord = getCoordinates(0, level);
      const labelText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      labelText.setAttribute("x", firstCoord.x + 5);
      labelText.setAttribute("y", firstCoord.y + 3);
      labelText.setAttribute("fill", "rgba(255, 255, 255, 0.2)");
      labelText.setAttribute("font-size", "8px");
      labelText.setAttribute("font-family", "JetBrains Mono");
      labelText.textContent = `L${level}`;
      svg.appendChild(labelText);
    });
    
    // Draw grid axes lines and labels
    domainKeys.forEach((key, i) => {
      const outerCoord = getCoordinates(i, maxVal);
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", center);
      line.setAttribute("y1", center);
      line.setAttribute("x2", outerCoord.x);
      line.setAttribute("y2", outerCoord.y);
      line.setAttribute("stroke", "rgba(255, 255, 255, 0.05)");
      line.setAttribute("stroke-width", "1");
      svg.appendChild(line);
      
      // Label text
      const labelDistance = maxVal + 0.4;
      const textCoord = getCoordinates(i, labelDistance);
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      
      // Anchor text properly based on position
      let textAnchor = "middle";
      if (textCoord.x > center + 10) textAnchor = "start";
      if (textCoord.x < center - 10) textAnchor = "end";
      
      text.setAttribute("x", textCoord.x);
      text.setAttribute("y", textCoord.y + 3);
      text.setAttribute("fill", DOMAINS[key].color);
      text.setAttribute("font-size", "10px");
      text.setAttribute("font-family", "Plus Jakarta Sans");
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
    userPolygon.setAttribute("fill", "rgba(0, 242, 254, 0.15)");
    userPolygon.setAttribute("stroke", "var(--accent-cyan)");
    userPolygon.setAttribute("stroke-width", "2.5");
    userPolygon.setAttribute("stroke-linejoin", "round");
    
    // Add glowing filter to the line
    userPolygon.style.filter = "drop-shadow(0 0 6px rgba(0, 242, 254, 0.4))";
    
    svg.appendChild(userPolygon);
    
    // Draw dots on nodes
    domainKeys.forEach((key, i) => {
      const coord = getCoordinates(i, domainScores[key]);
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", coord.x);
      circle.setAttribute("cy", coord.y);
      circle.setAttribute("r", "4");
      circle.setAttribute("fill", "var(--bg-main)");
      circle.setAttribute("stroke", DOMAINS[key].color);
      circle.setAttribute("stroke-width", "2");
      svg.appendChild(circle);
    });
    
    this.elements.radarChartContainer.appendChild(svg);
  }
  
  renderRoadmap() {
    this.elements.roadmapList.innerHTML = "";
    let itemsCount = 0;
    
    QUESTIONS.forEach(question => {
      const ansScore = this.answers[question.id] || 0;
      
      // Determine what level recommendation to pull
      const recommendation = question.recommendations[ansScore];
      if (!recommendation) return;
      
      const priority = recommendation.priority.toLowerCase();
      
      // Filter mapping
      if (this.activeFilter !== "all" && this.activeFilter !== priority) {
        return;
      }
      
      itemsCount++;
      
      const card = document.createElement("div");
      card.className = `roadmap-card priority-${priority} fade-in`;
      
      card.innerHTML = `
        <div class="roadmap-card-header">
          <div class="roadmap-card-title">
            <span class="priority-badge ${priority}">${recommendation.priority}</span>
            <span>${question.text}</span>
          </div>
        </div>
        <div class="roadmap-meta">
          <div class="meta-item">Domain: <span>${DOMAINS[question.domain].title}</span></div>
          <div class="meta-item">IEC 62443: <span>${question.standards.iec}</span></div>
          <div class="meta-item">NERC CIP: <span>${question.standards.nerc}</span></div>
          <div class="meta-item">Effort: <span>${recommendation.effort}</span></div>
          <div class="meta-item">Est. Cost: <span>${recommendation.cost}</span></div>
        </div>
        <div class="roadmap-action">
          <strong>Recommended Action:</strong> ${recommendation.action}
        </div>
        <div class="roadmap-rationale">
          <strong>Risk Rationale:</strong> ${recommendation.rationale}
        </div>
      `;
      
      this.elements.roadmapList.appendChild(card);
    });
    
    if (itemsCount === 0) {
      this.elements.roadmapList.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: 2rem;">
          No items found matching the selected priority filter.
        </div>
      `;
    }
  }
  
  exportStateToJSON() {
    const dataStr = JSON.stringify({
      answers: this.answers,
      isCompleted: this.isCompleted,
      currentQuestionIndex: this.currentQuestionIndex,
      exportedAt: new Date().toISOString()
    }, null, 2);
    
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `ot-cyber-assessment-${new Date().toISOString().slice(0, 10)}.json`;
    
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
        
        if (state && state.answers) {
          this.answers = state.answers;
          this.isCompleted = state.isCompleted ?? true;
          this.currentQuestionIndex = state.currentQuestionIndex ?? 0;
          this.saveState();
          
          this.renderSidebar();
          
          if (this.isCompleted) {
            this.showResults();
          } else {
            this.showQuestion(this.currentQuestionIndex);
          }
          alert("Assessment data imported successfully!");
        } else {
          alert("Invalid backup file structure.");
        }
      } catch (err) {
        alert("Failed to parse JSON file: " + err.message);
      }
    };
    reader.readAsText(file);
    
    // Clear input
    this.elements.fileInput.value = "";
  }
  
  editAnswers() {
    this.isCompleted = false;
    this.currentQuestionIndex = 0;
    this.saveState();
    this.showQuestion(this.currentQuestionIndex);
    this.renderSidebar();
  }
  
  restartAssessment() {
    if (confirm("Are you sure you want to clear your current progress and restart the assessment?")) {
      this.answers = {};
      this.isCompleted = false;
      this.currentQuestionIndex = 0;
      this.saveState();
      this.showQuestion(this.currentQuestionIndex);
      this.renderSidebar();
    }
  }
  
  handleLeadSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const name = document.getElementById("contact-name").value.trim();
    const company = document.getElementById("contact-company").value.trim();
    const email = document.getElementById("contact-email").value.trim();
    const phone = document.getElementById("contact-phone").value.trim();
    const message = document.getElementById("contact-message").value.trim();
    
    if (!name || !company || !email) {
      alert("Please fill in all required fields (Name, Company, Email).");
      return;
    }
    
    this.elements.formSubmitBtn.disabled = true;
    this.elements.formSubmitBtn.innerText = "Transmitting secure request...";
    
    // Simulating secure client-side qualification submission
    setTimeout(() => {
      this.elements.leadForm.style.display = "none";
      this.elements.submitSuccessAlert.style.display = "block";
      this.elements.submitSuccessAlert.classList.add("fade-in");
    }, 1500);
  }
}

// Instantiate on load
window.addEventListener("DOMContentLoaded", () => {
  new OTAssessmentApp();
});
