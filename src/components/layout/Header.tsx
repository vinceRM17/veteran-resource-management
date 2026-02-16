"use client";

import Link from "next/link";

export function Header() {
	return (
		<header className="border-b">
			<div className="container mx-auto px-4 py-4">
				<div className="flex items-center justify-between">
					<Link
						href="/"
						className="text-xl font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
					>
						Veteran Resource Management
					</Link>
					<nav aria-label="Main navigation">
						<ul className="flex gap-6">
							<li>
								<Link
									href="/"
									className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
								>
									Home
								</Link>
							</li>
							<li>
								<Link
									href="/directory"
									className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
								>
									Directory
								</Link>
							</li>
							<li>
								<Link
									href="/screening"
									className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
								>
									Screening
								</Link>
							</li>
						</ul>
					</nav>
				</div>
			</div>
		</header>
	);
}
