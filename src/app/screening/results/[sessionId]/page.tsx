/**
 * Screening Results Page
 *
 * Server Component that fetches and displays screening results.
 * Programs are grouped by confidence level with documents and next steps.
 */

import { ChevronRight, FileText } from "lucide-react";
import Link from "next/link";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { documentationChecklists } from "@/content/documentation-checklists";
import type { ScreeningResult } from "@/lib/db/screening-types";
import { createClient } from "@/lib/supabase/server";
import { PDFDownloadButton } from "./pdf-download";

// ============================================================================
// TYPES
// ============================================================================

interface ResultsPageProps {
	params: Promise<{ sessionId: string }>;
}

interface GroupedResults {
	high: ScreeningResult[];
	medium: ScreeningResult[];
	low: ScreeningResult[];
}

// ============================================================================
// HELPERS
// ============================================================================

function groupByConfidence(results: ScreeningResult[]): GroupedResults {
	const groups: GroupedResults = { high: [], medium: [], low: [] };
	for (const result of results) {
		if (result.confidence in groups) {
			groups[result.confidence as keyof GroupedResults].push(result);
		}
	}
	return groups;
}

function getDocumentDetails(programId: string) {
	const checklist = documentationChecklists.find(
		(c) => c.programId === programId,
	);
	return checklist?.documents ?? [];
}

function getProgramDescription(programId: string): string | undefined {
	const checklist = documentationChecklists.find(
		(c) => c.programId === programId,
	);
	return checklist?.description;
}

// ============================================================================
// PROGRAM CARD
// ============================================================================

