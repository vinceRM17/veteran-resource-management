import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Shield, Building2, Phone, Mail, ExternalLink } from 'lucide-react';
import { getVerificationSource, type PeerConnectionSearchResult } from '@/lib/db/peer-types';

interface PeerConnectionCardProps {
  org: PeerConnectionSearchResult;
}

export function PeerConnectionCard({ org }: PeerConnectionCardProps) {
  const location = [org.city, org.state, org.zip_code].filter(Boolean).join(', ');
  const verification = getVerificationSource(org);

  // Badge variant and icon based on verification tier
  const badgeVariant =
    verification.tier === 'primary'
      ? 'default'
      : verification.tier === 'secondary'
        ? 'secondary'
        : 'outline';

  const VerificationIcon =
    verification.tier === 'primary'
      ? ShieldCheck
      : verification.tier === 'secondary'
        ? Shield
        : Building2;

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
            {location && <CardDescription>{location}</CardDescription>}
          </div>

          {/* Verification badge section */}
          <div className="flex flex-col gap-1 items-end shrink-0">
            <Badge variant={badgeVariant} className="flex items-center gap-1">
              <VerificationIcon className="h-3 w-3" />
              {verification.label}
            </Badge>
            <p className="text-xs text-muted-foreground text-right">
              Verified: {verification.source}
            </p>
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

        {/* NTEE description badge */}
        {org.ntee_description && (
          <div>
            <Badge variant="outline" className="text-xs">
              {org.ntee_description}
            </Badge>
          </div>
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
