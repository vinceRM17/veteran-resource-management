"use client";

/**
 * PDF Download Button - Client component for browser-side PDF generation
 *
 * Uses dynamic import to avoid SSR issues with @react-pdf/renderer.
 * Renders a styled button that triggers PDF download.
 */

import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface PDFDownloadButtonProps {
	results: Array<{
		programName: string;
		confidence: string;
		confidenceLabel: string;
		description?: string;
		requiredDocs: string[];
		nextSteps: string[];
	}>;
}

export function PDFDownloadButton({ results }: PDFDownloadButtonProps) {
	const [isClient, setIsClient] = useState(false);
	const [PDFModule, setPDFModule] = useState<{
		pdf: typeof import("@react-pdf/renderer").pdf;
	} | null>(null);
	const [ScreeningPDF, setScreeningPDF] = useState<{
		ScreeningResultsPDF: typeof import("@/lib/pdf/screening-results").ScreeningResultsPDF;
	} | null>(null);
	const [isGenerating, setIsGenerating] = useState(false);

	useEffect(() => {
		setIsClient(true);

		// Dynamically import both modules
		Promise.all([
			import("@react-pdf/renderer"),
			import("@/lib/pdf/screening-results"),
		]).then(([pdfMod, pdfComponent]) => {
			setPDFModule({ pdf: pdfMod.pdf });
			setScreeningPDF({
				ScreeningResultsPDF: pdfComponent.ScreeningResultsPDF,
			});
		});
	}, []);

	async function handleDownload() {
		if (!PDFModule || !ScreeningPDF) return;

		setIsGenerating(true);
		try {
			const today = new Date().toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
			});

			const doc = (
				<ScreeningPDF.ScreeningResultsPDF
					generatedDate={today}
					results={results}
				/>
			);

			const blob = await PDFModule.pdf(doc).toBlob();
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			const dateStr = new Date().toISOString().split("T")[0];
			link.href = url;
			link.download = `screening-results-${dateStr}.pdf`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error("PDF generation failed:", error);
		} finally {
			setIsGenerating(false);
		}
	}

	if (!isClient) {
		return null;
	}

	const isReady = PDFModule && ScreeningPDF;

	return (
		<Button
			onClick={handleDownload}
			disabled={!isReady || isGenerating}
			className="w-full"
			size="lg"
		>
			<Download className="h-4 w-4 mr-2" />
			{isGenerating
				? "Generating PDF..."
				: !isReady
					? "Preparing PDF..."
					: "Download Results (PDF)"}
		</Button>
	);
}
