import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
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
			{/*
        Note: Auth protection for admin routes will be added in Phase 5
        when user roles and permissions are implemented. Currently accessible
        to any authenticated user.
      */}
		</div>
	);
}