function ProgramCard({ result }: { result: ScreeningResult }) {
	const documents = getDocumentDetails(result.program_id);
	const description = getProgramDescription(result.program_id);

	const confidenceBadge =
		result.confidence === "high" ? (
			<Badge className="bg-green-100 text-green-800 border-green-200">
				Likely Eligible
			</Badge>
		) : result.confidence === "medium" ? (
			<Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
				Possibly Eligible
			</Badge>
		) : (
			<Badge variant="secondary">Worth Exploring</Badge>
		);

	return (
		<Card className="mb-4">
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between gap-3">
					<CardTitle className="text-lg">{result.program_name}</CardTitle>
					{confidenceBadge}
				</div>
				{description && (
					<p className="text-sm text-muted-foreground mt-1">{description}</p>
				)}
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Documents section */}
				{documents.length > 0 && (
					<Accordion type="single" collapsible>
						<AccordionItem value="docs" className="border-none">
							<AccordionTrigger className="py-2 text-sm font-medium">
								<span className="flex items-center gap-2">
									<FileText className="h-4 w-4" />
									Documents You'll Need ({documents.length})
								</span>
							</AccordionTrigger>
							<AccordionContent>
								<ul className="space-y-3">
									{documents.map((doc) => (
										<li key={doc.name} className="text-sm">
											<div className="flex items-start gap-2">
												<span className="font-medium">{doc.name}</span>
												{doc.required ? (
													<Badge variant="outline" className="text-xs shrink-0">
														Required
													</Badge>
												) : (
													<Badge
														variant="secondary"
														className="text-xs shrink-0"
													>
														Recommended
													</Badge>
												)}
											</div>
											<p className="text-muted-foreground mt-0.5">
												{doc.howToObtain}
											</p>
										</li>
									))}
								</ul>
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				)}

				{/* Next steps */}
				{result.next_steps.length > 0 && (
					<div>
						<h4 className="text-sm font-medium mb-2">Next Steps</h4>
						<ol className="list-decimal list-inside space-y-1">
							{result.next_steps.map((step) => (
								<li key={step} className="text-sm text-muted-foreground">
									{step}
								</li>
							))}
						</ol>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

// ============================================================================
// RESULTS SECTION
// ============================================================================

function ResultsSection({
	title,
	description,
	results,
	colorClass,
}: {
	title: string;
	description: string;
	results: ScreeningResult[];
	colorClass: string;
}) {
	if (results.length === 0) return null;

	return (
		<section className="mb-8">
			<div className={`rounded-lg p-4 mb-4 ${colorClass}`}>
				<h3 className="text-lg font-semibold">{title}</h3>
				<p className="text-sm opacity-80">{description}</p>
			</div>
			{results.map((result) => (
				<ProgramCard key={result.id} result={result} />
			))}
		</section>
	);
}

// ============================================================================
// PAGE
// ============================================================================

export default async function ScreeningResultsPage({
	params,
}: ResultsPageProps) {
	const { sessionId } = await params;
	const supabase = await createClient();

	// Fetch screening session
	const { data: session } = await supabase
		.from("screening_sessions")
		.select("*")
		.eq("id", sessionId)
		.single();

	if (!session) {
		return (
			<div className="max-w-2xl mx-auto px-4 py-12 text-center">
				<h1 className="text-2xl font-bold mb-4">Results Not Found</h1>
				<p className="text-muted-foreground mb-6">
					We could not find screening results for this session. The link may
					have expired or be incorrect.
				</p>
				<Button asChild>
					<Link href="/screening">Start a New Screening</Link>
				</Button>
			</div>
		);
	}

	// Fetch screening results
	const { data: results } = await supabase
		.from("screening_results")
		.select("*")
		.eq("session_id", sessionId)
		.order("confidence", { ascending: true });

	const screeningResults = (results ?? []) as ScreeningResult[];
	const grouped = groupByConfidence(screeningResults);

	// Prepare data for PDF component
	const pdfResults = screeningResults.map((r) => ({
		programName: r.program_name,
		confidence: r.confidence,
		confidenceLabel: r.confidence_label,
		description: getProgramDescription(r.program_id),
		requiredDocs: r.required_docs,
		nextSteps: r.next_steps,
	}));

	return (
		<div className="max-w-2xl mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-2">Your Screening Results</h1>
			<p className="text-muted-foreground mb-8">
				Based on your answers, here are the programs you may qualify for.
			</p>

			{screeningResults.length === 0 ? (
				<Card className="p-6 text-center">
					<p className="text-muted-foreground mb-4">
						We did not find any program matches based on your answers. This does
						not mean you are ineligible — contact a Veterans Service
						Organization for personalized help.
					</p>
					<Button asChild>
						<Link href="/screening">Try Again</Link>
					</Button>
				</Card>
			) : (
				<>
					<ResultsSection
						title="Likely Eligible"
						description="Based on your answers, you appear to meet the main requirements for these programs."
						results={grouped.high}
						colorClass="bg-green-50 text-green-900 border border-green-200"
					/>

					<ResultsSection
						title="Possibly Eligible"
						description="You may qualify for these programs. We recommend looking into them."
						results={grouped.medium}
						colorClass="bg-yellow-50 text-yellow-900 border border-yellow-200"
					/>

					<ResultsSection
						title="Worth Exploring"
						description="These programs may also be helpful depending on your situation."
						results={grouped.low}
						colorClass="bg-gray-50 text-gray-700 border border-gray-200"
					/>

					<Separator className="my-8" />

					{/* Actions */}
					<div className="space-y-4">
						<PDFDownloadButton results={pdfResults} />

						<div className="flex flex-col sm:flex-row gap-3">
							<Button variant="outline" asChild className="flex-1">
								<Link href="/screening">
									<ChevronRight className="h-4 w-4 mr-1 rotate-180" />
									Start New Screening
								</Link>
							</Button>
							<Button variant="outline" asChild className="flex-1">
								<Link href="/resources/documents">
									<FileText className="h-4 w-4 mr-1" />
									Document Checklists
								</Link>
							</Button>
						</div>
					</div>
				</>
			)}

			{/* Disclaimer */}
			<div className="mt-8 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
				<p className="font-medium mb-1">Important</p>
				<p>
					These results are estimates based on the information you provided.
					They are not a guarantee of eligibility. Contact a Veterans Service
					Organization or benefits counselor to confirm your eligibility and get
					help applying.
				</p>
			</div>
		</div>
	);
}
