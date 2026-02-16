"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleBookmark } from "@/lib/db/bookmark-actions";

interface BookmarkButtonProps {
	resourceType: "organization" | "business" | "program";
	resourceId: string;
	resourceName: string;
	initialBookmarked: boolean;
	isLoggedIn: boolean;
}

export function BookmarkButton({
	resourceType,
	resourceId,
	resourceName,
	initialBookmarked,
	isLoggedIn,
}: BookmarkButtonProps) {
	const [bookmarked, setBookmarked] = useState(initialBookmarked);
	const [isPending, startTransition] = useTransition();
	const [message, setMessage] = useState<string | null>(null);

	function handleClick() {
		if (!isLoggedIn) {
			setMessage("Log in to save resources");
			setTimeout(() => setMessage(null), 3000);
			return;
		}

		const previousState = bookmarked;
		setBookmarked(!bookmarked);
		setMessage(null);

		startTransition(async () => {
			const result = await toggleBookmark(
				resourceType,
				resourceId,
				resourceName,
			);

			if (result.error) {
				setBookmarked(previousState);
				setMessage(result.error);
				setTimeout(() => setMessage(null), 3000);
			} else {
				setBookmarked(result.bookmarked);
			}
		});
	}

	return (
		<div className="w-full">
			<Button
				variant="outline"
				size="sm"
				className="w-full"
				onClick={handleClick}
				disabled={isPending}
				aria-label={
					bookmarked
						? `Remove ${resourceName} from saved`
						: `Save ${resourceName}`
				}
			>
				<Bookmark
					className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`}
				/>
				{bookmarked ? "Saved" : "Save"}
			</Button>
			{message && (
				<p className="text-xs text-muted-foreground mt-1 text-center">
					{message}
				</p>
			)}
		</div>
	);
}
