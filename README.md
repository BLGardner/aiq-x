
# AIQ-X: Advanced AI Evaluation & Diagnostics

AIQ-X is an open-source, local-first diagnostic suite designed to stress-test and benchmark Large Language Models (LLMs) with deterministic precision. Inspired by early conversational AI like Dr. Sbaitso, AIQ-X moves beyond "vibes" to provide a rigorous framework for identifying a model's true "Fit-for-Purpose".

**Live Demo:** [https://blgardner.github.io/aiq-x/](https://blgardner.github.io/aiq-x/)

---

## 🚀 Why AIQ-X?

Most benchmarks are either static (leaked into training data) or rely on "Judge LLMs" which introduce their own biases. AIQ-X solves this by:

- **Deterministic Scoring:** Uses heuristic-based evaluation to reward epistemic calibration and penalize overconfident hallucinations.
- **Zero-Server Privacy:** Runs entirely in the browser. Your prompts and model responses never leave your `localStorage`.
- **The Pack Builder:** Includes a specialized tool to create, export, and share custom JSON "Test Packs" for private benchmarking.
- **Multi-Tier Testing:** From "Basic" (5 mins) to "Expert" (20+ mins) to get high-granularity performance data.

### ❓ Why use regex/heuristics, isn't LLM-as-a-judge better?

That’s a fair question. While LLM-as-a-judge (like using GPT-4o to grade Llama) is popular, it creates a 'circular' evaluation problem. You end up measuring how much a model agrees with the judge, not necessarily how correct it is.

I chose deterministic heuristics (logic markers, epistemic hedging, structure checks) because they are transparent and consistent. They don't cost money, don't require an API, and they provide a 'ground truth' that doesn't change just because the grading model got a version update.

## 🛠 Features

- **Fit-for-Purpose Analysis:** Automatically categorizes models by their strengths (Coding, Logic, Creative, etc.).
- **Cross-Model Parity:** Standardized parameters to ensure you are comparing "apples to apples" across GPT, Claude, Gemini, and local models.
- **Dark Mode / Responsive UI:** Built for the desktop terminal aesthetic but fully functional on mobile.

## 📂 Included Diagnostic Packs

1. **Fit-for-Purpose:** Broad-spectrum evaluation (Start here).
2. **Core Capabilities:** The "Gold Standard" baseline (10 essential domains).
3. **Advanced Reasoning:** Paradox resolution and systems thinking.
4. **Code Proficiency:** Technical debugging and algorithmic logic.
5. **Instruction Following & Safety:** Constraint adherence and manipulation resistance.
6. **Professional Writing:** Ideal for testing models used in workplace contexts.
7. **Creative Writing:** Great for evaluating creative fiction capabilities.
8. **Information Processing:** Essential for research and analysis tasks.
9. **Conversational Intelligence:** Tests dialogue quality.
10. **Problem-Solving & Critical Thinking:** - A Bonus pack included in the Pack Builder, you can export it immediately! 

## ⚙️ How it Works

AIQ-X uses a "Copy-Paste" diagnostic workflow:
1. **Select a Pack:** Choose your testing domain.
2. **Interact:** Copy the generated prompt into any AI chat interface.
3. **Analyze:** Paste the raw response back into AIQ-X. The engine parses the response using marker-based delimiters and scores it based on defined heuristics. You can even copy the entire chat and paste into AIQ-X, it will only analyze the response!

### ❓ Why copy-paste, why not just use an API?

Privacy and flexibility were my main drivers here. Many of us work in environments where we can’t plug our internal data into a third-party benchmarking tool via API.

By using a copy-paste workflow with local storage, AIQ-X never touches a server. It also means you can test any model - even a local Llama instance running in your terminal or a locked-down enterprise chat - without needing to write a single line of integration code.

## 🛠 Development & Customization

The project is built with vanilla JS/CSS/HTML - no heavy frameworks or dependencies.

### Custom Scoring Logic
You can find the heuristic engine in `app.js`. It rewards/penalizes based on:
- **Hedge Terms:** Rewarding "potentially," "however," and "it depends."
- **Absolute Terms:** Penalizing "always," "never," and "certainly" in ambiguous contexts.
- **Structure:** Verification of formatting and instruction compliance.

### Contributing
If you create a new Test Pack using the **Pack Builder**, please consider submitting a PR to include it in the `community-packs/` folder!

## 📜 License

MIT License - Feel free to use, modify, and distribute.

