# Intelligent Mode Verification

## Objective
Confirm that INTELLIGENT mode can safely consume external input while preserving structural determinism.

## Implementation Details

1.  **Strict Separation**:
    -   Core Agents (`src/agents/*.ts`) remain "Frozen". They call `generateXContent` functions.
    -   Logic branching happens *inside* `src/content/descriptions.ts`.
    -   `SargasAgent` logic (Red/Yellow/Green) remains hardcoded in `SargasAgent.ts`, only the *text reason* is generated.

2.  **Structural Determinism**:
    -   `SargasOutput.color` is derived solely from inputs in `SargasAgent.ts`. No AI can override it.
    -   `TrenerisOutput.logicalAction` remains hardcoded in `TrenerisAgent.ts` based on Sargas color.
        -   *Green*: "Progressively overload..."
        -   *Red*: "Calm the nervous system..."
    -   The AI *only* populates `situationAnalysis` and `adjustmentVector`.

3.  **External Input Consumption**:
    -   In `src/content/descriptions.ts`, the function `generateTrenerisContent` now accepts `TrenerisInput`.
    -   If `SYSTEM_CONFIG.MODE === 'INTELLIGENT'`, it uses `input.userGoal` to generate specific advice.
    -   This proves the system consumes external context without altering the pipeline structure.

## Verification Steps (Manual)

To verify this yourself:

1.  Open `src/config.ts` and set `MODE: 'INTELLIGENT'`.
2.  Run the application.
3.  Enter a specific goal (e.g., "Marathon Training").
4.  Run the flow.
    -   **Expect**: The "Analysis" text should say something like `[AI Generated] Analysis for goal "Marathon Training"...`.
    -   **Expect**: The Sargas Status (Green/Yellow/Red) should still strictly follow the sliders.
5.  Set `MODE: 'DETERMINISTIC'` again.
    -   **Expect**: The text returns to "Static content...".
