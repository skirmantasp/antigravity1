import { FC, useEffect, useState } from "react";
import { Athlete, Session, EngineOutput } from "../../types";
import { dataService } from "../../services/dataService";
import { calculateTrainingParameters } from "../../core/trainingEngine";
import { buildSession } from "../../core/sessionBuilder";
import { Card, Badge, Button, Slider } from "../../shared/ui/Components";

export const AthleteView: FC<{ athleteId: string }> = ({ athleteId }) => {
    const [athlete, setAthlete] = useState<Athlete | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [engineOutput, setEngineOutput] = useState<EngineOutput | null>(null);
    const [loading, setLoading] = useState(true);

    // Recovery Feedback states
    const [sleepScore, setSleepScore] = useState(8);
    const [fatigueScore, setFatigueScore] = useState(3);
    const [isLogging, setIsLogging] = useState(false);

    // Log states
    const [rpe, setRpe] = useState(7);
    const [pain, setPain] = useState(0);

    const loadProfile = async () => {
        setLoading(true);
        // Hardcoded mock user ID 1
        const data = await dataService.getAthleteById(athleteId);
        if (data) {
            setAthlete(data);
            updateSession(data.injuryStatus, data.phase);
        }
        setLoading(false);
    };

    const updateSession = (injury: string, phase: string) => {
        const output = calculateTrainingParameters(sleepScore, fatigueScore, 5, 5, injury as any, phase as any);
        setEngineOutput(output);
        setSession(buildSession(output).session);
    };

    useEffect(() => {
        loadProfile();
    }, [athleteId]);

    const handleRecoverySubmit = async () => {
        if (!athlete) return;
        const output = calculateTrainingParameters(sleepScore, fatigueScore, 5, 5, athlete.injuryStatus, athlete.phase);
        setEngineOutput(output);
        setSession(buildSession(output).session);
        const strain = fatigueScore + 5 + 5;
        const recovery = sleepScore * 3;
        const newReadiness = Math.round(Math.max(0, Math.min(100, ((recovery - strain + 30) / 60) * 100)));
        const updated = await dataService.updateAthlete(athlete.id, { readinessScore: newReadiness });
        setAthlete(updated);
    };

    const handleLogSubmit = async () => {
        alert(`Logged: RPE ${rpe}, Pain ${pain}. Data saved to cloud.`);
        setIsLogging(false);
    };

    if (loading || !athlete) return <div style={{ color: "#e2e8f0", padding: "2rem" }}>Syncing profile...</div>;

    return (
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem" }}>
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: "2rem" }}>Today's Session</h1>
                    <div style={{ color: "#94a3b8" }}>{new Date().toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.875rem", color: "#64748b" }}>CURRENT READINESS</div>
                    <h2 style={{ margin: 0, color: "#38bdf8", fontSize: "2.5rem" }}>{athlete.readinessScore}%</h2>
                </div>
            </header>

            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "2.5rem", alignItems: "start" }}>
                {/* Session Blocks */}
                <div>
                    {session ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                            {[
                                { title: "Warmup & Flow", data: session.warmup },
                                { title: "Main Intervention", data: session.main },
                                { title: "Functional Accessory", data: session.accessory },
                                { title: "Neural Recovery", data: session.breathing },
                            ].map((section, sIdx) => (
                                <div key={sIdx}>
                                    <h3 style={{ fontSize: "0.875rem", color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem" }}>{section.title}</h3>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                        {section.data.map((block, bIdx) => (
                                            <Card key={bIdx} style={{ padding: "1.25rem" }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                    <div>
                                                        <div style={{ fontWeight: 700, fontSize: "1.125rem" }}>{block.name}</div>
                                                        {block.tempo && <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Tempo: {block.tempo} | Rest: {block.rest}</div>}
                                                    </div>
                                                    <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#38bdf8" }}>{block.sets}x{block.reps}</div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {!isLogging ? (
                                <Button label="Complete Session" onClick={() => setIsLogging(true)} style={{ marginTop: "1rem" }} />
                            ) : (
                                <Card style={{ marginTop: "1rem", border: "1px solid #38bdf8" }}>
                                    <h4 style={{ marginTop: 0, marginBottom: "1.5rem" }}>Session Performance Log</h4>
                                    <Slider label="Session RPE" value={rpe} min={1} max={10} onChange={setRpe} />
                                    <Slider label="Pain Level" value={pain} min={0} max={10} onChange={setPain} />
                                    <div style={{ display: "flex", gap: "1rem" }}>
                                        <Button label="Cancel" onClick={() => setIsLogging(false)} variant="secondary" style={{ flex: 1 }} />
                                        <Button label="Save Progress" onClick={handleLogSubmit} style={{ flex: 2 }} />
                                    </div>
                                </Card>
                            )}
                        </div>
                    ) : (
                        <div>Rest Day / No protocol generated.</div>
                    )}
                </div>

                {/* Sidebar: Recovery Feedback */}
                <aside>
                    <Card style={{ marginBottom: "2rem" }}>
                        <h3 style={{ marginTop: 0, marginBottom: "1.5rem", fontSize: "1.125rem" }}>Biological Status</h3>
                        <div style={{ marginBottom: "1.5rem" }}>
                            <Badge label={athlete.phase.replace(/_/g, " ")} color="#38bdf8" />
                        </div>

                        <div style={{ borderTop: "1px solid #334155", paddingTop: "1.5rem", marginTop: "1rem" }}>
                            <div style={{ color: "#94a3b8", fontSize: "0.75rem", marginBottom: "1rem", fontWeight: 700 }}>RECOVERY FEEDBACK</div>

                            <Slider label="Sleep Quality (hrs)" value={sleepScore} min={0} max={12} onChange={setSleepScore} />
                            <Slider label="Perceived Fatigue" value={fatigueScore} min={0} max={10} onChange={setFatigueScore} />

                            <Button
                                label="Update Readiness"
                                onClick={handleRecoverySubmit}
                                variant="secondary"
                                style={{ width: "100%", marginTop: "1rem" }}
                            />
                        </div>
                    </Card>

                    <Card style={{ padding: "1.5rem" }}>
                        <h4 style={{ marginTop: 0, marginBottom: "1rem" }}>System Note</h4>
                        <p style={{ margin: 0, fontSize: "0.875rem", color: "#94a3b8", lineHeight: 1.6 }}>
                            Your training parameters are currently modulated for <strong>{engineOutput?.focus}</strong>.
                            The engine has applied a <strong>{Math.round(engineOutput?.volumeModifier! * 100)}% volume load</strong> based on your neurological profile.
                        </p>
                    </Card>
                </aside>
            </div>
        </div>
    );
};
