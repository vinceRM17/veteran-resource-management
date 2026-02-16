/**
 * Crisis detection engine - pure function for testability
 * Scans text for crisis keywords using phrase matching
 */

import { CRISIS_KEYWORDS } from "./keywords";
import type { CrisisDetectionResult } from "./types";

/**
 * Detects crisis keywords in text content
 * Returns null if no crisis keywords found
 */
export async function detectCrisis(
	textContent: string,
): Promise<CrisisDetectionResult | null> {
	if (!textContent || textContent.trim().length === 0) {
		return null;
	}

	// Normalize input: lowercase, collapse whitespace
	const normalized = textContent.toLowerCase().replace(/\s+/g, " ").trim();

	// Collect all matching keywords
	const matches: Array<{ keyword: string; severity: "high" | "medium" }> = [];

	for (const crisis of CRISIS_KEYWORDS) {
		if (normalized.includes(crisis.phrase)) {
			matches.push({
				keyword: crisis.phrase,
				severity: crisis.severity,
			});
		}
	}

	// No matches found
	if (matches.length === 0) {
		return null;
	}

	// Compute max severity (high if any high keyword matched, else medium)
	const hasHighSeverity = matches.some((m) => m.severity === "high");
	const maxSeverity = hasHighSeverity ? "high" : "medium";

	// Compute SHA-256 hash of original text (not normalized)
	const sourceTextHash = await hashText(textContent);

	return {
		detected: true,
		keywords: matches.map((m) => m.keyword),
		severities: matches.map((m) => m.severity),
		maxSeverity,
		sourceTextHash,
	};
}

/**
 * Extracts text content from screening answers object
 * Collects all string values, skips arrays/numbers/booleans/nulls
 */
export function extractTextFromAnswers(
	answers: Record<string, unknown>,
): string {
	const textValues: string[] = [];

	for (const value of Object.values(answers)) {
		if (typeof value === "string" && value.trim().length > 0) {
			textValues.push(value);
		}
	}

	return textValues.join(" ");
}

/**
 * Computes SHA-256 hash of text using Web Crypto API
 * Available in both Node.js and Edge runtime
 */
async function hashText(text: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(text);
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
	return hashHex;
}
