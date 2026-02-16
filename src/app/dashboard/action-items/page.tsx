import type { Metadata } from "next";
import Link from "next/link";
import { getActionItems } from "@/lib/db/action-item-actions";
import { ActionItemsList } from "@/components/dashboard/ActionItemsList";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

export const metadata: Metadata = {
	title: "Action Items | Dashboard",
	description:
		"Track your next steps for applying to benefits and connecting with resources.",
};

export default async function ActionItemsPage() {
	const actionItems = await getActionItems();

	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			{/* Breadcrumb */}
			<nav className="text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
				<ol className="flex items-center gap-2">
					<li>
						<Link href="/dashboard" className="hover:underline">
							Dashboard
						</Link>
					</li>
					<li aria-hidden="true">/</li>
					<li className="text-foreground font-medium">Action Items</li>
				</ol>
			</nav>

			{/* Dashboard nav */}
			<div className="flex gap-4 mb-8">
				<Link
					href="/dashboard"
					className="text-sm text-muted-foreground hover:text-foreground"
				>
					Overview
				</Link>
				<Link
					href="/dashboard/bookmarks"
					className="text-sm text-muted-foreground hover:text-foreground"
				>
					Saved Resources
				</Link>
				<span className="text-sm font-medium text-foreground border-b-2 border-primary pb-1">
					Action Items
				</span>
			</div>

			<h1 className="text-3xl font-bold mb-8">Action Items</h1>

			{actionItems.length === 0 ? (
				<Card>
					<CardContent className="py-12 text-center">
						<ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
						<h2 className="text-xl font-semibold mb-2">
							No action items yet
						</h2>
						<p className="text-muted-foreground mb-4">
							Complete a screening and save your results to get personalized
							next steps for applying to benefits programs.
						</p>
						<Link
							href="/screening"
							className="text-blue-600 hover:underline font-medium"
						>
							Start a screening
						</Link>
					</CardContent>
				</Card>
			) : (
				<ActionItemsList initialItems={actionItems} />
			)}
		</div>
	);
}
