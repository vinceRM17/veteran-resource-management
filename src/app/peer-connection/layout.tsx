import type { Metadata } from 'next';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

export const metadata: Metadata = {
  title: 'Peer Connections — Veteran Resource Management',
  description:
    'Find verified support groups, events, and opportunities near you. Every listing is backed by a verified organization from the veteran resource directory.',
};

export default function PeerConnectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NuqsAdapter>
      <div className="max-w-6xl mx-auto px-4 py-8">{children}</div>
    </NuqsAdapter>
  );
}
