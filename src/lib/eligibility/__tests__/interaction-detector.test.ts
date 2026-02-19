/**
 * Unit tests for the benefit interaction detector.
 *
 * Tests that detectBenefitInteractions() correctly identifies known conflicts
 * between programs that veterans might receive simultaneously, and returns
 * the appropriate warnings with required fields.
 */

import { describe, expect, it } from "vitest";
import type { ProgramMatch } from "@/lib/db/screening-types";
import { detectBenefitInteractions } from "../interaction-detector";

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Create a mock ProgramMatch with sensible defaults.
 * Only override what each test needs.
 */
function createMockMatch(
	overrides: Partial<ProgramMatch> & { programId: string },
): ProgramMatch {
	return {
		programName: overrides.programId,
		confidence: "high",
		confidenceLabel: "Likely Eligible",
		requiredDocs: [],
		nextSteps: [],
		description: `${overrides.programId} program`,
		...overrides,
	};
}

// ============================================================================
// DETECTION TESTS
// ============================================================================

describe("detectBenefitInteractions", () => {
	it("returns empty array when no program conflicts exist", async () => {
		const matches = [
			createMockMatch({ programId: "va-healthcare" }),
			createMockMatch({ programId: "snap-ky" }),
		];
		const answers = { householdIncome: "under-15k" };

		const interactions = await detectBenefitInteractions(matches, answers);

		expect(interactions).toEqual([]);
	});

	it("detects SSI + SNAP income interaction for mid-range income", async () => {
		const matches = [
			createMockMatch({ programId: "ssi" }),
			createMockMatch({ programId: "snap-ky" }),
		];
		const answers = { householdIncome: "15k-25k" };

		const interactions = await detectBenefitInteractions(matches, answers);

		expect(interactions.length).toBeGreaterThanOrEqual(1);
		const ssiSnapWarning = interactions.find((i) =>
			i.programIds.includes("ssi") && i.programIds.includes("snap-ky"),
		);
		expect(ssiSnapWarning).toBeDefined();
		expect(ssiSnapWarning?.title).toContain("SSI");
		expect(ssiSnapWarning?.title).toContain("SNAP");
	});

	it("detects SSI + SNAP income interaction for 25k-40k income", async () => {
		const matches = [
			createMockMatch({ programId: "ssi" }),
			createMockMatch({ programId: "snap-ky" }),
		];
		const answers = { householdIncome: "25k-40k" };

		const interactions = await detectBenefitInteractions(matches, answers);

		expect(interactions.length).toBeGreaterThanOrEqual(1);
		const ssiSnapWarning = interactions.find((i) =>
			i.programIds.includes("ssi") && i.programIds.includes("snap-ky"),
		);
		expect(ssiSnapWarning).toBeDefined();
	});

	it("does not detect SSI + SNAP interaction for very low income (under-15k)", async () => {
		const matches = [
			createMockMatch({ programId: "ssi" }),
			createMockMatch({ programId: "snap-ky" }),
		];
		const answers = { householdIncome: "under-15k" };

		const interactions = await detectBenefitInteractions(matches, answers);

		const ssiSnapWarning = interactions.find((i) =>
			i.programIds.includes("ssi") && i.programIds.includes("snap-ky"),
		);
		expect(ssiSnapWarning).toBeUndefined();
	});

	it("detects SSI + Medicaid eligibility cliff", async () => {
		const matches = [
			createMockMatch({ programId: "ssi" }),
			createMockMatch({ programId: "medicaid-ky" }),
		];
		const answers = { householdIncome: "under-15k" };

		const interactions = await detectBenefitInteractions(matches, answers);

		expect(interactions.length).toBeGreaterThanOrEqual(1);
		const cliffWarning = interactions.find((i) =>
			i.programIds.includes("ssi") && i.programIds.includes("medicaid-ky"),
		);
		expect(cliffWarning).toBeDefined();
		expect(cliffWarning?.title).toContain("Medicaid");
	});

	it("detects VA disability compensation + SSI offset", async () => {
		const matches = [
			createMockMatch({ programId: "va-disability-compensation" }),
			createMockMatch({ programId: "ssi" }),
		];
		const answers = {};

		const interactions = await detectBenefitInteractions(matches, answers);

		expect(interactions.length).toBeGreaterThanOrEqual(1);
		const offsetWarning = interactions.find((i) =>
			i.programIds.includes("va-disability-compensation") &&
			i.programIds.includes("ssi"),
		);
		expect(offsetWarning).toBeDefined();
		expect(offsetWarning?.title).toContain("VA");
	});

	it("detects VA pension + SSI interaction", async () => {
		const matches = [
			createMockMatch({ programId: "va-pension" }),
			createMockMatch({ programId: "ssi" }),
		];
		const answers = {};

		const interactions = await detectBenefitInteractions(matches, answers);

		expect(interactions.length).toBeGreaterThanOrEqual(1);
		const pensionWarning = interactions.find((i) =>
			i.programIds.includes("va-pension") && i.programIds.includes("ssi"),
		);
		expect(pensionWarning).toBeDefined();
	});

	it("detects SNAP + Medicaid income cliff for 25k-40k income", async () => {
		const matches = [
			createMockMatch({ programId: "snap-ky" }),
			createMockMatch({ programId: "medicaid-ky" }),
		];
		const answers = { householdIncome: "25k-40k" };

		const interactions = await detectBenefitInteractions(matches, answers);

		expect(interactions.length).toBeGreaterThanOrEqual(1);
		const cliffWarning = interactions.find((i) =>
			i.programIds.includes("snap-ky") && i.programIds.includes("medicaid-ky"),
		);
		expect(cliffWarning).toBeDefined();
	});

	it("returns multiple interactions when multiple conflicts exist", async () => {
		const matches = [
			createMockMatch({ programId: "ssi" }),
			createMockMatch({ programId: "snap-ky" }),
			createMockMatch({ programId: "medicaid-ky" }),
		];
		const answers = { householdIncome: "15k-25k" };

		const interactions = await detectBenefitInteractions(matches, answers);

		// Should detect at least: SSI+SNAP interaction AND SSI+Medicaid cliff
		expect(interactions.length).toBeGreaterThanOrEqual(2);
	});

	it("each interaction has all required fields", async () => {
		const matches = [
			createMockMatch({ programId: "ssi" }),
			createMockMatch({ programId: "snap-ky" }),
		];
		const answers = { householdIncome: "15k-25k" };

		const interactions = await detectBenefitInteractions(matches, answers);

		expect(interactions.length).toBeGreaterThanOrEqual(1);

		for (const interaction of interactions) {
			expect(interaction).toHaveProperty("type");
			expect(["warning", "conflict", "info"]).toContain(interaction.type);

			expect(interaction).toHaveProperty("programIds");
			expect(Array.isArray(interaction.programIds)).toBe(true);
			expect(interaction.programIds.length).toBeGreaterThan(0);

			expect(interaction).toHaveProperty("title");
			expect(typeof interaction.title).toBe("string");
			expect(interaction.title.length).toBeGreaterThan(0);

			expect(interaction).toHaveProperty("description");
			expect(typeof interaction.description).toBe("string");
			expect(interaction.description.length).toBeGreaterThan(0);

			expect(interaction).toHaveProperty("recommendation");
			expect(typeof interaction.recommendation).toBe("string");
			expect(interaction.recommendation.length).toBeGreaterThan(0);

			expect(interaction).toHaveProperty("severity");
			expect(["high", "medium", "low"]).toContain(interaction.severity);
		}
	});

	it("returns high severity interactions before lower severity ones", async () => {
		// SSI + Medicaid is high severity, SSI + SNAP is medium severity
		const matches = [
			createMockMatch({ programId: "ssi" }),
			createMockMatch({ programId: "snap-ky" }),
			createMockMatch({ programId: "medicaid-ky" }),
		];
		const answers = { householdIncome: "15k-25k" };

		const interactions = await detectBenefitInteractions(matches, answers);

		// High severity should come first
		if (interactions.length >= 2) {
			const highIndex = interactions.findIndex((i) => i.severity === "high");
			const mediumIndex = interactions.findIndex((i) => i.severity === "medium");
			if (highIndex !== -1 && mediumIndex !== -1) {
				expect(highIndex).toBeLessThan(mediumIndex);
			}
		}
	});
});
