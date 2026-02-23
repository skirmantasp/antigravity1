import { useState } from "react";
import { Athlete, Session, EngineOutput, BlockPhase, PhaseTransitionSuggestion } from "./types";
import { dataService } from "./services/dataService";
import { calculateTrainingParameters } from "./core/trainingEngine";
import { buildSession } from "./core/sessionBuilder";
import { createStrengthBlock } from "./core/strengthBlockEngine";
import { calculateAcuteLoad, calculateChronicLoad, calculateACRatio } from "./core/effectiveVolume";

import { TodayView } from "./features/coach/TodayView";
import { AthletePreview } from "./features/coach/AthletePreview";
import { ReadinessForm } from "./features/coach/ReadinessForm";
import { SessionView } from "./features/coach/SessionView";
import { LiveSession } from "./features/coach/LiveSession";
import { SessionSummary } from "./features/coach/SessionSummary";
import { TrendsView } from "./features/coach/TrendsView";

type Screen =
    | "today"
    | "preview"
    | "readiness"
    | "session"
    | "live"
    | "summary"
    | "trends";

export default function App() {
    const [screen, setScreen] = useState<Screen>("today");
    const [athlete, setAthlete] = useState<Athlete | null>(null);
    const [readinessScore, setReadinessScore] = useState(0);
    const [engineOutput, setEngineOutput] = useState<EngineOutput | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [sessionVolume, setSessionVolume] = useState(0);
    const [sessionEffectiveVolume, setSessionEffectiveVolume] = useState<number | undefined>(undefined);
    const [phaseTransition, setPhaseTransition] = useState<PhaseTransitionSuggestion | null>(null);

    // Step 1 → 2: Select athlete
    const handleSelectAthlete = async (id: string) => {
        const data = await dataService.getAthleteById(id);
        if (data) {
            setAthlete(data);
            setScreen("preview");
        }
    };

    // Step 2 → 3: Start session
    const handleStartSession = () => {
        setScreen("readiness");
    };

    // Step 3 → 4: Submit readiness, run engine
    const handleReadinessSubmit = async (data: { sleep: number; fatigue: number; soreness: number; stress: number }) => {
        if (!athlete) return;

        // Run deterministic engine with raw inputs
        const output = calculateTrainingParameters(
            data.sleep,
            data.fatigue,
            data.stress,
            data.soreness,
            athlete.injuryStatus,
            athlete.phase
        );
        setEngineOutput(output);

        // Derive a display-only readiness score for UI/history
        const strain = data.fatigue + data.stress + data.soreness;
        const recovery = data.sleep * 3;
        const score = Math.round(Math.max(0, Math.min(100, ((recovery - strain + 30) / 60) * 100)));
        setReadinessScore(score);

        // Update athlete readiness in data layer
        await dataService.updateAthlete(athlete.id, { readinessScore: score });

        // ── Lazy block initialization ────────────────────────────────────────────
        // STRENGTH athletes without a block (e.g. profile edited from GENERAL)
        // get a Phase 1 block auto-created before session generation.
        // The result.updatedBlock path below handles the setAthlete update.
        let effectiveBlock = athlete.strengthBlock;
        if (athlete.sportContext === "STRENGTH" && !effectiveBlock) {
            const initialBlock = createStrengthBlock(1);
            await dataService.updateAthlete(athlete.id, { strengthBlock: initialBlock });
            effectiveBlock = initialBlock;
        }
        // ─────────────────────────────────────────────────────────────────────

        // Build session (block-aware)
        const result = buildSession(output, athlete.experienceLevel, effectiveBlock);
        setSession(result.session);

        // ── DEBUG: STEP 1 – Session build trace ──────────────────────────────
        console.log("DEBUG_BUILD_effectiveVolume:", result.effectiveVolume);
        console.log("DEBUG_BUILD_blockType:", result.blockType);
        console.log("DEBUG_BUILD_hasBlock:", !!effectiveBlock);
        console.log("DEBUG_BUILD_experience:", athlete.experienceLevel);
        // ─────────────────────────────────────────────────────────────────────

        // Store effectiveVolume so handleFinishSession can use it for history
        setSessionEffectiveVolume(result.effectiveVolume);

        // ── DEBUG: STEP 2 – State storage trace ──────────────────────────────
        console.log("DEBUG_STATE_setSessionEffectiveVolume:", result.effectiveVolume);
        // ─────────────────────────────────────────────────────────────────────

        // Persist updated block if the session consumed a block slot
        if (result.updatedBlock) {
            const updatedAthlete = { ...athlete, strengthBlock: result.updatedBlock };
            await dataService.updateAthlete(athlete.id, { strengthBlock: result.updatedBlock });
            setAthlete(updatedAthlete);
        }

        // Hold phase transition for display in SessionView (coach must confirm)
        setPhaseTransition(result.phaseTransition ?? null);

        setScreen("session");
    };

    // Step 4 → 5: Go live
    const handleStartLive = () => {
        setScreen("live");
    };

    // Step 5 → 6: Finish session, save data
    const handleFinishSession = async (logs: { weight: string; repsDone: string; rpe: string }[]) => {
        if (!athlete) return;

        // ── DEBUG: STEP 3 – Finish handler entry trace ───────────────────────
        console.log("DEBUG_FINISH_sessionEffectiveVolume:", sessionEffectiveVolume);
        console.log("DEBUG_FINISH_historyLength_before:", athlete.history.length);
        // ─────────────────────────────────────────────────────────────────────

        // Volume: prefer effectiveVolume from block engine; fall back to raw log sum
        let volumeToStore: number;
        if (sessionEffectiveVolume !== undefined) {
            volumeToStore = sessionEffectiveVolume;
        } else {
            let rawVolume = 0;
            logs.forEach((log) => {
                rawVolume += (parseFloat(log.weight) || 0) * (parseFloat(log.repsDone) || 0);
            });
            volumeToStore = rawVolume;
        }

        // Build updated history entry
        const today = new Date().toISOString().split("T")[0];
        const updatedHistory = [...athlete.history];
        const todayIndex = updatedHistory.findIndex(h => h.date === today);

        const historyEntry = {
            date: today,
            readiness: readinessScore,
            volume: volumeToStore,           // AthleteHistory.volume = effectiveVolume
            injuryFlag: athlete.injuryStatus === "INJURED",
            balance: engineOutput?.balance ?? 0,
        };

        // ── DEBUG: STEP 4 – History write trace ──────────────────────────────
        console.log("DEBUG_HISTORY_volumeToStore:", volumeToStore);
        // ─────────────────────────────────────────────────────────────────────

        if (todayIndex !== -1) {
            updatedHistory[todayIndex] = { ...updatedHistory[todayIndex], ...historyEntry };
        } else {
            updatedHistory.push(historyEntry);
        }

        // ── DEBUG: STEP 4 (post-write) ────────────────────────────────────────
        console.log("DEBUG_HISTORY_newHistoryLength:", updatedHistory.length);
        // ─────────────────────────────────────────────────────────────────────

        // Recalculate acute load, chronic load, and AC ratio from updated history
        const acute = calculateAcuteLoad(updatedHistory);
        const chronic = calculateChronicLoad(updatedHistory);
        const acRatio = calculateACRatio(acute, chronic);

        const updatedAthlete = {
            ...athlete,
            history: updatedHistory,
            readinessScore,
            acuteLoad: acute,
            chronicLoad: chronic,
            acRatio: acRatio ?? undefined,
        };

        await dataService.updateAthlete(athlete.id, updatedAthlete);
        setAthlete(updatedAthlete);
        setSessionVolume(volumeToStore);

        setScreen("summary");
    };

    // Phase transition: coach accepts or chooses a phase to begin a new block
    const handleAcceptPhase = async (phase: BlockPhase) => {
        if (!athlete) return;
        const newBlock = createStrengthBlock(phase);
        const updatedAthlete = { ...athlete, strengthBlock: newBlock };
        await dataService.updateAthlete(athlete.id, { strengthBlock: newBlock });
        setAthlete(updatedAthlete);
        setPhaseTransition(null);
    };

    // Navigation helpers
    const goToTrends = () => setScreen("trends");
    const goToRoster = () => {
        setScreen("today");
        setAthlete(null);
        setEngineOutput(null);
        setSession(null);
    };

    // Render
    switch (screen) {
        case "today":
            return <TodayView onSelectAthlete={handleSelectAthlete} />;

        case "preview":
            return athlete ? (
                <AthletePreview
                    athleteId={athlete.id}
                    onStartSession={handleStartSession}
                    onBack={goToRoster}
                    onAthleteUpdate={(updated) => setAthlete(updated)}
                />
            ) : null;

        case "readiness":
            return athlete ? (
                <ReadinessForm
                    athleteName={athlete.name}
                    onSubmit={handleReadinessSubmit}
                    onBack={() => setScreen("preview")}
                />
            ) : null;

        case "session":
            return athlete && engineOutput && session ? (
                <SessionView
                    athleteName={athlete.name}
                    readinessScore={readinessScore}
                    engineOutput={engineOutput}
                    session={session}
                    athleteHistory={athlete.history}
                    sportContext={athlete.sportContext}
                    experienceLevel={athlete.experienceLevel}
                    profileStatus={athlete.profileStatus}
                    acRatio={athlete.acRatio}
                    phaseTransition={phaseTransition ?? undefined}
                    onAcceptPhase={handleAcceptPhase}
                    onStartLive={handleStartLive}
                    onBack={() => setScreen("readiness")}
                />
            ) : null;

        case "live":
            return athlete && session ? (
                <LiveSession
                    athleteName={athlete.name}
                    session={session}
                    onFinish={handleFinishSession}
                />
            ) : null;

        case "summary":
            return athlete ? (
                <SessionSummary
                    athleteName={athlete.name}
                    readinessScore={readinessScore}
                    totalVolume={sessionVolume}
                    onViewTrends={goToTrends}
                    onBackToRoster={goToRoster}
                />
            ) : null;

        case "trends":
            return athlete ? (
                <TrendsView
                    athleteName={athlete.name}
                    history={athlete.history}
                    onBack={() => setScreen("summary")}
                />
            ) : null;

        default:
            return <TodayView onSelectAthlete={handleSelectAthlete} />;
    }
}
