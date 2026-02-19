/**
 * Screening Results Page
 *
 * Server Component that fetches and displays screening results.
 * Programs are grouped by confidence level with documents and next steps.
 */

import { Briefcase, ChevronRight, FileText, MapPin } from "lucide-react";
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
import type { ProgramMatch, ScreeningResult } from "@/lib/db/screening-types";
import { searchOrganizations, searchBusinesses } from "@/lib/db/queries";
import { detectBenefitInteractions } from "@/lib/eligibility/interaction-detector";
import { createClient } from "@/lib/supabase/server";
import { InteractionWarningBanner } from "@/components/screening/interaction-warning";
import { SaveResultsCTA } from "@/components/screening/SaveResultsCTA";
import { PDFDownloadButton } from "./pdf-download";

// Map screening areas of need to directory service categories
const AREA_TO_CATEGORIES: Record<string, string[]> = {
	healthcare: ["Healthcare"],
	"disability-compensation": ["Disability", "Benefits Assistance"],
	"food-assistance": ["Food"],
	housing: ["Housing", "Homelessness"],
	employment: ["Employment"],
	education: ["Education"],
	"mental-health": ["Mental Health", "Substance Abuse"],
	community: ["Veterans", "Social Services"],
	fitness: ["Recreation", "Health"],
	networking: ["Employment", "Education"],
	"family-support": ["Family Support"],
	legal: ["Legal"],
	"financial-planning": ["Financial"],
	"caregiver-support": ["Family Support"],
};

// Map screening areas of need to business search terms (NAICS-oriented)
const AREA_TO_BUSINESS_SEARCH: Record<string, string[]> = {
	healthcare: ["health", "medical", "clinic"],
	housing: ["construction", "real estate", "property management"],
	employment: ["staffing", "consulting", "professional services"],
	legal: ["legal", "law"],
	"financial-planning": ["financial", "accounting", "tax"],
	"mental-health": ["counseling", "behavioral health"],
	education: ["training", "education", "tutoring"],
	"family-support": ["family services", "child care"],
	"food-assistance": ["food", "catering", "restaurant"],
};

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

/**
 * Renders text with URLs auto-linked as clickable anchor tags.
 */
