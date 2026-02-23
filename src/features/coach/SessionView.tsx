import { FC, useState } from "react";
import { Session, EngineOutput, AthleteHistory, SportContext, ExperienceLevel, ProfileStatus, PhaseTransitionSuggestion, BlockPhase } from "../../types";
import { composePresentationEntry } from "../../core/presentationComposer";
import { applyACRatioModifier } from "../../core/acRatioRefinement";
import { Card, Button, Badge } from "../../shared/ui/Components";
import { calculateStability } from "../../core/stabilityModel";
import { calculateMomentum } from "../../core/momentumModel";
import { calculateConfidence } from "../../core/confidenceModel";

interface SessionViewProps {
    athleteName: string;
    readinessScore: number;
    engineOutput: EngineOutput;
    session: Session;
    athleteHistory: AthleteHistory[];
    sportContext?: SportContext;
    experienceLevel?: ExperienceLevel;
    profileStatus?: ProfileStatus;
    acRatio?: number;
    phaseTransition?: PhaseTransitionSuggestion;
    onAcceptPhase?: (phase: BlockPhase) => void;
    onStartLive: () => void;
    onBack: () => void;
}

const getRiskColor = (readiness: number): string => {
    if (readiness < 50) return "#ef4444";
    if (readiness < 70) return "#eab308";
    return "#22c55e";
};

const getRiskLabel = (readiness: number): string => {
    if (readiness < 50) return "HIGH RISK";
    if (readiness < 70) return "MODERATE";
    return "GREEN";
};

