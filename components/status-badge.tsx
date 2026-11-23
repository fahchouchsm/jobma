import React from 'react';
import type { LucideIcon } from 'lucide-react-native';
import { Banknote, CheckCheck, Globe } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

interface StatusBadgeProps {
  variant: 'hiring' | 'applied' | 'salary' | 'workMode';
  label?: string;
  icon?: LucideIcon;
}

export function StatusBadge({ variant, label, icon }: StatusBadgeProps) {
  if (variant === 'hiring') {
    return (
      <Box className="bg-secondary-container/60 self-start rounded-full px-2.5 py-0.5">
        <HStack className="items-center" space="xs">
          <Box className="bg-secondary h-1.5 w-1.5 rounded-full" />
          <Text size="2xs" bold className="text-on-secondary-container">
            {label ?? 'Recrutement actif'}
          </Text>
        </HStack>
      </Box>
    );
  }

  if (variant === 'applied') {
    return (
      <Box className="bg-primary-fixed self-start rounded-full px-2.5 py-1">
        <HStack className="items-center" space="xs">
          <Icon as={icon ?? CheckCheck} size="xs" className="text-primary" />
          <Text size="xs" bold className="text-on-primary-fixed">
            {label ?? 'Candidature envoyée'}
          </Text>
        </HStack>
      </Box>
    );
  }

  if (variant === 'salary') {
    return (
      <Box className="bg-secondary-container/40 self-start rounded-full px-2.5 py-1">
        <HStack className="items-center" space="xs">
          <Icon as={icon ?? Banknote} size="xs" className="text-secondary" />
          <Text size="xs" bold className="text-on-secondary-container">
            {label}
          </Text>
        </HStack>
      </Box>
    );
  }

  return (
    <Box className="bg-muted self-start rounded-full px-2.5 py-1">
      <HStack className="items-center" space="xs">
        <Icon as={icon ?? Globe} size="xs" className="text-primary" />
        <Text size="xs" className="text-foreground font-medium">
          {label}
        </Text>
      </HStack>
    </Box>
  );
}
