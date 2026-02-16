/**
 * Dashboard Page
 *
 * Server Component displaying user's screening history, quick stats
 * (total screenings, bookmarks, action item progress), and navigation
 * to sub-pages. Auth guard is handled by the layout.
 */

import type { Metadata } from "next";
import Link from "next/link";
import {
	ArrowRight,
	Bookmark,
	CheckCircle,
	ClipboardList,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	getActionItemProgress,
	getScreeningHistory,
	getUserBookmarkCount,
} from "@/lib/db/dashboard-queries";
import type { ScreeningHistoryEntry } from "@/lib/db/dashboard-types";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
	title: "Your Dashboard | Veteran Resource Management",
	description:
		"View your screening history, saved resources, and action items.",
};

// ============================================================================
// CONFIDENCE BADGE HELPER
// ============================================================================

function ConfidenceBadge({ confidence }: { confidence: string }) {
	switch (confidence) {
		case "high":
			return (
				<Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
					Likely
				</Badge>
			);
		case "medium":
			return (
				<Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
					Possibly
				</Badge>
			);
		default:
			return (
				<Badge variant="secondary" className="text-xs">
					Worth Exploring
				</Badge>
			);
	}
}

// ============================================================================
// SCREENING HISTORY CARD
// ============================================================================

function ScreeningCard({ entry }: { entry: ScreeningHistoryEntry }) {
	const formattedDate = new Date(entry.created_at).toLocaleDateString(
		"en-US",
		{
			year: "numeric",
			month: "long",
			day: "numeric",
		},
	);

	const roleLabel =
		entry.role === "veteran"
			? "Veteran"
			: entry.role === "caregiver"
				? "Caregiver"
				: "Unknown";

	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between gap-3">
					<div>
						<CardTitle className="text-base">{formattedDate}</CardTitle>
						<Badge variant="outline" className="mt-1 text-xs">
							{roleLabel}
						</Badge>
					</div>
					<Button variant="ghost" size="sm" asChild>
						<Link href={`/screening/results/${entry.id}`}>
							View Results
							<ArrowRight className="h-4 w-4 ml-1" />
						</Link>
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				{entry.results.length === 0 ? (
					<p className="text-sm text-muted-foreground">No programs matched</p>
				) : (
					<div className="flex flex-wrap gap-2">
						{entry.results.map((result) => (
							<span
								key={result.program_name}
								className="inline-flex items-center gap-1.5"
							>
								<ConfidenceBadge confidence={result.confidence} />
								<span className="text-sm">{result.program_name}</span>
							</span>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

// ============================================================================
// PAGE
// ============================================================================

export default async function DashboardPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	// Auth guard is in layout, but TypeScript needs the check
	if (!user) return null;

	// Fetch dashboard data in parallel
	const [screenings, bookmarkCount, actionProgress] = await Promise.all([
		getScreeningHistory(user.id),
		getUserBookmarkCount(user.id),
		getActionItemProgress(user.id),
	]);

	const progressPercent =
		actionProgress.total > 0
			? Math.round((actionProgress.completed / actionProgress.total) * 100)
			: 0;

	return (
		<div className="max-w-4xl mx-auto px-4 py-8">
			{/* Welcome */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-1">Your Dashboard</h1>
				<p className="text-muted-foreground">
					Welcome back, {user.email}
				</p>
			</div>

			{/* Sub-page navigation */}
			<nav aria-label="Dashboard navigation" className="mb-8">
				<ul className="flex gap-4 border-b pb-2">
					<li>
						<span className="text-sm font-medium border-b-2 border-primary pb-2">
							Overview
						</span>
					</li>
					<li>
						<Link
							href="/dashboard/bookmarks"
							className="text-sm text-muted-foreground hover:text-foreground pb-2"
						>
							Saved Resources
						</Link>
					</li>
					<li>
						<Link
							href="/dashboard/action-items"
							className="text-sm text-muted-foreground hover:text-foreground pb-2"
						>
							Action Items
						</Link>
					</li>
				</ul>
			</nav>

			{/* Quick Stats */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-blue-50 rounded-lg">
								<ClipboardList className="h-5 w-5 text-blue-600" />
							</div>
							<div>
								<p className="text-2xl font-bold">{screenings.length}</p>
								<p className="text-sm text-muted-foreground">
									{screenings.length === 1 ? "Screening" : "Screenings"}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-purple-50 rounded-lg">
								<Bookmark className="h-5 w-5 text-purple-600" />
							</div>
							<div>
								<p className="text-2xl font-bold">{bookmarkCount}</p>
								<p className="text-sm text-muted-foreground">
									Saved Resources
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-green-50 rounded-lg">
								<CheckCircle className="h-5 w-5 text-green-600" />
							</div>
							<div>
								<p className="text-2xl font-bold">
									{actionProgress.completed}/{actionProgress.total}
								</p>
								<p className="text-sm text-muted-foreground">
									Action Items Done
								</p>
							</div>
						</div>
						{actionProgress.total > 0 && (
							<div className="mt-3">
								<div className="h-2 bg-gray-100 rounded-full overflow-hidden">
									<div
										className="h-full bg-green-500 rounded-full transition-all"
										style={{ width: `${progressPercent}%` }}
									/>
								</div>
								<p className="text-xs text-muted-foreground mt-1">
									{progressPercent}% complete
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			<Separator className="mb-8" />

			{/* Screening History */}
			<section>
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-xl font-semibold">Screening History</h2>
					<Button variant="outline" size="sm" asChild>
						<Link href="/screening">
							New Screening
							<ArrowRight className="h-4 w-4 ml-1" />
						</Link>
					</Button>
				</div>

				{screenings.length === 0 ? (
					<Card className="p-8 text-center">
						<ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
						<h3 className="text-lg font-medium mb-2">No screenings yet</h3>
						<p className="text-muted-foreground mb-4">
							Start your first screening to see which programs you may qualify
							for.
						</p>
						<Button asChild>
							<Link href="/screening">Start Your First Screening</Link>
						</Button>
					</Card>
				) : (
					<div className="space-y-4">
						{screenings.map((entry) => (
							<ScreeningCard key={entry.id} entry={entry} />
						))}
					</div>
				)}
			</section>
		</div>
	);
}
