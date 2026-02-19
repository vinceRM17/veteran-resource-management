"use client";

/**
 * Step 2: Location & Demographics
 * State selection, age range, and conditional questions based on role
 * (service era for veterans, caregiver status for caregivers).
 */

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ConditionalField } from "@/components/screening/ConditionalField";
import { QuestionCard } from "@/components/screening/QuestionCard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { screeningQuestions } from "@/content/screening-questions";
import { getStep2Schema } from "@/lib/screening/schemas";
import { useScreeningStore } from "@/lib/screening/store";

const step2Def = screeningQuestions[1]; // Step 2 definition

export default function Step2Page() {
	const router = useRouter();
	const answers = useScreeningStore((s) => s.answers);
	const setAnswers = useScreeningStore((s) => s.setAnswers);
	const goToStep = useScreeningStore((s) => s.goToStep);

	// Local form state
	const [formState, setFormState] = useState<Record<string, string>>({
		state: (answers.state as string) || "KY",
		zipCode: (answers.zipCode as string) || "",
		ageRange: (answers.ageRange as string) || "",
		serviceStartYear: (answers.serviceStartYear as string) || "",
		serviceEndYear: (answers.serviceEndYear as string) || "",
		isCaregiver: (answers.isCaregiver as string) || "",
	});
	const [errors, setErrors] = useState<Record<string, string>>({});

	// Sync step with URL and redirect if step 1 incomplete
	useEffect(() => {
		goToStep(2);
		if (!answers.role) {
			router.replace("/screening/intake/step-1");
		}
	}, [goToStep, answers.role, router]);

	// Re-sync local state when store answers change (e.g., after hydration)
	useEffect(() => {
		setFormState((prev) => ({
			state: (answers.state as string) || prev.state || "KY",
			zipCode: (answers.zipCode as string) || prev.zipCode || "",
			ageRange: (answers.ageRange as string) || prev.ageRange || "",
			serviceStartYear:
				(answers.serviceStartYear as string) || prev.serviceStartYear || "",
			serviceEndYear:
				(answers.serviceEndYear as string) || prev.serviceEndYear || "",
			isCaregiver: (answers.isCaregiver as string) || prev.isCaregiver || "",
		}));
	}, [
		answers.state,
		answers.zipCode,
		answers.ageRange,
		answers.serviceStartYear,
		answers.serviceEndYear,
		answers.isCaregiver,
	]);

	function updateField(key: string, value: string) {
		setFormState((prev) => ({ ...prev, [key]: value }));
		setErrors((prev) => ({ ...prev, [key]: "" }));
	}

	function handleNext() {
		const role = answers.role as string;
		const schema = getStep2Schema(role);
		// Strip empty strings to undefined so .optional() fields pass validation
		const cleaned: Record<string, string | undefined> = {};
		for (const [k, v] of Object.entries(formState)) {
			cleaned[k] = v === "" ? undefined : v;
		}
		const result = schema.safeParse(cleaned);

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
		router.push("/screening/intake/step-3");
	}

	function handleBack() {
		// Save partial progress before going back
		setAnswers(formState);
		router.push("/screening/intake/step-1");
	}

	const stateQuestion = step2Def.questions[0];
	const zipCodeQuestion = step2Def.questions[1];
	const ageQuestion = step2Def.questions[2];
	const serviceYearsQuestion = step2Def.questions[3];
	const isCaregiverQuestion = step2Def.questions[4];

	return (
		<div>
			<h2 className="text-2xl font-bold mb-2">{step2Def.title}</h2>
			<p className="text-muted-foreground mb-6">{step2Def.description}</p>

			{/* State selection */}
			<QuestionCard
				label={stateQuestion.label}
				helpText={stateQuestion.helpText}
				required={stateQuestion.required}
				error={errors.state}
			>
				<Select
					value={formState.state}
					onValueChange={(v) => updateField("state", v)}
				>
					<SelectTrigger aria-label="Select your state" aria-required="true">
						<SelectValue placeholder="Pick a state" />
					</SelectTrigger>
					<SelectContent>
						{stateQuestion.options.map((opt) => (
							<SelectItem key={opt.value} value={opt.value}>
								{opt.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</QuestionCard>

			{/* Zip code */}
			<QuestionCard
				label={zipCodeQuestion.label}
				helpText={zipCodeQuestion.helpText}
				required={zipCodeQuestion.required}
				error={errors.zipCode}
			>
				<input
					id="zipCode"
					type="text"
					inputMode="numeric"
					maxLength={5}
					placeholder="e.g. 40202"
					value={formState.zipCode}
					onChange={(e) =>
						updateField("zipCode", e.target.value.replace(/\D/g, ""))
					}
					className="flex h-10 w-full max-w-[10rem] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
				/>
			</QuestionCard>

			{/* Age range */}
			<QuestionCard
				label={ageQuestion.label}
				required={ageQuestion.required}
				error={errors.ageRange}
			>
				<RadioGroup
					value={formState.ageRange}
					onValueChange={(v) => updateField("ageRange", v)}
					aria-required="true"
				>
					{ageQuestion.options.map((opt) => (
						<div key={opt.value} className="flex items-center gap-2">
							<RadioGroupItem value={opt.value} id={`age-${opt.value}`} />
							<Label htmlFor={`age-${opt.value}`}>{opt.label}</Label>
						</div>
					))}
				</RadioGroup>
			</QuestionCard>

			{/* Service years - veterans only */}
			<ConditionalField fieldId="serviceYears">
				<QuestionCard
					label={serviceYearsQuestion.label}
					helpText={serviceYearsQuestion.helpText}
					required={serviceYearsQuestion.required}
					error={errors.serviceStartYear || errors.serviceEndYear}
				>
					<div className="flex items-center gap-3">
						<div className="flex-1">
							<Label htmlFor="serviceStartYear">Start year</Label>
							<input
								id="serviceStartYear"
								type="text"
								inputMode="numeric"
								maxLength={4}
								placeholder="e.g. 1990"
								value={formState.serviceStartYear}
								onChange={(e) =>
									updateField("serviceStartYear", e.target.value.replace(/\D/g, ""))
								}
								aria-required="true"
								className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							/>
							{errors.serviceStartYear && (
								<p className="text-sm text-destructive mt-1">
									{errors.serviceStartYear}
								</p>
							)}
						</div>
						<span className="mt-6 text-muted-foreground">to</span>
						<div className="flex-1">
							<Label htmlFor="serviceEndYear">End year</Label>
							<input
								id="serviceEndYear"
								type="text"
								inputMode="numeric"
								maxLength={4}
								placeholder="e.g. 1994"
								value={formState.serviceEndYear}
								onChange={(e) =>
									updateField("serviceEndYear", e.target.value.replace(/\D/g, ""))
								}
								aria-required="true"
								className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							/>
							{errors.serviceEndYear && (
								<p className="text-sm text-destructive mt-1">
									{errors.serviceEndYear}
								</p>
							)}
						</div>
					</div>
				</QuestionCard>
			</ConditionalField>

			{/* Caregiver status - caregivers only */}
			<ConditionalField fieldId="isCaregiver">
				<QuestionCard
					label={isCaregiverQuestion.label}
					helpText={isCaregiverQuestion.helpText}
					required={isCaregiverQuestion.required}
					error={errors.isCaregiver}
				>
					<RadioGroup
						value={formState.isCaregiver}
						onValueChange={(v) => updateField("isCaregiver", v)}
						aria-required="true"
					>
						{isCaregiverQuestion.options.map((opt) => (
							<div key={opt.value} className="flex items-center gap-2">
								<RadioGroupItem value={opt.value} id={`cg-${opt.value}`} />
								<Label htmlFor={`cg-${opt.value}`}>{opt.label}</Label>
							</div>
						))}
					</RadioGroup>
				</QuestionCard>
			</ConditionalField>

			<div className="flex justify-between mt-6">
				<Button variant="outline" onClick={handleBack}>
					Back
				</Button>
				<Button onClick={handleNext}>Next</Button>
			</div>
		</div>
	);
}
