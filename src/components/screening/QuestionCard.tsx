"use client";

/**
 * Reusable question wrapper component for the screening form.
 * Provides consistent layout with label, help text, error display,
 * and a children slot for the actual form input.
 */

import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface QuestionCardProps {
	label: string;
	helpText?: string;
	required?: boolean;
	error?: string;
	children: ReactNode;
}

export function QuestionCard({
	label,
	helpText,
	required = false,
	error,
	children,
}: QuestionCardProps) {
	return (
		<Card className="mb-4">
			<CardContent className="pt-6">
				<h3 className="text-base font-semibold mb-1">
					{label}
					{required && (
						<span className="text-destructive ml-1" aria-hidden="true">
							*
						</span>
					)}
				</h3>

				{helpText && (
					<p className="text-sm text-muted-foreground mb-3">{helpText}</p>
				)}

				<div className="mt-2">{children}</div>

				{error && (
					<p
						className="mt-2 text-sm text-destructive"
						role="alert"
						aria-live="assertive"
					>
						{error}
					</p>
				)}
			</CardContent>
		</Card>
	);
}
