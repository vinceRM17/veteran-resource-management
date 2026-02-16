import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BusinessSearchResult } from "@/lib/db/types";
import { VerificationBadge } from "./verification-badge";

interface BusinessCardProps {
	business: BusinessSearchResult;
}

export function BusinessCard({ business }: BusinessCardProps) {
	const displayName = business.legal_business_name;
	const hasDBA =
		business.dba_name &&
		business.dba_name !== business.legal_business_name &&
		business.dba_name.trim() !== "";

	return (
		<Card className="hover:shadow-md transition-shadow">
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between gap-4">
					<div className="flex-1 min-w-0">
						<Link
							href={`/directory/businesses/${business.id}`}
							className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
						>
							{displayName}
						</Link>
						{hasDBA && (
							<p className="text-sm text-gray-600 mt-1">DBA: {business.dba_name}</p>
						)}
					</div>
					{business.business_type && (
						<Badge variant="secondary" className="shrink-0">
							{business.business_type === "Service Disabled Veteran Owned Small Business"
								? "SDVOSB"
								: "VOSB"}
						</Badge>
					)}
				</div>
			</CardHeader>

			<CardContent className="space-y-3">
				{/* Location */}
				{(business.city || business.state || business.zip_code) && (
					<div className="text-sm text-gray-700">
						<span className="font-medium">Location: </span>
						{[business.city, business.state, business.zip_code]
							.filter(Boolean)
							.join(", ")}
					</div>
				)}

				{/* Industry */}
				{business.naics_descriptions && (
					<div className="text-sm text-gray-700">
						<span className="font-medium">Industry: </span>
						<span className="line-clamp-2">{business.naics_descriptions}</span>
					</div>
				)}

				{/* Owner info */}
				{(business.owner_name || business.service_branch) && (
					<div className="text-sm text-gray-600">
						{business.owner_name && <span>Owner: {business.owner_name}</span>}
						{business.service_branch && (
							<span>
								{business.owner_name ? " • " : ""}
								{business.service_branch}
							</span>
						)}
					</div>
				)}

				{/* Contact */}
				<div className="flex flex-wrap gap-4 text-sm">
					{business.phone && (
						<a
							href={`tel:${business.phone}`}
							className="text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
						>
							{business.phone}
						</a>
					)}
					{business.email && (
						<a
							href={`mailto:${business.email}`}
							className="text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
						>
							Email
						</a>
					)}
					{business.website && (
						<a
							href={business.website}
							target="_blank"
							rel="noopener noreferrer"
							className="text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
						>
							Website
						</a>
					)}
				</div>

				{/* Verification badge */}
				<div className="pt-2 border-t">
					<VerificationBadge lastVerifiedDate={business.last_verified_date} />
				</div>
			</CardContent>
		</Card>
	);
}
