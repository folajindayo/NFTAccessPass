import React from 'react';

import { CheckIcon } from './icons/CheckIcon';
import { XIcon } from './icons/XIcon';
import { LoadingIcon } from './icons/LoadingIcon';

export type RequirementStatus = 'met' | 'unmet' | 'checking' | 'warning';

export interface AccessRequirement {
  id: string;
  label: string;
  description?: string;
  status: RequirementStatus;
  currentValue?: string | number;
  requiredValue?: string | number;
  helpLink?: string;
}

export interface AccessRequirementsProps {
  requirements: AccessRequirement[];
  title?: string;
  showProgress?: boolean;
  onHelpClick?: (requirementId: string) => void;
  className?: string;
}

const statusConfig: Record<RequirementStatus, {
  icon: React.ReactNode;
  iconBg: string;
  textColor: string;
  borderColor: string;
}> = {
  met: {
    icon: <CheckIcon className="w-4 h-4 text-green-600 dark:text-green-400" />,
    iconBg: 'bg-green-100 dark:bg-green-900/40',
    textColor: 'text-green-700 dark:text-green-300',
    borderColor: 'border-green-200 dark:border-green-800',
  },
  unmet: {
    icon: <XIcon className="w-4 h-4 text-red-600 dark:text-red-400" />,
    iconBg: 'bg-red-100 dark:bg-red-900/40',
    textColor: 'text-red-700 dark:text-red-300',
    borderColor: 'border-red-200 dark:border-red-800',
  },
  checking: {
    icon: <LoadingIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />,
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    textColor: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  warning: {
    icon: (
      <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    iconBg: 'bg-yellow-100 dark:bg-yellow-900/40',
    textColor: 'text-yellow-700 dark:text-yellow-300',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
  },
};

/**
 * AccessRequirements displays a checklist of requirements for accessing gated content.
 * Shows status of each requirement with progress indicator.
 */
export const AccessRequirements: React.FC<AccessRequirementsProps> = ({
  requirements,
  title = 'Access Requirements',
  showProgress = true,
  onHelpClick,
  className = '',
}) => {
  const metCount = requirements.filter(r => r.status === 'met').length;
  const totalCount = requirements.length;
  const progressPercent = totalCount > 0 ? (metCount / totalCount) * 100 : 0;
  const allMet = metCount === totalCount;

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">{title}</h3>
          {showProgress && (
            <span className={`text-sm font-medium ${allMet ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
              {metCount}/{totalCount} met
            </span>
          )}
        </div>

        {showProgress && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  allMet ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {requirements.map((requirement) => {
          const config = statusConfig[requirement.status];

          return (
            <div
              key={requirement.id}
              className={`p-4 ${requirement.status === 'unmet' ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full ${config.iconBg} flex items-center justify-center`}>
                  {config.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`font-medium ${config.textColor}`}>
                      {requirement.label}
                    </p>
                    {requirement.helpLink && onHelpClick && (
                      <button
                        onClick={() => onHelpClick(requirement.id)}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Learn more
                      </button>
                    )}
                  </div>

                  {requirement.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {requirement.description}
                    </p>
                  )}

                  {(requirement.currentValue !== undefined || requirement.requiredValue !== undefined) && (
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      {requirement.currentValue !== undefined && (
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
                          Current: <strong>{requirement.currentValue}</strong>
                        </span>
                      )}
                      {requirement.requiredValue !== undefined && (
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
                          Required: <strong>{requirement.requiredValue}</strong>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {allMet && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border-t border-green-100 dark:border-green-800">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <CheckIcon className="w-5 h-5" />
            <span className="font-medium">All requirements met! You have full access.</span>
          </div>
        </div>
      )}

      {!allMet && requirements.some(r => r.status === 'unmet') && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Complete all requirements above to gain access.
          </p>
        </div>
      )}
    </div>
  );
};

export default AccessRequirements;

