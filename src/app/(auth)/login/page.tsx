import { LoginForm } from "@/components/auth/LoginForm";
import { OAuthButton } from "@/components/auth/OAuthButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Log In - Veteran Resource Management",
	description: "Log in to access your veteran resource dashboard",
};

// Force dynamic rendering for auth pages
export const dynamic = "force-dynamic";

export default function LoginPage() {
	return (
		<div className="bg-white rounded-lg shadow-md p-8">
			<h1 className="text-2xl font-bold text-gray-900 mb-6">Log In</h1>

			<LoginForm />

			<div className="relative my-6">
				<div className="absolute inset-0 flex items-center">
					<div className="w-full border-t border-gray-300" />
				</div>
				<div className="relative flex justify-center text-sm">
					<span className="bg-white px-2 text-gray-500">or</span>
				</div>
			</div>

			<OAuthButton provider="google" label="Sign in with Google" />
		</div>
	);
}
