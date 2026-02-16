import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ReactNode } from "react";

export default async function AdminLayout({
	children,
}: { children: ReactNode }) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/login");
	}

	// Check admin role from profiles table
	const { data: profile } = await supabase
		.from("profiles")
		.select("role")
		.eq("id", user.id)
		.single();

	if (!profile || profile.role !== "admin") {
		redirect("/dashboard");
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<header className="bg-red-700 text-white shadow">
				<div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
					<h1 className="text-2xl font-bold">Admin Dashboard</h1>
					<p className="mt-1 text-sm text-red-100">
						Internal monitoring and management tools
					</p>
				</div>
			</header>
			<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				{children}
			</main>
		</div>
	);
}
