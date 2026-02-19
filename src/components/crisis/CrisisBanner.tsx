"use client";

import { MessageCircle, Phone } from "lucide-react";

export function CrisisBanner() {
	return (
		<aside
			aria-label="Crisis resources"
			className="sticky top-0 z-50 py-2 px-4"
			style={{ backgroundColor: "var(--crisis-bg)", color: "var(--crisis-text)" }}
		>
			<div className="container mx-auto">
				<span className="sr-only">
					If you are in crisis or need immediate help:
				</span>
				<div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
					<a
						href="tel:988"
						aria-label="Call 988 Suicide and Crisis Lifeline"
						className="flex items-center gap-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--crisis-bg)] rounded px-2 py-1"
					>
						<Phone className="h-4 w-4" aria-hidden="true" />
						<span className="text-sm md:text-base">
							<span className="md:hidden">988 Lifeline</span>
							<span className="hidden md:inline">
								Call 988 Suicide & Crisis Lifeline
							</span>
						</span>
					</a>
					<a
						href="sms:741741&body=HELLO"
						aria-label="Text HOME to 741741 Crisis Text Line"
						className="flex items-center gap-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--crisis-bg)] rounded px-2 py-1"
					>
						<MessageCircle className="h-4 w-4" aria-hidden="true" />
						<span className="text-sm md:text-base">
							<span className="md:hidden">Text 741741</span>
							<span className="hidden md:inline">Text HOME to 741741</span>
						</span>
					</a>
					<a
						href="tel:18002738255"
						aria-label="Call Veterans Crisis Line at 1-800-273-8255"
						className="flex items-center gap-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--crisis-bg)] rounded px-2 py-1"
					>
						<Phone className="h-4 w-4" aria-hidden="true" />
						<span className="text-sm md:text-base">
							<span className="md:hidden">VA Crisis</span>
							<span className="hidden md:inline">
								VA Crisis Line: 1-800-273-8255
							</span>
						</span>
					</a>
				</div>
			</div>
		</aside>
	);
}
