import React from 'react';
import { Clock, Globe } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { CompanyLogo } from '@/components/company-logo';
import { StatusBadge } from '@/components/status-badge';
import type { JobListing } from '@/data/jobs';

export function JobHeroCard({ job }: { job: JobListing }) {
  return (
    <Box className="mb-4 px-4">
      <Card className="bg-card border-border rounded-2xl border p-4 shadow-xs">
        <VStack space="sm">
          <HStack className="items-start" space="md">
            <CompanyLogo name={job.company} logoUrl={job.logoUrl} size="lg" tone={job.brandTone} />

            <VStack space="xs" className="min-w-0 flex-1">
              {job.isActivelyHiring && <StatusBadge variant="hiring" />}

              <Heading size="lg" bold isTruncated className="text-foreground leading-tight">
                {job.title}
              </Heading>

              <HStack className="items-center" space="xs">
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
            <HStack className="items-center" space="sm">
              <Icon as={Globe} size="sm" className="text-primary" />
              <Text size="xs" className="text-foreground font-medium">
                {job.workMode} • {job.location}
              </Text>
            </HStack>
            <HStack className="items-center" space="sm">
              <Icon as={Clock} size="sm" className="text-secondary" />
              <Text size="xs" className="text-muted-foreground">
                {job.postedAgo} •{' '}
                <Text size="xs" bold className="text-foreground">
                  {job.applicantsCount}
                </Text>
              </Text>
            </HStack>
          </VStack>
        </VStack>
      </Card>
    </Box>
  );
}
