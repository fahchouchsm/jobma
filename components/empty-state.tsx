import React from 'react';
import type { LucideIcon } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionIcon?: LucideIcon;
  onAction?: () => void;
  tone?: 'primary' | 'secondary' | 'muted';
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionIcon,
  onAction,
  tone = 'primary',
}: EmptyStateProps) {
  const iconBg =
    tone === 'secondary'
      ? 'bg-secondary-container/60'
      : tone === 'muted'
        ? 'bg-muted'
        : 'bg-primary-fixed';
  const iconColor =
    tone === 'secondary'
      ? 'text-secondary'
      : tone === 'muted'
        ? 'text-muted-foreground'
        : 'text-primary';

  return (
    <Card className="bg-card border-border items-center rounded-2xl border p-6">
      <VStack space="md" className="max-w-xs items-center">
        <Box className={`h-14 w-14 rounded-full ${iconBg} items-center justify-center`}>
          <Icon as={icon} size="xl" className={iconColor} />
        </Box>
        <VStack space="xs" className="items-center">
          <Heading size="md" bold className="text-foreground text-center">
            {title}
          </Heading>
          <Text size="sm" className="text-muted-foreground text-center">
            {description}
          </Text>
        </VStack>
        {actionLabel && onAction && (
          <Button onPress={onAction}>
            {actionIcon && <ButtonIcon as={actionIcon} />}
            <ButtonText>{actionLabel}</ButtonText>
          </Button>
        )}
      </VStack>
    </Card>
  );
}
