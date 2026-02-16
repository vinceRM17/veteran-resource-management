"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionItem } from "@/lib/db/dashboard-types";

export async function getActionItems(): Promise<ActionItem[]> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) return [];

	const { data } = await supabase
		.from("action_items")
		.select("*")
		.eq("user_id", user.id)
		.order("is_completed", { ascending: true })
		.order("sort_order", { ascending: true });

	return (data || []) as ActionItem[];
}

export async function toggleActionItem(
	itemId: string,
): Promise<{ success: boolean; isCompleted: boolean; error?: string }> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user)
		return { success: false, isCompleted: false, error: "Not authenticated." };

	const { data: item } = await supabase
		.from("action_items")
		.select("is_completed")
		.eq("id", itemId)
		.eq("user_id", user.id)
		.single();

	if (!item)
		return {
			success: false,
			isCompleted: false,
			error: "Action item not found.",
		};

	const newState = !item.is_completed;

	const { error } = await supabase
		.from("action_items")
		.update({
			is_completed: newState,
			completed_at: newState ? new Date().toISOString() : null,
		})
		.eq("id", itemId)
		.eq("user_id", user.id);

	if (error)
		return {
			success: false,
			isCompleted: item.is_completed,
			error: "Unable to update.",
		};

	return { success: true, isCompleted: newState };
}

export async function deleteActionItem(
	itemId: string,
): Promise<{ success: boolean; error?: string }> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) return { success: false, error: "Not authenticated." };

	const { error } = await supabase
		.from("action_items")
		.delete()
		.eq("id", itemId)
		.eq("user_id", user.id);

	if (error) return { success: false, error: "Unable to delete." };
	return { success: true };
}
