import React from 'react';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Compass, FileText, Send, Trash2 } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { EmptyState } from '@/components/empty-state';
import { JobCard } from '@/components/job-card';
import { JobmaHeader } from '@/components/jobma-header';
import { useJobs } from '@/context/jobs-context';
import { JOBS } from '@/data/jobs';
import { triggerHaptic } from '@/lib/haptics';

export default function ApplicationsScreen() {
  const router = useRouter();
  const { appliedIds, applications, isSaved, withdrawApplication } = useJobs();

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
              {appliedJobs.map((job, index) => {
                const appInfo = applications[job.id];
                return (
                  <Animated.View
                    key={job.id}
                    entering={FadeInDown.delay(index * 60).duration(280)}
                    layout={LinearTransition.springify()}>
                    <VStack space="xs">
                      <JobCard
                        job={job}
                        variant="applied"
                        isSaved={isSaved(job.id)}
                        isApplied
                        onPress={() => router.push(`/job/${job.id}`)}
                      />

                      <HStack className="items-center justify-between px-2" space="sm">
                        <HStack className="min-w-0 flex-1 items-center" space="xs">
                          <Icon as={FileText} size="xs" className="text-muted-foreground" />
                          <Text size="2xs" isTruncated className="text-muted-foreground">
                            {appInfo?.cvName ? `CV : ${appInfo.cvName}` : 'Profil Jobma envoyé'}
                            {appInfo?.note ? ` • « ${appInfo.note} »` : ''}
                          </Text>
                        </HStack>

                        <Pressable
                          onPress={() => {
                            triggerHaptic('light');
                            withdrawApplication(job.id);
                          }}
                          className="bg-muted flex-row items-center gap-1 rounded-full px-2 py-1">
                          <Icon as={Trash2} size="xs" className="text-destructive" />
                          <Text size="2xs" bold className="text-destructive">
                            Retirer
                          </Text>
                        </Pressable>
                      </HStack>
                    </VStack>
                  </Animated.View>
                );
              })}
            </VStack>
          )}
        </VStack>
      </ScrollView>
    </Box>
  );
}
