/**
 * testContractGuard.js
 *
 * Tests for validateResultContract — the CONTRACT GUARD.
 *
 * Proves:
 *   1. Null input → returns full defaults
 *   2. Partial input → missing fields filled with defaults
 *   3. Full valid input → passes through unchanged
 *   4. Random garbage → returns safe defaults
 *   5. Extra fields → stripped
 *   6. Invalid state → defaults to CONTROL
 *
 * Run: node src/core/testContractGuard.js
 */

import { validateResultContract } from "./validateResultContract.js";

const EXPECTED_KEYS = ["state", "sessionType", "focus", "intensity", "volume", "restPeriod", "notes"];

let passed = 0;
let failed = 0;

function assert(condition, label) {
    if (condition) { console.log(`  ✓ ${label}`); passed++; }
    else { console.log(`  ✗ FAIL: ${label}`); failed++; }
}

function hasExactKeys(obj) {
    const keys = Object.keys(obj).sort();
    const expected = [...EXPECTED_KEYS].sort();
    return JSON.stringify(keys) === JSON.stringify(expected);
}

function allStrings(obj) {
    return EXPECTED_KEYS.every(k => typeof obj[k] === "string");
}

/* ── Test 1: null input ──────────────────────────────────── */
console.log("\n TEST 1: null input");
{
    const r = validateResultContract(null);
    assert(hasExactKeys(r), "has exactly 7 contract keys");
    assert(allStrings(r), "all values are strings");
    assert(r.state === "CONTROL", `state defaults to CONTROL (got: ${r.state})`);
    assert(r.sessionType === "foundation", `sessionType defaults to 'foundation' (got: ${r.sessionType})`);
}

/* ── Test 2: undefined input ─────────────────────────────── */
console.log("\n TEST 2: undefined input");
{
    const r = validateResultContract(undefined);
    assert(hasExactKeys(r), "has exactly 7 contract keys");
    assert(r.state === "CONTROL", "state defaults to CONTROL");
}

/* ── Test 3: partial input ───────────────────────────────── */
console.log("\n TEST 3: partial input (only state + focus)");
{
    const r = validateResultContract({ state: "PROGRESS", focus: "speed work" });
    assert(hasExactKeys(r), "has exactly 7 contract keys");
    assert(r.state === "PROGRESS", `state preserved: PROGRESS (got: ${r.state})`);
    assert(r.focus === "speed work", `focus preserved (got: ${r.focus})`);
    assert(r.sessionType === "foundation", `missing sessionType defaults (got: ${r.sessionType})`);
    assert(r.intensity === "", `missing intensity defaults to '' (got: ${r.intensity})`);
    assert(r.notes === "", `missing notes defaults to '' (got: ${r.notes})`);
}

/* ── Test 4: full valid input ────────────────────────────── */
console.log("\n TEST 4: full valid input");
{
    const input = {
        state: "STABILIZE",
        sessionType: "corrective",
        focus: "joint stability",
        intensity: "low",
        volume: "moderate",
        restPeriod: "60-90s",
        notes: "monitor form",
    };
    const r = validateResultContract(input);
    assert(hasExactKeys(r), "has exactly 7 contract keys");
    for (const key of EXPECTED_KEYS) {
        assert(r[key] === input[key], `${key} preserved: '${r[key]}'`);
    }
}

/* ── Test 5: random garbage object ───────────────────────── */
console.log("\n TEST 5: random garbage object");
{
    const r = validateResultContract({
        banana: 42,
        color: "red",
        ui: { badgeColor: "pink" },
        state: 999,
        focus: [1, 2, 3],
    });
    assert(hasExactKeys(r), "has exactly 7 contract keys");
    assert(allStrings(r), "all values are strings");
    assert(r.state === "CONTROL", `invalid state (999) defaults to CONTROL (got: ${r.state})`);
    assert(r.focus === "", `non-string focus defaults to '' (got: ${r.focus})`);
    assert(!("banana" in r), "extra field 'banana' stripped");
    assert(!("color" in r), "extra field 'color' stripped");
    assert(!("ui" in r), "extra field 'ui' stripped");
}

/* ── Test 6: extra fields stripped ───────────────────────── */
console.log("\n TEST 6: valid data with extra fields");
{
    const r = validateResultContract({
        state: "CONTROL",
        focus: "base building",
        sessionType: "foundational",
        intensity: "low-moderate",
        volume: "moderate",
        restPeriod: "60-90s",
        notes: "monitor",
        badgeColor: "#fff",
        background: "#000",
        borderColor: "red",
        layout: "grid",
    });
    assert(hasExactKeys(r), "exactly 7 keys (extras stripped)");
    assert(!("badgeColor" in r), "badgeColor stripped");
    assert(!("background" in r), "background stripped");
    assert(!("borderColor" in r), "borderColor stripped");
    assert(!("layout" in r), "layout stripped");
    assert(r.state === "CONTROL", "valid data preserved");
    assert(r.focus === "base building", "valid data preserved");
}

/* ── Test 7: invalid state strings ───────────────────────── */
console.log("\n TEST 7: invalid state strings");
{
    const r1 = validateResultContract({ state: "GARBAGE" });
    assert(r1.state === "CONTROL", `'GARBAGE' defaults to CONTROL (got: ${r1.state})`);

    const r2 = validateResultContract({ state: "" });
    assert(r2.state === "CONTROL", `empty string defaults to CONTROL (got: ${r2.state})`);

    const r3 = validateResultContract({ state: "control" });
    assert(r3.state === "CONTROL", `lowercase 'control' defaults to CONTROL (got: ${r3.state})`);
}

/* ── Test 8: non-object inputs ───────────────────────────── */
console.log("\n TEST 8: non-object inputs");
{
    const r1 = validateResultContract("hello");
    assert(hasExactKeys(r1), "string input → full defaults");

    const r2 = validateResultContract(42);
    assert(hasExactKeys(r2), "number input → full defaults");

    const r3 = validateResultContract(true);
    assert(hasExactKeys(r3), "boolean input → full defaults");
}

/* ── Summary ─────────────────────────────────────────────── */
console.log(`\n${"─".repeat(50)}`);
console.log(`  RESULTS: ${passed} passed, ${failed} failed`);
console.log(`${"─".repeat(50)}\n`);

if (failed > 0) process.exit(1);
