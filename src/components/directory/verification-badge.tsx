import { Badge } from '@/components/ui/badge';
import { getFreshnessStatus, getFreshnessLabel } from '@/lib/db/types';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

interface VerificationBadgeProps {
  lastVerifiedDate: string;
  variant?: 'default' | 'large';
}

export function VerificationBadge({ lastVerifiedDate, variant = 'default' }: VerificationBadgeProps) {
  const status = getFreshnessStatus(lastVerifiedDate);
  const label = getFreshnessLabel(status);
  const date = new Date(lastVerifiedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const statusConfig = {
    fresh: {
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      text: `${label} ${date}`,
      ariaLabel: 'Data freshness: fresh - verified recently',
    },
    stale: {
      icon: AlertCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      text: `${label} - last verified ${date}`,
      ariaLabel: 'Data freshness: stale - needs review',
    },
    outdated: {
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      text: `${label} - last verified ${date}`,
      ariaLabel: 'Data freshness: outdated - verification needed',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  if (variant === 'large') {
    return (
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${config.bgColor} ${config.borderColor}`}
        role="status"
        aria-label={config.ariaLabel}
        title={`Last verified: ${date}`}
      >
        <Icon className={`h-5 w-5 ${config.color}`} />
        <span className={`text-sm font-medium ${config.color}`}>{config.text}</span>
      </div>
    );
  }

  return (
    <Badge
      variant="outline"
      className={`${config.bgColor} ${config.borderColor} ${config.color} border`}
      role="status"
      aria-label={config.ariaLabel}
      title={`Last verified: ${date}`}
    >
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </Badge>
  );
}
