import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MedicalCardProps {
  /** Clinical title */
  title: string;
  /** Optional clinical context */
  subtitle?: string;
  /** Medical icon */
  icon?: LucideIcon;
  /** Severity level for color coding */
  severity?: 'low' | 'moderate' | 'high' | 'critical';
  /** Click handler */
  onClick?: () => void;
  /** Status indicator */
  status?: 'pending' | 'active' | 'inactive';
  /** Clinical data value */
  value?: string | number;
  /** Timestamp or date */
  timestamp?: string;
  /** Custom className */
  className?: string;
  /** Additional clinical content */
  children?: React.ReactNode;
}

const severityVariants = {
  low: {
    border: 'border-green-200',
    bg: 'bg-green-50',
    text: 'text-green-800',
    icon: 'text-green-600'
  },
  moderate: {
    border: 'border-yellow-200',
    bg: 'bg-yellow-50',
    text: 'text-yellow-800',
    icon: 'text-yellow-600'
  },
  high: {
    border: 'border-orange-200',
    bg: 'bg-orange-50',
    text: 'text-orange-800',
    icon: 'text-orange-600'
  },
  critical: {
    border: 'border-red-200',
    bg: 'bg-red-50',
    text: 'text-red-800',
    icon: 'text-red-600'
  }
};

export function MedicalCard({
  title,
  subtitle,
  icon: Icon,
  severity = 'moderate',
  onClick,
  status = 'active',
  value,
  timestamp,
  className,
  children
}: MedicalCardProps) {
  // For user-facing UI, use friendlier colors instead of medical severity colors
  const friendlyVariants = {
    low: {
      border: 'border-green-200',
      bg: 'bg-green-50',
      text: 'text-green-800',
      icon: 'text-green-600'
    },
    moderate: {
      border: 'border-blue-200',
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      icon: 'text-blue-600'
    },
    high: {
      border: 'border-purple-200',
      bg: 'bg-purple-50',
      text: 'text-purple-800',
      icon: 'text-purple-600'
    },
    critical: {
      border: 'border-pink-200',
      bg: 'bg-pink-50',
      text: 'text-pink-800',
      icon: 'text-pink-600'
    }
  };

  const friendlyClasses = friendlyVariants[severity];

  return (
    <div
      className={cn(
        'rounded-xl border bg-white/90 shadow-lg transition-all duration-200',
        'hover:shadow-xl hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2',
        friendlyClasses.border,
        status === 'inactive' && 'opacity-75',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            {Icon && (
              <div className={cn('flex-shrink-0 mt-0.5', friendlyClasses.icon)}>
                <Icon size={20} />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h3 className={cn('font-medium text-gray-800 leading-tight')}>
                {title}
              </h3>

              {subtitle && (
                <p className={cn('text-sm text-gray-600 mt-1')}>
                  {subtitle}
                </p>
              )}

              {value && (
                <p className={cn('text-lg font-semibold mt-2', friendlyClasses.text)}>
                  {value}
                </p>
              )}

              {children}
            </div>
          </div>

          {timestamp && (
            <div className="flex-shrink-0 text-xs text-gray-500 ml-4">
              {timestamp}
            </div>
          )}
        </div>

        {status && status !== 'active' && (
          <div className="mt-3 flex items-center justify-between">
            <span className={cn(
              'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
              status === 'inactive' && 'bg-gray-100 text-gray-800',
              status === 'pending' && 'bg-yellow-100 text-yellow-800'
            )}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}