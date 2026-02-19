"use client";

/**
 * Benefit Interaction Warning Components
 *
 * Shown on the screening results page when multiple matched programs have
 * known interactions that may reduce or eliminate each other's benefits.
 *
 * InteractionWarningCard — renders a single interaction warning
 * InteractionWarningBanner — wraps multiple cards in a prominent alert section
 */

import { AlertTriangle, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BenefitInteraction } from "@/lib/eligibility/interaction-types";

// ============================================================================
// PROGRAM NAME MAP
// ============================================================================

const PROGRAM_NAMES: Record<string, string> = {
	ssi: "SSI",
	"snap-ky": "SNAP",
	"medicaid-ky": "Medicaid",
	"va-disability-compensation": "VA Disability Compensation",
	"va-pension": "VA Pension",
	"va-healthcare": "VA Healthcare",
};

function getProgramName(programId: string): string {
	return PROGRAM_NAMES[programId] ?? programId;
}

// ============================================================================
// INTERACTION WARNING CARD
// ============================================================================

interface InteractionWarningCardProps {
	interaction: BenefitInteraction;
}

export function InteractionWarningCard({
	interaction,
}: InteractionWarningCardProps) {
	const isHigh = interaction.severity === "high";

	const borderClass = isHigh
		? "border-red-300 border-2"
		: "border-amber-300 border-2";

	const iconClass = isHigh ? "text-red-500" : "text-amber-500";

	const recommendationBg = isHigh ? "bg-red-50" : "bg-amber-50";

	return (
		<Card className={`mb-4 ${borderClass}`}>
			<CardHeader className="pb-3">
				<div className="flex items-start gap-3">
					<AlertTriangle
						className={`h-5 w-5 mt-0.5 shrink-0 ${iconClass}`}
						aria-hidden="true"
					/>
					<div className="flex-1">
						<CardTitle className="text-base font-semibold">
							{interaction.title}
						</CardTitle>
						{/* Program badges */}
						<div className="flex flex-wrap gap-1.5 mt-2">
							{interaction.programIds.map((id) => (
								<Badge key={id} variant="secondary" className="text-xs">
									{getProgramName(id)}
								</Badge>
							))}
						</div>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-3">
				{/* Plain-language description */}
				<p className="text-sm text-muted-foreground">{interaction.description}</p>

				{/* Recommendation */}
				<div className={`rounded-md p-3 ${recommendationBg}`}>
					<p className="text-sm">
						<span className="font-semibold">Recommendation: </span>
						{interaction.recommendation}
					</p>
				</div>

				{/* Learn more link */}
				{interaction.learnMoreUrl && (
					<a
						href={interaction.learnMoreUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-1 text-sm text-primary underline hover:text-primary/80"
					>
						Learn more
						<ExternalLink className="h-3 w-3" aria-hidden="true" />
					</a>
				)}
			</CardContent>
		</Card>
	);
}

// ============================================================================
// INTERACTION WARNING BANNER
// ============================================================================

interface InteractionWarningBannerProps {
	interactions: BenefitInteraction[];
}

export function InteractionWarningBanner({
	interactions,
}: InteractionWarningBannerProps) {
	if (interactions.length === 0) {
		return null;
	}

	return (
		<section
			role="alert"
			aria-label="Benefit interaction warnings"
			className="rounded-lg border-2 border-amber-300 bg-amber-50/50 p-6"
		>
			{/* Header */}
			<div className="flex items-start gap-3 mb-4">
				<AlertTriangle
					className="h-6 w-6 text-amber-600 shrink-0 mt-0.5"
					aria-hidden="true"
				/>
				<div>
					<h2 className="text-lg font-bold text-amber-900">
						Important: Benefit Interactions Detected
					</h2>
					<p className="text-sm text-amber-800 mt-1">
						Some of the programs you may qualify for can affect each other.
						Review these warnings before applying.
					</p>
				</div>
			</div>

			{/* Warning cards */}
			<div className="space-y-0">
				{interactions.map((interaction) => (
					<InteractionWarningCard
						key={`${interaction.programIds.join("-")}-${interaction.title}`}
						interaction={interaction}
					/>
				))}
			</div>

			{/* Footer note */}
			<p className="text-xs text-amber-700 mt-4 border-t border-amber-200 pt-4">
				These warnings are for informational purposes. A benefits counselor can
				help you understand the full impact. Call{" "}
				<span className="font-medium">1-855-459-6328</span> (Kentucky DCBS) or
				contact a Veterans Service Organization.
			</p>
		</section>
	);
}
