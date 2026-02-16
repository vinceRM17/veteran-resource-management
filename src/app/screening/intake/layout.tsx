"use client";

/**
 * Intake layout wrapping all screening step pages.
 * Renders the StepIndicator and handles hydration loading state.
 */

import type { ReactNode } from "react";
import { StepIndicator } from "@/components/screening/StepIndicator";
import { TOTAL_STEPS } from "@/content/screening-questions";
import { useScreeningStore } from "@/lib/screening/store";

export default function IntakeLayout({ children }: { children: ReactNode }) {
	const currentStep = useScreeningStore((s) => s.currentStep);
	const hasHydrated = useScreeningStore((s) => s.hasHydrated);

	if (!hasHydrated) {
		return (
			<div className="container mx-auto max-w-2xl px-4 py-8">
				<div className="animate-pulse space-y-4">
					<div className="h-10 bg-muted rounded" />
					<div className="h-64 bg-muted rounded" />
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-2xl px-4 py-8">
			<StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />
			<div className="mt-6">{children}</div>
		</div>
	);
}
