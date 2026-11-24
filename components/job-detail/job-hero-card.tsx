import React from 'react';
import { Linking } from 'react-native';
import { Clock, ExternalLink, Globe } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { CompanyLogo } from '@/components/company-logo';
import { StatusBadge } from '@/components/status-badge';
import type { JobListing } from '@/data/jobs';

interface JobHeroCardProps {
  job: JobListing;
  sourceSite?: string;
  sourceUrl?: string;
}

export function JobHeroCard({ job, sourceSite, sourceUrl }: JobHeroCardProps) {
  return (
    <Box className="mb-3 px-4">
      <Card className="bg-card border-border rounded-2xl border p-4 shadow-xs">
        <VStack space="sm">
          <HStack className="items-start" space="md">
            <CompanyLogo name={job.company} logoUrl={job.logoUrl} size="lg" tone={job.brandTone} />

            <VStack space="xs" className="min-w-0 flex-1">
              <HStack className="flex-wrap items-center gap-1.5">
                {job.isActivelyHiring && <StatusBadge variant="hiring" />}
                {sourceSite && (
                  <Pressable
                    disabled={!sourceUrl}
                    onPress={() => {
                      if (sourceUrl) void Linking.openURL(sourceUrl);
                    }}
                    className="bg-muted flex-row items-center gap-1 rounded-full px-2.5 py-0.5">
                    <Text size="2xs" bold className="text-muted-foreground">
                      via {sourceSite}
                    </Text>
                    {sourceUrl && <Icon as={ExternalLink} size="2xs" className="text-primary" />}
                  </Pressable>
                )}
              </HStack>

              <Heading size="lg" bold numberOfLines={3} className="text-foreground leading-snug">
                {job.title}
              </Heading>

              <HStack className="flex-wrap items-center gap-x-1.5 gap-y-0.5">
                <Text size="xs" bold className="text-foreground">
                  {job.company}
                </Text>
                <Box className="bg-border h-1 w-1 rounded-full" />
                <Text size="xs" className="text-muted-foreground">
                  {job.industry}
                </Text>
              </HStack>
            </VStack>
          </HStack>

          <VStack space="xs" className="pt-1">
            <HStack className="items-start" space="sm">
              <Icon as={Globe} size="sm" className="text-primary mt-0.5 shrink-0" />
              <Text size="xs" className="text-foreground flex-1 font-medium leading-snug">
                {job.workMode} • {job.location}
              </Text>
            </HStack>
            <HStack className="items-start" space="sm">
              <Icon as={Clock} size="sm" className="text-secondary mt-0.5 shrink-0" />
              <Text size="xs" className="text-muted-foreground flex-1 leading-snug">
                {job.postedAgo}
                {job.applicantsCount ? (
                  <>
                    {' • '}
                    <Text size="xs" bold className="text-foreground">
                      {job.applicantsCount}
                    </Text>
                  </>
                ) : null}
              </Text>
            </HStack>
          </VStack>
        </VStack>
      </Card>
    </Box>
  );
}
