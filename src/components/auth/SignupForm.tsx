"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface SignupFormProps {
	redirectTo?: string;
	sessionId?: string;
}

export function SignupForm({ redirectTo, sessionId }: SignupFormProps) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const supabase = createClient();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setSuccess(false);
		setIsLoading(true);

		// Client-side validation
		if (password.length < 8) {
			setError("Password must be at least 8 characters long");
			setIsLoading(false);
			return;
		}

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			setIsLoading(false);
			return;
		}

		const { origin } = window.location;
		const callbackUrl = redirectTo
			? `${origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`
			: `${origin}/auth/callback`;
		const { error: signUpError } = await supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: callbackUrl,
			},
		});

		if (signUpError) {
			setError(signUpError.message);
			setIsLoading(false);
			return;
		}

		// Successful signup
		setSuccess(true);
		setIsLoading(false);
	};

	if (success) {
		return (
			<div
				role="alert"
				aria-live="polite"
				className="rounded-md bg-green-50 p-4 border border-green-200"
			>
				<p className="text-sm text-green-800 font-medium mb-2">
					Account created successfully!
				</p>
				<p className="text-sm text-green-700">
					Check your email for a confirmation link to complete your
					registration.
				</p>
				{sessionId && (
					<p className="text-sm text-green-700 mt-2">
						Your screening results will be saved to your account once you
						confirm your email.
					</p>
				)}
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			{error && (
				<div
					role="alert"
					aria-live="assertive"
					className="rounded-md bg-red-50 p-3 text-sm text-red-800 border border-red-200"
				>
					{error}
				</div>
			)}

			<div>
				<label
					htmlFor="email"
					className="block text-sm font-medium text-gray-700 mb-1"
				>
					Email Address <span className="text-red-600">*</span>
				</label>
				<input
					type="email"
					id="email"
					name="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
					aria-required="true"
					autoComplete="email"
					autoFocus
					className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				/>
			</div>

			<div>
				<label
					htmlFor="password"
					className="block text-sm font-medium text-gray-700 mb-1"
				>
					Password <span className="text-red-600">*</span>
				</label>
				<div className="relative">
					<input
						type={showPassword ? "text" : "password"}
						id="password"
						name="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						aria-required="true"
						aria-describedby="password-hint"
						autoComplete="new-password"
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
					/>
					<button
						type="button"
						onClick={() => setShowPassword(!showPassword)}
						aria-label={showPassword ? "Hide password" : "Show password"}
						className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
					>
						{showPassword ? (
							<EyeOff className="h-4 w-4" aria-hidden="true" />
						) : (
							<Eye className="h-4 w-4" aria-hidden="true" />
						)}
					</button>
				</div>
				<p id="password-hint" className="text-xs text-gray-500 mt-1">
					Minimum 8 characters
				</p>
			</div>

			<div>
				<label
					htmlFor="confirm-password"
					className="block text-sm font-medium text-gray-700 mb-1"
				>
					Confirm Password <span className="text-red-600">*</span>
				</label>
				<div className="relative">
					<input
						type={showConfirmPassword ? "text" : "password"}
						id="confirm-password"
						name="confirm-password"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						required
						aria-required="true"
						autoComplete="new-password"
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
					/>
					<button
						type="button"
						onClick={() => setShowConfirmPassword(!showConfirmPassword)}
						aria-label={
							showConfirmPassword
								? "Hide confirm password"
								: "Show confirm password"
						}
						className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
					>
						{showConfirmPassword ? (
							<EyeOff className="h-4 w-4" aria-hidden="true" />
						) : (
							<Eye className="h-4 w-4" aria-hidden="true" />
						)}
					</button>
				</div>
			</div>

			<Button type="submit" disabled={isLoading} className="w-full">
				{isLoading ? "Creating account..." : "Sign Up"}
			</Button>

			<div className="text-center text-sm">
				<span className="text-gray-600">Already have an account? </span>
				<Link
					href="/login"
					className="text-blue-600 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
				>
					Log in
				</Link>
			</div>
		</form>
	);
}
