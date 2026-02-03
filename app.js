// AIQ-X Professional Suite - Main Application Logic
// Domain-agnostic - Works with any pack structure

// ===================================
// CONSTANTS
// ===================================

const DEFAULT_DOMAINS = [
  ['logic', 'Logical Reasoning', 'Tests ability to handle complex logical problems, paradoxes, and decision theory'],
  ['math', 'Mathematical Precision', 'Evaluates accuracy in mathematical operations and handling of ambiguous expressions'],
  ['epistemic', 'Epistemic Calibration', 'Measures awareness of uncertainty and knowledge limitations'],
  ['ethics', 'Ethical Reasoning', 'Assesses ability to navigate ethical dilemmas and explain different frameworks'],
  ['creativity', 'Creativity', 'Tests innovative thinking and ability to create novel solutions'],
  ['robustness', 'Robustness', 'Evaluates handling of edge cases and assumption challenging'],
  ['planning', 'Planning', 'Measures ability to create coherent multi-step plans with constraints'],
  ['self', 'Meta-Cognition', 'Tests self-awareness and ability to identify own limitations'],
  ['format', 'Instruction Compliance', 'Evaluates ability to follow explicit formatting and output requirements'],
  ['clarity', 'Communication Clarity', 'Assesses ability to explain complex topics clearly to non-experts']
];

const RECOMMENDATIONS = {
  logic: { threshold: 80, desc: 'Analytical and problem-solving tasks' },
  math: { threshold: 80, desc: 'Mathematical computations and data analysis' },
  epistemic: { threshold: 80, desc: 'Research and uncertainty-aware decision making' },
  ethics: { threshold: 80, desc: 'Ethical advisory and compliance checking' },
  creativity: { threshold: 80, desc: 'Content generation and ideation' },
  robustness: { threshold: 80, desc: 'Edge-case handling in production systems' },
  planning: { threshold: 80, desc: 'Project management and strategy development' },
  self: { threshold: 80, desc: 'Self-improving systems and meta-analysis' },
  format: { threshold: 80, desc: 'Structured output generation for APIs' },
  clarity: { threshold: 80, desc: 'Educational content and explanations' }
};

// ===================================
// NOTIFICATION SYSTEM
// ===================================

class NotificationSystem {
  constructor() {
    this.notifications = [];
    this.container = null;
    this.setupContainer();
  }

  setupContainer() {
    this.container = document.createElement('div');
    this.container.id = 'notificationContainer';
    this.container.style.cssText = `
      position: fixed;
      top: 60px;
      right: 0.5rem;
      z-index: 1001;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      max-width: 300px;
    `;
    document.body.appendChild(this.container);
  }

  show(message, type = 'info', duration = 3000) {
    const id = Date.now() + Math.random();
    const notification = document.createElement('div');
    notification.id = `notification-${id}`;
    notification.className = `notification ${type}`;
    notification.textContent = message;

    this.container.appendChild(notification);
    this.notifications.push({ id, element: notification });

    setTimeout(() => this.remove(id), duration);

    return id;
  }

  remove(id) {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index === -1) return;

    const notification = this.notifications[index].element;

    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    notification.style.transition = 'opacity 0.3s, transform 0.3s';

    setTimeout(() => {
      if (notification.parentNode === this.container) {
        this.container.removeChild(notification);
      }
      this.notifications.splice(index, 1);
    }, 300);
  }

  clearAll() {
    this.notifications.forEach(n => {
      if (n.element.parentNode === this.container) {
        this.container.removeChild(n.element);
      }
    });
    this.notifications = [];
  }
}

// ===================================
// MAIN APPLICATION
// ===================================

