import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { BusinessSearchForm } from "@/components/directory/business-search-form";
import { BusinessCard } from "@/components/directory/business-card";
import { PaginationControls } from "@/components/directory/pagination-controls";
import {
	searchBusinesses,
	getDistinctStates,
	getDistinctBusinessTypes,
} from "@/lib/db/queries";

export const metadata: Metadata = {
	title: "Veteran-Owned Business Directory | Veteran Resource Management",
	description:
		"Search 5,500+ veteran-owned businesses by industry, location, and business type.",
};

interface SearchParams {
	q?: string;
	state?: string;
	type?: string;
	page?: string;
}

interface BusinessSearchPageProps {
	searchParams: Promise<SearchParams>;
}

async function BusinessSearchResults({ searchParams }: BusinessSearchPageProps) {
	const params = await searchParams;
	const query = params.q;
	const state = params.state;
	const businessType = params.type;
	const page = Number(params.page) || 1;

	const [searchResult, states, businessTypes] = await Promise.all([
		searchBusinesses({
			query,
			state,
			businessType,
			page,
			pageSize: 20,
		}),
		getDistinctStates(),
		getDistinctBusinessTypes(),
	]);

	const { results, totalCount, totalPages } = searchResult;

	return (
		<>
			<BusinessSearchForm states={states} businessTypes={businessTypes} />

			{/* Results count */}
			<div className="flex items-center justify-between">
				<p className="text-sm text-gray-600">
					{totalCount > 0 ? (
						<>
							Found <strong>{totalCount.toLocaleString()}</strong> veteran-owned
							business{totalCount !== 1 ? "es" : ""}
						</>
					) : (
						"No businesses found"
					)}
				</p>
				{results.length > 0 && (
					<Link
						href="/directory"
						className="text-sm text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
					>
						Search organizations instead
					</Link>
				)}
			</div>

			{/* Results list */}
			{results.length > 0 ? (
				<>
					<div className="grid gap-4">
						{results.map((business) => (
							<BusinessCard key={business.id} business={business} />
						))}
					</div>

					<PaginationControls
						totalCount={totalCount}
						currentPage={page}
						pageSize={20}
						totalPages={totalPages}
					/>
				</>
			) : (
				<div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
					<p className="text-gray-600 mb-4">
						No veteran-owned businesses match your search criteria.
					</p>
					<p className="text-sm text-gray-500">
						Try adjusting your filters or search terms, or{" "}
						<Link
							href="/directory/businesses"
							className="text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
						>
							browse all businesses
						</Link>
						.
					</p>
				</div>
			)}
		</>
	);
}

export default async function BusinessSearchPage(
	props: BusinessSearchPageProps,
) {
	return (
		<div className="container mx-auto px-4 py-8 max-w-6xl">
			<div className="mb-8">
				<div className="flex items-center justify-between mb-4">
					<h1 className="text-3xl font-bold">
						Veteran-Owned Business Directory
					</h1>
					<Link
						href="/directory"
						className="text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
					>
						Back to organization directory
					</Link>
				</div>
				<p className="text-lg text-gray-700">
					Find veteran-owned businesses for services you need. Search by business
					name, industry, or location.
				</p>
			</div>

			<div className="space-y-6">
				<Suspense
					fallback={
						<div className="text-center py-8 text-gray-500">
							Loading businesses...
						</div>
					}
				>
					<BusinessSearchResults searchParams={props.searchParams} />
				</Suspense>
			</div>
		</div>
	);
}
