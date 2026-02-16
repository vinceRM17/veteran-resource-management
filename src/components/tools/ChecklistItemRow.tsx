"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { saveChecklistProgress } from "@/lib/db/checklist-actions";

interface ChecklistItemRowProps {
	milestoneSlug: string;
	item: {
		id: string;
		title: string;
		description: string;
		resources: { label: string; url: string }[];
	};
	initialChecked: boolean;
	isAuthenticated: boolean;
	showLoginHint?: boolean;
}

export function ChecklistItemRow({
	milestoneSlug,
	item,
	initialChecked,
	isAuthenticated,
	showLoginHint = false,
}: ChecklistItemRowProps) {
	const [checked, setChecked] = useState(initialChecked);
	const [isPending, setIsPending] = useState(false);

	async function handleToggle() {
		if (!isAuthenticated) return;

		const newState = !checked;
		setChecked(newState);
		setIsPending(true);

		const result = await saveChecklistProgress(
			milestoneSlug,
			item.id,
			item.title,
			newState,
		);

		setIsPending(false);

		if (!result.success) {
			// Revert on error
			setChecked(!newState);
		}
	}

	return (
		<div className="border-b pb-4 last:border-b-0">
			<div className="flex items-start gap-3">
				<Checkbox
					checked={checked}
					onCheckedChange={handleToggle}
					disabled={!isAuthenticated || isPending}
					aria-label={`Mark "${item.title}" as ${checked ? "incomplete" : "complete"}`}
					className="mt-1"
				/>
				<div className="flex-1">
					<p
						className={`font-medium ${checked ? "line-through text-muted-foreground" : "text-foreground"}`}
					>
						{item.title}
					</p>
					{!isAuthenticated && showLoginHint && (
						<p className="text-xs text-muted-foreground mt-1">
							Log in to track progress
						</p>
					)}
					<p className="text-sm text-muted-foreground mt-2">
						{item.description}
					</p>
					{item.resources.length > 0 && (
						<ul className="mt-3 space-y-1">
							{item.resources.map((resource) => (
								<li key={resource.url}>
									<a
										href={resource.url}
										target="_blank"
										rel="noopener noreferrer"
										className="text-sm text-blue-600 underline hover:text-blue-800"
									>
										{resource.label}
									</a>
								</li>
							))}
						</ul>
					)}
				</div>
			</div>
		</div>
	);
}
