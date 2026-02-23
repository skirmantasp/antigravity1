import { FC, useState, useEffect } from "react";
import { Athlete, SportContext, ExperienceLevel, ProfileStatus } from "../../types";
import { dataService } from "../../services/dataService";
import { Card, Button } from "../../shared/ui/Components";
import { calculateStability } from "../../core/stabilityModel";
import { calculateMomentum } from "../../core/momentumModel";
import { deriveWeightedDecision, DecisionSeverity } from "../../core/decisionScoring";

interface AthletePreviewProps {
    athleteId: string;
    onStartSession: () => void;
    onBack: () => void;
    onAthleteUpdate?: (updated: Athlete) => void;
}

const getRiskColor = (readiness: number, injury: string): string => {
    if (injury === "INJURED") return "#ef4444";
    if (readiness < 50) return "#ef4444";
    if (readiness < 70) return "#eab308";
    return "#22c55e";
};

const getRiskLabel = (readiness: number, injury: string): string => {
    if (injury === "INJURED") return "HIGH RISK";
    if (readiness < 50) return "HIGH RISK";
    if (readiness < 70) return "MODERATE";
    return "READY";
};

const getNeuralEstimate = (readiness: number, injury: string): { label: string; color: string } => {
    if (injury === "INJURED") return { label: "PROTECTIVE", color: "#64748b" };
    if (readiness < 50) return { label: "PROTECTIVE", color: "#64748b" };
    if (readiness < 65) return { label: "STABLE", color: "#38bdf8" };
    if (readiness < 80) return { label: "ADAPTIVE", color: "#22c55e" };
    return { label: "PRIMED", color: "#a855f7" };
};

const STABILITY_COLOR: Record<string, string> = { HIGH: "#22c55e", MODERATE: "#eab308", LOW: "#94a3b8" };
const MOMENTUM_ARROW: Record<string, { symbol: string; color: string }> = {
    UP: { symbol: "↑", color: "#22c55e" },
    DOWN: { symbol: "↓", color: "#ef4444" },
    FLAT: { symbol: "→", color: "#94a3b8" },
};

const SEVERITY_COLOR: Record<DecisionSeverity, string> = {
    HIGH: "#ef4444",
    MEDIUM: "#eab308",
    LOW: "#22c55e",
};

