import React from 'react';

/**
 * Avatar size types
 */
type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Avatar shape types
 */
type AvatarShape = 'circle' | 'square';

/**
 * Props for the Avatar component
 */
interface AvatarProps {
  /** Image source URL */
  src?: string;
  /** Alt text for the image */
  alt?: string;
  /** Fallback text to display when no image (usually initials) */
  fallback?: string;
  /** Size of the avatar */
  size?: AvatarSize;
  /** Shape of the avatar */
  shape?: AvatarShape;
  /** Whether to show an online status indicator */
  showStatus?: boolean;
  /** Status indicator color */
  status?: 'online' | 'offline' | 'away' | 'busy';
  /** Additional CSS classes */
  className?: string;
  /** Click handler */
  onClick?: () => void;
}

/**
 * Size style classes
 */
const sizeClasses: Record<AvatarSize, { container: string; text: string; status: string }> = {
  xs: { container: 'h-6 w-6', text: 'text-xs', status: 'h-1.5 w-1.5' },
  sm: { container: 'h-8 w-8', text: 'text-sm', status: 'h-2 w-2' },
  md: { container: 'h-10 w-10', text: 'text-base', status: 'h-2.5 w-2.5' },
  lg: { container: 'h-12 w-12', text: 'text-lg', status: 'h-3 w-3' },
  xl: { container: 'h-16 w-16', text: 'text-xl', status: 'h-3.5 w-3.5' },
};

/**
 * Status color classes
 */
const statusColors: Record<string, string> = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
};

/**
 * Generate background color from string (for fallback)
 */
function stringToColor(str: string): string {
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-sky-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-fuchsia-500',
    'bg-pink-500',
    'bg-rose-500',
  ];
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Get initials from a name
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Avatar fallback component
 */
const AvatarFallback: React.FC<{
  fallback: string;
  size: AvatarSize;
}> = ({ fallback, size }) => {
  const bgColor = stringToColor(fallback);
  const initials = getInitials(fallback);
  
  return (
    <span 
      className={`flex items-center justify-center ${bgColor} text-white font-medium ${sizeClasses[size].text}`}
    >
      {initials}
    </span>
  );
};

/**
 * Status indicator component
 */
const StatusIndicator: React.FC<{
  status: string;
  size: AvatarSize;
}> = ({ status, size }) => (
  <span 
    className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-white dark:ring-gray-900 ${statusColors[status]} ${sizeClasses[size].status}`}
    aria-label={`Status: ${status}`}
  />
);

/**
 * A versatile avatar component for displaying user images or initials.
 * Supports multiple sizes, shapes, and status indicators.
 */
export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  fallback = '?',
  size = 'md',
  shape = 'circle',
  showStatus = false,
  status = 'offline',
  className = '',
  onClick,
}) => {
  const [imageError, setImageError] = React.useState(false);
  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-lg';
  
  const containerClasses = [
    'relative inline-flex items-center justify-center overflow-hidden',
    'bg-gray-200 dark:bg-gray-700',
    shapeClass,
    sizeClasses[size].container,
    onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : '',
    className,
  ].filter(Boolean).join(' ');

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div 
      className={containerClasses}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={alt}
          className={`h-full w-full object-cover ${shapeClass}`}
          onError={handleImageError}
        />
      ) : (
        <AvatarFallback fallback={fallback} size={size} />
      )}
      
      {showStatus && <StatusIndicator status={status} size={size} />}
    </div>
  );
};

/**
 * Avatar group component for displaying multiple avatars
 */
export const AvatarGroup: React.FC<{
  children: React.ReactNode;
  max?: number;
  size?: AvatarSize;
  className?: string;
}> = ({ children, max = 4, size = 'md', className = '' }) => {
  const avatars = React.Children.toArray(children);
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <div className={`flex -space-x-2 ${className}`}>
      {visibleAvatars.map((avatar, index) => (
        <div 
          key={index} 
          className="ring-2 ring-white dark:ring-gray-900 rounded-full"
        >
          {avatar}
        </div>
      ))}
      
      {remainingCount > 0 && (
        <div 
          className={`flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium ring-2 ring-white dark:ring-gray-900 ${sizeClasses[size].container} ${sizeClasses[size].text}`}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

export default Avatar;

