import React, { useState } from "react";
import { createAthleteProfile } from "./core/athleteProfile.js";
import { getDecisionResult } from "./core/trainingState.js";

export function App() {
    const [name, setName] = useState("Demo Athlete");
    const [sport, setSport] = useState("running");
    const [stable, setStable] = useState(true);
    const [baseNeeded, setBaseNeeded] = useState(true);
    const [result, setResult] = useState(null);

    function handleRun() {
        const athlete = createAthleteProfile({
            name,
            sport,
            stable,
            baseNeeded,
        });

        const decision = getDecisionResult(athlete);
        setResult(decision);
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

            {result && (
                <div style={{ marginTop: "1.5rem" }}>
                    <h2>Result — {result.state}</h2>
                    <pre style={preStyle}>
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}

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

const preStyle = {
    background: "#1e1e1e",
    color: "#d4d4d4",
    padding: "1.5rem",
    borderRadius: "8px",
    overflow: "auto",
};
