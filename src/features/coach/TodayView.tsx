import { FC, useState, useEffect } from "react";
import { Athlete } from "../../types";
import { dataService } from "../../services/dataService";
import { Card, Badge, Button, Modal } from "../../shared/ui/Components";

interface TodayViewProps {
    onSelectAthlete: (id: string) => void;
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

export const TodayView: FC<TodayViewProps> = ({ onSelectAthlete }) => {
    const [athletes, setAthletes] = useState<Athlete[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newName, setNewName] = useState("");

    const loadAthletes = async () => {
        const data = await dataService.getAthletes();
        setAthletes(data);
    };

    useEffect(() => {
        loadAthletes();
    }, []);

    const handleAddAthlete = async () => {
        const trimmed = newName.trim();
        if (!trimmed) return;
        await dataService.addAthlete(trimmed);
        setNewName("");
        setShowAddModal(false);
        await loadAthletes();
    };

    const today = new Date();
    const dateStr = today.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", color: "#e2e8f0" }}>
            <div style={{ maxWidth: "640px", margin: "0 auto", padding: "3rem 1.5rem" }}>
                {/* Header */}
                <div style={{ marginBottom: "3rem" }}>
                    <div style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {dateStr}
                    </div>
                    <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
                        Today's Athletes
                    </h1>
                </div>

                {/* Athlete List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {athletes.map((athlete) => {
                        const riskColor = getRiskColor(athlete.readinessScore, athlete.injuryStatus);
                        const riskLabel = getRiskLabel(athlete.readinessScore, athlete.injuryStatus);
                        const lastSession = athlete.history[athlete.history.length - 1];

                        return (
                            <Card
                                key={athlete.id}
                                onClick={() => onSelectAthlete(athlete.id)}
                                style={{ cursor: "pointer" }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div>
                                        <div style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                                            {athlete.name}
                                        </div>
                                        <div style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>
                                            {athlete.phase.replace(/_/g, " ")} · Last readiness: {lastSession?.readiness ?? "—"}
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                        <Badge label={riskLabel} color={riskColor} />
                                        <div style={{
                                            width: "12px",
                                            height: "12px",
                                            borderRadius: "50%",
                                            backgroundColor: riskColor,
                                        }} />
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>

                {athletes.length === 0 && (
                    <div style={{ textAlign: "center", color: "#64748b", padding: "3rem" }}>
                        No athletes yet. Add one below.
                    </div>
                )}

                {/* Add Athlete Button */}
                <Button
                    label="+ Add Athlete"
                    onClick={() => setShowAddModal(true)}
                    variant="secondary"
                    style={{ width: "100%", padding: "1rem", fontSize: "1rem", marginTop: "1.5rem" }}
                />
            </div>

            {/* Add Athlete Modal */}
            <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Athlete">
                <input
                    autoFocus
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddAthlete()}
                    placeholder="Athlete name"
                    style={{
                        width: "100%",
                        padding: "0.75rem",
                        backgroundColor: "#0f172a",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                        color: "#e2e8f0",
                        fontSize: "1rem",
                        outline: "none",
                        marginBottom: "1rem",
                        boxSizing: "border-box",
                    }}
                />
                <Button
                    label="Add"
                    onClick={handleAddAthlete}
                    disabled={!newName.trim()}
                    style={{ width: "100%", padding: "0.75rem" }}
                />
            </Modal>
        </div>
    );
};
