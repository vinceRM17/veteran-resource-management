import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getOrganizationById } from '@/lib/db/queries';
import { VerificationBadge } from '@/components/directory/verification-badge';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Phone, Mail, ExternalLink, MapPin, Award, Star } from 'lucide-react';
import type { Metadata } from 'next';

interface OrgDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: OrgDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const org = await getOrganizationById(id);

  if (!org) {
    return {
      title: 'Organization Not Found | Veteran Resource Directory',
      description: 'The requested organization could not be found.',
    };
  }

  return {
    title: `${org.org_name} | Veteran Resource Directory`,
    description: org.mission_statement?.slice(0, 160) || `View details for ${org.org_name}`,
  };
}

export default async function OrgDetailPage({ params }: OrgDetailPageProps) {
  const { id } = await params;
  const org = await getOrganizationById(id);

  if (!org) {
    notFound();
  }

  // Format address
  const address = [
    org.street_address,
    org.street_address_2,
    [org.city, org.state].filter(Boolean).join(', '),
    org.zip_code,
  ]
    .filter(Boolean)
    .join('\n');

  // Parse service categories
  const serviceCategories = org.service_categories
    ?.split(';')
    .map((cat) => cat.trim())
    .filter(Boolean) || [];

  // Parse data sources
  const dataSources = org.data_sources || [];

  // Confidence grade colors
  const gradeColors: Record<string, string> = {
    A: 'bg-green-100 text-green-700 border-green-300',
    B: 'bg-green-50 text-green-600 border-green-200',
    C: 'bg-blue-50 text-blue-600 border-blue-200',
    D: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    F: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        href="/directory"
        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to directory
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{org.org_name}</h1>
        {org.org_name_alt && (
          <p className="text-lg text-muted-foreground mb-4">Also known as: {org.org_name_alt}</p>
        )}
        {org.org_type && (
          <Badge variant="secondary" className="mb-4">
            {org.org_type}
          </Badge>
        )}
      </div>

      {/* Main content - two column layout on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Freshness banner */}
          <div className="flex flex-wrap items-center gap-4">
            <VerificationBadge lastVerifiedDate={org.last_verified_date} variant="large" />
            {org.confidence_grade && (
              <Badge
                variant="outline"
                className={`text-base px-4 py-2 ${gradeColors[org.confidence_grade] || 'bg-gray-50 text-gray-600 border-gray-200'}`}
              >
                Data Confidence: Grade {org.confidence_grade}
                {org.confidence_score && ` (${Math.round(org.confidence_score * 100)}%)`}
              </Badge>
            )}
            {org.va_accredited && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 text-base px-4 py-2">
                <Award className="h-4 w-4 mr-1" />
                VA Accredited
              </Badge>
            )}
          </div>

          {org.data_sources && dataSources.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Data sources: {dataSources.join(', ')}
            </div>
          )}

          <Separator />

          {/* About section */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">About</h2>

            {org.mission_statement && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Mission</h3>
                <p className="text-muted-foreground leading-relaxed">{org.mission_statement}</p>
              </div>
            )}

            {org.services_offered && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Services Offered</h3>
                <p className="text-muted-foreground leading-relaxed">{org.services_offered}</p>
              </div>
            )}

            {serviceCategories.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Service Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {serviceCategories.map((category, idx) => (
                    <Badge key={idx} variant="secondary">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {org.eligibility_requirements && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Eligibility Requirements</h3>
                <p className="text-muted-foreground leading-relaxed">{org.eligibility_requirements}</p>
              </div>
            )}

            {org.service_area && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Service Area</h3>
                <p className="text-muted-foreground leading-relaxed">{org.service_area}</p>
              </div>
            )}
          </section>

          {/* Classification section */}
          {(org.ntee_code || org.irs_subsection || org.tax_exempt_status) && (
            <>
              <Separator />
              <section>
                <h2 className="text-2xl font-semibold mb-4">Classification</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {org.ntee_code && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">NTEE Code</h3>
                      <p className="text-base">
                        {org.ntee_code}
                        {org.ntee_description && (
                          <span className="text-muted-foreground text-sm block">{org.ntee_description}</span>
                        )}
                      </p>
                    </div>
                  )}
                  {org.irs_subsection && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">IRS Subsection</h3>
                      <p className="text-base">{org.irs_subsection}</p>
                    </div>
                  )}
                  {org.tax_exempt_status && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Tax-Exempt Status</h3>
                      <p className="text-base">{org.tax_exempt_status}</p>
                    </div>
                  )}
                  {org.ein && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">EIN</h3>
                      <p className="text-base font-mono">{org.ein}</p>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}

          {/* Charity Navigator rating */}
          {(org.charity_navigator_rating || org.charity_navigator_score) && (
            <>
              <Separator />
              <section>
                <h2 className="text-2xl font-semibold mb-4">Charity Navigator Rating</h2>
                <div className="flex items-center gap-4">
                  {org.charity_navigator_rating && (
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 4 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={`h-6 w-6 ${idx < org.charity_navigator_rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                      <span className="ml-2 text-lg font-semibold">{org.charity_navigator_rating} stars</span>
                    </div>
                  )}
                  {org.charity_navigator_score && (
                    <div className="text-muted-foreground">
                      Score: {org.charity_navigator_score.toFixed(1)}
                    </div>
                  )}
                </div>
              </section>
            </>
          )}

          {/* Financial summary */}
          {(org.total_revenue || org.total_expenses || org.total_assets || org.num_employees || org.num_volunteers) && (
            <>
              <Separator />
              <section>
                <h2 className="text-2xl font-semibold mb-4">Financial Summary</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {org.total_revenue !== null && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Revenue</h3>
                      <p className="text-lg font-semibold">
                        ${org.total_revenue.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {org.total_expenses !== null && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Expenses</h3>
                      <p className="text-lg font-semibold">
                        ${org.total_expenses.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {org.total_assets !== null && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Assets</h3>
                      <p className="text-lg font-semibold">
                        ${org.total_assets.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {org.num_employees !== null && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Employees</h3>
                      <p className="text-lg font-semibold">
                        {org.num_employees.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {org.num_volunteers !== null && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Volunteers</h3>
                      <p className="text-lg font-semibold">
                        {org.num_volunteers.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </div>

        {/* Sidebar - Contact information */}
        <aside className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {address && (
                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <address className="not-italic text-sm whitespace-pre-line">{address}</address>
                </div>
              )}

              {org.phone && (
                <div className="flex gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <a
                    href={`tel:${org.phone}`}
                    className="text-sm text-blue-600 hover:underline"
                    aria-label={`Call ${org.org_name}`}
                  >
                    {org.phone}
                  </a>
                </div>
              )}

              {org.email && (
                <div className="flex gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <a
                    href={`mailto:${org.email}`}
                    className="text-sm text-blue-600 hover:underline break-all"
                    aria-label={`Email ${org.org_name}`}
                  >
                    {org.email}
                  </a>
                </div>
              )}

              {org.website && (
                <div className="flex gap-3">
                  <ExternalLink className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <a
                    href={org.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline break-all"
                    aria-label={`Visit ${org.org_name} website (opens in new tab)`}
                  >
                    Visit Website
                  </a>
                </div>
              )}

              {!org.phone && !org.email && !org.website && !address && (
                <p className="text-sm text-muted-foreground">No contact information available</p>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
