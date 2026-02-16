"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { removeBookmark } from "@/lib/db/bookmark-actions";

interface RemoveBookmarkButtonProps {
	bookmarkId: string;
	resourceName: string;
}

export function RemoveBookmarkButton({
	bookmarkId,
	resourceName,
}: RemoveBookmarkButtonProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState<string | null>(null);

	function handleRemove() {
		setError(null);
		startTransition(async () => {
			const result = await removeBookmark(bookmarkId);
			if (result.error) {
				setError(result.error);
			} else {
				router.refresh();
			}
		});
	}

	return (
		<>
			<Button
				variant="ghost"
				size="sm"
				onClick={handleRemove}
				disabled={isPending}
				aria-label={`Remove ${resourceName} from saved`}
				className="text-muted-foreground hover:text-destructive"
			>
				<Trash2 className="h-4 w-4" />
				{isPending ? "Removing..." : "Remove"}
			</Button>
			{error && <p className="text-xs text-destructive">{error}</p>}
		</>
	);
}
