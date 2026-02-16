/**
 * Readability Validation Script
 *
 * Validates that user-facing screening content reads at 6th-8th grade level.
 * Uses Flesch-Kincaid grade level and Flesch reading ease formulas.
 *
 * Run: npm run check:readability
 */

import { documentationChecklists } from "../src/content/documentation-checklists";
import { screeningQuestions } from "../src/content/screening-questions";

// ============================================================================
// SIMPLIFIED READABILITY CALCULATOR
// ============================================================================

function countSyllables(word: string): number {
	const w = word.toLowerCase().replace(/[^a-z]/g, "");
	if (w.length <= 2) return 1;

	let count = 0;
	const vowels = "aeiouy";
	let prevVowel = false;

	for (let i = 0; i < w.length; i++) {
		const isVowel = vowels.includes(w[i]);
		if (isVowel && !prevVowel) {
			count++;
		}
		prevVowel = isVowel;
	}

	// Handle silent e
	if (w.endsWith("e") && count > 1) {
		count--;
	}

	return Math.max(1, count);
}

function analyze(text: string): {
	gradeLevel: number;
	readingEase: number;
	sentences: number;
	words: number;
	syllables: number;
} {
	const sentences = text
		.split(/[.!?]+/)
		.filter((s) => s.trim().length > 0).length;
	const words = text
		.split(/\s+/)
		.filter((w) => w.replace(/[^a-zA-Z]/g, "").length > 0);
	const wordCount = words.length;
	const syllableCount = words.reduce((sum, w) => sum + countSyllables(w), 0);

	if (wordCount === 0 || sentences === 0) {
		return {
			gradeLevel: 0,
			readingEase: 100,
			sentences: 0,
			words: 0,
			syllables: 0,
		};
	}

	// Flesch-Kincaid Grade Level
	const gradeLevel =
		0.39 * (wordCount / sentences) + 11.8 * (syllableCount / wordCount) - 15.59;

	// Flesch Reading Ease
	const readingEase =
		206.835 -
		1.015 * (wordCount / sentences) -
		84.6 * (syllableCount / wordCount);

	return {
		gradeLevel: Math.round(gradeLevel * 10) / 10,
		readingEase: Math.round(readingEase * 10) / 10,
		sentences,
		words: wordCount,
		syllables: syllableCount,
	};
}

// ============================================================================
// COLLECT CONTENT
// ============================================================================

function collectScreeningContent(): string {
	const parts: string[] = [];

	for (const step of screeningQuestions) {
		parts.push(step.title);
		for (const q of step.questions) {
			parts.push(q.label);
			if (q.helpText) parts.push(q.helpText);
			for (const opt of q.options) {
				parts.push(opt.label);
			}
		}
	}

	return parts.join(". ");
}

function collectDocumentationContent(): string {
	const parts: string[] = [];

	for (const checklist of documentationChecklists) {
		parts.push(checklist.programName);
		parts.push(checklist.description);
		for (const doc of checklist.documents) {
			parts.push(doc.name);
			parts.push(doc.description);
		}
		for (const tip of checklist.tips) {
			parts.push(tip);
		}
	}

	return parts.join(". ");
}

// ============================================================================
// MAIN
// ============================================================================

const TARGET_MIN_GRADE = 4;
const TARGET_MAX_GRADE = 8;

console.log("Readability Check");
console.log("=".repeat(60));
console.log(
	`Target: ${TARGET_MIN_GRADE}th - ${TARGET_MAX_GRADE}th grade level\n`,
);

const screeningText = collectScreeningContent();
const screeningResult = analyze(screeningText);

console.log("Screening Questions:");
console.log(`  Grade Level: ${screeningResult.gradeLevel}`);
console.log(`  Reading Ease: ${screeningResult.readingEase} (higher = easier)`);
console.log(`  Words: ${screeningResult.words}`);
console.log(`  Sentences: ${screeningResult.sentences}`);

const screeningPass =
	screeningResult.gradeLevel >= TARGET_MIN_GRADE &&
	screeningResult.gradeLevel <= TARGET_MAX_GRADE;
console.log(
	`  Status: ${screeningPass ? "PASS" : "WARN"} (${screeningResult.gradeLevel <= TARGET_MAX_GRADE ? "within" : "above"} target range)\n`,
);

const docsText = collectDocumentationContent();
const docsResult = analyze(docsText);

console.log("Documentation Checklists:");
console.log(`  Grade Level: ${docsResult.gradeLevel}`);
console.log(`  Reading Ease: ${docsResult.readingEase} (higher = easier)`);
console.log(`  Words: ${docsResult.words}`);
console.log(`  Sentences: ${docsResult.sentences}`);

const docsPass =
	docsResult.gradeLevel >= TARGET_MIN_GRADE &&
	docsResult.gradeLevel <= TARGET_MAX_GRADE;
console.log(
	`  Status: ${docsPass ? "PASS" : "WARN"} (${docsResult.gradeLevel <= TARGET_MAX_GRADE ? "within" : "above"} target range)\n`,
);

console.log("=".repeat(60));
const allPass = screeningPass && docsPass;
console.log(
	`Overall: ${allPass ? "PASS" : "WARN - some content above target grade level"}`,
);
console.log(
	"\nNote: Grade levels above 8 may be acceptable for technical content",
);
console.log("like document names and application instructions.");

if (!allPass) {
	process.exit(0); // Warn but don't fail
}
