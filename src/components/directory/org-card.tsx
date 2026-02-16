import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VerificationBadge } from './verification-badge';
import { Phone, Mail, ExternalLink, Award } from 'lucide-react';
import type { OrganizationSearchResult } from '@/lib/db/types';

interface OrgCardProps {
  org: OrganizationSearchResult;
}

export function OrgCard({ org }: OrgCardProps) {
  const location = [org.city, org.state, org.zip_code].filter(Boolean).join(', ');

  // Confidence grade color mapping
  const gradeColors: Record<string, string> = {
    A: 'bg-green-100 text-green-700 border-green-300',
    B: 'bg-green-50 text-green-600 border-green-200',
    C: 'bg-blue-50 text-blue-600 border-blue-200',
    D: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    F: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">
              <Link
                href={`/directory/${org.id}`}
                className="hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded"
              >
                {org.org_name}
              </Link>
            </CardTitle>
            <CardDescription>{location}</CardDescription>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <VerificationBadge lastVerifiedDate={org.last_verified_date} />
            {org.confidence_grade && (
              <Badge
                variant="outline"
                className={gradeColors[org.confidence_grade] || 'bg-gray-50 text-gray-600 border-gray-200'}
              >
                Grade {org.confidence_grade}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Services offered */}
        {org.services_offered && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Services</h4>
            <p className="text-sm line-clamp-2">{org.services_offered}</p>
          </div>
        )}

        {/* Service categories as badges */}
        {org.service_categories && (
          <div className="flex flex-wrap gap-1">
            {org.service_categories
              .split(';')
              .filter(Boolean)
              .slice(0, 5)
              .map((category, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {category.trim()}
                </Badge>
              ))}
          </div>
        )}

        {/* VA Accredited badge */}
        {org.va_accredited && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
            <Award className="h-3 w-3 mr-1" />
            VA Accredited
          </Badge>
        )}

        {/* Contact information */}
        <div className="flex flex-wrap gap-4 text-sm">
          {org.phone && (
            <a
              href={`tel:${org.phone}`}
              className="flex items-center gap-1 text-blue-600 hover:underline"
              aria-label={`Call ${org.org_name}`}
            >
              <Phone className="h-4 w-4" />
              <span>{org.phone}</span>
            </a>
          )}
          {org.email && (
            <a
              href={`mailto:${org.email}`}
              className="flex items-center gap-1 text-blue-600 hover:underline"
              aria-label={`Email ${org.org_name}`}
            >
              <Mail className="h-4 w-4" />
              <span className="truncate max-w-[200px]">{org.email}</span>
            </a>
          )}
          {org.website && (
            <a
              href={org.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-600 hover:underline"
              aria-label={`Visit ${org.org_name} website (opens in new tab)`}
            >
              <ExternalLink className="h-4 w-4" />
              <span>Website</span>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
