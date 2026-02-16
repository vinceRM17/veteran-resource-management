"use client";

import { MessageCircle, Phone } from "lucide-react";
import Link from "next/link";

export function Footer() {
	return (
		<footer className="border-t mt-auto">
			<div className="container mx-auto px-4 py-8">
				<div className="grid gap-8 md:grid-cols-2">
					{/* Crisis Resources */}
					<div>
						<h2 className="font-semibold text-lg mb-4">Crisis Resources</h2>
						<div className="space-y-2">
							<div>
								<a
									href="tel:988"
									aria-label="Call 988 Suicide and Crisis Lifeline"
									className="flex items-center gap-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
								>
									<Phone className="h-4 w-4" aria-hidden="true" />
									<span>988 Suicide & Crisis Lifeline</span>
								</a>
							</div>
							<div>
								<a
									href="sms:741741&body=HELLO"
									aria-label="Text HOME to 741741 Crisis Text Line"
									className="flex items-center gap-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
								>
									<MessageCircle className="h-4 w-4" aria-hidden="true" />
									<span>Text HOME to 741741</span>
								</a>
							</div>
							<div>
								<a
									href="tel:18002738255"
									aria-label="Call Veterans Crisis Line at 1-800-273-8255"
									className="flex items-center gap-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
								>
									<Phone className="h-4 w-4" aria-hidden="true" />
									<span>VA Crisis Line: 1-800-273-8255</span>
								</a>
							</div>
						</div>
					</div>

					{/* Site Information */}
					<div>
						<h2 className="font-semibold text-lg mb-4">Information</h2>
						<div className="space-y-2">
							<div>
								<Link
									href="/privacy"
									className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
								>
									Privacy Policy
								</Link>
							</div>
						</div>
						<div className="mt-4 text-sm text-muted-foreground">
							<p>
								&copy; {new Date().getFullYear()} Veteran Resource Management
							</p>
							<p className="mt-1">
								Connecting veterans and their families to resources and support.
							</p>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}
