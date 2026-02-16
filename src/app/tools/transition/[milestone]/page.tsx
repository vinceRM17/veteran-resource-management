import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { transitionChecklists } from "@/content/transition-checklists";
import { getChecklistProgress } from "@/lib/db/checklist-actions";
import { createClient } from "@/lib/supabase/server";
import { ChecklistItemRow } from "@/components/tools/ChecklistItemRow";

interface MilestonePageProps {
	params: Promise<{ milestone: string }>;
}

export async function generateStaticParams() {
	return transitionChecklists.map((milestone) => ({
		milestone: milestone.slug,
	}));
}

export async function generateMetadata({
	params,
}: MilestonePageProps): Promise<Metadata> {
	const { milestone: milestoneSlug } = await params;
	const milestone = transitionChecklists.find((m) => m.slug === milestoneSlug);

	if (!milestone) {
		return {
			title: "Milestone Not Found | Veteran Resource Management",
		};
	}

	return {
		title: `${milestone.name} Checklist | Veteran Resource Management`,
		description: milestone.description,
	};
}

export default async function MilestonePage({ params }: MilestonePageProps) {
	const { milestone: milestoneSlug } = await params;
	const milestone = transitionChecklists.find((m) => m.slug === milestoneSlug);

	if (!milestone) {
		notFound();
	}

	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	const isAuthenticated = !!user;

	const progress = await getChecklistProgress(milestone.slug);

	// Calculate progress
	const completedCount = Object.values(progress).filter(Boolean).length;
	const totalCount = milestone.items.length;
	const progressPercent =
		totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

	// Find first unchecked item for login hint
	const firstUncheckedIndex = milestone.items.findIndex(
		(item) => !progress[item.title],
	);

	return (
		<div className="container mx-auto px-4 py-8 max-w-3xl">
			<div className="mb-6">
				<Link
					href="/tools/transition"
					className="text-blue-600 hover:underline text-sm"
				>
					← Back to Transition Checklists
				</Link>
			</div>

			{!isAuthenticated && (
				<div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
					<p className="text-sm text-blue-900">
						<strong>Log in to save your progress.</strong>{" "}
						<Link
							href={`/login?next=/tools/transition/${milestone.slug}`}
							className="underline hover:text-blue-700"
						>
							Log in
						</Link>{" "}
						or{" "}
						<Link
							href={`/signup?next=/tools/transition/${milestone.slug}`}
							className="underline hover:text-blue-700"
						>
							sign up
						</Link>{" "}
						to track your checklist progress.
					</p>
				</div>
			)}

			<div className="mb-8">
				<div className="flex items-center gap-2 mb-3">
					<Calendar className="h-5 w-5 text-blue-600" />
					<span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
						{milestone.timeframe}
					</span>
				</div>
				<h1 className="text-4xl font-bold mb-4">{milestone.name}</h1>
				<p className="text-lg text-muted-foreground">{milestone.description}</p>
			</div>

			{isAuthenticated && completedCount > 0 && (
				<Card className="mb-8">
					<CardContent className="py-4">
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm font-medium">Progress</span>
							<span className="text-sm text-muted-foreground">
								{completedCount} of {totalCount} complete ({progressPercent}%)
							</span>
						</div>
						<div
							className="w-full h-3 bg-gray-200 rounded-full overflow-hidden"
							role="progressbar"
							aria-valuenow={progressPercent}
							aria-valuemin={0}
							aria-valuemax={100}
							aria-label={`${progressPercent}% of checklist items complete`}
						>
							<div
								className="h-full bg-green-500 rounded-full transition-all duration-300"
								style={{ width: `${progressPercent}%` }}
							/>
						</div>
					</CardContent>
				</Card>
			)}

			<div className="space-y-6">
				{milestone.items.map((item, index) => (
					<ChecklistItemRow
						key={item.id}
						milestoneSlug={milestone.slug}
						item={item}
						initialChecked={progress[item.title] || false}
						isAuthenticated={isAuthenticated}
						showLoginHint={!isAuthenticated && index === firstUncheckedIndex}
					/>
				))}
			</div>

			<div className="mt-12 p-4 bg-gray-50 border border-gray-200 rounded-lg">
				<p className="text-sm text-muted-foreground">
					<strong>Need help right now?</strong> Call the Veterans Crisis Line
					at{" "}
					<a href="tel:988" className="text-blue-600 underline">
						988
					</a>{" "}
					then press 1, or text{" "}
					<a href="sms:838255" className="text-blue-600 underline">
						838255
					</a>
					. Support is available 24/7.
				</p>
			</div>
		</div>
	);
}