export const SessionView: FC<SessionViewProps> = ({
    athleteName,
    readinessScore,
    engineOutput,
    session,
    athleteHistory,
    sportContext = "GENERAL",
    experienceLevel,
    profileStatus,
    acRatio,
    phaseTransition,
    onAcceptPhase,
    onStartLive,
    onBack,
}) => {
    const riskColor = getRiskColor(readinessScore);
    const [showInsight, setShowInsight] = useState(false);

    const lastBalances = athleteHistory.slice(-5).map(h => h.balance ?? 0);
    const { stabilityLevel } = calculateStability(lastBalances);
    const { momentumDirection } = calculateMomentum(lastBalances);


    // Volatility-adjusted confidence
    const readinessHistory = athleteHistory.slice(-5).map(h => h.readiness);
    const balanceHistory = athleteHistory.slice(-5).map(h => h.balance ?? 0);
    const momentumHistory = lastBalances.length >= 2
        ? lastBalances.slice(1).map((b, i) =>
            b - lastBalances[i] > 5 ? "UP" : b - lastBalances[i] < -5 ? "DOWN" : "FLAT"
        )
        : [];
    const overrideRate = engineOutput.isOverridden ? 1 : 0;

    // Use weighted score proxy from balance spread for confidence base
    const balanceSpread = balanceHistory.length > 0
        ? balanceHistory[balanceHistory.length - 1]
        : engineOutput.balance;

    const confidenceResult = calculateConfidence({
        score: balanceSpread,
        readinessHistory,
        balanceHistory,
        momentumHistory,
        overrideRate,
    });


    const renderBlock = (title: string, blocks: { name: string; sets: number; reps: string; tempo?: string; rest: string }[]) => (
        <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem", fontWeight: 600 }}>
                {title}
            </div>
            {blocks.map((block, i) => (
                <div
                    key={i}
                    style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
                        gap: "0.5rem",
                        padding: "0.625rem 0",
                        borderBottom: "1px solid #1e293b",
                        fontSize: "0.875rem",
                        alignItems: "center",
                    }}
                >
                    <div style={{ fontWeight: 600 }}>{block.name}</div>
                    <div style={{ color: "#94a3b8" }}>{block.sets} sets</div>
                    <div style={{ color: "#94a3b8" }}>{block.reps}</div>
                    <div style={{ color: "#94a3b8" }}>{block.tempo || "—"}</div>
                    <div style={{ color: "#94a3b8" }}>{block.rest}</div>
                </div>
            ))}
        </div>
    );

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", color: "#e2e8f0" }}>
            <div style={{ maxWidth: "720px", margin: "0 auto", padding: "3rem 1.5rem" }}>
                <Button label="← Back" onClick={onBack} variant="secondary" style={{ marginBottom: "2rem" }} />

                <div style={{ marginBottom: "2rem" }}>
                    <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0 0 0.25rem 0" }}>
                        Generated Session
                    </h1>
                    <div style={{ color: "#64748b" }}>{athleteName}</div>
                </div>

                {/* Phase Transition Banner — only when block is complete */}
                {phaseTransition && onAcceptPhase && (
                    <div style={{
                        border: "1px solid #38bdf8",
                        borderRadius: "10px",
                        padding: "1.25rem 1.5rem",
                        marginBottom: "2rem",
                        backgroundColor: "#0c1929",
                    }}>
                        <div style={{ fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#38bdf8", marginBottom: "0.5rem" }}>
                            Block Complete
                        </div>
                        <div style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                            Suggested Next Phase: {phaseTransition.suggested}
                        </div>
                        <div style={{ fontSize: "0.8125rem", color: "#94a3b8", marginBottom: "1rem", lineHeight: 1.6 }}>
                            {phaseTransition.reason}
                        </div>
                        <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap" }}>
                            <button
                                onClick={() => onAcceptPhase(phaseTransition.suggested)}
                                style={{ padding: "0.4rem 1rem", backgroundColor: "#0ea5e9", color: "#fff", border: "none", borderRadius: "6px", fontSize: "0.8125rem", fontWeight: 700, cursor: "pointer" }}
                            >
                                Accept Phase {phaseTransition.suggested}
                            </button>
                            {([1, 2, 3] as BlockPhase[]).filter(p => p !== phaseTransition.suggested).map(p => (
                                <button
                                    key={p}
                                    onClick={() => onAcceptPhase(p)}
                                    style={{ padding: "0.4rem 1rem", backgroundColor: "transparent", color: "#94a3b8", border: "1px solid #334155", borderRadius: "6px", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer" }}
                                >
                                    Choose Phase {p}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Engine Header */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
                    <Card>
                        <div style={{ fontSize: "0.6875rem", color: "#64748b", textTransform: "uppercase", marginBottom: "0.25rem" }}>Readiness</div>
                        <div style={{ fontSize: "1.5rem", fontWeight: 800, color: riskColor }}>{readinessScore}</div>
                    </Card>
                    <Card>
                        <div style={{ fontSize: "0.6875rem", color: "#64748b", textTransform: "uppercase", marginBottom: "0.25rem" }}>Intensity</div>
                        <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>{(engineOutput.intensityModifier * 100).toFixed(0)}%</div>
                        <div style={{ fontSize: "0.625rem", color: "#475569", marginTop: "0.25rem", lineHeight: 1.4 }}>Adjusted from base program using readiness and sport profile.</div>
                    </Card>
                    <Card>
                        <div style={{ fontSize: "0.6875rem", color: "#64748b", textTransform: "uppercase", marginBottom: "0.25rem" }}>Volume</div>
                        <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>{(engineOutput.volumeModifier * 100).toFixed(0)}%</div>
                        <div style={{ fontSize: "0.625rem", color: "#475569", marginTop: "0.25rem", lineHeight: 1.4 }}>Adjusted from base program using readiness and sport profile.</div>
                    </Card>
                    <Card>
                        <div style={{ fontSize: "0.6875rem", color: "#64748b", textTransform: "uppercase", marginBottom: "0.25rem" }}>Risk</div>
                        <div><Badge label={getRiskLabel(readinessScore)} color={riskColor} /></div>
                        <div style={{ fontSize: "0.625rem", color: "#475569", marginTop: "0.25rem", lineHeight: 1.4 }}>
                            {readinessScore >= 70 ? "No injury flags." : readinessScore >= 50 ? "Some fatigue signals." : "Readiness is low."}
                        </div>
                    </Card>
                    <Card>
                        <div style={{ fontSize: "0.6875rem", color: "#64748b", textTransform: "uppercase", marginBottom: "0.25rem" }}>Stability</div>
                        <div style={{ fontSize: "1.5rem", fontWeight: 800, color: stabilityLevel === "HIGH" ? "#22c55e" : stabilityLevel === "MODERATE" ? "#eab308" : "#ef4444" }}>{stabilityLevel}</div>
                        <div style={{ fontSize: "0.625rem", color: "#475569", marginTop: "0.25rem", lineHeight: 1.4 }}>
                            {stabilityLevel === "HIGH" ? "Handles load consistently." : stabilityLevel === "MODERATE" ? "Some unevenness in recent sessions." : "Inconsistent recently."}
                        </div>
                    </Card>
                    <Card>
                        <div style={{ fontSize: "0.6875rem", color: "#64748b", textTransform: "uppercase", marginBottom: "0.25rem" }}>Momentum</div>
                        <div style={{ fontSize: "1.5rem", fontWeight: 800, color: momentumDirection === "UP" ? "#22c55e" : momentumDirection === "DOWN" ? "#ef4444" : "#94a3b8" }}>{momentumDirection}</div>
                        <div style={{ fontSize: "0.625rem", color: "#475569", marginTop: "0.25rem", lineHeight: 1.4 }}>
                            {momentumDirection === "UP" ? "Output is building." : momentumDirection === "DOWN" ? "Output has dropped recently." : "Holding steady."}
                        </div>
                    </Card>
                </div>

                {/* Focus & Neural State */}
                <Card style={{ marginBottom: "2rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div>
                            <div style={{ fontSize: "0.6875rem", color: "#64748b", textTransform: "uppercase" }}>Focus</div>
                            <div style={{ fontWeight: 700 }}>{engineOutput.focus}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: "0.6875rem", color: "#64748b", textTransform: "uppercase" }}>Neural State</div>
                            <div style={{ fontWeight: 700 }}>{engineOutput.neuralState}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: "0.6875rem", color: "#64748b", textTransform: "uppercase" }}>Est. Time</div>
                            <div style={{ fontWeight: 700 }}>{session.totalEstimatedTime} min</div>
                        </div>
                    </div>
                </Card>

                {/* Decision Card */}
                {(() => {
                    // ── Configurable thresholds ───────────────────────────
                    const PROGRESS_HIGH_THRESHOLD = 80; // fc >= this → "High"
                    const PROGRESS_MODERATE_THRESHOLD = 65; // fc >= this → "Moderate"
                    const PROGRESS_GUARDED_THRESHOLD = 50; // fc >= this → "Guarded"
                    const PROGRESS_DOWNGRADE_THRESHOLD = 50; // fc < this  → downgrade to CONTROLLED
                    // ─────────────────────────────────────────────────────

                    // Map finalMode → base decision type
                    const mode = engineOutput.finalMode;
                    const isProgressBase = mode === "PROVOKE" || mode === "ADAPT";
                    const isReduce = mode === "REGULATE";

                    const fc = confidenceResult.finalConfidence;

                    // PROGRESS–confidence alignment
                    const wasDowngraded =
                        isProgressBase && fc < PROGRESS_DOWNGRADE_THRESHOLD;
                    const decisionType =
                        wasDowngraded ? "CONTROLLED"
                            : isProgressBase ? "PROGRESS"
                                : isReduce ? "REDUCE"
                                    : "CONTROLLED";

                    const isProgress = decisionType === "PROGRESS";

                    const bandColor =
                        isProgress ? "#22c55e"
                            : decisionType === "REDUCE" ? "#ef4444"
                                : "#eab308";
                    // ── Decision Presentation Map ─────────────────────────────────
                    // Structure: SportContext → DecisionType → { headline, loadGuidance, bullets }
                    // Engine logic is never modified. Fallback to GENERAL if sportContext missing.
                    type SportToneEntry = { headline: string; loadGuidance: string; bullets: string[] };
                    const DECISION_PRESENTATION_MAP: Record<SportContext, Record<Tone, SportToneEntry>> = {
                        STRENGTH: {
                            PROGRESS: {
                                headline: "Push the bar further today.",
                                loadGuidance: "Add load to primary lifts. Maintain rep quality.",
                                bullets: [
                                    "Target a 2.5–5% load increase on main compound movements.",
                                    "Prioritise movement quality under the added load.",
                                    "Log the response — use it as the new baseline if successful.",
                                ],
                            },
                            CONTROLLED: {
                                headline: "Hold current load. Focus on execution.",
                                loadGuidance: "Same weights, tighter technique. No new maxes.",
                                bullets: [
                                    "Use this session to refine mechanics, not test limits.",
                                    "Focus on tempo, bracing, and range of motion.",
                                    "Avoid pushing to failure — stop one rep short.",
                                ],
                            },
                            REDUCE: {
                                headline: "Drop load. Move well, not heavy.",
                                loadGuidance: "Cut load to 60–70%. Focus on control and bar path.",
                                bullets: [
                                    "Reduce sets by one if fatigue signs appear.",
                                    "Prioritise movement patterns over loading targets.",
                                    "Do not test one-rep maxes or near-maxes today.",
                                ],
                            },
                        },
                        ENDURANCE: {
                            PROGRESS: {
                                headline: "Extend duration or pace today.",
                                loadGuidance: "Increase time-in-zone or target pace by one band.",
                                bullets: [
                                    "Add 5–10% to total duration or shift into the next intensity band.",
                                    "Monitor breathing rate and HR — stay within the planned zone.",
                                    "Log distance or time at the new output for future reference.",
                                ],
                            },
                            CONTROLLED: {
                                headline: "Maintain planned volume and pace.",
                                loadGuidance: "Stay in target zone. No threshold efforts today.",
                                bullets: [
                                    "Keep effort firmly in aerobic base zone.",
                                    "Avoid surges or tempo work outside the plan.",
                                    "Focus on consistency across the full session duration.",
                                ],
                            },
                            REDUCE: {
                                headline: "Pull back duration and intensity.",
                                loadGuidance: "Easy aerobic work only. Keep heart rate low.",
                                bullets: [
                                    "Cut session duration by 20–30%.",
                                    "Remove high-intensity intervals entirely.",
                                    "Focus on maintaining movement rhythm — no hard efforts.",
                                ],
                            },
                        },
                        REHAB: {
                            PROGRESS: {
                                headline: "Progress to the next movement tier.",
                                loadGuidance: "Advance to loaded or bilateral variation if tolerated.",
                                bullets: [
                                    "Introduce the next-tier exercise only if previous tier showed no pain or compensation.",
                                    "Keep sets conservative — 2–3 sets maximum on the new movement.",
                                    "Monitor for delayed symptom response post-session.",
                                ],
                            },
                            CONTROLLED: {
                                headline: "Repeat this tier. Consolidate the movement.",
                                loadGuidance: "Same exercises, same load. Watch for compensation.",
                                bullets: [
                                    "Repeat the current exercise tier with no changes.",
                                    "Watch for compensatory movement patterns — stop if observed.",
                                    "Consistency here builds the foundation for safe progression.",
                                ],
                            },
                            REDUCE: {
                                headline: "Return to the previous tier.",
                                loadGuidance: "Step back one level. Prioritise quality over progress.",
                                bullets: [
                                    "Drop back to the previous exercise tier immediately.",
                                    "Reduce sets and reps if pain or fatigue is present.",
                                    "Do not push through discomfort — protect long-term recovery.",
                                ],
                            },
                        },
                        TEAM: {
                            PROGRESS: {
                                headline: "Athlete is ready for full training load.",
                                loadGuidance: "Include contact, game-speed, and decision drills.",
                                bullets: [
                                    "Clear for full squad participation including contact.",
                                    "Game-specific drills at high intensity are appropriate.",
                                    "Monitor closely for fatigue as the session progresses.",
                                ],
                            },
                            CONTROLLED: {
                                headline: "Structured session. Manage intensity.",
                                loadGuidance: "Skill and structure work. Reduce contact exposure.",
                                bullets: [
                                    "Participate in technical and skill-based components.",
                                    "Limit contact and reactive high-intensity work.",
                                    "Check in with athlete at halftime or equivalent rest point.",
                                ],
                            },
                            REDUCE: {
                                headline: "Limit train. Modified participation only.",
                                loadGuidance: "No contact. Technical work and movement only.",
                                bullets: [
                                    "Modified session — technical work and light movement only.",
                                    "No contact drills or high-speed running.",
                                    "Consider individual activation work away from the main group.",
                                ],
                            },
                        },
                        GENERAL: {
                            PROGRESS: {
                                headline: "You can increase intensity slightly today.",
                                loadGuidance: "Apply a structured overload across the session.",
                                bullets: [
                                    "Increase session demand by one level across planned blocks.",
                                    "Monitor athlete response after the first main block.",
                                    "Confirm next session target based on today's output.",
                                ],
                            },
                            CONTROLLED: {
                                headline: "Maintain structure and monitor response.",
                                loadGuidance: "No changes to load today. Observe how athlete responds.",
                                bullets: [
                                    "Deliver the session as planned with no load modifications.",
                                    "Note any signs of fatigue or distress during the session.",
                                    "Use this session as a baseline data point.",
                                ],
                            },
                            REDUCE: {
                                headline: "Reduce load to support recovery.",
                                loadGuidance: "Cut volume and intensity. Keep the session short.",
                                bullets: [
                                    "Reduce total session volume by 20–30%.",
                                    "Lower intensity targets across all blocks.",
                                    "Prioritise active recovery over performance output.",
                                ],
                            },
                        },
                    };
                    // ─────────────────────────────────────────────────────



                    // ── Centralized Coach Interpretation Map (tone-keyed) ──
                    type Tone = "PROGRESS" | "CONTROLLED" | "REDUCE";
                    type InterpEntry = { meaningText: string; trainingImplication: string };
                    const INTERPRETATION_MAP: Record<string, Record<string, Record<Tone, InterpEntry>>> = {
                        neural: {
                            PRIMED: {
                                PROGRESS: { meaningText: "Ready to push. Drive capacity is high.", trainingImplication: "Set targets above baseline today." },
                                CONTROLLED: { meaningText: "Drive is available. Work within the structure.", trainingImplication: "Use capacity within the planned session." },
                                REDUCE: { meaningText: "High drive present. Recovery still needed.", trainingImplication: "Let the athlete rest. Don't act on the drive." },
                            },
                            ADAPTIVE: {
                                PROGRESS: { meaningText: "Responding well. Building as expected.", trainingImplication: "Increase load. Body is absorbing it." },
                                CONTROLLED: { meaningText: "Adapting to the current workload.", trainingImplication: "Hold structure while adaptation continues." },
                                REDUCE: { meaningText: "Adapting, but recovery is behind schedule.", trainingImplication: "Ease off to let the adaptation complete." },
                            },
                            STABLE: {
                                PROGRESS: { meaningText: "Settled and ready to work.", trainingImplication: "Progress within structure." },
                                CONTROLLED: { meaningText: "Balanced and manageable.", trainingImplication: "Maintain the current approach." },
                                REDUCE: { meaningText: "Stable, but load is too high right now.", trainingImplication: "Cut volume. Protect the baseline." },
                            },
                            PROTECTIVE: {
                                PROGRESS: { meaningText: "Output is limited today.", trainingImplication: "Scale back targets. Don't force output." },
                                CONTROLLED: { meaningText: "Body is managing load carefully.", trainingImplication: "Stay conservative. Watch response closely." },
                                REDUCE: { meaningText: "Body is signalling it needs rest.", trainingImplication: "Remove intensity. Focus on recovery." },
                            },
                        },
                        stability: {
                            HIGH: {
                                PROGRESS: { meaningText: "Athlete handles load consistently.", trainingImplication: "Safe to push forward." },
                                CONTROLLED: { meaningText: "Athlete is holding up well.", trainingImplication: "Maintain current load pattern." },
                                REDUCE: { meaningText: "Structurally sound, but load is too high now.", trainingImplication: "Reduce volume even if movement quality is good." },
                            },
                            MODERATE: {
                                PROGRESS: { meaningText: "Some unevenness in recent sessions.", trainingImplication: "Progress carefully. Watch for fatigue signs." },
                                CONTROLLED: { meaningText: "Response has been up and down.", trainingImplication: "Don't add load. Let consistency return." },
                                REDUCE: { meaningText: "Inconsistent response to recent load.", trainingImplication: "Strip it back. Keep it simple." },
                            },
                            LOW: {
                                PROGRESS: { meaningText: "Recent sessions have been inconsistent.", trainingImplication: "Hold load. Stability must come first." },
                                CONTROLLED: { meaningText: "Athlete is struggling to stay consistent.", trainingImplication: "Simplify and repeat. Do not increase load." },
                                REDUCE: { meaningText: "Athlete is breaking down under the demand.", trainingImplication: "Drop load significantly. Focus on control." },
                            },
                        },
                        momentum: {
                            UP: {
                                PROGRESS: { meaningText: "Athlete is building well.", trainingImplication: "Keep the pressure on. Trend supports it." },
                                CONTROLLED: { meaningText: "Trend has been positive.", trainingImplication: "Build on this within the current structure." },
                                REDUCE: { meaningText: "Trend was up, but the body needs rest now.", trainingImplication: "Don't chase the trend. Let the athlete recover." },
                            },
                            FLAT: {
                                PROGRESS: { meaningText: "Output is holding steady.", trainingImplication: "A small push may break the plateau." },
                                CONTROLLED: { meaningText: "Load is steady.", trainingImplication: "Maintain structured load." },
                                REDUCE: { meaningText: "Output has plateaued. Fatigue is likely the cause.", trainingImplication: "Step back. Recovery will restore momentum." },
                            },
                            DOWN: {
                                PROGRESS: { meaningText: "Recent output has dipped.", trainingImplication: "Do not increase load. Find the cause first." },
                                CONTROLLED: { meaningText: "Performance has dropped recently.", trainingImplication: "Watch closely. No load increases this session." },
                                REDUCE: { meaningText: "Output has been falling over recent sessions.", trainingImplication: "Pull back now before this gets worse." },
                            },
                        },
                        risk: {
                            GREEN: {
                                PROGRESS: { meaningText: "Good to go. No flags.", trainingImplication: "Full session is appropriate." },
                                CONTROLLED: { meaningText: "No injury flags present.", trainingImplication: "Proceed with the planned session." },
                                REDUCE: { meaningText: "No injury risk, but recovery is the priority.", trainingImplication: "Reduce load. Rest is the concern, not injury." },
                            },
                            MODERATE: {
                                PROGRESS: { meaningText: "Watch for tightness or fatigue during the session.", trainingImplication: "Progress, but check in with the athlete." },
                                CONTROLLED: { meaningText: "Some fatigue signals are present.", trainingImplication: "Check in with the athlete mid-session." },
                                REDUCE: { meaningText: "Fatigue flags are elevated.", trainingImplication: "Cut the session short if needed." },
                            },
                            HIGH_RISK: {
                                PROGRESS: { meaningText: "Readiness is low today. Override with care.", trainingImplication: "If progressing, reduce sets and watch closely." },
                                CONTROLLED: { meaningText: "Readiness is low.", trainingImplication: "Keep load well within current limits." },
                                REDUCE: { meaningText: "Readiness too low for full training.", trainingImplication: "Active recovery only. Protect the athlete." },
                            },
                        },
                    };
                    // ─────────────────────────────────────────────────────

                    const tone = decisionType as Tone;

                    // \u2500\u2500 Conflict Rule \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
                    // If Risk = HIGH_RISK and engine says PROGRESS:
                    // Force presentation tone to CONTROLLED (label only).
                    // Engine score is never modified.
                    const riskKey = readinessScore >= 70 ? "GREEN" : readinessScore >= 50 ? "MODERATE" : "HIGH_RISK";
                    const presentationConflict = riskKey === "HIGH_RISK" && decisionType === "PROGRESS";
                    const presentationTone: Tone = presentationConflict ? "CONTROLLED" : tone;
                    // ─────────────────────────────────────────────────────────

                    // ── AC Ratio modifier layer ───────────────────────────────
                    // Runs AFTER conflict rule. Cannot upgrade a tone — only
                    // constrains further. Active only for STRENGTH block athletes.
                    const finalPresentationTone = applyACRatioModifier(
                        presentationTone,
                        acRatio,
                        readinessScore,
                        sportContext,
                    );
                    // ─────────────────────────────────────────────────────────

                    const baseEntry =
                        (DECISION_PRESENTATION_MAP[sportContext] ?? DECISION_PRESENTATION_MAP["GENERAL"])[finalPresentationTone];
                    const sportEntry = composePresentationEntry(baseEntry, experienceLevel, profileStatus);
                    const riskLabel = getRiskLabel(readinessScore);
                    const momentumLabel = momentumDirection === "UP" ? "Up" : momentumDirection === "DOWN" ? "Down" : "Flat";
                    const stabilityLabel = stabilityLevel.charAt(0) + stabilityLevel.slice(1).toLowerCase();

                    const neuralEntry = (INTERPRETATION_MAP.neural[engineOutput.neuralState] ?? INTERPRETATION_MAP.neural["STABLE"])[finalPresentationTone];
                    const stabilityEntry = (INTERPRETATION_MAP.stability[stabilityLevel] ?? INTERPRETATION_MAP.stability["MODERATE"])[finalPresentationTone];
                    const momentumEntry = (INTERPRETATION_MAP.momentum[momentumDirection] ?? INTERPRETATION_MAP.momentum["FLAT"])[presentationTone];
                    const riskEntry = (INTERPRETATION_MAP.risk[riskKey] ?? INTERPRETATION_MAP.risk["MODERATE"])[presentationTone];
                    const displayConfidenceLabel =
                        isProgress
                            ? fc >= PROGRESS_HIGH_THRESHOLD ? "High"
                                : fc >= PROGRESS_MODERATE_THRESHOLD ? "Moderate"
                                    : fc >= PROGRESS_GUARDED_THRESHOLD ? "Guarded"
                                        : "Guarded" // floor for PROGRESS (downgrade already prevents < 50)
                            : fc >= 75 ? "High"
                                : "Moderate"; // CONTROLLED/REDUCE never show "Low"
                    const displayConfidenceColor =
                        displayConfidenceLabel === "High" ? "#22c55e"
                            : displayConfidenceLabel === "Guarded" ? "#f97316"
                                : "#eab308";
                    const confidenceNote: string | null =
                        wasDowngraded
                            ? "Decision adjusted — confidence too low to progress."
                            : confidenceResult.volatilityLevel >= 2 && momentumDirection === "DOWN"
                                ? "Output has been falling. Assessment may shift."
                                : confidenceResult.volatilityLevel >= 1
                                    ? "Some inconsistency in recent sessions."
                                    : null;


                    return (
                        <Card style={{ marginBottom: "2rem", padding: 0, overflow: "hidden" }}>
                            {/* Color band */}
                            <div style={{ height: "4px", backgroundColor: bandColor }} />

                            <div style={{ padding: "1.25rem 1.5rem" }}>
                                {/* Decision type + headline */}
                                <div style={{ display: "flex", alignItems: "baseline", gap: "0.875rem", marginBottom: "0.375rem" }}>
                                    <span style={{
                                        fontSize: "1rem",
                                        fontWeight: 800,
                                        color: bandColor,
                                        letterSpacing: "0.04em",
                                    }}>
                                        {presentationConflict ? "CONTROLLED" : decisionType}
                                    </span>
                                    <span style={{ fontSize: "0.875rem", color: "#94a3b8", fontWeight: 400 }}>
                                        {sportEntry.headline}
                                    </span>
                                </div>

                                {/* Conflict notice */}
                                {presentationConflict && (
                                    <div style={{
                                        fontSize: "0.6875rem",
                                        color: "#eab308",
                                        backgroundColor: "#eab30810",
                                        border: "1px solid #eab30830",
                                        borderRadius: "4px",
                                        padding: "0.25rem 0.5rem",
                                        marginBottom: "0.625rem",
                                        display: "inline-block",
                                    }}>
                                        ⚠ Presentation adjusted — high risk overrides PROGRESS label.
                                    </div>
                                )}

                                {/* Load Guidance */}
                                <div style={{
                                    fontSize: "0.8125rem",
                                    color: "#475569",
                                    borderLeft: `3px solid ${bandColor}`,
                                    paddingLeft: "0.625rem",
                                    marginBottom: "0.875rem",
                                    fontStyle: "italic",
                                }}>
                                    {sportEntry.loadGuidance}
                                </div>

                                {/* Confidence */}
                                <div style={{ fontSize: "0.8125rem", color: "#64748b", marginBottom: "1rem" }}>
                                    Confidence:{" "}
                                    <span style={{ fontWeight: 700, color: displayConfidenceColor }}>
                                        {displayConfidenceLabel}
                                    </span>
                                    {confidenceNote && (
                                        <span style={{ color: "#475569", fontStyle: "italic", marginLeft: "0.5rem" }}>
                                            {confidenceNote}
                                        </span>
                                    )}
                                </div>

                                {/* Collapsible: Why this decision? */}
                                <button
                                    onClick={() => setShowInsight(!showInsight)}
                                    style={{
                                        background: "none", border: "none",
                                        color: "#38bdf8", fontSize: "0.8125rem",
                                        cursor: "pointer", padding: "0",
                                        fontWeight: 600, marginBottom: showInsight ? "0.875rem" : "0",
                                    }}
                                >
                                    {showInsight ? "Hide decision reasoning ▲" : "Why this decision? ▼"}
                                </button>

                                {showInsight && (
                                    <div style={{ marginTop: "0.875rem" }}>

                                        {/* Sport Bullets */}
                                        <div style={{
                                            fontSize: "0.6875rem", fontWeight: 600,
                                            textTransform: "uppercase", letterSpacing: "0.05em",
                                            color: "#64748b", marginBottom: "0.5rem",
                                        }}>
                                            Session Guidance
                                        </div>
                                        {sportEntry.bullets.map((bullet: string, i: number) => (
                                            <div key={i} style={{
                                                display: "flex", gap: "0.5rem",
                                                fontSize: "0.8125rem", color: "#cbd5e1",
                                                lineHeight: 1.65, marginBottom: "0.3rem",
                                            }}>
                                                <span style={{ color: bandColor, flexShrink: 0, fontWeight: 700 }}>→</span>
                                                <span>{bullet}</span>
                                            </div>
                                        ))}

                                        {/* Section 1 — Summary Interpretation */}
                                        <div style={{
                                            fontSize: "0.6875rem", fontWeight: 600,
                                            textTransform: "uppercase", letterSpacing: "0.05em",
                                            color: "#64748b", marginBottom: "0.5rem",
                                        }}>
                                            Summary Interpretation
                                        </div>
                                        {[
                                            { label: "Neural", text: neuralEntry.meaningText },
                                            { label: "Stability", text: stabilityEntry.meaningText },
                                            { label: "Momentum", text: momentumEntry.meaningText },
                                            { label: "Risk", text: riskEntry.meaningText },
                                        ].map(row => (
                                            <div key={row.label} style={{
                                                display: "flex", gap: "0.625rem",
                                                fontSize: "0.8125rem", lineHeight: 1.6,
                                                marginBottom: "0.375rem",
                                            }}>
                                                <span style={{ color: "#475569", minWidth: "5rem", fontWeight: 600 }}>{row.label}</span>
                                                <span style={{ color: "#94a3b8" }}>{row.text}</span>
                                            </div>
                                        ))}

                                        {/* Section 2 — Training Implication */}
                                        <div style={{
                                            borderTop: "1px solid #1e293b",
                                            marginTop: "0.75rem", paddingTop: "0.75rem",
                                        }}>
                                            <div style={{
                                                fontSize: "0.6875rem", fontWeight: 600,
                                                textTransform: "uppercase", letterSpacing: "0.05em",
                                                color: "#64748b", marginBottom: "0.5rem",
                                            }}>
                                                Training Implication
                                            </div>
                                            {[
                                                neuralEntry.trainingImplication,
                                                stabilityEntry.trainingImplication,
                                                momentumEntry.trainingImplication,
                                                riskEntry.trainingImplication,
                                            ].filter((v, i, arr) => arr.indexOf(v) === i).map((line, i) => (
                                                <div key={i} style={{
                                                    display: "flex", gap: "0.5rem",
                                                    fontSize: "0.8125rem", color: "#94a3b8",
                                                    lineHeight: 1.6, marginBottom: "0.3rem",
                                                }}>
                                                    <span style={{ color: "#334155", flexShrink: 0 }}>•</span>
                                                    <span>{line}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Data Snapshot */}
                                        <div style={{
                                            borderTop: "1px solid #1e293b",
                                            marginTop: "0.75rem", paddingTop: "0.75rem",
                                            fontSize: "0.75rem", color: "#64748b",
                                        }}>
                                            <div style={{
                                                fontWeight: 600, textTransform: "uppercase",
                                                letterSpacing: "0.05em", marginBottom: "0.625rem",
                                            }}>
                                                Data Snapshot
                                            </div>
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem 1.5rem" }}>
                                                <div>
                                                    <span style={{ color: "#e2e8f0", fontWeight: 600 }}>Readiness {readinessScore}</span>
                                                    <div style={{ color: "#475569", marginTop: "0.125rem" }}>{riskEntry.meaningText}</div>
                                                </div>
                                                <div>
                                                    <span style={{ color: "#e2e8f0", fontWeight: 600 }}>Stability {stabilityLabel}</span>
                                                    <div style={{ color: "#475569", marginTop: "0.125rem" }}>{stabilityEntry.meaningText}</div>
                                                </div>
                                                <div>
                                                    <span style={{ color: "#e2e8f0", fontWeight: 600 }}>Momentum {momentumLabel}</span>
                                                    <div style={{ color: "#475569", marginTop: "0.125rem" }}>{momentumEntry.meaningText}</div>
                                                </div>
                                                <div>
                                                    <span style={{ color: "#e2e8f0", fontWeight: 600 }}>Risk {riskLabel}</span>
                                                    <div style={{ color: "#475569", marginTop: "0.125rem" }}>{riskEntry.trainingImplication}</div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                )}
                            </div>
                        </Card>
                    );
                })()}

                {/* Exercise Table Header */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
                    gap: "0.5rem",
                    padding: "0.5rem 0",
                    fontSize: "0.6875rem",
                    color: "#64748b",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    borderBottom: "1px solid #334155",
                    marginBottom: "0.5rem",
                }}>
                    <div>Exercise</div>
                    <div>Sets</div>
                    <div>Reps</div>
                    <div>Tempo</div>
                    <div>Rest</div>
                </div>

                {/* Session Blocks */}
                {renderBlock("Warm-up", session.warmup)}
                {renderBlock("Main", session.main)}
                {renderBlock("Accessory", session.accessory)}
                {renderBlock("Recovery", session.breathing)}

                {/* CTA */}
                <Button
                    label="Start Live Session →"
                    onClick={onStartLive}
                    style={{ width: "100%", padding: "1rem", fontSize: "1.125rem", marginTop: "1rem" }}
                />
            </div>
        </div>
    );
};
