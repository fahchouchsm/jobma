import React from 'react';
import { Bookmark, CheckCircle2, Trash2 } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { ScalePressable } from '@/components/animated/scale-pressable';
import { triggerHaptic } from '@/lib/haptics';
import type { JobListing } from '@/data/jobs';

interface JobCardProps {
  job: JobListing;
  isSaved: boolean;
  isApplied: boolean;
  matchScore?: number;
  matchReason?: string;
  variant?: 'discover' | 'saved' | 'applied';
  onPress: () => void;
  onToggleSave?: () => void;
}

export function JobCard({
  job,
  isSaved,
  isApplied,
  matchScore,
  matchReason,
  variant = 'discover',
  onPress,
  onToggleSave,
}: JobCardProps) {
  const handleSavePress = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    triggerHaptic('light');
    onToggleSave?.();
  };

  const hasSalary = job.salaryRange && job.salaryRange !== 'Salaire non précisé';
  const showStrongMatch =
    variant === 'discover' && !isApplied && matchScore !== undefined && matchScore >= 82;

  return (
    <ScalePressable onPress={onPress} scaleTo={0.985}>
      <Box className="bg-card border-border/80 rounded-2xl border p-4">
        {/* Row 1: Job Title + Bookmark */}
        <HStack className="items-start justify-between" space="sm">
          <Text
            size="md"
            bold
            numberOfLines={2}
            className="text-foreground flex-1 leading-snug tracking-tight">
            {job.title}
          </Text>

          {onToggleSave && (
            <ScalePressable
              accessibilityLabel={
                variant === 'saved' ? 'Retirer des favoris' : "Sauvegarder l'offre"
              }
              onPress={handleSavePress}
              scaleTo={0.85}
              className="-mt-1 -mr-1.5 h-8 w-8 shrink-0 items-center justify-center rounded-full">
              <Icon
                as={variant === 'saved' ? Trash2 : Bookmark}
                size="sm"
                className={
                  variant === 'saved'
                    ? 'text-destructive'
                    : isSaved
                      ? 'text-foreground fill-foreground'
                      : 'text-muted-foreground'
                }
              />
            </ScalePressable>
          )}
        </HStack>

        {/* Row 2: Company Name + Location · Sector */}
        <VStack className="mt-1.5">
          <Text size="sm" numberOfLines={1} className="text-foreground font-medium">
            {job.company}
          </Text>
          <Text size="xs" numberOfLines={1} className="text-muted-foreground mt-0.5">
            {job.location}
            {job.industry ? ` · ${job.industry}` : ''}
          </Text>
        </VStack>

        {/* Row 3: Compact Metadata Chips */}
        <HStack className="mt-3 flex-wrap items-center gap-2">
          {hasSalary && (
            <Box className="bg-secondary-container rounded-lg px-2.5 py-1">
              <Text size="xs" bold className="text-on-secondary-container">
                {job.salaryRange}
              </Text>
            </Box>
          )}

          <Box className="bg-muted rounded-lg px-2.5 py-1">
            <Text size="xs" className="text-foreground font-medium">
              {job.contractType}
            </Text>
          </Box>

          <Box className="bg-muted rounded-lg px-2.5 py-1">
            <Text size="xs" className="text-muted-foreground font-medium">
              {job.workMode}
            </Text>
          </Box>
        </HStack>

        {/* Row 4: Quiet Footer */}
        <HStack className="mt-3 items-center justify-between" space="sm">
          <Text size="2xs" className="text-muted-foreground">
            {job.postedAgo}
          </Text>

          {isApplied ? (
            <HStack className="items-center" space="xs">
              <Icon as={CheckCircle2} size="xs" className="text-secondary" />
              <Text size="2xs" bold className="text-secondary">
                Postulé
              </Text>
            </HStack>
          ) : showStrongMatch ? (
            <Text size="2xs" bold numberOfLines={1} className="text-primary max-w-[65%] text-right">
              {matchScore}% match{matchReason ? ` · ${matchReason}` : ''}
            </Text>
          ) : null}
        </HStack>
      </Box>
    </ScalePressable>
  );
}
