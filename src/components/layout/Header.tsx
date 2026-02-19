import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./LogoutButton";

export async function Header() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	return (
		<header className="bg-[hsl(152_42%_18%)] text-white">
			<div className="container mx-auto px-4 py-4">
				<div className="flex items-center justify-between">
					<Link
						href="/"
						className="text-xl font-bold font-[family-name:var(--font-heading)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(152_42%_18%)] rounded"
					>
						Veteran Resource Management
					</Link>
					<nav aria-label="Main navigation">
						<ul className="flex gap-6 items-center">
							<li>
								<Link
									href="/"
									className="text-white/80 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded transition-colors"
								>
									Home
								</Link>
							</li>
							<li>
								<Link
									href="/directory"
									className="text-white/80 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded transition-colors"
								>
									Directory
								</Link>
							</li>
							<li>
								<Link
									href="/directory/businesses"
									className="text-white/80 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded transition-colors"
								>
									Businesses
								</Link>
							</li>
							<li>
								<Link
									href="/resources/documents"
									className="text-white/80 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded transition-colors"
								>
									Documents
								</Link>
							</li>
							<li>
								<Link
									href="/screening"
									className="text-white/80 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded transition-colors"
								>
									Screening
								</Link>
							</li>
							<li>
								<Link
									href="/tools"
									className="text-white/80 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded transition-colors"
								>
									Tools
								</Link>
							</li>
							<li>
								<Link
									href="/peer-connection"
									className="text-white/80 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded transition-colors"
								>
									Peer Connections
								</Link>
							</li>
							{user ? (
								<>
									<li>
										<Link
											href="/dashboard"
											className="text-white/80 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded transition-colors"
										>
											Dashboard
										</Link>
									</li>
									<li className="text-sm text-white/60">{user.email}</li>
									<li>
										<LogoutButton />
									</li>
								</>
							) : (
								<>
									<li>
										<Link
											href="/login"
											className="text-white/80 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded transition-colors"
										>
											Log in
										</Link>
									</li>
									<li>
										<Link
											href="/signup"
											className="inline-block px-4 py-2 bg-[hsl(40_82%_55%)] text-[hsl(30_15%_12%)] font-medium rounded-md hover:bg-[hsl(40_82%_60%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(152_42%_18%)] transition-colors"
										>
											Sign up
										</Link>
									</li>
								</>
							)}
						</ul>
					</nav>
				</div>
			</div>
		</header>
	);
}
