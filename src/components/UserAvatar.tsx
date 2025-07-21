import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useWordPressAuth } from '@/contexts/WordPressAuthContext';

interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const UserAvatar = ({ size = 'md', className }: UserAvatarProps) => {
  const { user } = useWordPressAuth();

  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-12 w-12 text-base'
  };

  if (!user) return null;

  const initials = user.display_name
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage src={user.avatar_url} alt={user.display_name} />
      <AvatarFallback className="bg-primary text-primary-foreground">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};