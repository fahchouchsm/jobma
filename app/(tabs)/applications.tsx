import React from 'react';
import { useRouter } from 'expo-router';
import { Compass, Send } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { EmptyState } from '@/components/empty-state';
import { JobCard } from '@/components/job-card';
import { JobmaHeader } from '@/components/jobma-header';
import { useJobs } from '@/context/jobs-context';
import { JOBS } from '@/data/jobs';

export default function ApplicationsScreen() {
  const router = useRouter();
  const { appliedIds, isSaved } = useJobs();

  const appliedJobs = JOBS.filter((job) => appliedIds.includes(job.id));

  return (
    <Box className="bg-background flex-1">
      <JobmaHeader title="Candidatures" onAvatarPress={() => router.push('/profile')} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}>
        <VStack space="md" className="px-4 pt-4">
          <VStack space="xs">
            <Heading size="xl" bold className="text-foreground">
              Suivi des candidatures ({appliedJobs.length})
            </Heading>
            <Text size="sm" className="text-muted-foreground">
              Consultez l'avancement de vos candidatures en 1 clic.
            </Text>
          </VStack>

          {appliedJobs.length === 0 ? (
            <EmptyState
              icon={Send}
              tone="secondary"
              title="Aucune candidature envoyée"
              description="Ouvrez une offre et cliquez sur « Postuler en 1 clic » pour suivre votre dossier ici."
              actionLabel="Découvrir les offres"
              actionIcon={Compass}
              onAction={() => router.push('/')}
            />
          ) : (
            <VStack space="md">
              {appliedJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  variant="applied"
                  isSaved={isSaved(job.id)}
                  isApplied
                  onPress={() => router.push(`/job/${job.id}`)}
                />
              ))}
            </VStack>
          )}
        </VStack>
      </ScrollView>
    </Box>
  );
}
