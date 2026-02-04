import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserAvatarProps {
  src?: string | null;
  fallback?: string;
  ethnicity?: 'asian' | 'african' | 'caucasian' | 'hispanic' | 'mixed';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ethnicityGradients = {
  asian: 'from-yellow-400 via-red-400 to-pink-500',
  african: 'from-orange-500 via-red-600 to-purple-600',
  caucasian: 'from-blue-400 via-indigo-500 to-purple-500',
  hispanic: 'from-amber-400 via-orange-500 to-red-500',
  mixed: 'from-pink-400 via-purple-500 to-cyan-500'
};

const ethnicityEmojis = {
  asian: '👨🏻',
  african: '👨🏿',
  caucasian: '👨🏼',
  hispanic: '👨🏽',
  mixed: '👤'
};

const sizes = {
  sm: 'w-8 h-8 text-lg',
  md: 'w-12 h-12 text-2xl',
  lg: 'w-16 h-16 text-4xl'
};

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  src,
  fallback,
  ethnicity = 'mixed', 
  size = 'md',
  className = '' 
}) => {
  // If src is provided, use Avatar component
  if (src) {
    return (
      <Avatar className={className}>
        <AvatarImage src={src} alt={fallback || 'User'} />
        <AvatarFallback className="bg-gradient-to-br from-neon-pink to-neon-purple text-white">
          {fallback || '?'}
        </AvatarFallback>
      </Avatar>
    );
  }

  // Fallback to emoji-based avatar
  return (
    <div className={`relative ${className}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${ethnicityGradients[ethnicity]} rounded-full blur-md opacity-75 animate-pulse`} />
      <div className={`relative ${sizes[size]} bg-gradient-to-br ${ethnicityGradients[ethnicity]} rounded-full flex items-center justify-center border-2 border-white/20 shadow-lg`}>
        <span className="animate-pulse">{fallback || ethnicityEmojis[ethnicity]}</span>
      </div>
    </div>
  );
};