const Indicator: FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", minWidth: 0 }}>
        <div style={{ fontSize: "0.625rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, whiteSpace: "nowrap" }}>
            {label}
        </div>
        <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#e2e8f0" }}>
            {children}
        </div>
    </div>
);

const FIELD_STYLE: React.CSSProperties = {
    width: "100%",
    padding: "0.5rem 0.75rem",
    backgroundColor: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "6px",
    color: "#e2e8f0",
    fontSize: "0.875rem",
    outline: "none",
    boxSizing: "border-box",
};

export const AthletePreview: FC<AthletePreviewProps> = ({ athleteId, onStartSession, onBack, onAthleteUpdate }) => {
    const [athlete, setAthlete] = useState<Athlete | null>(null);
    const [showSettings, setShowSettings] = useState(false);

    // Draft state — mirrored from athlete on load
    const [draftSportContext, setDraftSportContext] = useState<SportContext>("GENERAL");
    const [draftExperienceLevel, setDraftExperienceLevel] = useState<ExperienceLevel | "">("");
    const [draftProfileStatus, setDraftProfileStatus] = useState<ProfileStatus>("NONE");
    const [draftNotes, setDraftNotes] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const load = async () => {
            const data = await dataService.getAthleteById(athleteId);
            if (data) {
                setAthlete(data);
                setDraftSportContext(data.sportContext ?? "GENERAL");
                setDraftExperienceLevel(data.experienceLevel ?? "");
                setDraftProfileStatus(data.profileStatus ?? "NONE");
                setDraftNotes(data.notes ?? "");
            }
        };
        load();
    }, [athleteId]);

    const handleSave = async () => {
        if (!athlete) return;
        setSaving(true);
        const updates: Partial<Athlete> = {
            sportContext: draftSportContext,
            experienceLevel: draftExperienceLevel || undefined,
            profileStatus: draftProfileStatus,
            notes: draftNotes,
        };
        const updated = await dataService.updateAthlete(athlete.id, updates);
        setAthlete(updated);
        setShowSettings(false);
        setSaving(false);
        onAthleteUpdate?.(updated);
    };

    if (!athlete) return <div style={{ color: "#e2e8f0", padding: "3rem", textAlign: "center" }}>Loading...</div>;

    const lastSession = athlete.history[athlete.history.length - 1];
    const prevSession = athlete.history.length > 1 ? athlete.history[athlete.history.length - 2] : null;
    const riskColor = getRiskColor(athlete.readinessScore, athlete.injuryStatus);
    const riskLabel = getRiskLabel(athlete.readinessScore, athlete.injuryStatus);
    const neural = getNeuralEstimate(athlete.readinessScore, athlete.injuryStatus);

    const lastBalances = athlete.history.slice(-5).map(h => h.balance ?? 0);
    const { stabilityLevel } = calculateStability(lastBalances);
    const { momentumDirection } = calculateMomentum(lastBalances);
    const momentum = MOMENTUM_ARROW[momentumDirection];
    const lastBalance = lastBalances.length > 0 ? lastBalances[lastBalances.length - 1] : 0;
    const primaryAction = deriveWeightedDecision({
        neuralState: neural.label,
        stability: stabilityLevel,
        momentum: momentumDirection,
        balance: lastBalance,
        phase: athlete.phase,
        riskProfile: "BALANCED",
    });

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", color: "#e2e8f0" }}>
            <div style={{ maxWidth: "640px", margin: "0 auto", padding: "3rem 1.5rem" }}>
                {/* Back */}
                <Button label="← Back" onClick={onBack} variant="secondary" style={{ marginBottom: "2rem" }} />

                {/* Name & Phase */}
                <div style={{ marginBottom: "1.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0 0 0.375rem 0", letterSpacing: "-0.02em" }}>
                            {athlete.name}
                        </h1>
                        <button
                            onClick={() => setShowSettings(s => !s)}
                            style={{
                                background: "none",
                                border: "1px solid #334155",
                                borderRadius: "6px",
                                color: showSettings ? "#38bdf8" : "#94a3b8",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                padding: "0.375rem 0.75rem",
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                                marginTop: "0.25rem",
                            }}
                        >
                            {showSettings ? "✕ Close" : "Edit Profile"}
                        </button>
                    </div>
                    <div style={{ fontSize: "0.8125rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {athlete.phase.replace(/_/g, " ")}
                        {athlete.sportContext && athlete.sportContext !== "GENERAL" && (
                            <span style={{ color: "#475569", marginLeft: "0.5rem" }}>· {athlete.sportContext}</span>
                        )}
                    </div>
                </div>

                {/* ── Inline Profile Settings Panel ────────────────── */}
                {showSettings && (
                    <div style={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "10px",
                        padding: "1.25rem 1.5rem",
                        marginBottom: "1.5rem",
                    }}>
                        <div style={{
                            fontSize: "0.625rem", fontWeight: 700,
                            textTransform: "uppercase", letterSpacing: "0.07em",
                            color: "#64748b", marginBottom: "1rem",
                        }}>
                            Profile Settings
                        </div>

                        {/* Sport Context */}
                        <div style={{ marginBottom: "0.875rem" }}>
                            <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.25rem", fontWeight: 600 }}>
                                Sport Context
                            </label>
                            <select
                                value={draftSportContext}
                                onChange={e => setDraftSportContext(e.target.value as SportContext)}
                                style={FIELD_STYLE}
                            >
                                <option value="GENERAL">General</option>
                                <option value="STRENGTH">Strength</option>
                                <option value="ENDURANCE">Endurance</option>
                                <option value="REHAB">Rehab</option>
                                <option value="TEAM">Team</option>
                            </select>
                        </div>

                        {/* Experience Level */}
                        <div style={{ marginBottom: "0.875rem" }}>
                            <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.25rem", fontWeight: 600 }}>
                                Experience Level
                            </label>
                            <select
                                value={draftExperienceLevel}
                                onChange={e => setDraftExperienceLevel(e.target.value as ExperienceLevel | "")}
                                style={FIELD_STYLE}
                            >
                                <option value="">— Not set —</option>
                                <option value="BEGINNER">Beginner</option>
                                <option value="INTERMEDIATE">Intermediate</option>
                                <option value="ADVANCED">Advanced</option>
                            </select>
                        </div>

                        {/* Profile Status */}
                        <div style={{ marginBottom: "0.875rem" }}>
                            <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.25rem", fontWeight: 600 }}>
                                Profile Status
                            </label>
                            <select
                                value={draftProfileStatus}
                                onChange={e => setDraftProfileStatus(e.target.value as ProfileStatus)}
                                style={FIELD_STYLE}
                            >
                                <option value="NONE">None</option>
                                <option value="RECOVERING">Recovering</option>
                                <option value="LIMITED">Limited</option>
                            </select>
                        </div>

                        {/* Notes */}
                        <div style={{ marginBottom: "1rem" }}>
                            <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.25rem", fontWeight: 600 }}>
                                Notes
                            </label>
                            <textarea
                                value={draftNotes}
                                onChange={e => setDraftNotes(e.target.value)}
                                rows={3}
                                placeholder="Load management notes, contraindications…"
                                style={{ ...FIELD_STYLE, resize: "vertical", lineHeight: 1.5 }}
                            />
                        </div>

                        {/* Save */}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            style={{
                                padding: "0.5rem 1.25rem",
                                backgroundColor: saving ? "#1e3a5f" : "#0ea5e9",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "0.875rem",
                                fontWeight: 700,
                                cursor: saving ? "not-allowed" : "pointer",
                                transition: "background-color 0.15s",
                            }}
                        >
                            {saving ? "Saving…" : "Save Profile"}
                        </button>
                    </div>
                )}
                {/* ──────────────────────────────────────────────────── */}

                {/* 5-indicator compact row */}
                <Card style={{ marginBottom: "2rem" }}>
                    <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", flexWrap: "nowrap", overflowX: "auto" }}>

                        {/* Readiness */}
                        <Indicator label="Readiness">
                            <span style={{ color: riskColor }}>{athlete.readinessScore}</span>
                        </Indicator>

                        <div style={{ width: "1px", backgroundColor: "#1e293b", alignSelf: "stretch" }} />

                        {/* Neural State */}
                        <Indicator label="Neural">
                            <span style={{
                                display: "inline-block",
                                padding: "0.125rem 0.5rem",
                                borderRadius: "999px",
                                fontSize: "0.6875rem",
                                fontWeight: 700,
                                color: neural.color,
                                border: `1px solid ${neural.color}40`,
                                backgroundColor: `${neural.color}10`,
                                whiteSpace: "nowrap",
                            }}>
                                {neural.label}
                            </span>
                        </Indicator>

                        <div style={{ width: "1px", backgroundColor: "#1e293b", alignSelf: "stretch" }} />

                        {/* Stability */}
                        <Indicator label="Stability">
                            <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                                <span style={{
                                    width: "7px", height: "7px", borderRadius: "50%",
                                    backgroundColor: STABILITY_COLOR[stabilityLevel],
                                    display: "inline-block", flexShrink: 0,
                                }} />
                                {stabilityLevel}
                            </span>
                        </Indicator>

                        <div style={{ width: "1px", backgroundColor: "#1e293b", alignSelf: "stretch" }} />

                        {/* Momentum */}
                        <Indicator label="Momentum">
                            <span style={{ color: momentum.color, fontSize: "1rem", fontWeight: 700 }}>
                                {momentum.symbol}
                            </span>
                        </Indicator>

                        <div style={{ width: "1px", backgroundColor: "#1e293b", alignSelf: "stretch" }} />

                        {/* Risk */}
                        <Indicator label="Risk">
                            <span style={{
                                display: "inline-block",
                                padding: "0.125rem 0.5rem",
                                borderRadius: "999px",
                                fontSize: "0.6875rem",
                                fontWeight: 700,
                                color: riskColor,
                                border: `1px solid ${riskColor}40`,
                                backgroundColor: `${riskColor}10`,
                                whiteSpace: "nowrap",
                            }}>
                                {riskLabel}
                            </span>
                        </Indicator>
                    </div>
                </Card>

                {/* Primary Action */}
                <div style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                    <div style={{ fontSize: "0.625rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, whiteSpace: "nowrap" }}>
                        Primary Action
                    </div>
                    <span style={{
                        display: "inline-block",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "999px",
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        color: SEVERITY_COLOR[primaryAction.severity],
                        border: `1px solid ${SEVERITY_COLOR[primaryAction.severity]}40`,
                        backgroundColor: `${SEVERITY_COLOR[primaryAction.severity]}10`,
                        whiteSpace: "nowrap",
                    }}>
                        {primaryAction.action}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", lineHeight: 1.5 }}>
                        {primaryAction.reasoning}
                    </span>
                </div>

                {/* Last Session Summary */}
                <Card style={{ marginBottom: "2rem" }}>
                    <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                        Last Session
                    </div>
                    {lastSession ? (
                        <div style={{ fontSize: "0.9375rem", lineHeight: "1.6" }}>
                            <div>Date: <span style={{ color: "#94a3b8" }}>{lastSession.date}</span></div>
                            <div>Readiness: <span style={{ color: "#94a3b8" }}>{lastSession.readiness}</span></div>
                            <div>Volume: <span style={{ color: "#94a3b8" }}>{lastSession.volume}</span></div>
                            {lastSession.injuryFlag && (
                                <div style={{ color: "#ef4444", marginTop: "0.5rem", fontWeight: 600 }}>
                                    ⚠ Injury flagged
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ color: "#64748b" }}>No previous sessions</div>
                    )}
                </Card>

                {/* Trend Snapshot */}
                {prevSession && lastSession && (
                    <Card style={{ marginBottom: "2.5rem" }}>
                        <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                            Trend
                        </div>
                        <div style={{ fontSize: "0.9375rem" }}>
                            Readiness: {prevSession.readiness} → {lastSession.readiness}
                            <span style={{ color: lastSession.readiness >= prevSession.readiness ? "#22c55e" : "#ef4444", marginLeft: "0.5rem" }}>
                                {lastSession.readiness >= prevSession.readiness ? "↑" : "↓"}
                            </span>
                        </div>
                    </Card>
                )}

                {/* CTA */}
                <Button
                    label="Start Today's Session →"
                    onClick={onStartSession}
                    style={{ width: "100%", padding: "1rem", fontSize: "1.125rem" }}
                />
            </div>
        </div>
    );
};
