import type { Metadata } from "next";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { transitionChecklists } from "@/content/transition-checklists";

export const metadata: Metadata = {
	title: "Transition Planning Checklists | Veteran Resource Management",
	description:
		"Milestone-based checklists for separating service members. Stay on track with your transition to civilian life.",
};

export default function TransitionChecklistsPage() {
	return (
		<div className="container mx-auto px-4 py-8 max-w-5xl">
			<div className="mb-6">
				<Link
					href="/tools"
					className="text-blue-600 hover:underline text-sm"
				>
					← Back to Tools
				</Link>
			</div>

			<div className="mb-8">
				<h1 className="text-4xl font-bold mb-4">
					Transition Planning Checklists
				</h1>
				<p className="text-lg text-muted-foreground">
					Leaving the military? Use these checklists to stay on track. Each
					milestone covers what you need to do before your separation date.
				</p>
			</div>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{transitionChecklists.map((milestone) => (
					<Card key={milestone.slug} className="hover:shadow-lg transition-shadow">
						<CardHeader>
							<div className="flex items-center gap-2 mb-2">
								<Calendar className="h-5 w-5 text-blue-600" />
								<span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
									{milestone.timeframe}
								</span>
							</div>
							<CardTitle className="text-xl">{milestone.name}</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground mb-4">
								{milestone.description}
							</p>
							<p className="text-xs text-muted-foreground mb-4">
								{milestone.items.length} tasks
							</p>
							<Link
								href={`/tools/transition/${milestone.slug}`}
								className="inline-block text-sm font-medium text-blue-600 hover:underline"
							>
								View checklist →
							</Link>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
