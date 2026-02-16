"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const reviewSchema = z.object({
	logId: z.string().min(1, "Log ID is required"),
	isFalsePositive: z.boolean(),
	notes: z.string().max(2000, "Notes must be under 2000 characters").optional(),
});

export async function reviewCrisisLog(params: {
	logId: string;
	isFalsePositive: boolean;
	notes?: string;
}): Promise<{ success: boolean; error?: string }> {
	// Validate input
	const validation = reviewSchema.safeParse(params);
	if (!validation.success) {
		return {
			success: false,
			error: validation.error.issues[0].message,
		};
	}

	const { logId, isFalsePositive, notes } = validation.data;

	// Get authenticated user
	const supabase = await createClient();
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		return {
			success: false,
			error: "Authentication required",
		};
	}

	// Update the crisis detection log
	const { error: updateError } = await supabase
		.from("crisis_detection_logs")
		.update({
			reviewed_by: user.id,
			reviewed_at: new Date().toISOString(),
			is_false_positive: isFalsePositive,
			review_notes: notes || null,
		})
		.eq("id", logId);

	if (updateError) {
		console.error("Failed to update crisis log review:", updateError);
		return {
			success: false,
			error: "Failed to update review",
		};
	}

	return { success: true };
}
