import Link from 'next/link';
import { Users, Calendar, Briefcase } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  PEER_CONNECTION_LABELS,
  PEER_CONNECTION_DESCRIPTIONS,
  type PeerConnectionType,
} from '@/lib/db/peer-types';

// ============================================================================
// CATEGORY CARD CONFIG
// ============================================================================

type CategoryConfig = {
  type: PeerConnectionType;
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
};

const CATEGORIES: CategoryConfig[] = [
  {
    type: 'support-groups',
    href: '/peer-connection/support-groups',
    Icon: Users,
  },
  {
    type: 'events',
    href: '/peer-connection/events',
    Icon: Calendar,
  },
  {
    type: 'opportunities',
    href: '/peer-connection/opportunities',
    Icon: Briefcase,
  },
];

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function PeerConnectionPage() {
  return (
    <main>
      <section className="mb-10">
        <h1 className="text-3xl font-bold mb-3">Connect with Fellow Veterans</h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Find verified support groups, events, and opportunities near you. Every
          listing is backed by a verified organization.
        </p>
      </section>

      <section aria-label="Peer connection categories">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {CATEGORIES.map(({ type, href, Icon }) => (
            <article key={type}>
              <Link href={href} className="block hover:no-underline h-full">
                <Card className="h-full transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className="h-8 w-8 text-primary" />
                      <CardTitle>{PEER_CONNECTION_LABELS[type]}</CardTitle>
                    </div>
                    <CardDescription>
                      {PEER_CONNECTION_DESCRIPTIONS[type]}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="text-sm font-medium text-primary">
                      Browse &rarr;
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section aria-label="Verification notice">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Verified listings only:</strong> All listings are verified
            through IRS nonprofit records, VA accreditation databases, or
            established veteran service organizations. We do not list unverified
            individuals or self-submitted profiles.
          </p>
        </div>
      </section>
    </main>
  );
}
