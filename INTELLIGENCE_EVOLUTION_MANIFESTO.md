# Intelligence Evolution Manifesto

## 1. The Separation of Concerns
This system effectively decouples **Control Logic** from **Content Generation**.
-   **Control Logic (`src/agents/`)**: Deterministic, safety-critical, and **IMMUTABLE**.
-   **Content Generation (`src/content/`)**: Probabilistic, creative, and **EVOLVING**.

## 2. Location Constraint
**All future Intelligence / AI work MUST reside strictly within `src/content/`.**
-   Any logic that involves LLMs, prompt engineering, or heuristic inference belongs here.
-   **Never** import AI libraries into `src/agents/`.

## 3. The Frozen Core
The following directories are **LEGALLY LOCKDOWN** against feature expansion:
-   `src/agents/` (The decision pipeline)
-   `src/verification/` (The safety harness)

## 4. The Intelligence Contract
All intelligent outputs must conform to the **Narrative Output** pattern:
-   Intelligence yields **Descriptions**, not **Decisions**.
-   Intelligence yields **Context**, not **Control**.

> "The Brain (Agents) decides the structure. The Voice (Content) fills the narrative. The two shall never trade places."
