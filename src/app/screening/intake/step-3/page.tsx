"use client";

/**
 * Step 3: Needs Assessment
 * Service-connected disability (veterans only), disability rating,
 * employment status, and household income.
 */

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ConditionalField } from "@/components/screening/ConditionalField";
import { QuestionCard } from "@/components/screening/QuestionCard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { screeningQuestions } from "@/content/screening-questions";
import { getStep3Schema } from "@/lib/screening/schemas";
import { useScreeningStore } from "@/lib/screening/store";

const step3Def = screeningQuestions[2]; // Step 3 definition

export default function Step3Page() {
	const router = useRouter();
	const answers = useScreeningStore((s) => s.answers);
	const setAnswers = useScreeningStore((s) => s.setAnswers);
	const goToStep = useScreeningStore((s) => s.goToStep);

	const [formState, setFormState] = useState<Record<string, string>>({
		hasServiceConnectedDisability:
			(answers.hasServiceConnectedDisability as string) || "",
		disabilityRating: (answers.disabilityRating as string) || "",
		employmentStatus: (answers.employmentStatus as string) || "",
		householdIncome: (answers.householdIncome as string) || "",
	});
	const [errors, setErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		goToStep(3);
		if (!answers.role) {
			router.replace("/screening/intake/step-1");
		}
	}, [goToStep, answers.role, router]);

	useEffect(() => {
		setFormState((prev) => ({
			hasServiceConnectedDisability:
				(answers.hasServiceConnectedDisability as string) ||
				prev.hasServiceConnectedDisability ||
				"",
			disabilityRating:
				(answers.disabilityRating as string) || prev.disabilityRating || "",
			employmentStatus:
				(answers.employmentStatus as string) || prev.employmentStatus || "",
			householdIncome:
				(answers.householdIncome as string) || prev.householdIncome || "",
		}));
	}, [
		answers.hasServiceConnectedDisability,
		answers.disabilityRating,
		answers.employmentStatus,
		answers.householdIncome,
	]);

	function updateField(key: string, value: string) {
		setFormState((prev) => {
			const updated = { ...prev, [key]: value };
			// If disability answer changes to not "yes", clear rating locally
			if (key === "hasServiceConnectedDisability" && value !== "yes") {
				updated.disabilityRating = "";
			}
			return updated;
		});
		setErrors((prev) => ({ ...prev, [key]: "" }));
	}

	function handleNext() {
		const role = answers.role as string;
		const schema = getStep3Schema(
			role,
			formState.hasServiceConnectedDisability,
		);
		const result = schema.safeParse(formState);

		if (!result.success) {
			const fieldErrors: Record<string, string> = {};
			for (const issue of result.error.issues) {
				const field = issue.path[0] as string;
				if (!fieldErrors[field]) {
					fieldErrors[field] = issue.message;
				}
			}
			setErrors(fieldErrors);
			return;
		}

		setAnswers(formState);
		router.push("/screening/intake/step-4");
	}

	function handleBack() {
		setAnswers(formState);
		router.push("/screening/intake/step-2");
	}

	const disabilityQuestion = step3Def.questions[0];
	const ratingQuestion = step3Def.questions[1];
	const employmentQuestion = step3Def.questions[2];
	const incomeQuestion = step3Def.questions[3];

	return (
		<div>
			<h2 className="text-2xl font-bold mb-2">{step3Def.title}</h2>
			<p className="text-muted-foreground mb-6">{step3Def.description}</p>

			{/* Service-connected disability - veterans only */}
			<ConditionalField fieldId="hasServiceConnectedDisability">
				<QuestionCard
					label={disabilityQuestion.label}
					helpText={disabilityQuestion.helpText}
					required={disabilityQuestion.required}
					error={errors.hasServiceConnectedDisability}
				>
					<RadioGroup
						value={formState.hasServiceConnectedDisability}
						onValueChange={(v) =>
							updateField("hasServiceConnectedDisability", v)
						}
						aria-required="true"
					>
						{disabilityQuestion.options.map((opt) => (
							<div key={opt.value} className="flex items-center gap-2">
								<RadioGroupItem
									value={opt.value}
									id={`disability-${opt.value}`}
								/>
								<Label htmlFor={`disability-${opt.value}`}>{opt.label}</Label>
							</div>
						))}
					</RadioGroup>
				</QuestionCard>
			</ConditionalField>

			{/* Disability rating - only when disability = yes (uses local form state
				 since this depends on a field on the same step, not ConditionalField
				 which reads from the store) */}
			{formState.hasServiceConnectedDisability === "yes" && (
				<div data-field-id="disabilityRating">
					<QuestionCard
						label={ratingQuestion.label}
						helpText={ratingQuestion.helpText}
						required={ratingQuestion.required}
						error={errors.disabilityRating}
					>
						<RadioGroup
							value={formState.disabilityRating}
							onValueChange={(v) => updateField("disabilityRating", v)}
							aria-required="true"
						>
							{ratingQuestion.options.map((opt) => (
								<div key={opt.value} className="flex items-center gap-2">
									<RadioGroupItem
										value={opt.value}
										id={`rating-${opt.value}`}
									/>
									<Label htmlFor={`rating-${opt.value}`}>{opt.label}</Label>
								</div>
							))}
						</RadioGroup>
					</QuestionCard>
				</div>
			)}

			{/* Employment status - always visible */}
			<QuestionCard
				label={employmentQuestion.label}
				required={employmentQuestion.required}
				error={errors.employmentStatus}
			>
				<RadioGroup
					value={formState.employmentStatus}
					onValueChange={(v) => updateField("employmentStatus", v)}
					aria-required="true"
				>
					{employmentQuestion.options.map((opt) => (
						<div key={opt.value} className="flex items-center gap-2">
							<RadioGroupItem value={opt.value} id={`emp-${opt.value}`} />
							<Label htmlFor={`emp-${opt.value}`}>{opt.label}</Label>
						</div>
					))}
				</RadioGroup>
			</QuestionCard>

			{/* Household income - always visible */}
			<QuestionCard
				label={incomeQuestion.label}
				helpText={incomeQuestion.helpText}
				required={incomeQuestion.required}
				error={errors.householdIncome}
			>
				<RadioGroup
					value={formState.householdIncome}
					onValueChange={(v) => updateField("householdIncome", v)}
					aria-required="true"
				>
					{incomeQuestion.options.map((opt) => (
						<div key={opt.value} className="flex items-center gap-2">
							<RadioGroupItem value={opt.value} id={`income-${opt.value}`} />
							<Label htmlFor={`income-${opt.value}`}>{opt.label}</Label>
						</div>
					))}
				</RadioGroup>
			</QuestionCard>

			<div className="flex justify-between mt-6">
				<Button variant="outline" onClick={handleBack}>
					Back
				</Button>
				<Button onClick={handleNext}>Next</Button>
			</div>
		</div>
	);
}
