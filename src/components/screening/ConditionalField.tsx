"use client";

/**
 * Component that shows or hides children based on screening answers.
 * Uses shouldShowField() from conditional-logic.ts to determine visibility.
 *
 * Wraps children in a div with data-field-id for testing.
 * Returns null when the field should not be visible.
 */

import type { ReactNode } from "react";
import { useScreeningStore } from "@/lib/screening/store";
import { shouldShowField } from "@/lib/screening/conditional-logic";

interface ConditionalFieldProps {
	fieldId: string;
	children: ReactNode;
}

export function ConditionalField({ fieldId, children }: ConditionalFieldProps) {
	const answers = useScreeningStore((state) => state.answers);
	const visible = shouldShowField(fieldId, answers);

	if (!visible) {
		return null;
	}

	return <div data-field-id={fieldId}>{children}</div>;
}
