"use client";

/**
 * SaveResultsCTA - Call to action for saving screening results to an account.
 *
 * Shows different states depending on the user's authentication and session ownership:
 * - Not logged in: Sign up / Log in prompt
 * - Logged in but session unclaimed: "Save to My Account" button
 * - Already claimed: Confirmation with link to dashboard
 */

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, LogIn, Save, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	claimGuestSession,
	createActionItemsFromResults,
} from "@/app/screening/actions";

interface SaveResultsCTAProps {
	sessionId: string;
	isLoggedIn: boolean;
	isAlreadyClaimed: boolean;
}

export function SaveResultsCTA({
	sessionId,
	isLoggedIn,
	isAlreadyClaimed,
}: SaveResultsCTAProps) {
	const [isSaving, setIsSaving] = useState(false);
	const [isSaved, setIsSaved] = useState(isAlreadyClaimed);
	const [error, setError] = useState<string | null>(null);

	async function handleSave() {
		setIsSaving(true);
		setError(null);

		try {
			const claimResult = await claimGuestSession(sessionId);
			if (!claimResult.success) {
				setError(claimResult.error || "Unable to save results.");
				setIsSaving(false);
				return;
			}

			// Create action items from screening results
			await createActionItemsFromResults(sessionId);

			setIsSaved(true);
		} catch {
			setError("Something went wrong. Please try again.");
		} finally {
			setIsSaving(false);
		}
	}

	// Already saved state
	if (isSaved) {
		return (
			<Card className="my-8 border-green-200 bg-green-50">
				<CardContent className="pt-6">
					<div className="flex items-center gap-3">
						<CheckCircle className="h-6 w-6 text-green-600 shrink-0" />
						<div className="flex-1">
							<p className="font-medium text-green-800">
								Results saved to your account
							</p>
							<p className="text-sm text-green-700">
								View your screening history and track action items on your
								dashboard.
							</p>
						</div>
						<Button variant="outline" size="sm" asChild>
							<Link href="/dashboard">Go to Dashboard</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	// Logged in but not claimed
	if (isLoggedIn) {
		return (
			<Card className="my-8 border-primary/20 bg-primary/5">
				<CardContent className="pt-6">
					<div className="flex items-center gap-3">
						<Save className="h-6 w-6 text-primary shrink-0" />
						<div className="flex-1">
							<p className="font-medium text-primary">
								Save these results to your account
							</p>
							<p className="text-sm text-primary/80">
								Track your action items and revisit your results anytime.
							</p>
						</div>
						<Button
							onClick={handleSave}
							disabled={isSaving}
							size="sm"
						>
							{isSaving ? "Saving..." : "Save to My Account"}
						</Button>
					</div>
					{error && (
						<p className="text-sm text-red-600 mt-2">{error}</p>
					)}
				</CardContent>
			</Card>
		);
	}

	// Not logged in
	return (
		<Card className="my-8 border-primary/20 bg-gradient-to-r from-primary/5 to-accent">
			<CardContent className="pt-6">
				<div className="space-y-3">
					<h3 className="text-lg font-semibold">Save Your Results</h3>
					<p className="text-sm text-muted-foreground">
						Create a free account to save your screening results, track action
						steps, and bookmark resources.
					</p>
					<div className="flex flex-col sm:flex-row gap-3">
						<Button asChild>
							<Link
								href={`/signup?next=/dashboard&sessionId=${sessionId}`}
							>
								<UserPlus className="h-4 w-4 mr-2" />
								Sign Up to Save
							</Link>
						</Button>
						<Button variant="outline" asChild>
							<Link
								href={`/login?next=/screening/results/${sessionId}`}
							>
								<LogIn className="h-4 w-4 mr-2" />
								Log In
							</Link>
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
