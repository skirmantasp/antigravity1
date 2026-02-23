import { FC, ReactNode, CSSProperties } from "react";

const COLORS = {
    base: "#0f172a",
    surface: "#1e293b",
    accent: "#38bdf8",
    text: "#e2e8f0",
    muted: "#94a3b8",
    border: "#334155",
    success: "#22c55e",
    warning: "#eab308",
    danger: "#ef4444",
};

export const Card: FC<{ children: ReactNode; style?: CSSProperties; onClick?: () => void }> = ({
    children,
    style,
    onClick,
}) => (
    <div
        onClick={onClick}
        style={{
            backgroundColor: COLORS.surface,
            borderRadius: "12px",
            padding: "1.5rem",
            border: `1px solid ${COLORS.border}`,
            color: COLORS.text,
            cursor: onClick ? "pointer" : "default",
            transition: "transform 0.2s, border-color 0.2s",
            ...style,
        }}
    >
        {children}
    </div>
);

export const Badge: FC<{ label: string | number; color?: string }> = ({ label, color = COLORS.accent }) => (
    <span
        style={{
            display: "inline-block",
            backgroundColor: `${color}20`,
            color: color,
            padding: "0.25rem 0.75rem",
            borderRadius: "999px",
            fontSize: "0.75rem",
            fontWeight: 600,
            border: `1px solid ${color}40`,
            textTransform: "uppercase",
        }}
    >
        {label}
    </span>
);

export const Button: FC<{
    label: string;
    onClick?: () => void;
    variant?: "primary" | "secondary" | "danger";
    disabled?: boolean;
    style?: CSSProperties;
}> = ({ label, onClick, variant = "primary", disabled, style }) => {
    const bgColor = variant === "primary" ? COLORS.accent : variant === "danger" ? COLORS.danger : "transparent";
    const borderColor = variant === "secondary" ? COLORS.border : "none";
    const textColor = variant === "primary" ? COLORS.base : COLORS.text;

    return (
        <button
            disabled={disabled}
            onClick={onClick}
            style={{
                backgroundColor: bgColor,
                border: variant === "secondary" ? `1px solid ${borderColor}` : "none",
                color: textColor,
                padding: "0.75rem 1.5rem",
                borderRadius: "8px",
                fontWeight: 700,
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.5 : 1,
                transition: "opacity 0.2s, transform 0.1s",
                ...style,
            }}
        >
            {label}
        </button>
    );
};

export const Slider: FC<{
    label: string;
    value: number;
    min: number;
    max: number;
    onChange: (val: number) => void;
}> = ({ label, value, min, max, onChange }) => (
    <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <label style={{ fontSize: "0.875rem", color: COLORS.muted }}>{label}</label>
            <span style={{ fontWeight: 700, color: COLORS.accent }}>{value}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            style={{
                width: "100%",
                accentColor: COLORS.accent,
                height: "6px",
                borderRadius: "3px",
                backgroundColor: COLORS.border,
                cursor: "pointer",
            }}
        />
    </div>
);

export const Toggle: FC<{
    label: string;
    checked: boolean;
    onChange: (val: boolean) => void;
}> = ({ label, checked, onChange }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <span style={{ fontSize: "0.875rem", color: COLORS.muted }}>{label}</span>
        <div
            onClick={() => onChange(!checked)}
            style={{
                width: "48px",
                height: "24px",
                backgroundColor: checked ? COLORS.accent : COLORS.border,
                borderRadius: "12px",
                position: "relative",
                cursor: "pointer",
                transition: "background-color 0.2s",
            }}
        >
            <div
                style={{
                    width: "20px",
                    height: "20px",
                    backgroundColor: checked ? COLORS.base : COLORS.muted,
                    borderRadius: "50%",
                    position: "absolute",
                    top: "2px",
                    left: checked ? "26px" : "2px",
                    transition: "left 0.2s, background-color 0.2s",
                }}
            />
        </div>
    </div>
);

export const Select: FC<{
    label: string;
    value: string;
    options: { label: string; value: string }[];
    onChange: (val: string) => void;
}> = ({ label, value, options, onChange }) => (
    <div style={{ marginBottom: "1.5rem" }}>
        <label style={{ display: "block", fontSize: "0.875rem", color: COLORS.muted, marginBottom: "0.5rem" }}>
            {label}
        </label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
                width: "100%",
                backgroundColor: COLORS.base,
                color: COLORS.text,
                border: `1px solid ${COLORS.border}`,
                borderRadius: "8px",
                padding: "0.75rem",
                fontSize: "1rem",
                outline: "none",
                cursor: "pointer",
            }}
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    </div>
);

export const Modal: FC<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.8)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                padding: "1rem",
            }}
        >
            <Card style={{ width: "100%", maxWidth: "480px", position: "relative" }}>
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: "1rem",
                        right: "1rem",
                        background: "none",
                        border: "none",
                        color: COLORS.muted,
                        fontSize: "1.5rem",
                        cursor: "pointer",
                    }}
                >
                    &times;
                </button>
                <h2 style={{ marginTop: 0, marginBottom: "1.5rem", fontSize: "1.25rem" }}>{title}</h2>
                {children}
            </Card>
        </div>
    );
};
