# Intelligence Boundary Failure Matrix

This matrix documents the expected outcomes of adversarial attacks on the Intelligence Boundary.

| Attack Vector | Mechanism | Expected Outcome | Enforced By |
| :--- | :--- | :--- | :--- |
| **Control Flag Injection** | Intelligence returns `canTrain: false` | **Compile Error** | `NarrativeOutput` Index Signature |
| **State Override** | Intelligence returns `color: "RED"` | **Compile Error** | `NarrativeOutput` Index Signature |
| **Numeric Manipulation** | Intelligence returns `duration: 90` | **Compile Error** | `NarrativeOutput` Index Signature |
| **Pipeline Routing** | Intelligence returns `nextAgent: "Session"` | **Compile Error** | `NarrativeOutput` Index Signature |
| **Runtime 'Any' Cast** | Malicious actor forces obj via `as any` | **Ignored** | Core Agents allow-list specific fields |
| **Timing Attack** | Intelligence delays execution | **N/A** (Sync) | Pipeline is currently synchronous |

## Verification
-   **Compiler Security**: Verified by `src/__tests__/intelligence_compiler_fail.test.ts`.
-   **Runtime Immunity**: Verified by `src/__tests__/intelligence_runtime_immunity.test.ts`.

All vectors result in either **Build Failure** or **Runtime Inertia**.
