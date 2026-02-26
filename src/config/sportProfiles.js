/**
 * sportProfiles.js
 *
 * Sport-specific DOMAIN overrides — merged on top of base actions.
 *
 * STRICT CONTRACT:
 *   Allowed fields (engine contract only):
 *     focus, sessionType, intensity, volume, restPeriod, notes
 *
 *   FORBIDDEN fields (UI layer only — enforced by applySportProfile):
 *     badgeColor, background, borderColor, label, ui, color,
 *     component, layout, style, className, or ANY rendering hint.
 *
 * RULES:
 *   - "default" profile matches existing base actions (no visible change).
 *   - Named profiles override only the fields they specify.
 *   - Missing fields inherit from base actions.
 *   - Missing sport → falls back to "default".
 *   - Missing state within a profile → no overrides applied.
 *   - Any non-allowlisted field is STRIPPED by the engine pipeline.
 *
 * To add a new sport: add a keyed entry below with per-state overrides.
 * Only specify ENGINE CONTRACT fields that DIFFER from the base.
 */

export const SPORT_PROFILES = Object.freeze({

    /** default — mirrors base ACTION_MAP values. No behavior change. */
    default: {
        CONTROL: {
            sessionType: "foundational",
            intensity: "low-moderate",
        },
        STABILIZE: {
            sessionType: "corrective",
            intensity: "low",
        },
        PROGRESS: {
            sessionType: "development",
            intensity: "moderate-high",
        },
    },

    /** strength — barbell / powerlifting / Olympic lifting */
    strength: {
        CONTROL: {
            sessionType: "base strength",
            focus: "movement patterns & load tolerance",
        },
        STABILIZE: {
            sessionType: "technique rebuild",
            focus: "joint integrity & position work",
        },
        PROGRESS: {
            sessionType: "progressive overload",
            focus: "load progression & volume accumulation",
        },
    },

    /** running — distance / sprinting / track */
    running: {
        CONTROL: {
            sessionType: "running foundation",
            focus: "aerobic base & gait mechanics",
        },
        STABILIZE: {
            sessionType: "running correction",
            focus: "foot strike & hip stability",
        },
        PROGRESS: {
            sessionType: "performance build",
            focus: "tempo work & race pace exposure",
        },
    },

    /** triathlon — swim / bike / run multisport */
    triathlon: {
        CONTROL: {
            sessionType: "aerobic base",
            focus: "cross-discipline base building",
        },
        STABILIZE: {
            sessionType: "movement correction",
            focus: "transition mechanics & fatigue management",
        },
        PROGRESS: {
            sessionType: "race development",
            focus: "brick sessions & race simulation",
        },
    },

    /** rehab — injury recovery / return to sport */
    rehab: {
        CONTROL: {
            sessionType: "motor control",
            focus: "neuromuscular re-education",
        },
        STABILIZE: {
            sessionType: "pain-safe rebuild",
            focus: "load tolerance below pain threshold",
        },
        PROGRESS: {
            sessionType: "return to function",
            focus: "sport-specific loading & confidence building",
        },
    },
});
