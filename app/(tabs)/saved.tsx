import React from 'react';
import Animated, { FadeInDown, FadeOutLeft, LinearTransition } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Bookmark, Compass } from 'lucide-react-native';
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

export default function SavedJobsScreen() {
  const router = useRouter();
  const { savedIds, isApplied, toggleSave } = useJobs();

  const savedJobs = JOBS.filter((job) => savedIds.includes(job.id));

  return (
    <Box className="bg-background flex-1">
      <JobmaHeader title="Favoris" onAvatarPress={() => router.push('/profile')} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}>
        <VStack space="md" className="px-4 pt-4">
          <VStack space="xs">
            <Heading size="xl" bold className="text-foreground">
              Offres enregistrées ({savedJobs.length})
            </Heading>
            <Text size="sm" className="text-muted-foreground">
              Retrouvez ici les opportunités que vous avez mises de côté.
            </Text>
          </VStack>

          {savedJobs.length === 0 ? (
            <EmptyState
              icon={Bookmark}
              tone="primary"
              title="Aucun favori pour le moment"
              description="Appuyez sur l'icône signet d'une offre pour l'enregistrer ici."
              actionLabel="Explorer les offres"
              actionIcon={Compass}
              onAction={() => router.push('/')}
            />
          ) : (
            <VStack space="md">
              {savedJobs.map((job, index) => (
                <Animated.View
                  key={job.id}
                  entering={FadeInDown.delay(index * 60).duration(280)}
                  exiting={FadeOutLeft.duration(220)}
                  layout={LinearTransition.springify()}>
                  <JobCard
                    job={job}
                    variant="saved"
                    isSaved
                    isApplied={isApplied(job.id)}
                    onPress={() => router.push(`/job/${job.id}`)}
                    onToggleSave={() => toggleSave(job.id)}
                  />
                </Animated.View>
              ))}
            </VStack>
          )}
        </VStack>
      </ScrollView>
    </Box>
  );
}
