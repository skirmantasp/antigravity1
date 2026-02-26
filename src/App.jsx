import React, { useState } from "react";
import { getResultViewModel } from "./getResultViewModel.js";
import { ResultCard } from "./ui/ResultCard.jsx";

export function App() {
    const [name, setName] = useState("Demo Athlete");
    const [sport, setSport] = useState("running");
    const [stable, setStable] = useState(true);
    const [baseNeeded, setBaseNeeded] = useState(true);
    const [result, setResult] = useState(null);

    function handleRun() {
        // Single entry point: raw input → ResultViewModel
        // No engine internals exposed. No raw results. No config.
        const vm = getResultViewModel({ name, sport, stable, baseNeeded });
        setResult(vm);
    }

    return (
        <div style={{ fontFamily: "monospace", padding: "2rem", maxWidth: "720px" }}>
            <h1>Antigravity Engine Test</h1>

            <fieldset style={{ border: "1px solid #444", padding: "1rem", borderRadius: "8px" }}>
                <legend style={{ fontWeight: "bold" }}>Athlete Setup</legend>

                <div style={{ marginBottom: "0.75rem" }}>
                    <label htmlFor="input-name" style={{ display: "block", marginBottom: "0.25rem" }}>
                        Name
                    </label>
                    <input
                        id="input-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={inputStyle}
                    />
                </div>

                <div style={{ marginBottom: "0.75rem" }}>
                    <label htmlFor="input-sport" style={{ display: "block", marginBottom: "0.25rem" }}>
                        Sport
                    </label>
                    <input
                        id="input-sport"
                        type="text"
                        value={sport}
                        onChange={(e) => setSport(e.target.value)}
                        style={inputStyle}
                    />
                </div>

                <div style={{ marginBottom: "0.75rem" }}>
                    <label htmlFor="input-stable" style={{ cursor: "pointer" }}>
                        <input
                            id="input-stable"
                            type="checkbox"
                            checked={stable}
                            onChange={(e) => setStable(e.target.checked)}
                        />{" "}
                        Stable
                    </label>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                    <label htmlFor="input-base-needed" style={{ cursor: "pointer" }}>
                        <input
                            id="input-base-needed"
                            type="checkbox"
                            checked={baseNeeded}
                            onChange={(e) => setBaseNeeded(e.target.checked)}
                        />{" "}
                        Base Needed
                    </label>
                </div>

                <button id="btn-run-engine" onClick={handleRun} style={buttonStyle}>
                    Run Engine
                </button>
            </fieldset>

            {result && <ResultCard vm={result} />}
        </div>
    );
}

/* ── Form styles ───────────────────────────────────────────── */

const inputStyle = {
    fontFamily: "monospace",
    fontSize: "0.95rem",
    padding: "0.4rem 0.5rem",
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #666",
    borderRadius: "4px",
    background: "#fafafa",
};

const buttonStyle = {
    fontFamily: "monospace",
    fontSize: "1rem",
    fontWeight: "bold",
    padding: "0.5rem 1.5rem",
    cursor: "pointer",
    border: "1px solid #333",
    borderRadius: "4px",
    background: "#222",
    color: "#fff",
};

