import { FC, useState } from "react";
import { Session, Block } from "../../types";
import { Card, Button } from "../../shared/ui/Components";

interface ExerciseLog {
    name: string;
    weight: string;
    repsDone: string;
    rpe: string;
    notes: string;
}

interface LiveSessionProps {
    athleteName: string;
    session: Session;
    onFinish: (logs: ExerciseLog[]) => void;
}

const allBlocks = (session: Session): Block[] => [
    ...session.warmup,
    ...session.main,
    ...session.accessory,
    ...session.breathing,
];

export const LiveSession: FC<LiveSessionProps> = ({ athleteName, session, onFinish }) => {
    const blocks = allBlocks(session);
    const [logs, setLogs] = useState<ExerciseLog[]>(
        blocks.map((b) => ({
            name: b.name,
            weight: "",
            repsDone: "",
            rpe: "",
            notes: "",
        }))
    );

    const updateLog = (index: number, field: keyof ExerciseLog, value: string) => {
        setLogs((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    const handleFinish = () => {
        onFinish(logs);
    };

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", color: "#e2e8f0" }}>
            <div style={{ maxWidth: "720px", margin: "0 auto", padding: "3rem 1.5rem" }}>
                {/* Header */}
                <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0 0 0.25rem 0" }}>
                            Live Session
                        </h1>
                        <div style={{ color: "#64748b" }}>{athleteName}</div>
                    </div>
                    <div style={{
                        backgroundColor: "#22c55e20",
                        color: "#22c55e",
                        padding: "0.375rem 0.75rem",
                        borderRadius: "999px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        border: "1px solid #22c55e40",
                    }}>
                        ● LIVE
                    </div>
                </div>

                {/* Exercise Logging */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {logs.map((log, i) => (
                        <Card key={i}>
                            <div style={{ fontWeight: 700, marginBottom: "0.75rem", fontSize: "1rem" }}>
                                {log.name}
                                <span style={{ color: "#64748b", fontWeight: 400, fontSize: "0.8125rem", marginLeft: "0.5rem" }}>
                                    {blocks[i].sets}×{blocks[i].reps}
                                    {blocks[i].tempo ? ` @ ${blocks[i].tempo}` : ""}
                                </span>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
                                <input
                                    placeholder="Weight (kg)"
                                    value={log.weight}
                                    onChange={(e) => updateLog(i, "weight", e.target.value)}
                                    style={inputStyle}
                                />
                                <input
                                    placeholder="Reps done"
                                    value={log.repsDone}
                                    onChange={(e) => updateLog(i, "repsDone", e.target.value)}
                                    style={inputStyle}
                                />
                                <input
                                    placeholder="RPE (1–10)"
                                    value={log.rpe}
                                    onChange={(e) => updateLog(i, "rpe", e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                            <input
                                placeholder="Notes"
                                value={log.notes}
                                onChange={(e) => updateLog(i, "notes", e.target.value)}
                                style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
                            />
                        </Card>
                    ))}
                </div>

                {/* Finish */}
                <Button
                    label="Finish Session ✓"
                    onClick={handleFinish}
                    style={{ width: "100%", padding: "1rem", fontSize: "1.125rem", marginTop: "2rem" }}
                />
            </div>
        </div>
    );
};

const inputStyle: React.CSSProperties = {
    padding: "0.625rem",
    backgroundColor: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "6px",
    color: "#e2e8f0",
    fontSize: "0.875rem",
    outline: "none",
};
