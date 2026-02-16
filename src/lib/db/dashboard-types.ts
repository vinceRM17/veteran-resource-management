/**
 * TypeScript types for user dashboard features
 * Mirrors the Supabase schema defined in 00007_user_accounts_dashboard.sql
 */

import type { ConfidenceLevel } from "./screening-types";

// ============================================================================
// BOOKMARKS TABLE
// ============================================================================

export type ResourceType = "organization" | "business" | "program";

export interface Bookmark {
	id: string;
	user_id: string;
	resource_type: ResourceType;
	resource_id: string;
	resource_name: string;
	notes: string | null;
	created_at: string;
}

// ============================================================================
// ACTION ITEMS TABLE
// ============================================================================

export interface ActionItem {
	id: string;
	user_id: string;
	session_id: string | null;
	program_id: string | null;
	program_name: string | null;
	title: string;
	description: string | null;
	is_completed: boolean;
	completed_at: string | null;
	sort_order: number;
	created_at: string;
	updated_at: string;
}

// ============================================================================
// SCREENING HISTORY (view type for dashboard display)
// ============================================================================

export interface ScreeningHistoryResult {
	program_name: string;
	confidence: ConfidenceLevel;
	confidence_label: string;
}

export interface ScreeningHistoryEntry {
	id: string;
	answers: Record<string, unknown>;
	role: "veteran" | "caregiver" | null;
	status: "in_progress" | "completed" | "abandoned";
	created_at: string;
	results: ScreeningHistoryResult[];
}
