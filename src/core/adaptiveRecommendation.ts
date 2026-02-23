import { NeuralState } from "./trainingEngine";
import { StabilityLevel } from "./stabilityModel";
import { MomentumDirection } from "./momentumModel";

export interface AdaptiveRecommendation {
    situation: string;
    context: string;
    action: string;
    confidenceLevel: "HIGH" | "MODERATE" | "LOW";
    confidenceScore: number;
    confidenceExplanation: string;
}

export function deriveAdaptiveRecommendation(
    neuralState: NeuralState,
    stabilityLevel: StabilityLevel,
    momentumDirection: MomentumDirection
): AdaptiveRecommendation {
    let situation = "";
    let context = "";
    let action = "";

    situation = `System is currently ${neuralState.toLowerCase()}.`;

    context = `Stability level is ${stabilityLevel.toLowerCase()} with ${momentumDirection.toLowerCase()} momentum.`;

    if (neuralState === "ADAPTIVE" && stabilityLevel === "HIGH" && momentumDirection === "UP") {
        action = "Controlled progression is appropriate.";
    } else if (momentumDirection === "DOWN") {
        action = "Hold intensity and monitor recovery closely.";
    } else if (stabilityLevel === "LOW") {
        action = "Prioritize control and avoid aggressive progression.";
    } else {
        action = "Maintain current load and observe system response.";
    }

    let confidenceLevel: "HIGH" | "MODERATE" | "LOW" = "MODERATE";
    let confidenceScore = 60;

    if (
        stabilityLevel === "HIGH" &&
        momentumDirection !== "DOWN" &&
        neuralState !== "PROTECTIVE"
    ) {
        confidenceLevel = "HIGH";
        confidenceScore = 85;
    } else if (
        stabilityLevel === "LOW" ||
        momentumDirection === "DOWN" ||
        neuralState === "PROTECTIVE"
    ) {
        confidenceLevel = "LOW";
        confidenceScore = 40;
    } else {
        confidenceLevel = "MODERATE";
        confidenceScore = 65;
    }
    let confidenceExplanation = "";

    if (confidenceLevel === "HIGH") {
        confidenceExplanation =
            "High stability and supportive momentum confirm this recommendation.";
    } else if (confidenceLevel === "MODERATE") {
        confidenceExplanation =
            "System signals are mixed. Recommendation is cautious but reasonable.";
    } else {
        confidenceExplanation =
            "Low stability or negative momentum reduces confidence in aggressive progression.";
    }

    return { situation, context, action, confidenceLevel, confidenceScore, confidenceExplanation };
}
