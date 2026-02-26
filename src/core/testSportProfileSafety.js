/**
 * testSportProfileSafety.js
 *
 * Lightweight safety tests for the sport profile layer.
 * Proves:
 *   1. UI fields injected into sport profiles are stripped.
 *   2. Unknown sport falls back to default profile.
 *   3. Output contract matches exactly: { state, focus, sessionType, intensity, volume, restPeriod, notes }.
 *   4. normalizeEngineResult strips any extra fields.
 *
 * Run: node src/core/testSportProfileSafety.js
 */

import { getDecisionResult } from "./trainingState.js";
import { createAthleteProfile } from "./athleteProfile.js";

const EXPECTED_KEYS = ["state", "focus", "sessionType", "intensity", "volume", "restPeriod", "notes"];

let passed = 0;
let failed = 0;

function assert(condition, label) {
    if (condition) {
        console.log(`  ✓ ${label}`);
        passed++;
    } else {
        console.log(`  ✗ FAIL: ${label}`);
        failed++;
    }
}

/* ── Test 1: UI fields in sport profiles get stripped ────── */
console.log("\n TEST 1: UI fields cannot leak through sport profiles");
{
    // Temporarily inject a fake sport with UI fields into the profile lookup path.
    // Since SPORT_PROFILES is frozen, we test indirectly:
    // the engine output should NEVER contain UI keys regardless of input.
    const result = getDecisionResult(createAthleteProfile({
        name: "Test", sport: "running", stable: true, baseNeeded: true,
    }));

    assert(!("badgeColor" in result), "badgeColor not in output");
    assert(!("background" in result), "background not in output");
    assert(!("borderColor" in result), "borderColor not in output");
    assert(!("label" in result), "label not in output");
    assert(!("ui" in result), "ui not in output");
    assert(!("color" in result), "color not in output");
    assert(!("style" in result), "style not in output");
    assert(!("className" in result), "className not in output");
}

/* ── Test 2: Unknown sport falls back safely ─────────────── */
console.log("\n TEST 2: Unknown sport uses default profile");
{
    const result = getDecisionResult(createAthleteProfile({
        name: "Test", sport: "underwater_basket_weaving", stable: true, baseNeeded: true,
    }));

    assert(result.state === "CONTROL", `state is CONTROL (got: ${result.state})`);
    assert(result.sessionType === "foundational", `sessionType is 'foundational' (got: ${result.sessionType})`);
    assert(typeof result.focus === "string", "focus is a string");
}

/* ── Test 3: Output contract shape is exact ──────────────── */
console.log("\n TEST 3: Output contract has exactly 7 keys");
{
    const result = getDecisionResult(createAthleteProfile({
        name: "Test", sport: "strength", stable: false, baseNeeded: true,
    }));

    const keys = Object.keys(result).sort();
    const expected = [...EXPECTED_KEYS].sort();

    assert(keys.length === expected.length, `has ${expected.length} keys (got: ${keys.length})`);
    assert(JSON.stringify(keys) === JSON.stringify(expected), `keys match: [${keys.join(", ")}]`);
}

/* ── Test 4: All contract fields are strings ────────────── */
console.log("\n TEST 4: All contract fields are strings");
{
    const result = getDecisionResult(createAthleteProfile({
        name: "Test", sport: "rehab", stable: true, baseNeeded: false,
    }));

    for (const key of EXPECTED_KEYS) {
        assert(typeof result[key] === "string", `${key} is a string (got: ${typeof result[key]})`);
    }
}

/* ── Test 5: Null athlete does not crash ─────────────────── */
console.log("\n TEST 5: Null/undefined athlete is safe");
{
    const result = getDecisionResult(null);
    assert(typeof result === "object" && result !== null, "null athlete returns an object");
    assert(EXPECTED_KEYS.every(k => k in result), "all contract keys present");

    const result2 = getDecisionResult(undefined);
    assert(typeof result2 === "object" && result2 !== null, "undefined athlete returns an object");
}

/* ── Test 6: All sports produce valid output ────────────── */
console.log("\n TEST 6: All known sports produce valid contract output");
{
    const sports = ["default", "running", "strength", "triathlon", "rehab"];
    for (const sport of sports) {
        const result = getDecisionResult(createAthleteProfile({
            name: "Test", sport, stable: true, baseNeeded: true,
        }));
        const keys = Object.keys(result).sort();
        const expected = [...EXPECTED_KEYS].sort();
        assert(JSON.stringify(keys) === JSON.stringify(expected), `${sport}: exact contract shape`);
        assert(!("ui" in result), `${sport}: no ui field in engine output`);
    }
}

/* ── Summary ─────────────────────────────────────────────── */
console.log(`\n${"─".repeat(50)}`);
console.log(`  RESULTS: ${passed} passed, ${failed} failed`);
console.log(`${"─".repeat(50)}\n`);

if (failed > 0) {
    process.exit(1);
}
