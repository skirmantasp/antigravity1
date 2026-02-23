import { FC, useState } from "react";
import { Button, Card, Slider } from "../../shared/ui/Components";

interface ReadinessFormProps {
    athleteName: string;
    onSubmit: (data: { sleep: number; fatigue: number; soreness: number; stress: number }) => void;
    onBack: () => void;
}

export const ReadinessForm: FC<ReadinessFormProps> = ({ athleteName, onSubmit, onBack }) => {
    const [sleep, setSleep] = useState(7);
    const [fatigue, setFatigue] = useState(5);
    const [soreness, setSoreness] = useState(5);
    const [stress, setStress] = useState(5);

    const handleSubmit = () => {
        onSubmit({ sleep, fatigue, soreness, stress });
    };

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", color: "#e2e8f0" }}>
            <div style={{ maxWidth: "640px", margin: "0 auto", padding: "3rem 1.5rem" }}>
                <Button label="← Back" onClick={onBack} variant="secondary" style={{ marginBottom: "2rem" }} />

                <div style={{ marginBottom: "2.5rem" }}>
                    <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0 0 0.25rem 0" }}>
                        Readiness Check
                    </h1>
                    <div style={{ color: "#64748b", fontSize: "0.9375rem" }}>{athleteName}</div>
                </div>

                <Card style={{ marginBottom: "2.5rem" }}>
                    <Slider label="Sleep (hours)" value={sleep} min={0} max={12} onChange={setSleep} />
                    <Slider label="Fatigue (1–10)" value={fatigue} min={1} max={10} onChange={setFatigue} />
                    <Slider label="Soreness (1–10)" value={soreness} min={1} max={10} onChange={setSoreness} />
                    <Slider label="Stress (1–10)" value={stress} min={1} max={10} onChange={setStress} />
                </Card>

                <Button
                    label="Generate Session →"
                    onClick={handleSubmit}
                    style={{ width: "100%", padding: "1rem", fontSize: "1.125rem" }}
                />
            </div>
        </div>
    );
};
