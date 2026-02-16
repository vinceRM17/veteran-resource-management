/**
 * Dashboard Layout
 *
 * Auth-guarded layout that redirects unauthenticated users to /login.
 * All pages under /dashboard require a logged-in user.
 */

import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
	children,
}: {
	children: ReactNode;
}) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/login?next=/dashboard");
	}

	return <>{children}</>;
}
