import { FC } from "react";
import { AthleteHistory } from "../../types";

interface TrendChartProps {
    history: AthleteHistory[];
    height?: number;
}

export const TrendChart: FC<TrendChartProps> = ({ history, height = 200 }) => {
    if (history.length === 0) return <div>No historical data</div>;

    const padding = 40;
    const width = 800; // Viewbox width
    const svgHeight = height + padding * 2;
    const svgWidth = width + padding * 2;

    const maxReadiness = 100;
    const minReadiness = 0;

    const points = history
        .map((h, i) => {
            const x = (i / (history.length - 1)) * width + padding;
            const y = svgHeight - padding - ((h.readiness - minReadiness) / (maxReadiness - minReadiness)) * height;
            return `${x},${y}`;
        })
        .join(" ");

    return (
        <div style={{ width: "100%", overflowX: "auto" }}>
            <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                style={{ width: "100%", height: "auto", display: "block" }}
            >
                {/* Grid Lines */}
                {[0, 25, 50, 75, 100].map((val) => {
                    const y = svgHeight - padding - (val / 100) * height;
                    return (
                        <g key={val}>
                            <line
                                x1={padding}
                                y1={y}
                                x2={width + padding}
                                y2={y}
                                stroke="#334155"
                                strokeWidth="1"
                                strokeDasharray="4"
                            />
                            <text
                                x={padding - 10}
                                y={y + 4}
                                fill="#94a3b8"
                                fontSize="12"
                                textAnchor="end"
                            >
                                {val}
                            </text>
                        </g>
                    );
                })}

                {/* Readiness Line */}
                <polyline
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                />

                {/* History Points & Markers */}
                {history.map((h, i) => {
                    const x = (i / (history.length - 1)) * width + padding;
                    const y = svgHeight - padding - ((h.readiness - minReadiness) / (maxReadiness - minReadiness)) * height;
                    return (
                        <g key={i}>
                            <circle
                                cx={x}
                                cy={y}
                                r="4"
                                fill={h.injuryFlag ? "#ef4444" : "#38bdf8"}
                                stroke="#1e293b"
                                strokeWidth="2"
                            />
                            {h.injuryFlag && (
                                <text
                                    x={x}
                                    y={y - 12}
                                    fill="#ef4444"
                                    fontSize="10"
                                    fontWeight="bold"
                                    textAnchor="middle"
                                >
                                    !
                                </text>
                            )}
                            <text
                                x={x}
                                y={svgHeight - 10}
                                fill="#94a3b8"
                                fontSize="10"
                                textAnchor="middle"
                            >
                                {h.date.split("-")[2]}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};
