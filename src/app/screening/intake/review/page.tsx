"use client";

/**
 * Step 5: Review Answers
 * Displays all answers organized by step with edit links.
 * Submits screening to eligibility engine via server action.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { submitScreening } from "@/app/screening/actions";
import { CrisisIntercept } from "@/components/crisis/CrisisIntercept";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { screeningQuestions } from "@/content/screening-questions";
import {
	shouldShowCaregiverSupport,
	shouldShowField,
} from "@/lib/screening/conditional-logic";
import { useScreeningStore } from "@/lib/screening/store";

/**
 * Finds the human-readable label for a given answer value in a question's options.
 */
function getLabel(questionId: string, value: unknown, step: number): string {
	const stepDef = screeningQuestions[step - 1];
	if (!stepDef) return String(value);

	const question = stepDef.questions.find((q) => q.id === questionId);
	if (!question) return String(value);

	if (Array.isArray(value)) {
		return value
			.map((v) => {
				const opt = question.options.find((o) => o.value === v);
				return opt ? opt.label : v;
			})
			.join(", ");
	}

	const opt = question.options.find((o) => o.value === value);
	return opt ? opt.label : String(value);
}

interface ReviewSectionProps {
	title: string;
	stepPath: string;
	items: { label: string; value: string }[];
}

function ReviewSection({ title, stepPath, items }: ReviewSectionProps) {
	if (items.length === 0) return null;

	return (
		<Card className="mb-4">
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<CardTitle className="text-lg">{title}</CardTitle>
				<Link
					href={stepPath}
					className="text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
				>
					Edit
				</Link>
			</CardHeader>
			<CardContent>
				<dl className="space-y-2">
					{items.map((item) => (
						<div key={item.label}>
							<dt className="text-sm text-muted-foreground">{item.label}</dt>
							<dd className="text-sm font-medium">{item.value}</dd>
						</div>
					))}
				</dl>
			</CardContent>
		</Card>
	);
}

export default function ReviewPage() {
	const router = useRouter();
	const answers = useScreeningStore((s) => s.answers);
	const goToStep = useScreeningStore((s) => s.goToStep);
	const reset = useScreeningStore((s) => s.reset);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [showCrisisIntercept, setShowCrisisIntercept] = useState(false);
	const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);
	const [isNavigating, setIsNavigating] = useState(false);

	useEffect(() => {
		goToStep(5);
		// Only redirect if not submitting/navigating — reset() clears answers.role during submission
		if (!answers.role && !isSubmitting && !isNavigating) {
			router.replace("/screening/intake/step-1");
		}
	}, [goToStep, answers.role, router, isSubmitting, isNavigating]);

	// Build review sections based on what's visible
	const step1Items = [
		{ label: "Who you are", value: getLabel("role", answers.role, 1) },
	];

	const step2Items = [
		{ label: "State", value: getLabel("state", answers.state, 2) },
		{
			label: "Age range",
			value: getLabel("ageRange", answers.ageRange, 2),
		},
	];

	if (shouldShowField("serviceEra", answers) && answers.serviceEra) {
		step2Items.push({
			label: "Service era",
			value: getLabel("serviceEra", answers.serviceEra, 2),
		});
	}

	if (shouldShowField("isCaregiver", answers) && answers.isCaregiver) {
		step2Items.push({
			label: "Caregiver",
			value: getLabel("isCaregiver", answers.isCaregiver, 2),
		});
	}

	const step3Items = [];

	if (
		shouldShowField("hasServiceConnectedDisability", answers) &&
		answers.hasServiceConnectedDisability
	) {
		step3Items.push({
			label: "Service-connected disability",
			value: getLabel(
				"hasServiceConnectedDisability",
				answers.hasServiceConnectedDisability,
				3,
			),
		});
	}

	if (
		answers.hasServiceConnectedDisability === "yes" &&
		answers.disabilityRating
	) {
		step3Items.push({
			label: "Disability rating",
			value: getLabel("disabilityRating", answers.disabilityRating, 3),
		});
	}

	if (answers.employmentStatus) {
		step3Items.push({
			label: "Employment",
			value: getLabel("employmentStatus", answers.employmentStatus, 3),
		});
	}

	if (answers.householdIncome) {
		step3Items.push({
			label: "Household income",
			value: getLabel("householdIncome", answers.householdIncome, 3),
		});
	}

	const step4Items = [];

	if (answers.areasOfNeed && (answers.areasOfNeed as string[]).length > 0) {
		// Filter out caregiver-support if not applicable
		const areas = (answers.areasOfNeed as string[]).filter(
			(a) => a !== "caregiver-support" || shouldShowCaregiverSupport(answers),
		);
		step4Items.push({
			label: "Areas you need help with",
			value: getLabel("areasOfNeed", areas, 4),
		});
	}

	if (
		answers.currentBenefits &&
		(answers.currentBenefits as string[]).length > 0
	) {
		step4Items.push({
			label: "Benefits you already have",
			value: getLabel("currentBenefits", answers.currentBenefits, 4),
		});
	}

	if (
		answers.additionalInfo &&
		typeof answers.additionalInfo === "string" &&
		answers.additionalInfo.trim()
	) {
		step4Items.push({
			label: "Additional information",
			value: answers.additionalInfo as string,
		});
	}

	function handleCrisisDismiss() {
		setShowCrisisIntercept(false);
		if (pendingSessionId) {
			setIsNavigating(true);
			reset();
			router.push(`/screening/results/${pendingSessionId}`);
		}
	}

	async function handleSubmit() {
		setIsSubmitting(true);
		setSubmitError(null);

		const result = await submitScreening(answers as Record<string, unknown>);

		if (result.error) {
			setSubmitError(result.error);
			setIsSubmitting(false);
			return;
		}

		if (result.crisisDetected && result.sessionId) {
			// Crisis detected: show intercept modal
			setPendingSessionId(result.sessionId);
			setShowCrisisIntercept(true);
			setIsSubmitting(false);
		} else if (result.sessionId) {
			// No crisis: proceed normally
			setIsNavigating(true);
			reset();
			router.push(`/screening/results/${result.sessionId}`);
		}
	}

	function handleBack() {
		router.push("/screening/intake/step-4");
	}

	return (
		<>
			{showCrisisIntercept && (
				<CrisisIntercept
					onDismiss={handleCrisisDismiss}
					sessionId={pendingSessionId ?? undefined}
				/>
			)}

			<div>
				<h2 className="text-2xl font-bold mb-2">Review Your Answers</h2>
			<p className="text-muted-foreground mb-6">
				Please check your answers below. You can go back to change anything.
			</p>

			<ReviewSection
				title="About You"
				stepPath="/screening/intake/step-1"
				items={step1Items}
			/>
			<ReviewSection
				title="Where You Live"
				stepPath="/screening/intake/step-2"
				items={step2Items}
			/>
			<ReviewSection
				title="Your Situation"
				stepPath="/screening/intake/step-3"
				items={step3Items}
			/>
			<ReviewSection
				title="What You Need"
				stepPath="/screening/intake/step-4"
				items={step4Items}
			/>

			<Separator className="my-6" />

			{submitError && (
				<div
					role="alert"
					className="mb-4 rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive"
				>
					{submitError}
				</div>
			)}

			<div className="flex justify-between">
				<Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
					Back
				</Button>
				<Button onClick={handleSubmit} disabled={isSubmitting}>
					{isSubmitting ? "Processing your answers..." : "Submit"}
				</Button>
			</div>
		</div>
		</>
	);
}
