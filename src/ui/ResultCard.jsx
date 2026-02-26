/**
 * ResultCard.jsx
 *
 * Pure presentation component — renders a pre-built View Model.
 *
 * BOUNDARY RULES:
 *   - Receives a single `vm` prop (built by buildResultViewModel).
 *   - Reads data from `vm.*` and visuals from `vm.ui.*`.
 *   - Does NOT import engine modules or state config.
 *   - Contains ZERO logic — only rendering.
 *
 * Architecture: Engine → ViewModel → ResultCard
 */

import React from "react";

export function ResultCard({ vm }) {
    const { state, focus, sessionType, intensity, volume, restPeriod, notes, ui } = vm;

    const details = [
        { label: "Session Type", value: sessionType },
        { label: "Intensity", value: intensity },
        { label: "Volume", value: volume },
        { label: "Rest Period", value: restPeriod },
    ];

    return (
        <div style={cardStyle}>
            {/* State badge */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                <span style={{
                    display: "inline-block",
                    padding: "0.3rem 0.85rem",
                    borderRadius: "999px",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    color: "#fff",
                    background: ui.badgeColor,
                }}>
                    {state}
                </span>
                <span style={{ fontSize: "1.15rem", fontWeight: 600, color: "#222" }}>
                    {ui.label}
                </span>
            </div>

            {/* Focus */}
            <p style={{ margin: "0 0 1.25rem", fontSize: "0.95rem", color: "#444", lineHeight: 1.5 }}>
                <strong>Focus:</strong> {focus}
            </p>

            {/* Action details — 2×2 grid */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.6rem 1.5rem",
                padding: "1rem",
                background: ui.background,
                borderRadius: "8px",
                marginBottom: "1.25rem",
            }}>
                {details.map((item) => (
                    <div key={item.label}>
                        <div style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "#888", marginBottom: "0.15rem" }}>
                            {item.label}
                        </div>
                        <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#222" }}>
                            {item.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Notes */}
            <div style={{
                padding: "0.75rem 1rem",
                background: "#f9f9f9",
                borderLeft: `3px solid ${ui.borderColor}`,
                borderRadius: "0 6px 6px 0",
                fontSize: "0.85rem",
                color: "#555",
                lineHeight: 1.6,
            }}>
                {notes}
            </div>
        </div>
    );
}

/* ── Card base style ───────────────────────────────────────── */

const cardStyle = {
    marginTop: "1.5rem",
    padding: "1.5rem",
    background: "#fff",
    border: "1px solid #e8e8e8",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
};

