import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { VerificationBadge } from "@/components/directory/verification-badge";
import { BookmarkButton } from "@/components/directory/BookmarkButton";
import { getBusinessById } from "@/lib/db/queries";
import { createClient } from "@/lib/supabase/server";
import { isBookmarked } from "@/lib/db/bookmark-actions";
import {
	MapPin,
	Phone,
	Mail,
	Globe,
	Building2,
	User,
	Shield,
	FileText,
	ArrowLeft,
} from "lucide-react";

interface BusinessDetailPageProps {
	params: Promise<{ id: string }>;
}

export async function generateMetadata(
	props: BusinessDetailPageProps,
): Promise<Metadata> {
	const params = await props.params;
	const business = await getBusinessById(params.id);

	if (!business) {
		return {
			title: "Business Not Found | Veteran Resource Management",
		};
	}

	return {
		title: `${business.legal_business_name} | Veteran-Owned Business Directory`,
		description: business.naics_descriptions
			? `${business.legal_business_name} - ${business.naics_descriptions.substring(0, 150)}`
			: `${business.legal_business_name} - Veteran-owned business in ${business.city}, ${business.state}`,
	};
}

export default async function BusinessDetailPage(
	props: BusinessDetailPageProps,
) {
	const params = await props.params;
	const business = await getBusinessById(params.id);

	if (!business) {
		notFound();
	}

	// Check auth and bookmark status
	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();
	const bookmarked = user ? await isBookmarked('business', params.id) : false;

	const hasDBA =
		business.dba_name &&
		business.dba_name !== business.legal_business_name &&
		business.dba_name.trim() !== "";

	return (
		<div className="container mx-auto px-4 py-8 max-w-5xl">
			{/* Back link */}
			<Link
				href="/directory/businesses"
				className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
			>
				<ArrowLeft className="h-4 w-4" />
				Back to business directory
			</Link>

			{/* Header */}
			<div className="mb-8">
				<div className="flex items-start justify-between gap-4 mb-4">
					<div className="flex-1 min-w-0">
						<h1 className="text-4xl font-bold mb-2">
							{business.legal_business_name}
						</h1>
						{hasDBA && (
							<p className="text-xl text-gray-600">DBA: {business.dba_name}</p>
						)}
					</div>
					{business.business_type && (
						<Badge variant="default" className="text-lg px-4 py-2 shrink-0">
							{business.business_type === "Service Disabled Veteran Owned Small Business"
								? "SDVOSB"
								: business.business_type}
						</Badge>
					)}
				</div>

				<VerificationBadge
					lastVerifiedDate={business.last_verified_date}
					variant="large"
				/>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Main content - 2 columns */}
				<div className="lg:col-span-2 space-y-6">
					{/* Contact Information */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Phone className="h-5 w-5" />
								Contact Information
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Address */}
							{(business.physical_address_line1 ||
								business.city ||
								business.state) && (
								<div className="flex gap-3">
									<MapPin className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
									<div>
										<p className="font-medium text-gray-900">Address</p>
										{business.physical_address_line1 && (
											<p className="text-gray-700">
												{business.physical_address_line1}
											</p>
										)}
										{business.physical_address_line2 && (
											<p className="text-gray-700">
												{business.physical_address_line2}
											</p>
										)}
										{(business.city || business.state || business.zip_code) && (
											<p className="text-gray-700">
												{[business.city, business.state, business.zip_code]
													.filter(Boolean)
													.join(", ")}
											</p>
										)}
										{business.country && business.country !== "USA" && (
											<p className="text-gray-700">{business.country}</p>
										)}
									</div>
								</div>
							)}

							<Separator />

							{/* Phone */}
							{business.phone && (
								<div className="flex gap-3">
									<Phone className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
									<div>
										<p className="font-medium text-gray-900">Phone</p>
										<a
											href={`tel:${business.phone}`}
											className="text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
										>
											{business.phone}
										</a>
									</div>
								</div>
							)}

							{/* Email */}
							{business.email && (
								<div className="flex gap-3">
									<Mail className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
									<div>
										<p className="font-medium text-gray-900">Email</p>
										<a
											href={`mailto:${business.email}`}
											className="text-blue-600 hover:underline break-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
										>
											{business.email}
										</a>
									</div>
								</div>
							)}

							{/* Website */}
							{business.website && (
								<div className="flex gap-3">
									<Globe className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
									<div>
										<p className="font-medium text-gray-900">Website</p>
										<a
											href={business.website}
											target="_blank"
											rel="noopener noreferrer"
											className="text-blue-600 hover:underline break-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
										>
											{business.website}
										</a>
									</div>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Industry Classification */}
					{(business.naics_codes || business.naics_descriptions) && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Building2 className="h-5 w-5" />
									Industry Classification
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								{business.naics_descriptions && (
									<div>
										<p className="font-medium text-gray-900 mb-2">
											Industry Description
										</p>
										<p className="text-gray-700 leading-relaxed">
											{business.naics_descriptions}
										</p>
									</div>
								)}
								{business.naics_codes && (
									<div>
										<p className="font-medium text-gray-900 mb-1">NAICS Codes</p>
										<p className="text-sm text-gray-600 font-mono">
											{business.naics_codes}
										</p>
									</div>
								)}
							</CardContent>
						</Card>
					)}
				</div>

				{/* Sidebar - 1 column */}
				<div className="space-y-6">
					{/* Owner Information */}
					{(business.owner_name || business.service_branch) && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<User className="h-5 w-5" />
									Owner Information
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								{business.owner_name && (
									<div>
										<p className="font-medium text-gray-900">Owner</p>
										<p className="text-gray-700">{business.owner_name}</p>
									</div>
								)}
								{business.service_branch && (
									<div>
										<p className="font-medium text-gray-900">Service Branch</p>
										<p className="text-gray-700">{business.service_branch}</p>
									</div>
								)}
							</CardContent>
						</Card>
					)}

					{/* Registration Information */}
					{(business.uei ||
						business.cage_code ||
						business.registration_status ||
						business.registration_expiration) && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Shield className="h-5 w-5" />
									Registration
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								{business.registration_status && (
									<div>
										<p className="font-medium text-gray-900">Status</p>
										<p className="text-gray-700">{business.registration_status}</p>
									</div>
								)}
								{business.registration_expiration && (
									<div>
										<p className="font-medium text-gray-900">Expires</p>
										<p className="text-gray-700">
											{new Date(
												business.registration_expiration,
											).toLocaleDateString("en-US", {
												year: "numeric",
												month: "long",
												day: "numeric",
											})}
										</p>
									</div>
								)}
								{business.uei && (
									<div>
										<p className="font-medium text-gray-900">UEI</p>
										<p className="text-sm text-gray-600 font-mono">
											{business.uei}
										</p>
									</div>
								)}
								{business.cage_code && (
									<div>
										<p className="font-medium text-gray-900">CAGE Code</p>
										<p className="text-sm text-gray-600 font-mono">
											{business.cage_code}
										</p>
									</div>
								)}
							</CardContent>
						</Card>
					)}

					{/* Data Source */}
					{business.source && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<FileText className="h-5 w-5" />
									Data Source
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-gray-600">{business.source}</p>
							</CardContent>
						</Card>
					)}

					{/* Save Resource */}
					<Card>
						<CardContent className="pt-6">
							<BookmarkButton
								resourceType="business"
								resourceId={params.id}
								resourceName={business.legal_business_name}
								initialBookmarked={bookmarked}
								isLoggedIn={!!user}
							/>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
