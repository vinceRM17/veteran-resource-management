import type { Metadata } from "next";
import Link from "next/link";
import { getUserBookmarks } from "@/lib/db/bookmark-actions";
import { RemoveBookmarkButton } from "@/components/dashboard/RemoveBookmarkButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bookmark, ExternalLink } from "lucide-react";
import type { ResourceType } from "@/lib/db/dashboard-types";

export const metadata: Metadata = {
	title: "Saved Resources | Dashboard",
	description: "View and manage your saved organizations and businesses.",
};

const resourceTypeConfig: Record<
	ResourceType,
	{ label: string; color: string; basePath: string }
> = {
	organization: {
		label: "Organization",
		color: "bg-blue-100 text-blue-700",
		basePath: "/directory",
	},
	business: {
		label: "Business",
		color: "bg-green-100 text-green-700",
		basePath: "/directory/businesses",
	},
	program: {
		label: "Program",
		color: "bg-purple-100 text-purple-700",
		basePath: "/screening",
	},
};

export default async function BookmarksPage() {
	const bookmarks = await getUserBookmarks();

	// Group bookmarks by resource_type
	const grouped = bookmarks.reduce(
		(acc, bookmark) => {
			const type = bookmark.resource_type;
			if (!acc[type]) {
				acc[type] = [];
			}
			acc[type].push(bookmark);
			return acc;
		},
		{} as Record<string, typeof bookmarks>,
	);

	const groupOrder: ResourceType[] = ["organization", "business", "program"];

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
					<li className="text-foreground font-medium">Saved Resources</li>
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
				<span className="text-sm font-medium text-foreground border-b-2 border-primary pb-1">
					Saved Resources
				</span>
				<Link
					href="/dashboard/action-items"
					className="text-sm text-muted-foreground hover:text-foreground"
				>
					Action Items
				</Link>
			</div>

			<h1 className="text-3xl font-bold mb-8">Saved Resources</h1>

			{bookmarks.length === 0 ? (
				<Card>
					<CardContent className="py-12 text-center">
						<Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
						<h2 className="text-xl font-semibold mb-2">
							No saved resources yet
						</h2>
						<p className="text-muted-foreground mb-4">
							Browse the directory to find organizations and businesses you
							want to save for later.
						</p>
						<Link
							href="/directory"
							className="text-blue-600 hover:underline font-medium"
						>
							Browse the directory
						</Link>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-8">
					{groupOrder.map((type) => {
						const items = grouped[type];
						if (!items || items.length === 0) return null;

						const config = resourceTypeConfig[type];
						const pluralLabel =
							type === "business" ? "Businesses" : `${config.label}s`;

						return (
							<section key={type}>
								<h2 className="text-xl font-semibold mb-4">{pluralLabel}</h2>
								<div className="grid gap-4">
									{items.map((bookmark) => {
										const cfg =
											resourceTypeConfig[
												bookmark.resource_type as ResourceType
											];
										const viewUrl =
											bookmark.resource_type === "program"
												? "/screening"
												: `${cfg.basePath}/${bookmark.resource_id}`;

										return (
											<Card key={bookmark.id}>
												<CardContent className="flex items-center justify-between py-4">
													<div className="flex-1 min-w-0">
														<div className="flex items-center gap-3 mb-1">
															<h3 className="font-medium truncate">
																{bookmark.resource_name}
															</h3>
															<Badge
																variant="secondary"
																className={cfg.color}
															>
																{cfg.label}
															</Badge>
														</div>
														<p className="text-xs text-muted-foreground">
															Saved on{" "}
															{new Date(
																bookmark.created_at,
															).toLocaleDateString("en-US", {
																year: "numeric",
																month: "long",
																day: "numeric",
															})}
														</p>
													</div>
													<div className="flex items-center gap-2 ml-4 shrink-0">
														<Link
															href={viewUrl}
															className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
														>
															<ExternalLink className="h-3 w-3" />
															View
														</Link>
														<RemoveBookmarkButton
															bookmarkId={bookmark.id}
															resourceName={bookmark.resource_name}
														/>
													</div>
												</CardContent>
											</Card>
										);
									})}
								</div>
							</section>
						);
					})}
				</div>
			)}
		</div>
	);
}
