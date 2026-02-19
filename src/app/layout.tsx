import type { Metadata } from "next";
import { Lora, Source_Sans_3 } from "next/font/google";
import { Toaster } from "sonner";
import { CrisisBanner } from "@/components/crisis/CrisisBanner";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SkipLink } from "@/components/layout/SkipLink";
import "./globals.css";

const lora = Lora({
	subsets: ["latin"],
	variable: "--font-heading",
	display: "swap",
});

const sourceSans = Source_Sans_3({
	subsets: ["latin"],
	variable: "--font-body",
	display: "swap",
});

export const metadata: Metadata = {
	title: "Veteran Resource Management",
	description:
		"Connecting veterans and their families to resources, programs, and support across Kentucky.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={`${lora.variable} ${sourceSans.variable}`}>
			<body className="flex flex-col min-h-screen">
				<SkipLink />
				<CrisisBanner />
				<Header />
				<main id="main-content" tabIndex={-1} className="flex-1">
					{children}
				</main>
				<Footer />
				<Toaster />
			</body>
		</html>
	);
}
