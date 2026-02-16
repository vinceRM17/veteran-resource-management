import { NuqsAdapter } from 'nuqs/adapters/next/app';

export default function DirectoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NuqsAdapter>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Resource Directory</h1>
          <p className="text-muted-foreground">
            Search veteran organizations and services across the United States
          </p>
        </div>
        {children}
      </div>
    </NuqsAdapter>
  );
}
