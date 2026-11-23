import React from 'react';
import { Bookmark, ChevronRight, Clock, MapPin, Trash2 } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { CompanyLogo } from '@/components/company-logo';
import { StatusBadge } from '@/components/status-badge';
import { triggerHaptic } from '@/lib/haptics';
import type { JobListing } from '@/data/jobs';

interface JobCardProps {
  job: JobListing;
  isSaved: boolean;
  isApplied: boolean;
  variant?: 'discover' | 'saved' | 'applied';
  onPress: () => void;
  onToggleSave?: () => void;
}

export function JobCard({
  job,
  isSaved,
  isApplied,
  variant = 'discover',
  onPress,
  onToggleSave,
}: JobCardProps) {
  const handleSavePress = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    triggerHaptic('light');
    onToggleSave?.();
  };

  return (
    <Pressable onPress={onPress} className="active:opacity-95">
      <Card className="bg-card border-border rounded-2xl border p-4 shadow-xs">
        <VStack space="sm">
          {/* Top Row: Company Logo + Title + Action */}
          <HStack className="items-start justify-between" space="md">
            <HStack className="min-w-0 flex-1 items-start" space="md">
              <CompanyLogo name={job.company} logoUrl={job.logoUrl} tone={job.brandTone} />

              <VStack space="xs" className="min-w-0 flex-1">
                {variant === 'discover' && job.isActivelyHiring && <StatusBadge variant="hiring" />}
                <Heading size="md" bold isTruncated className="text-foreground">
                  {job.title}
                </Heading>
                <HStack className="items-center" space="xs">
                  <Text size="xs" bold className="text-foreground" isTruncated>
                    {job.company}
                  </Text>
                  <Text size="xs" className="text-muted-foreground">
                    • {job.industry}
                  </Text>
                </HStack>
              </VStack>
            </HStack>

            {onToggleSave && (
              <Pressable
                accessibilityLabel={
                  variant === 'saved' ? 'Retirer des favoris' : "Sauvegarder l'offre"
                }
                onPress={handleSavePress}
                className="bg-muted h-9 w-9 items-center justify-center rounded-full active:opacity-80">
                <Icon
                  as={variant === 'saved' ? Trash2 : Bookmark}
                  size="sm"
                  className={
                    variant === 'saved'
                      ? 'text-destructive'
                      : isSaved
                        ? 'text-primary fill-primary'
                        : 'text-muted-foreground'
                  }
                />
              </Pressable>
            )}
          </HStack>

          {/* Pills Row */}
          <HStack className="flex-wrap items-center" space="sm">
            <StatusBadge variant="salary" label={job.salaryRange} />
            <StatusBadge variant="workMode" label={job.workMode} />
            {isApplied && <StatusBadge variant="applied" />}
          </HStack>

          <Divider className="bg-border/60" />

          {/* Footer Meta Row */}
          <HStack className="items-center justify-between" space="sm">
            {variant === 'applied' ? (
              <HStack className="items-center" space="xs">
                <Icon as={Clock} size="xs" className="text-secondary" />
                <Text size="xs" className="text-muted-foreground">
                  Envoyée aujourd'hui • {job.location}
                </Text>
              </HStack>
            ) : (
              <HStack className="min-w-0 flex-1 items-center" space="sm">
                <HStack className="items-center" space="xs">
                  <Icon as={MapPin} size="xs" className="text-muted-foreground" />
                  <Text size="xs" className="text-muted-foreground" isTruncated>
                    {job.location}
                  </Text>
                </HStack>
                <Box className="bg-border h-1 w-1 rounded-full" />
                <Text size="xs" className="text-muted-foreground">
                  {job.postedAgo}
                </Text>
              </HStack>
            )}

            <HStack className="items-center" space="xs">
              <Text size="xs" bold className="text-primary">
                Détails
              </Text>
              <Icon as={ChevronRight} size="xs" className="text-primary" />
            </HStack>
          </HStack>
        </VStack>
      </Card>
    </Pressable>
  );
}
