import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./LogoutButton";

export async function Header() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

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
						<ul className="flex gap-6 items-center">
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
									href="/directory/businesses"
									className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
								>
									Businesses
								</Link>
							</li>
							<li>
								<Link
									href="/resources/documents"
									className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
								>
									Documents
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
							{user ? (
								<>
									<li className="text-sm text-gray-600">{user.email}</li>
									<li>
										<LogoutButton />
									</li>
								</>
							) : (
								<>
									<li>
										<Link
											href="/login"
											className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
										>
											Log in
										</Link>
									</li>
									<li>
										<Link
											href="/signup"
											className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