function Linkify({ text }: { text: string }) {
	const parts = text.split(/(https?:\/\/[^\s,)]+)/g);

	return (
		<>
			{parts.map((part, i) =>
				/^https?:\/\//.test(part) ? (
					<a
						key={`${part}-${i}`}
						href={part}
						target="_blank"
						rel="noopener noreferrer"
						className="text-primary underline hover:text-primary/80"
					>
						{part.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
					</a>
				) : (
					<span key={`${part}-${i}`}>{part}</span>
				),
			)}
		</>
	);
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
												<Linkify text={doc.howToObtain} />
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
									<Linkify text={step} />
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

	// Get current user auth status
	const {
		data: { user },
	} = await supabase.auth.getUser();

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

	// Fetch local organizations based on screening answers
	const answers = (session.answers ?? {}) as Record<string, unknown>;
	const userState = (answers.state as string) || null;
	const userZip = (answers.zipCode as string) || null;
	const areasOfNeed = (answers.areasOfNeed as string[]) || [];

	// Build search categories from areas of need
	const categoryGroups: Array<{ areaLabel: string; categories: string[] }> = [];
	const AREA_LABELS: Record<string, string> = {
		healthcare: "Healthcare",
		"disability-compensation": "Disability & Benefits",
		"food-assistance": "Food Assistance",
		housing: "Housing",
		employment: "Employment",
		education: "Education & Training",
		"mental-health": "Mental Health",
		community: "Community & Companionship",
		fitness: "Fitness & Recreation",
		networking: "Networking & Careers",
		"family-support": "Family Support",
		legal: "Legal Help",
		"financial-planning": "Financial Planning",
		"caregiver-support": "Caregiver Support",
	};

	for (const area of areasOfNeed) {
		const mapped = AREA_TO_CATEGORIES[area];
		if (mapped) {
			categoryGroups.push({
				areaLabel: AREA_LABELS[area] || area,
				categories: mapped,
			});
		}
	}

	// Fetch local organizations by category, grouped by area of need
	interface LocalOrg {
		id: string;
		name: string;
		city: string | null;
		state: string | null;
		serviceCategories: string | null;
		phone: string | null;
		website: string | null;
	}

	interface OrgGroup {
		areaLabel: string;
		orgs: LocalOrg[];
	}

	const orgGroups: OrgGroup[] = [];

	if (userState) {
		const seenOrgIds = new Set<string>();

		try {
			// Query per category group so results are relevant to each need area
			const groupPromises = categoryGroups.map(async (group) => {
				const orgs: LocalOrg[] = [];
				for (const category of group.categories) {
					const { results: orgResults } = await searchOrganizations({
						state: userState,
						serviceCategory: category,
						location: userZip || undefined,
						pageSize: 4,
					});

					for (const o of orgResults) {
						if (!seenOrgIds.has(o.id)) {
							seenOrgIds.add(o.id);
							orgs.push({
								id: o.id,
								name: o.org_name,
								city: o.city,
								state: o.state,
								serviceCategories: o.service_categories,
								phone: o.phone,
								website: o.website,
							});
						}
					}
				}
				return { areaLabel: group.areaLabel, orgs: orgs.slice(0, 4) };
			});

			const results = await Promise.all(groupPromises);
			for (const group of results) {
				if (group.orgs.length > 0) {
					orgGroups.push(group);
				}
			}
		} catch {
			// Non-critical: if directory query fails, just skip this section
		}
	}

	const totalLocalOrgs = orgGroups.reduce((sum, g) => sum + g.orgs.length, 0);

	// Fetch veteran-owned businesses based on areas of need
	interface LocalBiz {
		id: string;
		name: string;
		city: string | null;
		state: string | null;
		businessType: string | null;
		phone: string | null;
		website: string | null;
	}

	interface BizGroup {
		areaLabel: string;
		businesses: LocalBiz[];
	}

	const bizGroups: BizGroup[] = [];

	if (userState) {
		const seenBizIds = new Set<string>();

		try {
			const bizGroupPromises = areasOfNeed
				.filter((area) => AREA_TO_BUSINESS_SEARCH[area])
				.map(async (area) => {
					const searchTerms = AREA_TO_BUSINESS_SEARCH[area];
					const businesses: LocalBiz[] = [];

					for (const term of searchTerms) {
						if (businesses.length >= 4) break;
						// Don't pass zip as location — most businesses lack zip codes,
					// so the filter would eliminate nearly all results. State is sufficient.
					const { results: bizResults } = await searchBusinesses({
							query: term,
							state: userState,
							pageSize: 4,
						});

						for (const b of bizResults) {
							if (!seenBizIds.has(b.id) && businesses.length < 4) {
								seenBizIds.add(b.id);
								businesses.push({
									id: b.id,
									name: b.legal_business_name,
									city: b.city,
									state: b.state,
									businessType: b.business_type,
									phone: b.phone,
									website: b.website,
								});
							}
						}
					}

					return {
						areaLabel: AREA_LABELS[area] || area,
						businesses,
					};
				});

			const bizResults = await Promise.all(bizGroupPromises);
			for (const group of bizResults) {
				if (group.businesses.length > 0) {
					bizGroups.push(group);
				}
			}
		} catch {
			// Non-critical: if business query fails, just skip this section
		}
	}

	const totalLocalBiz = bizGroups.reduce(
		(sum, g) => sum + g.businesses.length,
		0,
	);

	// Build ProgramMatch[] from screening results for interaction detection
	const programMatches: ProgramMatch[] = screeningResults.map((r) => ({
		programId: r.program_id,
		programName: r.program_name,
		confidence: r.confidence,
		confidenceLabel: r.confidence_label,
		requiredDocs: r.required_docs,
		nextSteps: r.next_steps,
		description: getProgramDescription(r.program_id) ?? "",
	}));

	// Detect benefit interactions after eligibility evaluation
	const interactions = await detectBenefitInteractions(programMatches, answers);

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

			{screeningResults.length === 0 && totalLocalOrgs === 0 && totalLocalBiz === 0 ? (
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

					{/* Benefit Interaction Warnings */}
					{interactions.length > 0 && (
						<>
							<Separator className="my-8" />
							<InteractionWarningBanner interactions={interactions} />
						</>
					)}

					{/* Local Resources — grouped by area of need */}
					{totalLocalOrgs > 0 && (
						<>
							<Separator className="my-8" />
							<section className="mb-8">
								<div className="rounded-lg p-4 mb-4 bg-blue-50 text-blue-900 border border-blue-200">
									<h3 className="text-lg font-semibold flex items-center gap-2">
										<MapPin className="h-5 w-5" />
										Organizations Near You
									</h3>
									<p className="text-sm opacity-80">
										Nonprofits, support groups, and community organizations that
										match your needs{userZip ? ` near ${userZip}` : ""}.
									</p>
								</div>

								{orgGroups.map((group) => (
									<div key={group.areaLabel} className="mb-6">
										<h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
											{group.areaLabel}
										</h4>
										<div className="grid gap-3">
											{group.orgs.map((org) => (
												<Link
													key={org.id}
													href={`/directory/${org.id}`}
													className="block"
												>
													<Card className="hover:border-primary transition-colors">
														<CardContent className="py-3 px-4">
															<p className="font-medium text-sm">{org.name}</p>
															{(org.city || org.state) && (
																<p className="text-xs text-muted-foreground flex items-center gap-1">
																	<MapPin className="h-3 w-3" />
																	{[org.city, org.state]
																		.filter(Boolean)
																		.join(", ")}
																</p>
															)}
															{org.phone && (
																<p className="text-xs text-muted-foreground mt-0.5">
																	{org.phone}
																</p>
															)}
														</CardContent>
													</Card>
												</Link>
											))}
										</div>
									</div>
								))}

								<Button variant="outline" asChild className="w-full mt-3">
									<Link href={`/directory?state=${userState || ""}`}>
										Browse All Organizations in Your Area
									</Link>
								</Button>
							</section>
						</>
					)}

					{/* Veteran-Owned Businesses Near You */}
					{totalLocalBiz > 0 && (
						<>
							<Separator className="my-8" />
							<section className="mb-8">
								<div className="rounded-lg p-4 mb-4 bg-emerald-50 text-emerald-900 border border-emerald-200">
									<h3 className="text-lg font-semibold flex items-center gap-2">
										<Briefcase className="h-5 w-5" />
										Veteran-Owned Businesses Near You
									</h3>
									<p className="text-sm opacity-80">
										Support fellow veterans by connecting with veteran-owned
										businesses that match your needs
										{userZip ? ` near ${userZip}` : ""}.
									</p>
								</div>

								{bizGroups.map((group) => (
									<div key={group.areaLabel} className="mb-6">
										<h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
											{group.areaLabel}
										</h4>
										<div className="grid gap-3">
											{group.businesses.map((biz) => (
												<Link
													key={biz.id}
													href={`/directory/businesses/${biz.id}`}
													className="block"
												>
													<Card className="hover:border-primary transition-colors">
														<CardContent className="py-3 px-4">
															<p className="font-medium text-sm">
																{biz.name}
															</p>
															<div className="flex items-center gap-2 mt-0.5">
																{(biz.city || biz.state) && (
																	<p className="text-xs text-muted-foreground flex items-center gap-1">
																		<MapPin className="h-3 w-3" />
																		{[biz.city, biz.state]
																			.filter(Boolean)
																			.join(", ")}
																	</p>
																)}
																{biz.businessType && (
																	<Badge
																		variant="secondary"
																		className="text-xs"
																	>
																		{biz.businessType ===
																		"Service Disabled Veteran Owned Small Business"
																			? "SDVOSB"
																			: "VOSB"}
																	</Badge>
																)}
															</div>
															{biz.phone && (
																<p className="text-xs text-muted-foreground mt-0.5">
																	{biz.phone}
																</p>
															)}
														</CardContent>
													</Card>
												</Link>
											))}
										</div>
									</div>
								))}

								<Button variant="outline" asChild className="w-full mt-3">
									<Link
										href={`/directory/businesses?state=${userState || ""}`}
									>
										Browse All Veteran-Owned Businesses
									</Link>
								</Button>
							</section>
						</>
					)}

					{/* Save Results CTA */}
					<SaveResultsCTA
						sessionId={sessionId}
						isLoggedIn={!!user}
						isAlreadyClaimed={session.user_id !== null}
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
