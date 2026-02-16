"use client";

/**
 * Full-page crisis intervention modal with focus trap and keyboard navigation.
 * Displays accessible crisis resources (988, Crisis Text Line, VA Crisis Line).
 * User can dismiss to continue to screening results (non-blocking).
 */

import { MessageCircle, Phone } from "lucide-react";
import { useEffect, useRef } from "react";

interface CrisisInterceptProps {
	onDismiss: () => void;
	sessionId?: string;
}

export function CrisisIntercept({
	onDismiss,
	sessionId,
}: CrisisInterceptProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const firstFocusableRef = useRef<HTMLAnchorElement>(null);
	const lastFocusableRef = useRef<HTMLButtonElement>(null);
	const previousActiveElement = useRef<HTMLElement | null>(null);

	useEffect(() => {
		// Save previously focused element
		previousActiveElement.current = document.activeElement as HTMLElement;

		// Prevent body scroll
		document.body.style.overflow = "hidden";

		// Focus first crisis link
		firstFocusableRef.current?.focus();

		// Cleanup on unmount
		return () => {
			document.body.style.overflow = "";
			// Restore focus to previously focused element
			previousActiveElement.current?.focus();
		};
	}, []);

	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			// Escape key dismisses modal
			if (event.key === "Escape") {
				onDismiss();
				return;
			}

			// Focus trap: Tab cycling
			if (event.key === "Tab") {
				const focusableElements = containerRef.current?.querySelectorAll(
					'a[href], button:not([disabled])',
				);
				if (!focusableElements || focusableElements.length === 0) return;

				const firstElement = focusableElements[0] as HTMLElement;
				const lastElement = focusableElements[
					focusableElements.length - 1
				] as HTMLElement;

				// Shift+Tab from first element wraps to last
				if (event.shiftKey && document.activeElement === firstElement) {
					event.preventDefault();
					lastElement.focus();
				}
				// Tab from last element wraps to first
				else if (!event.shiftKey && document.activeElement === lastElement) {
					event.preventDefault();
					firstElement.focus();
				}
			}
		}

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [onDismiss]);

	return (
		<div
			ref={containerRef}
			role="dialog"
			aria-modal="true"
			aria-labelledby="crisis-title"
			className="fixed inset-0 z-[100] bg-white flex items-center justify-center p-4"
		>
			<div className="max-w-2xl w-full space-y-6">
				<div className="text-center space-y-3">
					<h1 id="crisis-title" className="text-4xl font-bold text-red-900">
						You Are Not Alone
					</h1>
					<p className="text-lg text-gray-700">
						We noticed you might be going through a tough time. Please reach out
						— help is available right now.
					</p>
				</div>

				<div className="space-y-4">
					{/* 988 Suicide & Crisis Lifeline */}
					<a
						ref={firstFocusableRef}
						href="tel:988"
						className="flex items-center justify-center gap-3 bg-red-900 text-white text-xl font-bold py-6 px-8 rounded-lg hover:bg-red-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500 focus-visible:ring-offset-2 transition-colors w-full min-h-[44px]"
					>
						<Phone className="h-6 w-6" aria-hidden="true" />
						<span>Call 988 Suicide & Crisis Lifeline</span>
					</a>

					{/* Crisis Text Line */}
					<a
						href="sms:741741&body=HELLO"
						className="flex items-center justify-center gap-3 bg-red-900 text-white text-xl font-bold py-6 px-8 rounded-lg hover:bg-red-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500 focus-visible:ring-offset-2 transition-colors w-full min-h-[44px]"
					>
						<MessageCircle className="h-6 w-6" aria-hidden="true" />
						<span>Text HOME to 741741</span>
					</a>

					{/* Veterans Crisis Line */}
					<a
						href="tel:18002738255"
						className="flex items-center justify-center gap-3 bg-red-900 text-white text-xl font-bold py-6 px-8 rounded-lg hover:bg-red-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500 focus-visible:ring-offset-2 transition-colors w-full min-h-[44px]"
					>
						<Phone className="h-6 w-6" aria-hidden="true" />
						<span>Call Veterans Crisis Line: 1-800-273-8255</span>
					</a>
				</div>

				{/* Dismiss button */}
				<div className="pt-4 text-center">
					<button
						ref={lastFocusableRef}
						type="button"
						onClick={onDismiss}
						className="border-2 border-gray-600 text-gray-900 text-base font-medium py-3 px-6 rounded-lg hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gray-400 focus-visible:ring-offset-2 transition-colors min-h-[44px]"
					>
						Continue to your results
					</button>
				</div>
			</div>
		</div>
	);
}
