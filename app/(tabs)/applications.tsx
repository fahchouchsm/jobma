import React, { useMemo, useState } from 'react';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Compass, FileText, Send, Trash2 } from 'lucide-react-native';
import { ApplicationDetailSheet } from '@/components/applications/application-detail-sheet';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { Toast, ToastTitle, useToast } from '@/components/ui/toast';
import { VStack } from '@/components/ui/vstack';
import { EmptyState } from '@/components/empty-state';
import { JobCard } from '@/components/job-card';
import { JobmaHeader } from '@/components/jobma-header';
import { type ApplicationStatus, useJobs } from '@/context/jobs-context';
import { triggerHaptic } from '@/lib/haptics';

const STATUS_STAGES: ApplicationStatus[] = ['Envoyée', 'En cours', 'Entretien', 'Offre'];

export default function ApplicationsScreen() {
  const router = useRouter();
  const toast = useToast();
  const {
    offers,
    getOfferById,
    appliedIds,
    applications,
    isSaved,
    updateApplicationStatus,
    updateApplicationNote,
    withdrawApplication,
    restoreApplication,
  } = useJobs();

  const handleWithdrawWithUndo = (jobId: string) => {
    const removed = withdrawApplication(jobId);
    if (!removed) return;
    toast.show({
      placement: 'top',
      duration: 3200,
      render: ({ id }) => (
        <Toast
          nativeID={`toast-${id}`}
          className="bg-foreground flex-row items-center gap-3 rounded-full px-4 py-2.5 shadow-lg">
          <ToastTitle className="text-background text-xs font-semibold">
            Candidature retirée
          </ToastTitle>
          <Pressable
            onPress={() => {
              triggerHaptic('light');
              restoreApplication(removed);
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

  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'Toutes'>('Toutes');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const selectedJob = useMemo(
    () => (selectedJobId ? getOfferById(selectedJobId) ?? null : null),
    [selectedJobId, getOfferById]
  );
  const selectedApplication = selectedJobId ? applications[selectedJobId] ?? null : null;

  const appliedJobs = useMemo(() => {
    return offers.filter((job) => {
      if (!appliedIds.includes(job.id)) return false;
      if (statusFilter === 'Toutes') return true;
      return (applications[job.id]?.status ?? 'Envoyée') === statusFilter;
    });
  }, [appliedIds, applications, statusFilter]);

  return (
    <Box className="bg-background flex-1">
      <JobmaHeader title="Candidatures" onAvatarPress={() => router.push('/profile')} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}>
        <VStack space="md" className="px-4 pt-4">
          <VStack space="xs">
            <Heading size="xl" bold className="text-foreground">
              Suivi des candidatures ({appliedIds.length})
            </Heading>
            <Text size="sm" className="text-muted-foreground">
              Suivez l'avancement de chaque dossier étape par étape.
            </Text>
          </VStack>

          {appliedIds.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}>
              {(['Toutes', ...STATUS_STAGES] as const).map((stage) => {
                const active = statusFilter === stage;
                return (
                  <Pressable
                    key={stage}
                    onPress={() => {
                      triggerHaptic('light');
                      setStatusFilter(stage);
                    }}
                    className={`rounded-full border px-3.5 py-1.5 ${
                      active ? 'bg-primary-fixed border-primary' : 'bg-card border-border'
                    }`}>
                    <Text
                      size="xs"
                      bold={active}
                      className={active ? 'text-primary' : 'text-muted-foreground'}>
                      {stage}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          {appliedJobs.length === 0 ? (
            <EmptyState
              icon={Send}
              tone="secondary"
              title={
                appliedIds.length === 0
                  ? 'Aucune candidature envoyée'
                  : 'Aucun dossier à cette étape'
              }
              description={
                appliedIds.length === 0
                  ? 'Ouvrez une offre et cliquez sur « Postuler en 1 clic » pour suivre votre dossier ici.'
                  : 'Changez le filtre ci-dessus pour voir vos autres candidatures.'
              }
              actionLabel={appliedIds.length === 0 ? 'Découvrir les offres' : 'Voir toutes'}
              actionIcon={Compass}
              onAction={() => {
                if (appliedIds.length === 0) {
                  router.push('/');
                } else {
                  setStatusFilter('Toutes');
                }
              }}
            />
          ) : (
            <VStack space="md">
              {appliedJobs.map((job, index) => {
                const appInfo = applications[job.id];
                const currentStatus = appInfo?.status ?? 'Envoyée';

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

                      {/* Pipeline Stages */}
                      <Box className="bg-card border-border rounded-2xl border p-3">
                        <VStack space="xs">
                          <HStack className="items-center justify-between">
                            <Text size="2xs" bold className="text-muted-foreground uppercase">
                              Étape du recrutement
                            </Text>
                            <Pressable
                              onPress={() => {
                                triggerHaptic('light');
                                handleWithdrawWithUndo(job.id);
                              }}
                              className="bg-muted flex-row items-center gap-1 rounded-full px-2 py-0.5">
                              <Icon as={Trash2} size="xs" className="text-destructive" />
                              <Text size="2xs" bold className="text-destructive">
                                Retirer
                              </Text>
                            </Pressable>
                          </HStack>

                          <HStack space="xs">
                            {STATUS_STAGES.map((stage) => {
                              const active = currentStatus === stage;
                              return (
                                <Pressable
                                  key={stage}
                                  onPress={() => {
                                    triggerHaptic('light');
                                    updateApplicationStatus(job.id, stage);
                                  }}
                                  className={`flex-1 items-center rounded-lg border px-1 py-1.5 ${
                                    active
                                      ? 'bg-secondary-container/60 border-secondary'
                                      : 'bg-muted border-transparent'
                                  }`}>
                                  <Text
                                    size="2xs"
                                    bold={active}
                                    numberOfLines={1}
                                    className={
                                      active
                                        ? 'text-on-secondary-container'
                                        : 'text-muted-foreground'
                                    }>
                                    {stage}
                                  </Text>
                                </Pressable>
                              );
                            })}
                          </HStack>

                          <Pressable
                            onPress={() => {
                              triggerHaptic('light');
                              setSelectedJobId(job.id);
                            }}
                            className="flex-row items-center justify-between pt-1">
                            <HStack className="min-w-0 flex-1 items-center" space="xs">
                              <Icon as={FileText} size="xs" className="text-muted-foreground" />
                              <Text size="2xs" isTruncated className="text-muted-foreground flex-1">
                                {appInfo?.cvName ? `CV : ${appInfo.cvName}` : 'Profil Jobma envoyé'}
                                {appInfo?.note ? ` • « ${appInfo.note} »` : ''}
                              </Text>
                            </HStack>
                            <Text size="2xs" bold className="text-primary pl-2">
                              Détails →
                            </Text>
                          </Pressable>
                        </VStack>
                      </Box>
                    </VStack>
                  </Animated.View>
                );
              })}
            </VStack>
          )}
        </VStack>
      </ScrollView>

      <ApplicationDetailSheet
        visible={Boolean(selectedJob && selectedApplication)}
        job={selectedJob}
        application={selectedApplication}
        onClose={() => setSelectedJobId(null)}
        onUpdateStatus={updateApplicationStatus}
        onUpdateNote={updateApplicationNote}
        onWithdraw={handleWithdrawWithUndo}
        onViewJob={(jobId) => router.push(`/job/${jobId}`)}
      />
    </Box>
  );
}
