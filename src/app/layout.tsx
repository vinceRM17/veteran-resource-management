import type { Metadata } from "next";
import "./globals.css";

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
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
