/**
 * Clinically validated crisis keywords derived from ASQ screening tool
 * Uses phrase matching (multi-word) to minimize false positives
 */

import type { CrisisKeyword } from "./types";

export const CRISIS_KEYWORDS: CrisisKeyword[] = [
	// High severity: Suicidal ideation indicators
	{ phrase: "kill myself", severity: "high", category: "suicidal_ideation" },
	{ phrase: "end my life", severity: "high", category: "suicidal_ideation" },
	{ phrase: "want to die", severity: "high", category: "suicidal_ideation" },
	{
		phrase: "better off dead",
		severity: "high",
		category: "suicidal_ideation",
	},
	{
		phrase: "no reason to live",
		severity: "high",
		category: "suicidal_ideation",
	},
	{ phrase: "end it all", severity: "high", category: "suicidal_ideation" },
	{ phrase: "suicide", severity: "high", category: "suicidal_ideation" },
	{ phrase: "suicidal", severity: "high", category: "suicidal_ideation" },
	{
		phrase: "take my own life",
		severity: "high",
		category: "suicidal_ideation",
	},
	{
		phrase: "don't want to be here",
		severity: "high",
		category: "suicidal_ideation",
	},
	{
		phrase: "wish i was dead",
		severity: "high",
		category: "suicidal_ideation",
	},
	{ phrase: "rather be dead", severity: "high", category: "suicidal_ideation" },
	{
		phrase: "can't go on anymore",
		severity: "high",
		category: "suicidal_ideation",
	},
	{ phrase: "no way out", severity: "high", category: "suicidal_ideation" },
	{ phrase: "plan to end", severity: "high", category: "suicidal_ideation" },

	// Medium severity: Acute distress indicators
	{ phrase: "hopeless", severity: "medium", category: "acute_distress" },
	{ phrase: "worthless", severity: "medium", category: "acute_distress" },
	{ phrase: "no point", severity: "medium", category: "acute_distress" },
	{ phrase: "give up", severity: "medium", category: "acute_distress" },
	{ phrase: "can't take it", severity: "medium", category: "acute_distress" },
	{ phrase: "nobody cares", severity: "medium", category: "acute_distress" },
	{ phrase: "all alone", severity: "medium", category: "acute_distress" },
	{
		phrase: "burden to everyone",
		severity: "medium",
		category: "acute_distress",
	},
	{ phrase: "nothing matters", severity: "medium", category: "acute_distress" },
	{ phrase: "what's the point", severity: "medium", category: "acute_distress" },
	{ phrase: "trapped", severity: "medium", category: "acute_distress" },
	{ phrase: "unbearable", severity: "medium", category: "acute_distress" },
];
