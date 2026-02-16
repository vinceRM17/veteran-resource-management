import type { Metadata } from "next";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Info } from "lucide-react";
import { documentationChecklists } from "@/content/documentation-checklists";

export const metadata: Metadata = {
	title: "Documentation Checklists | Veteran Resource Management",
	description:
		"Gather these documents before applying to benefit programs to speed up your application process.",
};

export default function DocumentationChecklistsPage() {
	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-4">Documentation Checklists</h1>
				<p className="text-lg text-gray-700">
					Gather these documents before applying to speed up your application
					process. Having everything ready can save weeks of back-and-forth with
					program administrators.
				</p>
			</div>

			<Accordion type="single" collapsible className="space-y-4">
				{documentationChecklists.map((checklist) => {
					const requiredDocs = checklist.documents.filter((doc) => doc.required);
					const recommendedDocs = checklist.documents.filter(
						(doc) => !doc.required,
					);

					return (
						<AccordionItem
							key={checklist.programId}
							value={checklist.programId}
							className="border rounded-lg px-6"
						>
							<AccordionTrigger className="text-left hover:no-underline">
								<div className="flex flex-col items-start gap-2 pr-4">
									<h2 className="text-xl font-semibold">
										{checklist.programName}
									</h2>
									<p className="text-sm text-gray-600">{checklist.description}</p>
								</div>
							</AccordionTrigger>

							<AccordionContent className="space-y-6 pt-4">
								{/* Required Documents */}
								{requiredDocs.length > 0 && (
									<section>
										<h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
											<CheckCircle2 className="h-5 w-5 text-red-600" />
											Required Documents
										</h3>
										<ul className="space-y-4">
											{requiredDocs.map((doc, index) => (
												<li
													key={`${checklist.programId}-req-${index}`}
													className="flex gap-3"
												>
													<input
														type="checkbox"
														id={`${checklist.programId}-req-${index}`}
														className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
														aria-label={`Document: ${doc.name}`}
													/>
													<div className="flex-1">
														<label
															htmlFor={`${checklist.programId}-req-${index}`}
															className="font-medium cursor-pointer flex items-center gap-2"
														>
															{doc.name}
															<Badge variant="destructive" className="text-xs">
																Required
															</Badge>
														</label>
														<p className="text-sm text-gray-600 mt-1">
															{doc.description}
														</p>
														<p className="text-sm text-gray-500 mt-1 italic">
															<strong>How to obtain:</strong> {doc.howToObtain}
														</p>
													</div>
												</li>
											))}
										</ul>
									</section>
								)}

								{/* Recommended Documents */}
								{recommendedDocs.length > 0 && (
									<section>
										<h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
											<Info className="h-5 w-5 text-blue-600" />
											Recommended Documents
										</h3>
										<ul className="space-y-4">
											{recommendedDocs.map((doc, index) => (
												<li
													key={`${checklist.programId}-rec-${index}`}
													className="flex gap-3"
												>
													<input
														type="checkbox"
														id={`${checklist.programId}-rec-${index}`}
														className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
														aria-label={`Document: ${doc.name}`}
													/>
													<div className="flex-1">
														<label
															htmlFor={`${checklist.programId}-rec-${index}`}
															className="font-medium cursor-pointer flex items-center gap-2"
														>
															{doc.name}
															<Badge variant="secondary" className="text-xs">
																Recommended
															</Badge>
														</label>
														<p className="text-sm text-gray-600 mt-1">
															{doc.description}
														</p>
														<p className="text-sm text-gray-500 mt-1 italic">
															<strong>How to obtain:</strong> {doc.howToObtain}
														</p>
													</div>
												</li>
											))}
										</ul>
									</section>
								)}

								{/* Tips */}
								{checklist.tips.length > 0 && (
									<section className="bg-blue-50 border border-blue-200 rounded-lg p-4">
										<h3 className="text-lg font-semibold mb-2">
											Application Tips
										</h3>
										<ul className="space-y-2">
											{checklist.tips.map((tip, index) => (
												<li
													key={`${checklist.programId}-tip-${index}`}
													className="text-sm text-gray-700 flex gap-2"
												>
													<span className="text-blue-600 font-bold">•</span>
													<span>{tip}</span>
												</li>
											))}
										</ul>
									</section>
								)}
							</AccordionContent>
						</AccordionItem>
					);
				})}
			</Accordion>

			<div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
				<h2 className="text-lg font-semibold mb-2">Need Help?</h2>
				<p className="text-sm text-gray-700">
					These checklists are guides based on typical requirements. Individual
					programs may request additional documentation. Contact the program
					directly if you have questions about specific requirements.
				</p>
			</div>
		</div>
	);
}
