/**
 * testSingleEntryPoint.js
 *
 * Proves that getResultViewModel:
 *   1. Returns a ResultViewModel (has .ui property)
 *   2. Never returns raw engine output
 *   3. All 4 truth-table combinations produce correct states
 *   4. Handles null/undefined input without crashing
 *   5. Try/catch fallback works
 *
 * Run: node src/testSingleEntryPoint.js
 */

import { getResultViewModel } from "./getResultViewModel.js";

let passed = 0;
let failed = 0;

function assert(condition, label) {
    if (condition) { console.log(`  ✓ ${label}`); passed++; }
    else { console.log(`  ✗ FAIL: ${label}`); failed++; }
}

/* ── Test 1: Output is a ViewModel, not raw engine ──────── */
console.log("\n TEST 1: Output is a ResultViewModel");
{
    const vm = getResultViewModel({ name: "T", sport: "running", stable: true, baseNeeded: true });
    assert("ui" in vm, "has .ui property (ViewModel marker)");
    assert("badgeColor" in vm.ui, "vm.ui has badgeColor");
    assert("background" in vm.ui, "vm.ui has background");
    assert("borderColor" in vm.ui, "vm.ui has borderColor");
    assert("label" in vm.ui, "vm.ui has label");
    assert(typeof vm.state === "string", "vm.state is a string");
    assert(typeof vm.focus === "string", "vm.focus is a string");
    assert(typeof vm.sessionType === "string", "vm.sessionType is a string");
}

/* ── Test 2: No raw engine fields leak ──────────────────── */
console.log("\n TEST 2: No raw engine fields in output");
{
    const vm = getResultViewModel({ name: "T", sport: "running", stable: true, baseNeeded: true });
    const keys = Object.keys(vm).sort();
    const expected = ["focus", "intensity", "notes", "restPeriod", "sessionType", "state", "ui", "volume"];
    assert(JSON.stringify(keys) === JSON.stringify(expected), `keys are exactly: [${keys.join(", ")}]`);
    assert(keys.length === 8, `exactly 8 keys (7 contract + ui) — got ${keys.length}`);
}

/* ── Test 3: Truth table — all 4 combinations ───────────── */
console.log("\n TEST 3: Truth table verification");
{
    const cases = [
        { stable: true, baseNeeded: true, expected: "CONTROL" },
        { stable: false, baseNeeded: true, expected: "STABILIZE" },
        { stable: true, baseNeeded: false, expected: "PROGRESS" },
        { stable: false, baseNeeded: false, expected: "STABILIZE" },
    ];
    for (const c of cases) {
        const vm = getResultViewModel({ name: "T", sport: "running", ...c });
        assert(vm.state === c.expected, `stable=${c.stable} base=${c.baseNeeded} => ${vm.state} (expected: ${c.expected})`);
    }
}

/* ── Test 4: Null / undefined / empty input ────────────── */
console.log("\n TEST 4: Null/undefined/empty input is safe");
{
    const vm1 = getResultViewModel(null);
    assert("ui" in vm1, "null input → has .ui (is ViewModel)");
    assert(typeof vm1.state === "string", "null input → state is string");

    const vm2 = getResultViewModel(undefined);
    assert("ui" in vm2, "undefined input → has .ui");

    const vm3 = getResultViewModel({});
    assert("ui" in vm3, "empty {} input → has .ui");
}

/* ── Test 5: UI config matches state ───────────────────── */
console.log("\n TEST 5: UI config matches state");
{
    const vmControl = getResultViewModel({ name: "T", sport: "default", stable: true, baseNeeded: true });
    assert(vmControl.ui.label === "Control", `CONTROL → label 'Control' (got: ${vmControl.ui.label})`);

    const vmStab = getResultViewModel({ name: "T", sport: "default", stable: false, baseNeeded: true });
    assert(vmStab.ui.label === "Stabilize", `STABILIZE → label 'Stabilize' (got: ${vmStab.ui.label})`);

    const vmProg = getResultViewModel({ name: "T", sport: "default", stable: true, baseNeeded: false });
    assert(vmProg.ui.label === "Progress", `PROGRESS → label 'Progress' (got: ${vmProg.ui.label})`);
}

/* ── Test 6: Sport-specific values flow through ─────────── */
console.log("\n TEST 6: Sport profiles produce correct values");
{
    const vm = getResultViewModel({ name: "T", sport: "running", stable: true, baseNeeded: true });
    assert(vm.sessionType === "running foundation", `running CONTROL → 'running foundation' (got: ${vm.sessionType})`);

    const vmStr = getResultViewModel({ name: "T", sport: "strength", stable: true, baseNeeded: true });
    assert(vmStr.sessionType === "base strength", `strength CONTROL → 'base strength' (got: ${vmStr.sessionType})`);
}

/* ── Summary ─────────────────────────────────────────────── */
console.log(`\n${"─".repeat(50)}`);
console.log(`  RESULTS: ${passed} passed, ${failed} failed`);
console.log(`${"─".repeat(50)}\n`);

if (failed > 0) process.exit(1);
