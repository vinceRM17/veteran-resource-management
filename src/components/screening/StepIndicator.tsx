"use client";

/**
 * Visual progress indicator for the multi-step screening form.
 * Shows steps 1-5 with labels, highlighting current and completed steps.
 *
 * Accessibility: aria-current="step" on current, descriptive aria-labels.
 * Responsive: circles only on mobile, full labels on md+.
 */

import { cn } from "@/lib/utils";

const STEP_LABELS = ["Role", "About You", "Your Needs", "Benefits", "Review"];

interface StepIndicatorProps {
	currentStep: number;
	totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
	return (
		<nav aria-label="Screening progress" className="w-full py-4">
			<ol className="flex items-center justify-between">
				{STEP_LABELS.slice(0, totalSteps).map((label, index) => {
					const stepNumber = index + 1;
					const isCompleted = stepNumber < currentStep;
					const isCurrent = stepNumber === currentStep;
					const isFuture = stepNumber > currentStep;

					return (
						<li
							key={stepNumber}
							className="flex flex-1 flex-col items-center gap-1"
							aria-current={isCurrent ? "step" : undefined}
							aria-label={`Step ${stepNumber}: ${label}${isCompleted ? " (completed)" : isCurrent ? " (current)" : ""}`}
						>
							{/* Step circle */}
							<div
								className={cn(
									"flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors",
									isCompleted && "bg-primary text-primary-foreground",
									isCurrent &&
										"bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2",
									isFuture && "bg-muted text-muted-foreground",
								)}
							>
								{isCompleted ? (
									<svg
										className="h-4 w-4"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										strokeWidth={3}
										aria-hidden="true"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M5 13l4 4L19 7"
										/>
									</svg>
								) : (
									stepNumber
								)}
							</div>

							{/* Step label - hidden on mobile */}
							<span
								className={cn(
									"hidden text-xs md:block",
									isCompleted && "font-medium text-primary",
									isCurrent && "font-bold text-primary",
									isFuture && "text-muted-foreground",
								)}
							>
								{label}
							</span>
						</li>
					);
				})}
			</ol>
		</nav>
	);
}
