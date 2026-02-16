"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, CheckCircle2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	toggleActionItem,
	deleteActionItem,
} from "@/lib/db/action-item-actions";
import type { ActionItem } from "@/lib/db/dashboard-types";

interface ActionItemsListProps {
	initialItems: ActionItem[];
}

export function ActionItemsList({ initialItems }: ActionItemsListProps) {
	const router = useRouter();
	const [items, setItems] = useState<ActionItem[]>(initialItems);
	const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

	const totalCount = items.length;
	const completedCount = items.filter((i) => i.is_completed).length;
	const progressPercent =
		totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

	// Group items by program_name
	const grouped = items.reduce(
		(acc, item) => {
			const key = item.program_name || "General";
			if (!acc[key]) {
				acc[key] = [];
			}
			acc[key].push(item);
			return acc;
		},
		{} as Record<string, ActionItem[]>,
	);

	function handleToggle(itemId: string) {
		// Optimistic update
		setItems((prev) =>
			prev.map((item) =>
				item.id === itemId
					? {
							...item,
							is_completed: !item.is_completed,
							completed_at: !item.is_completed
								? new Date().toISOString()
								: null,
						}
					: item,
			),
		);
		setPendingIds((prev) => new Set(prev).add(itemId));

		// Server call
		toggleActionItem(itemId).then((result) => {
			setPendingIds((prev) => {
				const next = new Set(prev);
				next.delete(itemId);
				return next;
			});

			if (!result.success) {
				// Revert on error
				setItems((prev) =>
					prev.map((item) =>
						item.id === itemId
							? {
									...item,
									is_completed: !item.is_completed,
									completed_at: item.is_completed
										? new Date().toISOString()
										: null,
								}
							: item,
					),
				);
			}
		});
	}

	function handleDelete(itemId: string) {
		const previousItems = [...items];
		setItems((prev) => prev.filter((item) => item.id !== itemId));
		setPendingIds((prev) => new Set(prev).add(itemId));

		deleteActionItem(itemId).then((result) => {
			setPendingIds((prev) => {
				const next = new Set(prev);
				next.delete(itemId);
				return next;
			});

			if (!result.success) {
				setItems(previousItems);
			} else {
				router.refresh();
			}
		});
	}

	if (items.length === 0) {
		return null;
	}

	return (
		<div className="space-y-6">
			{/* Progress bar */}
			<Card>
				<CardContent className="py-4">
					<div className="flex items-center justify-between mb-2">
						<span className="text-sm font-medium">Overall Progress</span>
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
						aria-label={`${progressPercent}% of action items complete`}
					>
						<div
							className="h-full bg-green-500 rounded-full transition-all duration-300"
							style={{ width: `${progressPercent}%` }}
						/>
					</div>
				</CardContent>
			</Card>

			{/* Grouped action items */}
			{Object.entries(grouped).map(([programName, programItems]) => {
				const allComplete = programItems.every((i) => i.is_completed);

				return (
					<Card key={programName}>
						<CardHeader className="pb-3">
							<CardTitle className="text-lg">{programName}</CardTitle>
							{allComplete && (
								<p className="text-sm text-green-600 flex items-center gap-1">
									<CheckCircle2 className="h-4 w-4" />
									All steps complete!
								</p>
							)}
						</CardHeader>
						<CardContent>
							<ul className="space-y-3">
								{programItems.map((item) => (
									<li
										key={item.id}
										className="flex items-start gap-3 group"
									>
										<Checkbox
											checked={item.is_completed}
											onCheckedChange={() => handleToggle(item.id)}
											disabled={pendingIds.has(item.id)}
											aria-label={`Mark "${item.title}" as ${item.is_completed ? "incomplete" : "complete"}`}
											className="mt-0.5"
										/>
										<div className="flex-1 min-w-0">
											<p
												className={`text-sm ${
													item.is_completed
														? "line-through text-muted-foreground"
														: "text-foreground"
												}`}
											>
												{item.title}
											</p>
											{item.description && (
												<p className="text-xs text-muted-foreground mt-0.5">
													{item.description}
												</p>
											)}
										</div>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => handleDelete(item.id)}
											disabled={pendingIds.has(item.id)}
											aria-label={`Delete "${item.title}"`}
											className="h-7 w-7 opacity-0 group-hover:opacity-100 focus:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
										>
											<Trash2 className="h-3.5 w-3.5" />
										</Button>
									</li>
								))}
							</ul>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}
