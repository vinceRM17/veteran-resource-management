import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

/**
 * Screening landing page. Server Component.
 * Introduces the screening flow and provides a start button.
 */
export default function ScreeningPage() {
	return (
		<div className="container mx-auto max-w-2xl px-4 py-12">
			<div className="text-center mb-8">
				<h1 className="text-3xl font-bold tracking-tight mb-3">
					Find Benefits You May Qualify For
				</h1>
				<p className="text-lg text-muted-foreground">
					Answer a few questions to see which programs can help you. No account
					needed.
				</p>
			</div>

			<Card className="mb-8">
				<CardHeader>
					<CardTitle>How it works</CardTitle>
					<CardDescription>
						A quick screening to match you with programs
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="flex gap-3 items-start">
						<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
							1
						</span>
						<p>
							Answer a few questions about yourself and your needs. Takes about
							3 to 5 minutes.
						</p>
					</div>
					<div className="flex gap-3 items-start">
						<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
							2
						</span>
						<p>
							We check your answers against program rules to find what you may
							qualify for.
						</p>
					</div>
					<div className="flex gap-3 items-start">
						<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
							3
						</span>
						<p>See your results with next steps and documents you may need.</p>
					</div>
				</CardContent>
			</Card>

			<div className="text-center space-y-4">
				<Button asChild size="lg">
					<Link href="/screening/intake/step-1">Start Screening</Link>
				</Button>
				<p className="text-sm text-muted-foreground">
					Your answers stay on your device. We do not store your personal
					information without your consent.
				</p>
			</div>
		</div>
	);
}
