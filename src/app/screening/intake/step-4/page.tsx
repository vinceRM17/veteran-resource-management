"use client";

/**
 * Step 4: Benefits & Priorities
 * Multi-select checkboxes for areas of need and current benefits.
 * Caregiver support option conditionally visible.
 */

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { QuestionCard } from "@/components/screening/QuestionCard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { screeningQuestions } from "@/content/screening-questions";
import { shouldShowCaregiverSupport } from "@/lib/screening/conditional-logic";
import { step4Schema } from "@/lib/screening/schemas";
import { useScreeningStore } from "@/lib/screening/store";

const step4Def = screeningQuestions[3]; // Step 4 definition

export default function Step4Page() {
	const router = useRouter();
	const answers = useScreeningStore((s) => s.answers);
	const setAnswers = useScreeningStore((s) => s.setAnswers);
	const goToStep = useScreeningStore((s) => s.goToStep);

	const [areasOfNeed, setAreasOfNeed] = useState<string[]>(
		(answers.areasOfNeed as string[]) || [],
	);
	const [currentBenefits, setCurrentBenefits] = useState<string[]>(
		(answers.currentBenefits as string[]) || [],
	);
	const [additionalInfo, setAdditionalInfo] = useState<string>(
		(answers.additionalInfo as string) || "",
	);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const showCaregiverOption = shouldShowCaregiverSupport(answers);

	useEffect(() => {
		goToStep(4);
		if (!answers.role) {
			router.replace("/screening/intake/step-1");
		}
	}, [goToStep, answers.role, router]);

	useEffect(() => {
		if (answers.areasOfNeed) {
			setAreasOfNeed(answers.areasOfNeed as string[]);
		}
		if (answers.currentBenefits) {
			setCurrentBenefits(answers.currentBenefits as string[]);
		}
		if (answers.additionalInfo) {
			setAdditionalInfo(answers.additionalInfo as string);
		}
	}, [answers.areasOfNeed, answers.currentBenefits, answers.additionalInfo]);

	function toggleArea(value: string) {
		setAreasOfNeed((prev) =>
			prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
		);
		setErrors((prev) => ({ ...prev, areasOfNeed: "" }));
	}

	function toggleBenefit(value: string) {
		setCurrentBenefits((prev) => {
			// "none" is exclusive
			if (value === "none") {
				return prev.includes("none") ? [] : ["none"];
			}
			// Selecting any other option removes "none"
			const withoutNone = prev.filter((v) => v !== "none");
			return withoutNone.includes(value)
				? withoutNone.filter((v) => v !== value)
				: [...withoutNone, value];
		});
	}

	function handleNext() {
		const result = step4Schema.safeParse({
			areasOfNeed,
			currentBenefits,
			additionalInfo,
		});
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

		setAnswers({ areasOfNeed, currentBenefits, additionalInfo });
		router.push("/screening/intake/review");
	}

	function handleBack() {
		setAnswers({ areasOfNeed, currentBenefits, additionalInfo });
		router.push("/screening/intake/step-3");
	}

	const areasQuestion = step4Def.questions[0];
	const benefitsQuestion = step4Def.questions[1];
	const additionalInfoQuestion = step4Def.questions[2];

	// Filter caregiver-support option based on role
	const areaOptions = areasQuestion.options.filter(
		(opt) => opt.value !== "caregiver-support" || showCaregiverOption,
	);

	return (
		<div>
			<h2 className="text-2xl font-bold mb-2">{step4Def.title}</h2>
			<p className="text-muted-foreground mb-6">{step4Def.description}</p>

			{/* Areas of need */}
			<QuestionCard
				label={areasQuestion.label}
				helpText={areasQuestion.helpText}
				required={areasQuestion.required}
				error={errors.areasOfNeed}
			>
				<fieldset className="space-y-3 border-0 p-0 m-0">
					<legend className="sr-only">{areasQuestion.label}</legend>
					{areaOptions.map((opt) => (
						<div key={opt.value} className="flex items-center gap-2">
							<Checkbox
								id={`area-${opt.value}`}
								checked={areasOfNeed.includes(opt.value)}
								onCheckedChange={() => toggleArea(opt.value)}
							/>
							<Label htmlFor={`area-${opt.value}`}>{opt.label}</Label>
						</div>
					))}
				</fieldset>
			</QuestionCard>

			{/* Current benefits */}
			<QuestionCard
				label={benefitsQuestion.label}
				helpText={benefitsQuestion.helpText}
				required={benefitsQuestion.required}
				error={errors.currentBenefits}
			>
				<fieldset className="space-y-3 border-0 p-0 m-0">
					<legend className="sr-only">{benefitsQuestion.label}</legend>
					{benefitsQuestion.options.map((opt) => (
						<div key={opt.value} className="flex items-center gap-2">
							<Checkbox
								id={`benefit-${opt.value}`}
								checked={currentBenefits.includes(opt.value)}
								onCheckedChange={() => toggleBenefit(opt.value)}
							/>
							<Label htmlFor={`benefit-${opt.value}`}>{opt.label}</Label>
						</div>
					))}
				</fieldset>
			</QuestionCard>

			{/* Additional info textarea */}
			<QuestionCard
				label={additionalInfoQuestion.label}
				helpText={additionalInfoQuestion.helpText}
				required={additionalInfoQuestion.required}
				error={errors.additionalInfo}
			>
				<textarea
					id="additionalInfo"
					value={additionalInfo}
					onChange={(e) => setAdditionalInfo(e.target.value)}
					maxLength={1000}
					rows={4}
					placeholder="Optional — share anything on your mind"
					aria-describedby="additionalInfo-help"
					className="w-full border border-gray-300 rounded-md p-3 text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
				/>
				{additionalInfoQuestion.helpText && (
					<p id="additionalInfo-help" className="sr-only">
						{additionalInfoQuestion.helpText}
					</p>
				)}
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
