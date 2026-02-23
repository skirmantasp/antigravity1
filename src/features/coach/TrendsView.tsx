import { FC } from "react";
import { AthleteHistory } from "../../types";
import { Card, Button } from "../../shared/ui/Components";
import { TrendChart } from "../trends/TrendChart";

interface TrendsViewProps {
    athleteName: string;
    history: AthleteHistory[];
    onBack: () => void;
}

const calculateACRatio = (history: AthleteHistory[]): string => {
    if (history.length < 7) return "—";
    const recent = history.slice(-7);
    const older = history.length >= 28 ? history.slice(-28) : history;

    const acuteAvg = recent.reduce((sum, h) => sum + h.volume, 0) / recent.length;
    const chronicAvg = older.reduce((sum, h) => sum + h.volume, 0) / older.length;

    if (chronicAvg === 0) return "—";
    return (acuteAvg / chronicAvg).toFixed(2);
};

const getACRatioColor = (ratio: string): string => {
    if (ratio === "—") return "#94a3b8";
    const val = parseFloat(ratio);
    if (val > 1.5) return "#ef4444";
    if (val > 1.3) return "#eab308";
    return "#22c55e";
};

export const TrendsView: FC<TrendsViewProps> = ({ athleteName, history, onBack }) => {
    const latestReadiness = history.length > 0 ? history[history.length - 1].readiness : 0;
    const latestVolume = history.length > 0 ? history[history.length - 1].volume : 0;
    const acRatio = calculateACRatio(history);

    const getRiskLabel = (): string => {
        if (acRatio === "—") return "INSUFFICIENT DATA";
        const val = parseFloat(acRatio);
        if (val > 1.5) return "HIGH RISK";
        if (val > 1.3) return "ELEVATED";
        if (val < 0.8) return "UNDERTRAINED";
        return "OPTIMAL";
    };

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", color: "#e2e8f0" }}>
            <div style={{ maxWidth: "720px", margin: "0 auto", padding: "3rem 1.5rem" }}>
                <Button label="← Back" onClick={onBack} variant="secondary" style={{ marginBottom: "2rem" }} />

                <div style={{ marginBottom: "2.5rem" }}>
                    <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0 0 0.25rem 0" }}>
                        Trends
                    </h1>
                    <div style={{ color: "#64748b" }}>{athleteName}</div>
                </div>

                {/* Key Metrics */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
                    <Card>
                        <div style={{ fontSize: "0.6875rem", color: "#64748b", textTransform: "uppercase", marginBottom: "0.25rem" }}>Latest Readiness</div>
                        <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#38bdf8" }}>{latestReadiness}</div>
                    </Card>
                    <Card>
                        <div style={{ fontSize: "0.6875rem", color: "#64748b", textTransform: "uppercase", marginBottom: "0.25rem" }}>Latest Volume</div>
                        <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>{latestVolume}</div>
                    </Card>
                    <Card>
                        <div style={{ fontSize: "0.6875rem", color: "#64748b", textTransform: "uppercase", marginBottom: "0.25rem" }}>A:C Ratio</div>
                        <div style={{ fontSize: "1.5rem", fontWeight: 800, color: getACRatioColor(acRatio) }}>{acRatio}</div>
                    </Card>
                </div>

                {/* Risk Status */}
                <Card style={{ marginBottom: "2rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <div style={{ fontSize: "0.6875rem", color: "#64748b", textTransform: "uppercase" }}>Risk Status</div>
                            <div style={{ fontWeight: 700, fontSize: "1.125rem", color: getACRatioColor(acRatio) }}>{getRiskLabel()}</div>
                        </div>
                        <div style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "50%",
                            backgroundColor: getACRatioColor(acRatio),
                        }} />
                    </div>
                </Card>

                {/* Readiness Chart */}
                <Card style={{ marginBottom: "2rem" }}>
                    <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", marginBottom: "1rem", fontWeight: 600 }}>
                        Readiness History
                    </div>
                    <TrendChart history={history} />
                </Card>
            </div>
        </div>
    );
};
