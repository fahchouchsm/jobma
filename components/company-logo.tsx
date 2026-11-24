import React, { useState } from 'react';
import { Box } from '@/components/ui/box';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';

interface CompanyLogoProps {
  name: string;
  logoUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'primary' | 'secondary' | 'tertiary';
}

export function CompanyLogo({ name, logoUrl, size = 'md', tone = 'primary' }: CompanyLogoProps) {
  const [failed, setFailed] = useState(false);

  const dimensions =
    size === 'lg' ? 'w-14 h-14' : size === 'sm' ? 'w-9 h-9' : 'w-12 h-12';
  const radius = size === 'sm' ? 'rounded-lg' : 'rounded-xl';
  const initials =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'JM';

  const fallbackBg =
    tone === 'secondary' ? 'bg-secondary' : tone === 'tertiary' ? 'bg-tertiary' : 'bg-primary';

  if (logoUrl && !failed) {
    return (
      <Box
        className={`${dimensions} ${radius} bg-accent border-border shrink-0 overflow-hidden border`}>
        <Image
          source={{ uri: logoUrl }}
          alt={name}
          size="full"
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      </Box>
    );
  }

  return (
    <Box className={`${dimensions} ${radius} ${fallbackBg} shrink-0 items-center justify-center`}>
      <Text
        size={size === 'lg' ? 'lg' : size === 'sm' ? 'xs' : 'md'}
        bold
        className="text-primary-foreground tracking-tight">
        {initials}
      </Text>
    </Box>
  );
}
