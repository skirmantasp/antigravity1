import { FC } from "react";
import { Card, Button } from "../../shared/ui/Components";

interface SessionSummaryProps {
    athleteName: string;
    readinessScore: number;
    totalVolume: number;
    onViewTrends: () => void;
    onBackToRoster: () => void;
}

export const SessionSummary: FC<SessionSummaryProps> = ({
    athleteName,
    readinessScore,
    totalVolume,
    onViewTrends,
    onBackToRoster,
}) => {
    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", color: "#e2e8f0" }}>
            <div style={{ maxWidth: "640px", margin: "0 auto", padding: "3rem 1.5rem" }}>
                {/* Success Icon */}
                <div style={{ textAlign: "center", marginBottom: "2.5rem", paddingTop: "2rem" }}>
                    <div style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        backgroundColor: "#22c55e20",
                        border: "2px solid #22c55e",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 1.5rem",
                        fontSize: "2rem",
                    }}>
                        ✓
                    </div>
                    <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0 0 0.5rem 0" }}>
                        Session Completed
                    </h1>
                    <div style={{ color: "#64748b" }}>{athleteName}</div>
                </div>

                {/* Summary Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2.5rem" }}>
                    <Card>
                        <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", marginBottom: "0.25rem" }}>
                            Readiness
                        </div>
                        <div style={{ fontSize: "2rem", fontWeight: 800, color: "#38bdf8" }}>
                            {readinessScore}
                        </div>
                    </Card>
                    <Card>
                        <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", marginBottom: "0.25rem" }}>
                            Total Volume
                        </div>
                        <div style={{ fontSize: "2rem", fontWeight: 800, color: "#38bdf8" }}>
                            {totalVolume}
                        </div>
                    </Card>
                </div>

                {/* Auto-updated info */}
                <Card style={{ marginBottom: "2.5rem" }}>
                    <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                        Auto-Updated
                    </div>
                    <div style={{ fontSize: "0.9375rem", lineHeight: "2" }}>
                        <div>✓ Session saved to history</div>
                        <div>✓ Acute load updated</div>
                        <div>✓ Chronic load updated</div>
                        <div>✓ Readiness history updated</div>
                        <div>✓ Risk calculation refreshed</div>
                    </div>
                </Card>

                {/* Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <Button
                        label="View Trends"
                        onClick={onViewTrends}
                        style={{ width: "100%", padding: "1rem", fontSize: "1.125rem" }}
                    />
                    <Button
                        label="Back to Roster"
                        onClick={onBackToRoster}
                        variant="secondary"
                        style={{ width: "100%", padding: "1rem", fontSize: "1.125rem" }}
                    />
                </div>
            </div>
        </div>
    );
};
