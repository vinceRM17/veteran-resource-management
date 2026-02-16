"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function LogoutButton() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const supabase = createClient();

	const handleLogout = async () => {
		setIsLoading(true);
		await supabase.auth.signOut();
		router.push("/");
		router.refresh();
	};

	return (
		<Button
			onClick={handleLogout}
			disabled={isLoading}
			variant="outline"
			size="sm"
		>
			{isLoading ? "Logging out..." : "Log out"}
		</Button>
	);
}
