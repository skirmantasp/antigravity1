import type { ExperienceLevel, ProfileStatus } from "../types";

// ── Shared presentation entry shape ─────────────────────────────────────────
export type SportToneEntry = {
    headline: string;
    loadGuidance: string;
    bullets: string[];
};

// ── Layer 2: Experience Level Modifier ──────────────────────────────────────
// Controls coaching depth and language register.
// Does NOT change what action is recommended — only how it is communicated.

type ExperienceModifier = {
    bulletFilter?: "simplified";        // BEGINNER: cap to first 2 bullets
    loadGuidancePrefix?: string;        // prepended to loadGuidance
    bulletSuffix?: string;              // appended as an extra bullet
};

const EXPERIENCE_MODIFIER: Record<ExperienceLevel | "NONE", ExperienceModifier> = {
    BEGINNER: { bulletFilter: "simplified", loadGuidancePrefix: "Keep it simple — " },
    INTERMEDIATE: {},   // baseline — existing bullets are written for this level
    ADVANCED: { bulletSuffix: "Use this as a precision marker, not a ceiling." },
    NONE: {},
};

// ── Layer 3: Profile Status Modifier ────────────────────────────────────────
// Injects capacity or recovery qualifiers into the entry.
// Does NOT change the tone decision or sport context.

type StatusModifier = {
    headlineQualifier?: string;     // appended to headline
    loadGuidancePrepend?: string;   // prepended to loadGuidance
    safetyBullet?: string;          // inserted as bullet[0]
};

const PROFILE_STATUS_MODIFIER: Record<ProfileStatus, StatusModifier> = {
    NONE: {},
    RECOVERING: {
        headlineQualifier: " — within recovery limits.",
        safetyBullet: "Monitor for symptom response throughout. Stop if pain or compensation appears.",
    },
    LIMITED: {
        headlineQualifier: " — modified for limited capacity.",
        loadGuidancePrepend: "Capacity is limited. ",
        safetyBullet: "Reduced capacity is in effect. Do not push to the ceiling of the plan.",
    },
};

// ── Composition function ─────────────────────────────────────────────────────
// Pure transform: takes base entry, returns modified entry.
// Engine output is never read here. Undefined inputs are no-ops.

export function composePresentationEntry(
    base: SportToneEntry,
    experienceLevel: ExperienceLevel | undefined,
    profileStatus: ProfileStatus | undefined
): SportToneEntry {
    let { headline, loadGuidance, bullets } = base;

    // ── Apply Experience modifier ────────────────────────────────────────────
    const expMod = EXPERIENCE_MODIFIER[experienceLevel ?? "NONE"];

    if (expMod.bulletFilter === "simplified") {
        bullets = bullets.slice(0, 2);
    }
    if (expMod.loadGuidancePrefix) {
        loadGuidance = expMod.loadGuidancePrefix + loadGuidance;
    }
    if (expMod.bulletSuffix) {
        bullets = [...bullets, expMod.bulletSuffix];
    }

    // ── Apply Profile Status modifier ────────────────────────────────────────
    const statusMod = PROFILE_STATUS_MODIFIER[profileStatus ?? "NONE"];

    if (statusMod.headlineQualifier) {
        headline = headline.replace(/\.$/, "") + statusMod.headlineQualifier;
    }
    if (statusMod.loadGuidancePrepend) {
        loadGuidance = statusMod.loadGuidancePrepend + loadGuidance;
    }
    if (statusMod.safetyBullet) {
        bullets = [statusMod.safetyBullet, ...bullets];
    }

    return { headline, loadGuidance, bullets };
}
