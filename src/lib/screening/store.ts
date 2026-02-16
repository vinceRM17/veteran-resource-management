"use client";

/**
 * Zustand screening store with localStorage persistence.
 *
 * Handles multi-step form state, answer persistence across browser sessions,
 * and dependent field cleanup when conditional trigger fields change.
 *
 * Uses the hasHydrated pattern to avoid React hydration mismatches:
 * components should check hasHydrated before rendering persisted state.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TOTAL_STEPS } from "@/content/screening-questions";
import { clearDependentFields } from "@/lib/screening/conditional-logic";

// ============================================================================
// TYPES
// ============================================================================

interface ScreeningState {
	// State
	currentStep: number;
	answers: Record<string, unknown>;
	isSubmitting: boolean;
	hasHydrated: boolean;

	// Actions
	setAnswer: (key: string, value: unknown) => void;
	setAnswers: (updates: Record<string, unknown>) => void;
	nextStep: () => void;
	prevStep: () => void;
	goToStep: (step: number) => void;
	reset: () => void;
	setSubmitting: (v: boolean) => void;
	setHasHydrated: (v: boolean) => void;
}

// ============================================================================
// STORE
// ============================================================================

/** Fields that trigger dependent field cleanup when changed */
const TRIGGER_FIELDS = new Set([
	"role",
	"hasServiceConnectedDisability",
	"isCaregiver",
]);

export const useScreeningStore = create<ScreeningState>()(
	persist(
		(set) => ({
			// Initial state
			currentStep: 1,
			answers: {},
			isSubmitting: false,
			hasHydrated: false,

			setAnswer: (key, value) =>
				set((state) => {
					let updatedAnswers = { ...state.answers, [key]: value };

					// Clear dependent fields when trigger fields change
					if (TRIGGER_FIELDS.has(key)) {
						updatedAnswers = clearDependentFields(key, value, updatedAnswers);
					}

					return { answers: updatedAnswers };
				}),

			setAnswers: (updates) =>
				set((state) => {
					let updatedAnswers = { ...state.answers, ...updates };

					// Check each updated field for dependent cleanup
					for (const [key, value] of Object.entries(updates)) {
						if (TRIGGER_FIELDS.has(key)) {
							updatedAnswers = clearDependentFields(key, value, updatedAnswers);
						}
					}

					return { answers: updatedAnswers };
				}),

			nextStep: () =>
				set((state) => ({
					currentStep: Math.min(state.currentStep + 1, TOTAL_STEPS),
				})),

			prevStep: () =>
				set((state) => ({
					currentStep: Math.max(state.currentStep - 1, 1),
				})),

			goToStep: (step) =>
				set(() => ({
					currentStep: Math.max(1, Math.min(step, TOTAL_STEPS)),
				})),

			reset: () =>
				set(() => ({
					currentStep: 1,
					answers: {},
					isSubmitting: false,
				})),

			setSubmitting: (v) => set(() => ({ isSubmitting: v })),

			setHasHydrated: (v) => set(() => ({ hasHydrated: v })),
		}),
		{
			name: "vrm-screening-session",
			partialize: (state) => ({
				currentStep: state.currentStep,
				answers: state.answers,
			}),
			onRehydrateStorage: () => (state) => {
				state?.setHasHydrated(true);
			},
		},
	),
);
