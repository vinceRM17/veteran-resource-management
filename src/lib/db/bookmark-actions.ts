"use server";

import { createClient } from "@/lib/supabase/server";
import type { Bookmark } from "@/lib/db/dashboard-types";

export async function toggleBookmark(
	resourceType: "organization" | "business" | "program",
	resourceId: string,
	resourceName: string,
): Promise<{ bookmarked: boolean; error?: string }> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return {
			bookmarked: false,
			error: "You must be logged in to bookmark resources.",
		};
	}

	const { data: existing } = await supabase
		.from("bookmarks")
		.select("id")
		.eq("user_id", user.id)
		.eq("resource_type", resourceType)
		.eq("resource_id", resourceId)
		.maybeSingle();

	if (existing) {
		await supabase.from("bookmarks").delete().eq("id", existing.id);
		return { bookmarked: false };
	}

	const { error } = await supabase.from("bookmarks").insert({
		user_id: user.id,
		resource_type: resourceType,
		resource_id: resourceId,
		resource_name: resourceName,
	});

	if (error) {
		console.error("Failed to create bookmark:", error);
		return { bookmarked: false, error: "Unable to save bookmark." };
	}

	return { bookmarked: true };
}

export async function isBookmarked(
	resourceType: string,
	resourceId: string,
): Promise<boolean> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) return false;

	const { data } = await supabase
		.from("bookmarks")
		.select("id")
		.eq("user_id", user.id)
		.eq("resource_type", resourceType)
		.eq("resource_id", resourceId)
		.maybeSingle();

	return !!data;
}

export async function getUserBookmarks(): Promise<Bookmark[]> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) return [];

	const { data } = await supabase
		.from("bookmarks")
		.select("*")
		.eq("user_id", user.id)
		.order("created_at", { ascending: false });

	return (data || []) as Bookmark[];
}

export async function removeBookmark(
	bookmarkId: string,
): Promise<{ success: boolean; error?: string }> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) return { success: false, error: "Not authenticated." };

	const { error } = await supabase
		.from("bookmarks")
		.delete()
		.eq("id", bookmarkId)
		.eq("user_id", user.id);

	if (error) return { success: false, error: "Unable to remove bookmark." };
	return { success: true };
}
