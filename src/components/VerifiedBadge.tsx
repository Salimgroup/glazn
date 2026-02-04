import { BadgeCheck } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type Platform = 'google' | 'linkedin' | 'twitter' | 'facebook' | 'github' | 'snapchat' | 'tiktok';

interface VerifiedBadgeProps {
  platform?: Platform;
  username?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

const platformColors: Record<Platform, string> = {
  google: 'text-red-500',
  linkedin: 'text-blue-600',
  twitter: 'text-blue-400',
  facebook: 'text-blue-600',
  github: 'text-gray-900 dark:text-white',
  snapchat: 'text-yellow-400',
  tiktok: 'text-pink-500',
};

const platformNames: Record<Platform, string> = {
  google: 'Google',
  linkedin: 'LinkedIn',
  twitter: 'Twitter/X',
  facebook: 'Facebook',
  github: 'GitHub',
  snapchat: 'Snapchat',
  tiktok: 'TikTok',
};

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export function VerifiedBadge({ platform, username, size = 'md' }: VerifiedBadgeProps) {
  // If no platform specified, show a generic verified badge
  if (!platform) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <BadgeCheck className={`text-neon-cyan ${sizeClasses[size]}`} />
          </TooltipTrigger>
          <TooltipContent>
            <p>Verified account</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const displayText = username 
    ? `Verified ${platformNames[platform]} account: ${username}`
    : `Verified ${platformNames[platform]} account`;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <BadgeCheck className={`${platformColors[platform]} ${sizeClasses[size]}`} />
        </TooltipTrigger>
        <TooltipContent>
          <p>{displayText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
