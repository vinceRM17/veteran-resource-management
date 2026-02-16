"use server";

import { createClient } from "@/lib/supabase/server";

export async function getChecklistProgress(
	milestoneSlug: string,
): Promise<Record<string, boolean>> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) return {};

	const { data } = await supabase
		.from("action_items")
		.select("title, is_completed")
		.eq("program_name", `transition-${milestoneSlug}`)
		.eq("user_id", user.id);

	if (!data) return {};

	return data.reduce(
		(acc, item) => {
			acc[item.title] = item.is_completed;
			return acc;
		},
		{} as Record<string, boolean>,
	);
}

export async function saveChecklistProgress(
	milestoneSlug: string,
	itemId: string,
	itemTitle: string,
	completed: boolean,
): Promise<{ success: boolean; isCompleted: boolean; error?: string }> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return {
			success: false,
			isCompleted: false,
			error: "Log in to track your progress.",
		};
	}

	const programName = `transition-${milestoneSlug}`;

	// Check if item exists
	const { data: existing } = await supabase
		.from("action_items")
		.select("id, is_completed")
		.eq("program_name", programName)
		.eq("title", itemTitle)
		.eq("user_id", user.id)
		.single();

	if (existing) {
		// Update existing item
		const { error } = await supabase
			.from("action_items")
			.update({
				is_completed: completed,
				completed_at: completed ? new Date().toISOString() : null,
			})
			.eq("id", existing.id);

		if (error) {
			return {
				success: false,
				isCompleted: existing.is_completed,
				error: "Unable to update progress.",
			};
		}

		return { success: true, isCompleted: completed };
	}

	// Create new item if it doesn't exist and user is checking it
	if (completed) {
		const { error } = await supabase.from("action_items").insert({
			user_id: user.id,
			program_name: programName,
			program_id: milestoneSlug,
			title: itemTitle,
			description: null,
			is_completed: true,
			completed_at: new Date().toISOString(),
			sort_order: 0,
		});

		if (error) {
			return {
				success: false,
				isCompleted: false,
				error: "Unable to save progress.",
			};
		}

		return { success: true, isCompleted: true };
	}

	// If item doesn't exist and user is unchecking, nothing to do
	return { success: true, isCompleted: false };
}