const APP = {
  currentModel: null,
  currentPack: null,
  currentTier: 'basic',
  models: [],
  installedPacks: [],
  customPacks: [],
  darkMode: true,
  notificationSystem: null,
  compareMode: 'cross',
  historyModel: null,

  showInlineMessage(containerId, message, type = 'info') {
    const container = document.getElementById(containerId);
    if (!container) {
      console.log(`[${type}] ${message}`);
      return;
    }

    container.innerHTML = `<strong>${message}</strong>`;
    container.className = `info-box ${type}`;
    container.style.display = 'block';

    setTimeout(() => {
      container.style.display = 'none';
    }, 5000);
  },

  importCustomPack(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const pack = JSON.parse(e.target.result);

        if (!pack.id || !pack.version || !pack.tiers) {
          throw new Error('Invalid pack format');
        }

        if (!pack.name) pack.name = `Unnamed Pack (${pack.id})`;
        if (!pack.author) pack.author = 'Unknown';
        if (!pack.description) pack.description = 'No description provided';
        if (!pack.difficulty) pack.difficulty = 'baseline';
        if (!pack.tags) pack.tags = [];
        if (!pack.domains) pack.domains = [];
        if (!pack.scoringParams) {
          pack.scoringParams = {
            baseScore: 30,
            hedgeBonus: 3,
            absolutePenalty: -5,
            lengthBonuses: [
              { threshold: 150, bonus: 15 },
              { threshold: 300, bonus: 10 }
            ]
          };
        }

        ['basic', 'advanced', 'expert'].forEach(tier => {
          if (pack.tiers[tier] && !pack.tiers[tier].expectedDomains) {
            pack.tiers[tier].expectedDomains = this.extractDomainsFromPrompt(pack.tiers[tier].prompt);
          }
        });

        const existingCustom = this.customPacks.find(p => p.id === pack.id);
        if (existingCustom) {
          if (!confirm(`Pack "${pack.name}" already exists. Replace it?`)) {
            event.target.value = '';
            return;
          }
          this.customPacks = this.customPacks.filter(p => p.id !== pack.id);
        }

        this.customPacks.push(pack);
        this.save();
        this.renderPackLibrary();
        this.renderPackSelect();
        this.showInlineMessage('importStatus', `✓ Pack "${pack.name}" imported successfully!`, 'success');

      } catch (err) {
        this.showInlineMessage('importStatus', '❌ Failed to import pack. Invalid file format.', 'error');
        console.error('Import error:', err);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  },

    importCustomPackFromData(packData) {
    try {
      const pack = packData;

      // Validate pack structure
      if (!pack.id || !pack.version || !pack.tiers) {
        throw new Error('Invalid pack format');
      }

      // Set defaults for missing fields
      if (!pack.name) pack.name = `Unnamed Pack (${pack.id})`;
      if (!pack.author) pack.author = 'Unknown';
      if (!pack.description) pack.description = 'No description provided';
      if (!pack.difficulty) pack.difficulty = 'baseline';
      if (!pack.tags) pack.tags = [];
      if (!pack.domains) pack.domains = [];
      if (!pack.scoringParams) {
        pack.scoringParams = {
          baseScore: 30,
          hedgeBonus: 3,
          absolutePenalty: -5,
          lengthBonuses: [
            { threshold: 150, bonus: 15 },
            { threshold: 300, bonus: 10 }
          ]
        };
      }

      // Extract expected domains if missing
      ['basic', 'advanced', 'expert'].forEach(tier => {
        if (pack.tiers[tier] && !pack.tiers[tier].expectedDomains) {
          pack.tiers[tier].expectedDomains = this.extractDomainsFromPrompt(pack.tiers[tier].prompt);
        }
      });

      // Check if already exists in custom packs
      const existingCustom = this.customPacks.find(p => p.id === pack.id);
      if (existingCustom) {
        if (confirm(`Pack "${pack.name}" already exists. Replace it?`)) {
          const index = this.customPacks.indexOf(existingCustom);
          this.customPacks[index] = pack;
          this.save();
          this.renderPackLibrary();
          this.showNotification(`✅ Updated: ${pack.name}`, 'success');
          return true;
        }
        return false;
      }

      // Add new pack
      this.customPacks.push(pack);
      this.save();
      this.renderPackLibrary();
      this.showNotification(`✅ Imported: ${pack.name}`, 'success');
      return true;

    } catch (error) {
      console.error('Import error:', error);
      this.showNotification(`❌ Failed to import: ${error.message}`, 'error');
      return false;
    }
  },

  extractDomainsFromPrompt(prompt) {
    if (!prompt) return [];
    const domainMatches = prompt.match(/\[\[([^\]]+)\]\]/g);
    if (!domainMatches) return [];
    return domainMatches.map(match => match.slice(2, -2));
  },

  deleteCustomPack(packId) {
    const pack = this.customPacks.find(p => p.id === packId);
    if (!pack) return;

    if (!confirm(`Delete custom pack "${pack.name}"? This cannot be undone.`)) return;

    this.customPacks = this.customPacks.filter(p => p.id !== packId);

    if (this.currentPack && this.currentPack.id === packId) {
      this.currentPack = null;
    }

    this.save();
    this.renderPackLibrary();
    this.renderPackSelect();
    this.updateActivePackInfo();
    this.showInlineMessage('importStatus', `Pack "${pack.name}" deleted`, 'info');
  },

  exportPack(packId, isCustom = false) {
    const pack = isCustom
      ? this.customPacks.find(p => p.id === packId)
      : this.installedPacks.find(p => p.id === packId);

    if (!pack) return;

    const dataStr = JSON.stringify(pack, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pack.id}-v${pack.version}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.showInlineMessage('importStatus', `Pack "${pack.name}" exported`, 'success');
  },

  selectPack(packId, isCustom = false) {
    const pack = isCustom
      ? this.customPacks.find(p => p.id === packId)
      : this.installedPacks.find(p => p.id === packId);

    if (!pack) return;

    this.currentPack = pack;
    this.save();
    this.renderPackLibrary();
    this.updateActivePackInfo();
    this.renderTierSelector();
  },

  renderPackLibrary() {
    const customContainer = document.getElementById('customPacksList');
    const officialContainer = document.getElementById('installedPacksList');

    if (!customContainer || !officialContainer) {
      const container = document.getElementById('installedPacksList');
      if (container) {
        const allPacks = [...this.customPacks, ...this.installedPacks];
        container.innerHTML = allPacks.map(pack =>
          this.renderPackCard(pack, this.customPacks.includes(pack))
        ).join('');
      }
      return;
    }

    customContainer.innerHTML = this.customPacks.length === 0
      ? `<div class="info-box"><strong>No custom packs yet</strong><br>Import a custom pack using the button above.</div>`
      : this.customPacks.map(pack => this.renderPackCard(pack, true)).join('');

    officialContainer.innerHTML = this.installedPacks.map(pack =>
      this.renderPackCard(pack, false)
    ).join('');
  },

  renderPackCard(pack, isCustom) {
    const isSelected = this.currentPack && this.currentPack.id === pack.id;
    const totalQuestions = (pack.tiers.basic?.questionCount || 0) +
                          (pack.tiers.advanced?.questionCount || 0) +
                          (pack.tiers.expert?.questionCount || 0);

    return `
      <div class="pack-card ${isSelected ? 'selected' : ''}" onclick="APP.selectPack('${pack.id}', ${isCustom})">
        <div class="pack-header">
          <div class="pack-title">${pack.name}</div>
          <div class="pack-version">v${pack.version}</div>
        </div>
        <div class="pack-description">${pack.description}</div>
        <div class="pack-meta">
          <span>📝 ${totalQuestions} questions</span>
          <span>👤 ${pack.author}</span>
          <span>🎯 ${pack.domains?.length || 0} domains</span>
          ${pack.difficulty ? `<span class="pack-tag">${pack.difficulty}</span>` : ''}
          ${pack.tags?.map(tag => `<span class="pack-tag">${tag}</span>`).join('') || ''}
        </div>
        <div class="pack-actions">
          ${isSelected ? '<button class="success" onclick="event.stopPropagation();">✓ Selected</button>' : ''}
          <button class="secondary" onclick="event.stopPropagation(); APP.exportPack('${pack.id}', ${isCustom});" style="font-size: 0.65rem;">📥 Export</button>
          ${isCustom ? `<button class="danger" onclick="event.stopPropagation(); APP.deleteCustomPack('${pack.id}');" style="font-size: 0.65rem;">🗑️ Delete</button>` : ''}
        </div>
      </div>
    `;
  },

  deleteTest(modelName, testIndex) {
    const model = this.models.find(m => m.name === modelName);
    if (!model) return;

    if (!confirm('Delete this test result? This cannot be undone.')) return;

    model.history.splice(testIndex, 1);
    this.save();
    this.renderCompare();

    const statusDiv = document.getElementById('compareStatus');
    if (statusDiv) {
      this.showInlineMessage('compareStatus', '✓ Test deleted', 'info');
    }
  },


  aggregateScoresByDomain(scores) {
    const domainScores = {};
    
    // Group scores by domain prefix (part before underscore and number)
    Object.entries(scores).forEach(([questionId, score]) => {
      // Extract domain from questionId (e.g., "reasoning_1" -> "reasoning", "metacognition_5" -> "metacognition")
      const domain = questionId.replace(/_\d+$/, '').replace(/\d+$/, '');
      
      if (!domainScores[domain]) {
        domainScores[domain] = { total: 0, count: 0 };
      }
      
      domainScores[domain].total += score;
      domainScores[domain].count += 1;
    });
    
    // Calculate averages
    const aggregated = {};
    Object.entries(domainScores).forEach(([domain, data]) => {
      aggregated[domain] = Math.round(data.total / data.count);
    });
    
    return aggregated;
  },

  renderRecommendations() {
    const container = document.getElementById('recommendationsContent');
    if (!container) return;

    const testedModels = this.models.filter(m => m.history.length > 0);

    if (testedModels.length === 0) {
      container.innerHTML = `
        <div class="info-box">
          <strong>No test results yet</strong>
          Run some tests to see model recommendations and fit-for-purpose analysis.
        </div>
      `;
      return;
    }

    const recommendations = testedModels.map(model => {
      const latestTest = model.history[model.history.length - 1];
      
      // IMPORTANT: Aggregate scores by domain first
      const aggregatedScores = this.aggregateScoresByDomain(latestTest.scores);
      
      const strengths = Object.entries(aggregatedScores)
        .map(([domain, score]) => ({ domain, score }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      const useCases = this.generateUseCases(strengths);

      return {
        name: model.name,
        strengths,
        useCases,
        avgScore: Object.values(aggregatedScores).reduce((a, b) => a + b, 0) / Object.values(aggregatedScores).length,
        testCount: model.history.length
      };
    });

    recommendations.sort((a, b) => b.avgScore - a.avgScore);

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1rem;">
        ${recommendations.map((rec, index) => `
          <div style="background: var(--surface-elevated); border: 1px solid var(--border); border-radius: 0.5rem; padding: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.75rem;">
          <h4 style="font-size: 1rem; margin: 0; color: var(--text);">
            ${index === 0 ? '🥇 ' : index === 1 ? '🥈 ' : index === 2 ? '🥉 ' : ''}${rec.name}
          </h4>
          <div style="font-size: 0.7rem; color: var(--text-secondary);">
            Avg: ${rec.avgScore.toFixed(1)} • ${rec.testCount} test${rec.testCount !== 1 ? 's' : ''}
          </div>
        </div>

        <div style="margin-bottom: 0.75rem;">
          <div style="font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.375rem;">Top Strengths:</div>
          <div style="display: flex; flex-wrap: wrap; gap: 0.375rem;">
            ${rec.strengths.map(s => `
              <span class="pack-tag" style="background: ${this.getScoreColor(s.score)};">
                ${this.getDomainName(s.domain)}: ${s.score}
              </span>
            `).join('')}
          </div>
        </div>

            <div style="margin-bottom: 0.5rem;">
              <div style="font-size: 0.7rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.25rem;">Best For</div>
              <div style="font-size: 0.65rem; color: var(--text-secondary); line-height: 1.5;">
                ${rec.useCases.map(uc => `• ${uc}`).join('<br>')}
              </div>
            </div>
            
            <div style="border-top: 1px solid var(--border); padding-top: 0.5rem; margin-top: 0.5rem;">
              <div style="font-size: 0.7rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.25rem;">📚 Recommended Tests</div>
              <div style="font-size: 0.65rem; color: var(--text-secondary);">
                ${this.getRecommendedPacks(rec.strengths).map(pack => `• ${pack}`).join('<br>')}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  generateUseCases(strengths) {
    const useCaseMap = {
      // Core Capabilities
      logic: 'Analytical reasoning and problem-solving',
      math: 'Mathematical calculations and data analysis',
      epistemic: 'Research and fact-checking',
      ethics: 'Ethical decision-making and compliance',
      creativity: 'Creative content and brainstorming',
      robustness: 'Handling edge cases and unusual requests',
      planning: 'Project planning and strategy',
      self: 'Self-assessment and quality improvement',
      format: 'Following instructions precisely',
      clarity: 'Explaining complex topics simply',
      
      // Advanced Reasoning
      metacog: 'Meta-cognitive reasoning and analysis',
      systems: 'Systems thinking and complexity',
      paradox: 'Solving logical puzzles',
      counterfactual: 'Hypothetical scenario analysis',
      innovation: 'Innovation and novel solutions',
      abstraction: 'Abstract thinking across domains',
      secondorder: 'Analyzing consequences and impacts',
      recursive: 'Complex multi-layered problems',
      framing: 'Problem reframing and assumptions',
      synthesis: 'Combining insights from multiple sources',
      
      // Code Proficiency
      syntax: 'Writing code in multiple languages',
      debugging: 'Finding and fixing bugs',
      architecture: 'Software design and architecture',
      optimization: 'Performance optimization',
      readability: 'Writing clean, maintainable code',
      algorithms: 'Algorithm design and optimization',
      testing: 'Test creation and quality assurance',
      security: 'Security analysis and best practices',
      refactoring: 'Code improvement and modernization',
      documentation: 'Technical documentation',
      
      // Professional Writing
      business: 'Business communication',
      technical: 'Technical writing and documentation',
      persuasive: 'Persuasive and compelling writing',
      tone: 'Adapting tone for different audiences',
      editing: 'Editing and proofreading',
      structure: 'Document organization',
      conciseness: 'Clear, concise communication',
      audience: 'Audience-appropriate content',
      
      // Creative Writing
      narrative: 'Storytelling and narratives',
      character: 'Character development',
      dialogue: 'Natural dialogue writing',
      description: 'Descriptive and vivid writing',
      style: 'Stylistic variety',
      worldbuilding: 'Creating fictional worlds',
      pacing: 'Story pacing and tension',
      voice: 'Distinct narrative voice',
      originality: 'Original creative ideas',
      emotion: 'Emotional and engaging content',
      
      // Information Processing
      summarization: 'Summarizing information',
      synthesis: 'Synthesizing multiple sources',
      extraction: 'Extracting key information',
      comparison: 'Comparing and contrasting',
      categorization: 'Organizing and categorizing',
      pattern: 'Pattern recognition',
      verification: 'Fact-checking and verification',
      
      // Conversational Intelligence
      context: 'Maintaining conversation context',
      ambiguity: 'Handling unclear questions',
      tone_match: 'Matching communication style',
      empathy: 'Empathetic responses',
      helpfulness: 'Helpful and balanced advice',
      topic_nav: 'Natural topic transitions',
      boundaries: 'Setting appropriate boundaries',
      follow_up: 'Asking clarifying questions',
      repair: 'Recovering from misunderstandings',
      
      // Instruction & Safety
      format_strict: 'Following precise instructions',
      constraints: 'Working within constraints',
      multistep: 'Complex multi-step tasks',
      refusal: 'Appropriate task refusal',
      manipulation: 'Resisting manipulation',
      implicit: 'Understanding implicit requirements',
      conflict: 'Handling conflicting instructions',
      precision: 'High precision compliance',
      safety_edge: 'Safe handling of edge cases',
      consistency: 'Consistent behavior',
      
      // Fit-for-Purpose domains
      reasoning: 'Complex reasoning and analytical tasks',
      coding: 'Software development and programming',
      writing: 'Writing and content creation',
      analysis: 'Data analysis and research',
      conversation: 'Interactive dialogue and assistance',
      instructions: 'Following precise specifications',
      creativity: 'Creative and innovative thinking',
      metacognition: 'Self-assessment and quality control',
	  
      // Problem-Solving & Critical Thinking
      problemsolve: 'Novel problem-solving',
      criticalthink: 'Critical analysis and evaluation',
      inference: 'Drawing logical conclusions',
      prioritize: 'Prioritization and decision-making'
    };
  
    return strengths.map(s =>
      useCaseMap[s.domain] || this.getDomainName(s.domain)
    ).slice(0, 4);
  },


  getRecommendedPacks(strengths) {
    const packRecommendations = {
      // Fit-for-Purpose domains
      reasoning: 'Advanced Reasoning Pack',
      coding: 'Code Proficiency Pack',
      writing: 'Professional Writing Pack',
      analysis: 'Information Processing Pack',
      conversation: 'Conversational Intelligence Pack',
      instructions: 'Instruction & Safety Pack',
      creativity: 'Creative Writing Pack',
      metacognition: 'Advanced Reasoning Pack',
      
      // Core domains
      logic: 'Advanced Reasoning Pack',
      math: 'Advanced Reasoning Pack',
      epistemic: 'Advanced Reasoning Pack',
      problemsolve: 'Problem-Solving & Critical Thinking Pack',
      criticalthink: 'Problem-Solving & Critical Thinking Pack'
    };
    
    const recommended = strengths
      .map(s => packRecommendations[s.domain])
      .filter((pack, index, self) => pack && self.indexOf(pack) === index)
      .slice(0, 3);
    
    return recommended.length > 0 ? recommended : ['Run more specialized tests for detailed insights'];
  },

  getScoreColor(score) {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return '#a3e635';
    if (score >= 40) return '#fbbf24';
    if (score >= 20) return 'var(--warning)';
    return 'var(--danger)';
  },

  getDomainName(domainId) {
    if (this.currentPack && this.currentPack.domains) {
      const domain = this.currentPack.domains.find(d => d.id === domainId);
      if (domain) return domain.name;
    }

    for (const pack of [...this.customPacks, ...this.installedPacks]) {
      if (pack.domains) {
        const domain = pack.domains.find(d => d.id === domainId);
        if (domain) return domain.name;
      }
    }

    return domainId
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  },

  getPackById(packId) {
    return this.customPacks.find(p => p.id === packId) ||
           this.installedPacks.find(p => p.id === packId);
  },

  renderCompare() {
    const container = document.getElementById('compareTable');
    const recommendationsContainer = document.getElementById('recommendationsContainer');

    if (!container) return;

    if (this.compareMode === 'history') {
      if (!this.historyModel) {
        container.innerHTML = '<div class="info-box">Select a model to view history</div>';
        return;
      }

      const model = this.models.find(m => m.name === this.historyModel);
      if (!model || model.history.length === 0) {
        container.innerHTML = '<div class="info-box">No test history for this model</div>';
        return;
      }

      const allDomains = new Set();
      model.history.forEach(test => {
        Object.keys(test.scores).forEach(domain => allDomains.add(domain));
      });

      let html = '<table><thead><tr><th>Domain</th>';

      model.history.forEach((test, i) => {
        const pack = this.getPackById(test.packId);
        const packName = pack ? pack.name.substring(0, 20) : test.packId;
        const date = new Date(test.time).toLocaleDateString();

        html += `
          <th style="min-width: 120px;">
            <div style="font-weight: 600; font-size: 0.65rem;">${packName}</div>
            <div style="font-size: 0.55rem; font-weight: normal; color: var(--text-secondary);">${date}</div>
            <div style="font-size: 0.55rem; font-weight: normal;">${this.capitalize(test.tier)}</div>
            <button class="danger" onclick="APP.deleteTest('${model.name}', ${i}); event.stopPropagation();"
                    style="margin-top: 0.25rem; font-size: 0.5rem; padding: 0.2rem 0.4rem;">Delete</button>
          </th>
        `;
      });

      html += '</tr></thead><tbody>';

      Array.from(allDomains).forEach(domain => {
        html += `<tr><td>${this.getDomainName(domain)}</td>`;

        model.history.forEach(test => {
          const score = test.scores[domain] || 0;
          const colorClass = this.getScoreClass(score);
          html += `<td class="score-cell ${colorClass}">${score}</td>`;
        });

        html += '</tr>';
      });

      html += '</tbody></table>';
      container.innerHTML = html;

    } else {
      // cross-model comparison (fallback to simpler version)
      const testedModels = this.models.filter(m => m.history.length > 0);

      if (testedModels.length === 0) {
        container.innerHTML = '<div class="info-box">No models tested yet</div>';
        return;
      }

      const allDomains = new Set();
      testedModels.forEach(model => {
        const latest = model.history[model.history.length - 1];
        Object.keys(latest.scores).forEach(d => allDomains.add(d));
      });

      let html = '<table><thead><tr><th>Domain</th>';
      testedModels.forEach(m => html += `<th>${m.name}</th>`);
      html += '</tr></thead><tbody>';

      Array.from(allDomains).forEach(domain => {
        html += `<tr><td>${this.getDomainName(domain)}</td>`;
        testedModels.forEach(model => {
          const latest = model.history[model.history.length - 1];
          const score = latest.scores[domain] || 0;
          html += `<td class="score-cell ${this.getScoreClass(score)}">${score}</td>`;
        });
        html += '</tr>';
      });

      html += '</tbody></table>';
      container.innerHTML = html;
    }

    if (recommendationsContainer) {
      recommendationsContainer.innerHTML = `
        <div class="info-box info" style="text-align: center;">
          <strong>💡 Looking for model recommendations?</strong><br>
          Check the <button class="secondary" onclick="APP.showTab('recommendations')"
          style="display: inline-flex; margin-top: 0.5rem;">🎯 Fit</button> tab.
        </div>
      `;
    }
  },

  renderResults() {
    const model = this.models.find(m => m.name === this.currentModel);
    const container = document.getElementById('resultsContainer');
    if (!container) return;

    if (!model || !model.history.length) {
      container.innerHTML = `
        <div class="info-box">
          <strong>No results yet</strong>
          Run a test to see results here.
        </div>
      `;
      return;
    }

    const latest = model.history[model.history.length - 1];
    const scores = latest.scores;
    const domains = Object.keys(scores);
    const avg = domains.length ? Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / domains.length) : 0;

    let html = `
      <div class="stat-card" style="margin-bottom: 0.5rem;">
        <h4>Overall Score (${this.capitalize(latest.tier)} Tier)</h4>
        <div class="stat-value score-${this.getScoreClass(avg)}">${avg}%</div>
        <div style="margin-top: 0.25rem; font-size: 0.7rem; color: var(--text-secondary);">
          Latest: ${new Date(latest.time).toLocaleDateString()}
        </div>
      </div>
      <div class="metrics-container">
    `;

    domains.forEach(domain => {
      const score = scores[domain];
      html += `
        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-label">${this.getDomainName(domain)}</span>
            <span class="metric-value score-${this.getScoreClass(score)}">${score}%</span>
          </div>
          <div class="metric-bar">
            <div class="metric-bar-fill" style="width: ${score}%"></div>
          </div>
        </div>
      `;
    });

    html += '</div>';
    container.innerHTML = html;
  },

  init() {
    this.notificationSystem = new NotificationSystem();
    this.loadData();
    this.setupEventListeners();
    this.setupDarkMode();
    this.renderTabs();
    this.renderPackLibrary();
    this.updateActivePackInfo();
    this.renderModelSelect();
    this.renderPackSelect();
    this.renderCompare();

    if (!localStorage.getItem('aiqx_seen_welcome')) {
      this.showTab('start');
      localStorage.setItem('aiqx_seen_welcome', 'true');
    } else {
      const lastTab = localStorage.getItem('aiqx_last_tab') || 'library';
      this.showTab(lastTab);
    }
  },

  loadData() {
    this.models = JSON.parse(localStorage.getItem('aiqx_models_v4') || '[]');
    this.installedPacks = JSON.parse(localStorage.getItem('aiqx_installed_packs') || '[]');
    this.customPacks = JSON.parse(localStorage.getItem('aiqx_custom_packs') || '[]');
	
    const savedModel = localStorage.getItem('aiqx_current_model');
    if (savedModel && this.models.find(m => m.name === savedModel)) {
      this.currentModel = savedModel;
    } else if (this.models.length > 0) {
      this.currentModel = this.models[0].name;
    }

    const savedPackId = localStorage.getItem('aiqx_current_pack');
    if (savedPackId) {
      this.currentPack = this.installedPacks.find(p => p.id === savedPackId) ||
                         this.customPacks.find(p => p.id === savedPackId) || null;
    } else if (this.installedPacks.length > 0) {
      this.currentPack = this.installedPacks[0];
    }

    this.currentTier = localStorage.getItem('aiqx_current_tier') || 'basic';
  },

  save() {
    localStorage.setItem('aiqx_models_v4', JSON.stringify(this.models));
    localStorage.setItem('aiqx_installed_packs', JSON.stringify(this.installedPacks));
    localStorage.setItem('aiqx_custom_packs', JSON.stringify(this.customPacks));
	
    if (this.currentModel) localStorage.setItem('aiqx_current_model', this.currentModel);
    if (this.currentPack) localStorage.setItem('aiqx_current_pack', this.currentPack.id);
    localStorage.setItem('aiqx_current_tier', this.currentTier);
  },

setupDarkMode() {
  const savedMode = localStorage.getItem('aiqx_dark_mode');  
  if (savedMode === 'false') {
    document.body.classList.add('light-mode');
    this.darkMode = false;
  } else if (savedMode === 'true') {
    document.body.classList.remove('light-mode');
    this.darkMode = true;
  } else {
    this.darkMode = !document.body.classList.contains('light-mode');
  }
},

toggleDarkMode() {
  this.darkMode = !this.darkMode;
  document.body.classList.toggle('light-mode');
  localStorage.setItem('aiqx_dark_mode', this.darkMode.toString());
  this.showNotification(`Switched to ${this.darkMode ? 'dark' : 'light'} mode`, 'success');
},

  setupEventListeners() {
    document.getElementById('btnToggleDarkMode')?.addEventListener('click', () => this.toggleDarkMode());

    const btnImportPack = document.getElementById('btnImportPack');
    const importPackFile = document.getElementById('importPackFile');
    if (btnImportPack && importPackFile) {
      btnImportPack.addEventListener('click', () => importPackFile.click());
      importPackFile.addEventListener('change', e => this.importCustomPack(e));
    }

    document.getElementById('btnNewModel')?.addEventListener('click', () => this.newModel());
    document.getElementById('btnRenameModel')?.addEventListener('click', () => this.renameModel());
    document.getElementById('btnDeleteModel')?.addEventListener('click', () => this.deleteModel());

    document.getElementById('btnCopyPrompt')?.addEventListener('click', () => this.copyPrompt());
    document.getElementById('btnAnalyze')?.addEventListener('click', () => this.analyze());
    document.getElementById('btnClear')?.addEventListener('click', () => {
      document.getElementById('responseBox').value = '';
    });

    document.getElementById('btnExport')?.addEventListener('click', () => this.exportData());
    document.getElementById('btnImportData')?.addEventListener('click', () => {
      document.getElementById('importFile').click();
    });
    document.getElementById('importFile')?.addEventListener('change', e => this.importData(e));

    document.getElementById('modelSelect')?.addEventListener('change', e => {
      this.currentModel = e.target.value || null;
      this.save();
      this.renderResults();
    });

    document.getElementById('packSelect')?.addEventListener('change', e => {
      const packId = e.target.value;
      if (packId) {
        // Check if pack is in customPacks or installedPacks
        const isCustom = this.customPacks.some(p => p.id === packId);
        this.selectPack(packId, isCustom);
      }
    });

    document.getElementById('compareMode')?.addEventListener('change', e => {
      this.compareMode = e.target.value;
      document.getElementById('historyModelSelect').style.display = this.compareMode === 'history' ? 'block' : 'none';
      this.renderCompare();
    });

    document.getElementById('historyModelSelect')?.addEventListener('change', e => {
      this.historyModel = e.target.value;
      this.renderCompare();
    });
  },

  renderTabs() {
    const tabs = [
      { id: 'start', label: '🚀 Start' },
      { id: 'library', label: '📚 Packs' },
      { id: 'test', label: '🧪 Test' },
      { id: 'compare', label: '⚖️ Compare' },
      { id: 'help', label: '❓ Help' },
      { id: 'recommendations', label: '🎯 Fit' }
    ];

    const container = document.getElementById('tabContainer');
    if (!container) return;

    container.innerHTML = tabs.map((tab, i) =>
      `<div class="tab ${i === 0 ? 'active' : ''}" data-tab="${tab.id}">${tab.label}</div>`
    ).join('');

    container.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => this.showTab(tab.dataset.tab));
    });
  },

  showTab(tabId) {
    localStorage.setItem('aiqx_last_tab', tabId);

    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('main > section').forEach(s => s.classList.add('hidden'));

    const tabElement = document.querySelector(`[data-tab="${tabId}"]`);
    const sectionElement = document.getElementById(`tab-${tabId}`);

    if (tabElement) tabElement.classList.add('active');
    if (sectionElement) sectionElement.classList.remove('hidden');

    if (tabId === 'test') {
      this.renderResults();
      this.renderPackSelect();
      this.renderTierSelector();
    } else if (tabId === 'compare') {
      this.renderHistoryModelSelect();
      this.renderCompare();
    } else if (tabId === 'recommendations') {
      this.renderRecommendations();
    }
  },

  renderTierSelector() {
    const container = document.getElementById('tierSelector');
    if (!container || !this.currentPack) return;

    const tiers = ['basic', 'advanced', 'expert'];
    const available = tiers.filter(t => this.currentPack.tiers[t] && this.currentPack.tiers[t].questionCount > 0);

    if (available.length === 0) return;

    if (!available.includes(this.currentTier)) {
      this.currentTier = available[0];
      this.save();
    }

    container.innerHTML = available.map(tier => {
      const tierData = this.currentPack.tiers[tier];
      return `
        <div class="tier-option ${tier === this.currentTier ? 'selected' : ''}"
             onclick="APP.selectTier('${tier}')">
          <div class="tier-title">${this.capitalize(tier)} Tier</div>
          <div class="tier-desc">${tierData.questionCount} questions</div>
        </div>
      `;
    }).join('');

    this.updateTierDescription();
  },

  selectTier(tier) {
    this.currentTier = tier;
    this.save();
    this.renderTierSelector();
    this.updateTierDescription();
  },

  updateTierDescription() {
    const container = document.getElementById('tierDescription');
    if (!container || !this.currentPack) return;

    const descriptions = {
      basic: 'Quick baseline assessment. Perfect for getting started and comparing models.',
      advanced: 'Thorough evaluation with follow-up questions. Identifies specific strengths and weaknesses.',
      expert: 'Comprehensive testing with stress tests and edge cases. For in-depth capability analysis.'
    };

    container.innerHTML = `<strong>${this.capitalize(this.currentTier)} Tier Selected</strong><br>${descriptions[this.currentTier] || ''}`;
  },

  updateActivePackInfo() {
    const container = document.getElementById('activePackInfo');
    if (!container) return;

    if (!this.currentPack) {
      container.innerHTML = `
        <strong>No pack selected</strong><br>
        Go to Pack Library to import or select a test pack.
      `;
      container.className = 'info-box';
      document.getElementById('tierSelector')?.replaceChildren();
      return;
    }

    const totalQ = (this.currentPack.tiers.basic?.questionCount || 0) +
                   (this.currentPack.tiers.advanced?.questionCount || 0) +
                   (this.currentPack.tiers.expert?.questionCount || 0);

    container.innerHTML = `
      <strong>${this.currentPack.name} v${this.currentPack.version}</strong><br>
      ${this.currentPack.description}<br>
      <span style="font-size: 0.7rem; margin-top: 0.25rem; display: block;">
        📝 ${totalQ} total questions • 👤 ${this.currentPack.author}
      </span>
    `;
    container.className = 'info-box success';

    this.renderTierSelector();
  },

  renderModelSelect() {
    const select = document.getElementById('modelSelect');
    if (!select) return;

    select.innerHTML = '<option value="">Select a model...</option>';
    this.models.forEach(model => {
      const option = document.createElement('option');
      option.value = model.name;
      option.textContent = `${model.name} (${model.history.length} test${model.history.length !== 1 ? 's' : ''})`;
      option.selected = model.name === this.currentModel;
      select.appendChild(option);
    });
  },

  renderPackSelect() {
    const select = document.getElementById('packSelect');
    if (!select) return;

    select.innerHTML = '<option value="">Select a test pack...</option>';
    [...this.installedPacks, ...this.customPacks].forEach(pack => {
      const option = document.createElement('option');
      option.value = pack.id;
      option.textContent = `${pack.name} v${pack.version}`;
      option.selected = this.currentPack?.id === pack.id;
      select.appendChild(option);
    });
  },

  renderHistoryModelSelect() {
    const select = document.getElementById('historyModelSelect');
    if (!select) return;

    select.innerHTML = '<option value="">Select model for history...</option>';
    this.models.forEach(model => {
      if (model.history.length > 0) {
        const option = document.createElement('option');
        option.value = model.name;
        option.textContent = model.name;
        option.selected = model.name === this.historyModel;
        select.appendChild(option);
      }
    });
  },

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  showNotification(message, type = 'info') {
    return this.notificationSystem.show(message, type);
  },

  newModel() {
    const name = prompt('Enter model name:');
    if (!name?.trim()) return;

    const trimmed = name.trim();
    if (this.models.find(m => m.name === trimmed)) {
      this.showNotification('Model already exists', 'error');
      return;
    }

    this.models.push({ name: trimmed, history: [] });
    this.currentModel = trimmed;
    this.save();
    this.renderModelSelect();
    this.showNotification('Model added', 'success');
  },

  renameModel() {
    if (!this.currentModel) {
      this.showNotification('No model selected', 'error');
      return;
    }

    const newName = prompt('New name:', this.currentModel);
    const trimmed = newName?.trim();
    if (!trimmed || trimmed === this.currentModel) return;

    if (this.models.find(m => m.name === trimmed)) {
      this.showNotification('Name already exists', 'error');
      return;
    }

    const model = this.models.find(m => m.name === this.currentModel);
    model.name = trimmed;
    this.currentModel = trimmed;
    this.save();
    this.renderModelSelect();
    this.showNotification('Model renamed', 'success');
  },

  deleteModel() {
    if (!this.currentModel) {
      this.showNotification('No model selected', 'error');
      return;
    }

    if (!confirm(`Delete model "${this.currentModel}" and all its test history?`)) return;

    this.models = this.models.filter(m => m.name !== this.currentModel);
    this.currentModel = this.models[0]?.name || null;
    this.save();
    this.renderModelSelect();
    this.renderResults();
    this.showNotification('Model deleted', 'success');
  },

  copyPrompt() {
    if (!this.currentPack || !this.currentTier || !this.currentPack.tiers[this.currentTier]) {
      this.showNotification('No valid pack/tier selected', 'error');
      return;
    }

    const prompt = this.currentPack.tiers[this.currentTier].prompt;

    navigator.clipboard.writeText(prompt)
      .then(() => this.showNotification('Prompt copied to clipboard!', 'success'))
      .catch(() => this.showNotification('Failed to copy prompt', 'error'));
  },

  analyze() {
    if (!this.currentModel) return this.showNotification('No model selected', 'error');
    if (!this.currentPack) return this.showNotification('No test pack selected', 'error');
    if (!this.currentTier || !this.currentPack.tiers[this.currentTier]) return this.showNotification('No tier selected', 'error');

    const response = document.getElementById('responseBox')?.value.trim();
    if (!response) return this.showNotification('No response pasted', 'error');

    try {
      const parsed = this.parseResponse(response, this.currentPack.tiers[this.currentTier].expectedDomains);
      const scores = {};

      for (const [domain, text] of Object.entries(parsed)) {
        scores[domain] = this.calculateScore(domain, text, this.currentPack.scoringParams || {});
      }

      const model = this.models.find(m => m.name === this.currentModel);
      model.history.push({
        packId: this.currentPack.id,
        tier: this.currentTier,
        time: Date.now(),
        scores
      });

      this.save();
      this.renderResults();
      this.renderModelSelect();
      document.getElementById('responseBox').value = '';
      this.showNotification('Analysis complete!', 'success');
    } catch (err) {
      this.showNotification('Failed to analyze response. Check format.', 'error');
      console.error('Analysis error:', err);
    }
	scrollToTop();
  },

  parseResponse(response, expectedDomains) {
    const startMarker = 'BEGIN AIQ-X RESPONSES';
    const endMarker = 'END AIQ-X RESPONSES';

    const startIndex = response.lastIndexOf(startMarker);
    if (startIndex === -1) throw new Error('Start marker not found');

    const endIndex = response.indexOf(endMarker, startIndex);
    if (endIndex === -1) throw new Error('End marker not found');

    const content = response.substring(startIndex + startMarker.length, endIndex).trim();
    const sections = {};
    const lines = content.split('\n');
    let currentDomain = null;

    lines.forEach(line => {
      const domainMatch = line.match(/\[\[([^\]]+)\]\]/);
      if (domainMatch) {
        currentDomain = domainMatch[1].trim();
        const after = line.substring(domainMatch.index + domainMatch[0].length).trim();
        sections[currentDomain] = after ? after + '\n' : '';
      } else if (currentDomain && line.trim()) {
        sections[currentDomain] += line + '\n';
      }
    });

    for (const domain in sections) {
      sections[domain] = sections[domain].trim();
    }

    expectedDomains.forEach(domain => {
      if (!sections[domain]) sections[domain] = '';
    });

    return sections;
  },

  calculateScore(domainId, text, params) {
    if (!text || !text.trim()) return 0;

    let score = params.baseScore || 30;
    const len = text.length;
    const words = text.split(/\s+/).length;

    (params.lengthBonuses || []).forEach(bonus => {
      if (len >= bonus.threshold) score += bonus.bonus;
    });

    const hedgeTerms = (text.match(/however|depends|assumption|limit|uncertain|might|could|perhaps|possibly|may|sometimes|often|typically/gi) || []).length;
    score += Math.min(15, hedgeTerms * (params.hedgeBonus || 3));

    const absoluteTerms = (text.match(/always|never|obvious|clearly|definitely|certainly|absolutely|must|impossible|guaranteed/gi) || []).length;
    score += absoluteTerms * (params.absolutePenalty || -5);

    const structure = (text.match(/first|second|third|because|therefore|thus|consequently|for example|specifically|namely/gi) || []).length;
    score += Math.min(10, structure * 2);

    if (len > 200) score += 10;
    if (words > 50) score += 5;
    if (text.match(/\d+|[+\-*\/=<>]/)) score += 5;
    if (text.match(/because|therefore|thus|so/gi)) score += 5;
    if (text.match(/example|for instance|specifically/gi)) score += 5;

    return Math.max(0, Math.min(100, Math.round(score)));
  },

  getScoreClass(score) {
    if (score < 20) return 'critical';
    if (score < 40) return 'low';
    if (score < 60) return 'medium';
    if (score < 80) return 'good';
    return 'excellent';
  },

  exportData() {
    const data = {
      models: this.models,
      installedPacks: this.installedPacks,
      customPacks: this.customPacks,
      exportDate: new Date().toISOString(),
      version: '4.2'
    };

    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aiqx-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.showNotification('Data exported successfully!', 'success');
  },

  importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.models) throw new Error('Invalid data format');

        if (!confirm('Import data? This will merge with existing data.')) return;

        data.models.forEach(importedModel => {
          const existing = this.models.find(m => m.name === importedModel.name);
          if (existing) {
            existing.history = [...existing.history, ...importedModel.history];
          } else {
            this.models.push(importedModel);
          }
        });

        if (data.installedPacks) {
          data.installedPacks.forEach(pack => {
            if (!this.installedPacks.find(p => p.id === pack.id)) {
              this.installedPacks.push(pack);
            }
          });
        }

        if (data.customPacks) {
          data.customPacks.forEach(pack => {
            if (!this.customPacks.find(p => p.id === pack.id)) {
              this.customPacks.push(pack);
            }
          });
        }

        this.save();
        this.renderModelSelect();
        this.renderPackSelect();
        this.renderPackLibrary();
        this.renderResults();
        this.showNotification('Data imported successfully!', 'success');
      } catch (err) {
        this.showNotification('Failed to import data. Invalid file format.', 'error');
        console.error('Import error:', err);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }
};

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

function clearAllLocalStorage() {
    const userConfirmed = confirm("Are you sure? This will permanently delete all saved data.");

    if (userConfirmed) {
        try {
            localStorage.clear();
            alert("Data cleared successfully.");
            window.location.reload(); 
        } catch (error) {
            console.error("Error clearing local storage:", error);
        }
    } else {
        console.log("Clear action canceled by user.");
    }
}

// --- GitHub Integration Configuration ---
const GITHUB_CONFIG = {
    username: 'BLGardner',
    repo: 'aiq-x',
    branch: 'main', 
    cacheTime: 600000 // 10 minutes in milliseconds
};

/**
 * Fetch the list of test packs from GitHub
 */
async function fetchTestPacks() {
    const cacheKey = 'github_test_packs';
    const lastFetch = localStorage.getItem('github_test_packs_time');
    const now = Date.now();

    // 1. Check Cache
    if (lastFetch && (now - lastFetch < GITHUB_CONFIG.cacheTime)) {
        return JSON.parse(localStorage.getItem(cacheKey));
    }

    try {
        // 2. Fetch all files recursively using the Trees API
        const url = `https://api.github.com/repos/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repo}/git/trees/${GITHUB_CONFIG.branch}?recursive=1`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error('GitHub API Limit reached or Repo not found');
        
        const data = await response.json();

        // 3. Filter for .json files in the 'Test-Packs' directory
        const testPacks = data.tree.filter(file => 
            file.path.startsWith('Test-Packs/') && 
            file.path.endsWith('.json')
        );

        // 4. Store in Cache
        localStorage.setItem(cacheKey, JSON.stringify(testPacks));
        localStorage.setItem('github_test_packs_time', now.toString());

        return testPacks;
    } catch (error) {
        console.error('Error fetching from GitHub:', error);
        APP.showNotification('Could not load online test packs. Try again later.', 'error');
        return [];
    }
}

//Imports a specific file directly into the app

async function importFromGitHub(path) {
    const rawUrl = `https://raw.githubusercontent.com/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.branch}/${path}`;
    
    try {
        const response = await fetch(rawUrl);
        if (!response.ok) throw new Error('Failed to fetch pack');
        
        const jsonData = await response.json();
        
        // Use the new function instead of importCustomPack
        const success = APP.importCustomPackFromData(jsonData);
        
        if (success) {
            const fileName = path.split('/').pop().replace('.json', '');
            APP.showNotification(`✅ Imported: ${fileName}`, 'success');
        }
        
    } catch (error) {
        console.error("Import failed:", error);
        APP.showNotification('❌ Failed to import test pack', 'error');
    }
}

/**
 * Downloads a pack file properly (forces download, not browser view)
 * @param {string} path - The path to the file in the repo
 */
async function downloadFromGitHub(path) {
    const rawUrl = `https://raw.githubusercontent.com/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.branch}/${path}`;
    
    try {
        // Fetch the file content
        const response = await fetch(rawUrl);
        if (!response.ok) throw new Error('Failed to fetch pack');
        
        const jsonData = await response.json();
        
        // Create a blob and download it
        const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Create temporary download link
        const a = document.createElement('a');
        a.href = url;
        a.download = path.split('/').pop(); // Just the filename
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        APP.showNotification(`💾 Downloaded: ${path.split('/').pop()}`, 'success');
        
    } catch (error) {
        console.error("Download failed:", error);
        APP.showNotification('❌ Failed to download test pack', 'error');
    }
}

/**
 * Displays the list of available test packs from GitHub
 */
async function handleDownloadButtonClick() {
    const container = document.getElementById('test-pack-list');
    
    // Show loading state
    container.innerHTML = '<div class="info-box">Loading test packs from GitHub...</div>';
    
    const packs = await fetchTestPacks();
    
    if (packs.length === 0) {
        container.innerHTML = '<div class="info-box warning"><strong>⚠️ No packs found</strong><br>Could not load test packs from GitHub. Check your internet connection.</div>';
        return;
    }
    
    // Clear and rebuild list
    container.innerHTML = '';
    
    // Add header
    const header = document.createElement('div');
    header.className = 'info-box success';
    header.style.marginBottom = '0.5rem';
    header.innerHTML = `
	<button onclick="document.getElementById('test-pack-list').innerHTML = ''" class="secondary" style="font-size: 0.65rem; padding: 0.3rem 0.5rem;">✕ Hide</button>
	<strong> 📦 ${packs.length} Test Packs Available</strong><br>
	Import directly into AIQ-X or download to your device.`;
    container.appendChild(header);

    packs.forEach(pack => {
        const fileName = pack.path.replace('Test-Packs/', '').replace('Community-Packs/', '');
        const isCommunity = pack.path.includes('Community-Packs/');
        
        const item = document.createElement('div');
        item.className = 'pack-card';
        item.style.marginBottom = '0.5rem';
        item.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
                <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 600; font-size: 0.75rem; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${fileName}
                    </div>
                    ${isCommunity ? '<div style="font-size: 0.6rem; color: var(--text-secondary);">Community Pack</div>' : ''}
                </div>
                <div style="display: flex; gap: 0.25rem; flex-shrink: 0;">
                    <button onclick="importFromGitHub('${pack.path}')" 
                            class="secondary"
                            style="font-size: 0.65rem; padding: 0.3rem 0.5rem;">
                        📥 Import
                    </button>
                    <button onclick="downloadFromGitHub('${pack.path}')" 
                            class="secondary"
                            style="font-size: 0.65rem; padding: 0.3rem 0.5rem;">
                        💾 Download
                    </button>
                </div>
            </div>
        `;
        container.appendChild(item);
    });
    
    APP.showNotification(`Loaded ${packs.length} test packs from GitHub`, 'success');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  APP.init();
});