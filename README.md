# AIQ-X: AI Model Evaluation Suite

**Deterministic, privacy-first AI benchmarking that runs entirely in your browser.**

**Live Demo:** [https://blgardner.github.io/aiq-x/](https://blgardner.github.io/aiq-x/)

---

## Why AIQ-X?

Most AI benchmarks are either contaminated (models trained on test questions) or use biased AI judges. AIQ-X is different:

- **Deterministic Scoring** - Heuristic-based evaluation, no AI judges
- **Free-Tier Focused** - Tests models as people actually use them (ChatGPT free, Claude free, etc.)
- **Privacy First** - Runs locally in browser, zero data sent to servers
- **Copy-Paste Simple** - No API keys, no setup, just copy and paste

---

## Quick Start (5 Minutes)

1. **Visit:** [https://blgardner.github.io/aiq-x/](https://blgardner.github.io/aiq-x/)
2. **Import a pack:** Click "📦 Show GitHub Packs" → Import "Fit-for-Purpose Assessment"
3. **Add your model:** Testing tab → "➕ New Model" → Name it (e.g., "ChatGPT Free")
4. **Run test:** Select Basic tier → Copy prompt → Paste into AI → Copy response back → Analyze
5. **View results:** Check "🎯 Fit" tab for strengths analysis

---

## Features

- **Fit-for-Purpose Analysis** - Identifies each model's strengths (coding, reasoning, writing, etc.)
- **Multi-Tier Testing** - Basic (5 min), Advanced (15 min), Expert (25 min)
- **Epistemic Calibration** - Rewards appropriate uncertainty, penalizes overconfidence
- **Cross-Model Comparison** - Standardized scoring across any AI model
- **Pack Builder** - Create custom test packs for specialized evaluation
- **Zero Dependencies** - Pure HTML/CSS/JS, works offline

---

## Test Packs

**Essential (Start Here)**
- 🎯 **Fit-for-Purpose Assessment** - Broad-spectrum baseline across 8 capability areas
- ⭐ **Core Capabilities** - Gold standard test covering 10 essential domains

**Specialized Packs**
- 🧠 Advanced Reasoning - Systems thinking, paradoxes, metacognition
- 💻 Code Proficiency - Debugging, algorithms, architecture
- ✍️ Professional Writing - Business communication, technical docs
- 🎨 Creative Writing - Fiction, narrative, character development
- 📊 Information Processing - Research, analysis, synthesis
- 💬 Conversational Intelligence - Dialogue quality, context handling
- 🛡️ Instruction & Safety - Constraint adherence, format compliance
- 🧩 Problem-Solving - Critical thinking, novel solutions

All packs available in the repo's `Test-Packs/` folder or via GitHub import in the app.

---

## How It Works

AIQ-X uses **heuristic-based scoring** to evaluate responses:

**Rewards:**
- Hedge terms ("might", "could", "typically") - shows epistemic calibration
- Structured reasoning ("first", "because", "therefore")
- Detailed explanations (length, examples, depth)

**Penalizes:**
- Absolute terms in ambiguous contexts ("always", "never", "certainly")
- Overconfident assertions without caveats
- Brief, shallow responses

**Example:**
```
❌ "This will ALWAYS work in every case." 
   Score: 25 (overconfident, no nuance)

✅ "This approach typically works, though edge cases may exist."
   Score: 48 (appropriate hedging, acknowledges limitations)
```

---

## Sample Results

```
🥇 Claude Sonnet 4.5 (Free Tier)
   Avg: 72.6 • Tested with Fit-for-Purpose Pack

   Top Strengths:
   • Metacognition: 85 (Self-awareness, uncertainty calibration)
   • Coding: 78 (Debugging, architecture, algorithms)
   • Creativity: 75 (Novel solutions, innovative thinking)

   Best For:
   • Software development and code review
   • Tasks requiring self-assessment
   • Creative problem-solving

   📚 Recommended Next Tests:
   • Advanced Reasoning Pack
   • Code Proficiency Pack
```

*All results represent free-tier performance - how most users actually experience these models.*

---

## Pack Builder

Create custom evaluation frameworks with the included **AIQ-X Pack Builder** (`aiqx-pack-builder.html`).

**Use Cases:**
- Internal company benchmarks
- Domain-specific testing (medical, legal, financial)
- Academic research protocols
- Targeted capability assessments

**Features:**
- Visual editor for questions and scoring
- Three-tier system (Basic/Advanced/Expert)
- JSON export for sharing
- Pre-loaded with Problem-Solving pack (export immediately!)

**Access:** Click the "🛠️ Pack Builder" button in the app, or visit directly: [AIQ-X Pack Builder](https://blgardner.github.io/aiq-x/aiqx-pack-builder.html)

---

## FAQ

**Q: Which models can I test?**  
Any text-based AI with a chat interface. Successfully tested: ChatGPT, Claude, Gemini, DeepSeek, Grok, Mistral, Perplexity, Meta AI, and more.

**Q: Do I need an API key?**  
No. Works with free web interfaces via copy-paste.

**Q: Is my data private?**  
Yes. Everything runs in your browser. Data stored only in browser localStorage. Nothing sent to external servers.

**Q: My model scored low. Is it bad?**  
Not necessarily. Scores measure response style (hedging, structure, depth) not absolute capability. Low scores often indicate overconfident language or brief responses rather than poor reasoning.

**Q: Can I contribute test packs?**  
Yes! Use the Pack Builder, then submit a PR to `Test-Packs/Community-Packs/`.

---

## Development

Built with vanilla JavaScript - no frameworks, no dependencies.

### Key Files
- `index.html` - Main interface
- `app.js` - Core logic and scoring engine
- `styles.css` - UI styling
- `aiqx-pack-builder.html` - Pack creation tool
- `Test-Packs/` - JSON test pack library

### Scoring Logic
Found in `app.js` - customizable heuristics for:
- Hedge term detection
- Absolute term penalties
- Structure analysis
- Length/depth bonuses

### Contributing
PRs welcome! Especially:
- New test packs for `Community-Packs/`
- Scoring algorithm improvements
- UI/UX enhancements
- Bug fixes

---

## Technical Details

- **Storage:** Browser localStorage (~250KB typical usage, 5MB limit)
- **Browser Support:** Modern browsers (Chrome, Firefox, Safari, Edge)
- **Offline:** Fully functional offline after initial load
- **Mobile:** Responsive design, works on tablets/phones

---

## License

MIT License - Free to use, modify, and distribute.

---

## Acknowledgments

Inspired by the deterministic simplicity of early AI evaluation methods, built for modern LLM testing needs.

**Built by:** [@BLGardner](https://github.com/BLGardner)  
**Repository:** [https://github.com/BLGardner/aiq-x](https://github.com/BLGardner/aiq-x)  
**Live Demo:** [https://blgardner.github.io/aiq-x/](https://blgardner.github.io/aiq-x/)
