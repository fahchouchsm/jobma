import React from 'react';
import Animated, { FadeInDown, FadeOutLeft, LinearTransition } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Bookmark, Compass } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { Toast, ToastTitle, useToast } from '@/components/ui/toast';
import { VStack } from '@/components/ui/vstack';
import { JobCardSkeleton } from '@/components/discover/job-card-skeleton';
import { EmptyState } from '@/components/empty-state';
import { JobCard } from '@/components/job-card';
import { JobmaHeader } from '@/components/jobma-header';
import { useJobs } from '@/context/jobs-context';
import { triggerHaptic } from '@/lib/haptics';

export default function SavedJobsScreen() {
  const router = useRouter();
  const toast = useToast();
  const { offers, savedIds, isSyncingCloud, isApplied, toggleSave } = useJobs();

  const savedJobs = offers.filter((job) => savedIds.includes(job.id));

  const handleRemoveSaved = (jobId: string) => {
    toggleSave(jobId);
    toast.show({
      placement: 'top',
      duration: 3000,
      render: ({ id }) => (
        <Toast
          nativeID={`toast-${id}`}
          className="bg-foreground flex-row items-center gap-3 rounded-full px-4 py-2.5 shadow-lg">
          <ToastTitle className="text-background text-xs font-semibold">
            Retiré de vos favoris
          </ToastTitle>
          <Pressable
            onPress={() => {
              triggerHaptic('light');
              toggleSave(jobId);
              toast.close(id);
            }}>
            <Text size="xs" bold className="text-primary-fixed underline">
              Annuler
            </Text>
          </Pressable>
        </Toast>
      ),
    });
  };

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

          {isSyncingCloud && savedJobs.length === 0 ? (
            <VStack space="md">
              <JobCardSkeleton />
              <JobCardSkeleton />
            </VStack>
          ) : savedJobs.length === 0 ? (
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
                    onToggleSave={() => handleRemoveSaved(job.id)}
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
