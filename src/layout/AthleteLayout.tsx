import { FC, ReactNode } from "react";

export const AthleteLayout: FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", color: "#e2e8f0" }}>
            {/* Top Bar for Athlete */}
            <nav style={{
                borderBottom: "1px solid #334155",
                padding: "1rem 2rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                position: "sticky",
                top: 0,
                backgroundColor: "rgba(15, 23, 42, 0.8)",
                backdropFilter: "blur(8px)",
                zIndex: 100
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ width: "24px", height: "24px", backgroundColor: "#38bdf8", borderRadius: "6px" }} />
                    <span style={{ fontWeight: 800, fontSize: "0.875rem", letterSpacing: "0.05em" }}>AG PLATFORM</span>
                </div>

                <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.875rem", fontWeight: 600 }}>
                    <span style={{ color: "#38bdf8" }}>Home</span>
                    <span style={{ color: "#94a3b8" }}>Library</span>
                    <span style={{ color: "#94a3b8" }}>Me</span>
                </div>
            </nav>

            {/* Centered Desktop Layout */}
            <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
                {children}
            </div>

            {/* Mobile Bottom Nav Spacer */}
            <div style={{ height: "4rem" }} />
        </div>
    );
};
