"use client";

/**
 * Step 1: Role Selection
 * User picks whether they are a veteran or supporting a veteran.
 * Large clickable cards act as radio buttons.
 */

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { step1Schema } from "@/lib/screening/schemas";
import { useScreeningStore } from "@/lib/screening/store";
import { cn } from "@/lib/utils";

export default function Step1Page() {
	const router = useRouter();
	const answers = useScreeningStore((s) => s.answers);
	const setAnswer = useScreeningStore((s) => s.setAnswer);
	const goToStep = useScreeningStore((s) => s.goToStep);

	const [selectedRole, setSelectedRole] = useState<string>(
		(answers.role as string) || "",
	);
	const [error, setError] = useState("");

	// Keep store step in sync with URL
	useEffect(() => {
		goToStep(1);
	}, [goToStep]);

	// Pre-fill from store on mount
	useEffect(() => {
		if (answers.role) {
			setSelectedRole(answers.role as string);
		}
	}, [answers.role]);

	function handleSelect(role: string) {
		setSelectedRole(role);
		setError("");
	}

	function handleNext() {
		const result = step1Schema.safeParse({ role: selectedRole });
		if (!result.success) {
			setError(result.error.issues[0]?.message || "Please make a selection.");
			return;
		}

		setAnswer("role", selectedRole);
		router.push("/screening/intake/step-2");
	}

	return (
		<div>
			<h2 className="text-2xl font-bold mb-2">Who are you?</h2>
			<p className="text-muted-foreground mb-6">
				This helps us show you the right programs. Pick the one that fits you
				best.
			</p>

			<div className="grid gap-4 mb-6">
				<button
					type="button"
					onClick={() => handleSelect("veteran")}
					className="text-left w-full"
					aria-pressed={selectedRole === "veteran"}
				>
					<Card
						className={cn(
							"cursor-pointer transition-colors hover:border-primary",
							selectedRole === "veteran" &&
								"border-primary bg-primary/5 ring-2 ring-primary",
						)}
					>
						<CardContent className="pt-6">
							<div className="flex items-center gap-3">
								<div
									className={cn(
										"flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
										selectedRole === "veteran"
											? "border-primary bg-primary"
											: "border-muted-foreground",
									)}
								>
									{selectedRole === "veteran" && (
										<div className="h-2 w-2 rounded-full bg-white" />
									)}
								</div>
								<div>
									<p className="font-semibold text-base">I am a veteran</p>
									<p className="text-sm text-muted-foreground">
										I served in the military and want to find benefits for
										myself.
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</button>

				<button
					type="button"
					onClick={() => handleSelect("caregiver")}
					className="text-left w-full"
					aria-pressed={selectedRole === "caregiver"}
				>
					<Card
						className={cn(
							"cursor-pointer transition-colors hover:border-primary",
							selectedRole === "caregiver" &&
								"border-primary bg-primary/5 ring-2 ring-primary",
						)}
					>
						<CardContent className="pt-6">
							<div className="flex items-center gap-3">
								<div
									className={cn(
										"flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
										selectedRole === "caregiver"
											? "border-primary bg-primary"
											: "border-muted-foreground",
									)}
								>
									{selectedRole === "caregiver" && (
										<div className="h-2 w-2 rounded-full bg-white" />
									)}
								</div>
								<div>
									<p className="font-semibold text-base">
										I am helping a veteran
									</p>
									<p className="text-sm text-muted-foreground">
										I am a family member, caregiver, or friend looking for help
										for a veteran.
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</button>
			</div>

			{error && (
				<p
					className="text-sm text-destructive mb-4"
					role="alert"
					aria-live="assertive"
				>
					{error}
				</p>
			)}

			<div className="flex justify-end">
				<Button onClick={handleNext} disabled={!selectedRole}>
					Next
				</Button>
			</div>
		</div>
	);
}
