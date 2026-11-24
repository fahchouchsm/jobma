import React, { useEffect, useState } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Award,
  Building2,
  Check,
  CheckCircle2,
  Eye,
  GitBranch,
  GraduationCap,
  HeartPulse,
  PartyPopper,
  PenTool,
  PiggyBank,
  ShieldCheck,
  Star,
  Umbrella,
  Users,
} from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Image } from '@/components/ui/image';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { Toast, ToastTitle, useToast } from '@/components/ui/toast';
import { VStack } from '@/components/ui/vstack';
import { ApplySheet } from '@/components/job-detail/apply-sheet';
import { JobApplyBar } from '@/components/job-detail/job-apply-bar';
import { JobHeroCard } from '@/components/job-detail/job-hero-card';
import { JobMetricsRow } from '@/components/job-detail/job-metrics-row';
import { type JobDetailTabId, JobSegmentedTabs } from '@/components/job-detail/job-segmented-tabs';
import { JobmaHeader } from '@/components/jobma-header';
import { useAuth } from '@/context/auth-context';
import { useJobs } from '@/context/jobs-context';
import { useProfile } from '@/context/profile-context';
import { JOBS, type JobBenefit, type JobListing, type JobQualification } from '@/data/jobs';
import { triggerHaptic } from '@/lib/haptics';
import { computeJobMatch } from '@/lib/job-match';
import { fetchOfferSource, fetchSimilarOffers, submitApplication } from '@/services/jobs-service';
import type { OfferSourceResponse } from '@/types/offer';

const QUALIFICATION_ICON_MAP: Record<JobQualification['icon'], typeof Award> = {
  award: Award,
  pen: PenTool,
  network: GitBranch,
};

const BENEFIT_ICON_MAP: Record<JobBenefit['icon'], typeof HeartPulse> = {
  health: HeartPulse,
  learning: GraduationCap,
  retirement: PiggyBank,
  vacation: Umbrella,
};

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { isAuthenticated } = useAuth();
  const { offers, getOfferById, ensureOfferLoaded, isSaved, isApplied, toggleSave, markApplied } =
    useJobs();
  const { profile, uploadCv } = useProfile();

  const job = getOfferById(id) ?? offers[0] ?? JOBS[0];
  const match = computeJobMatch(job, profile);
  const [serverSimilarJobs, setServerSimilarJobs] = useState<JobListing[]>([]);
  const similarJobs =
    serverSimilarJobs.length > 0
      ? serverSimilarJobs.slice(0, 3)
      : offers.filter((item) => item.id !== job.id && item.category === job.category).slice(0, 3);

  useEffect(() => {
    if (id && !getOfferById(id)) {
      void ensureOfferLoaded(id);
    }
  }, [id, getOfferById, ensureOfferLoaded]);
  const saved = isSaved(job.id);
  const applied = isApplied(job.id);

  const [activeTab, setActiveTab] = useState<JobDetailTabId>('overview');
  const [isApplying, setIsApplying] = useState(false);
  const [showApplySheet, setShowApplySheet] = useState(false);
  const [offerSource, setOfferSource] = useState<OfferSourceResponse | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!job.id) return;
    fetchOfferSource(job.id)
      .then((src) => {
        if (mounted) setOfferSource(src);
      })
      .catch(() => {});
    fetchSimilarOffers(job.id, 6)
      .then((items) => {
        if (mounted && items.length > 0) setServerSimilarJobs(items);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [job.id]);

  const showToast = (message: string) => {
    toast.show({
      placement: 'top',
      duration: 2600,
      render: ({ id: toastId }) => (
        <Toast
          nativeID={`toast-${toastId}`}
          className="bg-foreground flex-row items-center gap-2 rounded-full px-4 py-2.5 shadow-lg">
          <Icon as={CheckCircle2} size="sm" className="text-secondary-fixed" />
          <ToastTitle className="text-background text-xs font-semibold">{message}</ToastTitle>
        </Toast>
      ),
    });
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const handleToggleSave = () => {
    triggerHaptic('light');
    const nextSaved = toggleSave(job.id);
    showToast(nextSaved ? 'Enregistré dans vos offres favorites' : 'Retiré de vos favoris');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: `${job.title} chez ${job.company}`,
        message: `Découvrez cette opportunité sur Jobma : ${job.title} chez ${job.company} (${job.salaryRange})`,
      });
    } catch {
      showToast("Lien de l'offre copié !");
    }
  };

  const handleOneClickApply = () => {
    if (applied || isApplying) return;
    triggerHaptic('light');
    setShowApplySheet(true);
  };

  const handleConfirmApply = async (note: string) => {
    if (applied || isApplying) return;
    triggerHaptic('medium');
    setIsApplying(true);
    try {
      await submitApplication(
        {
          jobId: job.id,
          cvId: profile.cvFile?.id,
          cvName: profile.cvFile?.name,
          note: note || undefined,
        },
        isAuthenticated
      );
      setShowApplySheet(false);
      markApplied(job.id, {
        cvName: profile.cvFile?.name,
        note: note || undefined,
      });
      triggerHaptic('success');
      showToast(
        profile.cvFile
          ? `Postulé avec ${profile.cvFile.name} !`
          : `Postulé ! L'équipe ${job.company} a été notifiée.`
      );
    } catch {
      showToast("Erreur lors de l'envoi. Réessayez.");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Box className="bg-background flex-1">
      <JobmaHeader
        title="Détails de l'offre"
        showBack
        onBack={handleBack}
        isSaved={saved}
        onToggleSave={handleToggleSave}
        onShare={handleShare}
      />

      <ScrollView
        className="flex-1"
        stickyHeaderIndices={[3]}
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: 28,
        }}
        showsVerticalScrollIndicator={false}>
        {/* 0: Hero Card */}
        <JobHeroCard
          job={job}
          sourceSite={offerSource?.sourceSite}
          sourceUrl={offerSource?.sourceUrl}
        />

        {/* Match Score Banner */}
        <Box className="mb-3 px-4">
          <Box className="bg-primary-fixed/60 border-primary/20 rounded-xl border px-3.5 py-2.5">
            <HStack className="items-center justify-between" space="sm">
              <Text size="xs" bold className="text-on-primary-fixed">
                Compatibilité : {match.score}% Match
              </Text>
              {match.reasons.length > 0 && (
                <Text size="2xs" isTruncated className="text-muted-foreground flex-1 text-right">
                  {match.reasons.join(' • ')}
                </Text>
              )}
            </HStack>
          </Box>
        </Box>

        {/* 1: Key Metrics Pills */}
        <JobMetricsRow metrics={job.metrics} />

        {/* 2: Sticky Segmented Tabs */}
        <JobSegmentedTabs activeTab={activeTab} onChange={setActiveTab} />

        {/* 3: Active Tab Content */}
        <Animated.View key={activeTab} entering={FadeInDown.duration(240)}>
          <VStack space="md" className="px-4">
            {activeTab === 'overview' && (
              <VStack space="md">
                <Card className="bg-card border-border rounded-2xl border p-4 shadow-xs">
                  <VStack space="sm">
                    <HStack className="items-center" space="sm">
                      <Box className="bg-primary-fixed/70 h-7 w-7 items-center justify-center rounded-lg">
                        <Icon as={Eye} size="sm" className="text-primary" />
                      </Box>
                      <Heading size="sm" bold className="text-foreground">
                        Aperçu du poste
                      </Heading>
                    </HStack>

                    <Text size="sm" className="text-muted-foreground leading-relaxed">
                      {job.overview}
                    </Text>

                    <Box className="bg-muted mt-1 rounded-xl p-3">
                      <HStack className="items-center" space="sm">
                        <Icon as={ShieldCheck} size="lg" className="text-secondary" />
                        <VStack className="flex-1">
                          <Text size="xs" bold className="text-foreground">
                            {job.highlightTitle}
                          </Text>
                          <Text size="xs" className="text-muted-foreground">
                            {job.highlightSubtitle}
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>
                  </VStack>
                </Card>

                {job.responsibilities.length > 0 && (
                  <Card className="bg-card border-border rounded-2xl border p-4 shadow-xs">
                    <VStack space="sm">
                      <HStack className="items-center" space="sm">
                        <Box className="bg-secondary-container/60 h-7 w-7 shrink-0 items-center justify-center rounded-lg">
                          <Icon as={CheckCircle2} size="sm" className="text-secondary" />
                        </Box>
                        <Heading size="sm" bold className="text-foreground flex-1">
                          Votre impact et responsabilités
                        </Heading>
                      </HStack>

                      <VStack space="md" className="pt-1">
                        {job.responsibilities.map((item) => (
                          <HStack key={item.id} className="items-start" space="sm">
                            <Box className="bg-secondary-container/60 mt-0.5 h-5 w-5 shrink-0 items-center justify-center rounded-full">
                              <Icon as={Check} size="xs" className="text-secondary" />
                            </Box>
                            <Text size="sm" className="text-muted-foreground flex-1 leading-snug">
                              <Text size="sm" bold className="text-foreground">
                                {item.title}{' '}
                              </Text>
                              {item.description}
                            </Text>
                          </HStack>
                        ))}
                      </VStack>
                    </VStack>
                  </Card>
                )}
              </VStack>
            )}

            {activeTab === 'requirements' && (
              <Card className="bg-card border-border rounded-2xl border p-4 shadow-xs">
                <VStack space="sm">
                  <HStack className="items-center" space="sm">
                    <Box className="bg-accent h-7 w-7 items-center justify-center rounded-lg">
                      <Icon as={GraduationCap} size="sm" className="text-primary" />
                    </Box>
                    <Heading size="sm" bold className="text-foreground">
                      Qualifications & Compétences requises
                    </Heading>
                  </HStack>

                  <VStack space="sm" className="pt-1">
                    {job.qualifications.length === 0 ? (
                      <Text size="xs" className="text-muted-foreground">
                        Consultez l&apos;aperçu du poste pour les qualifications détaillées.
                      </Text>
                    ) : (
                      job.qualifications.map((qual) => {
                        const QualIcon = QUALIFICATION_ICON_MAP[qual.icon];
                        return (
                          <Box key={qual.id} className="bg-muted rounded-xl p-3">
                            <VStack space="xs">
                              <HStack className="items-start" space="xs">
                                <Icon as={QualIcon} size="sm" className="text-primary mt-0.5 shrink-0" />
                                <Text size="xs" bold className="text-foreground flex-1 leading-snug">
                                  {qual.title}
                                </Text>
                              </HStack>
                              <Text size="xs" className="text-muted-foreground leading-relaxed">
                                {qual.description}
                              </Text>
                            </VStack>
                          </Box>
                        );
                      })
                    )}
                  </VStack>
                </VStack>
              </Card>
            )}

            {activeTab === 'benefits' && (
              <Card className="bg-card border-border rounded-2xl border p-4 shadow-xs">
                <VStack space="sm">
                  <HStack className="items-center" space="sm">
                    <Box className="bg-secondary-container/60 h-7 w-7 items-center justify-center rounded-lg">
                      <Icon as={PartyPopper} size="sm" className="text-secondary" />
                    </Box>
                    <Heading size="sm" bold className="text-foreground">
                      Avantages
                    </Heading>
                  </HStack>

                  {job.benefits.length === 0 ? (
                    <Text size="xs" className="text-muted-foreground pt-1">
                      Les avantages seront précisés lors de l&apos;entretien avec {job.company}.
                    </Text>
                  ) : (
                    <Box className="flex-row flex-wrap justify-between gap-y-2 pt-1">
                      {job.benefits.map((benefit) => {
                        const BenefitIcon = BENEFIT_ICON_MAP[benefit.icon];
                        const iconColorClass =
                          benefit.accent === 'secondary'
                            ? 'text-secondary'
                            : benefit.accent === 'primary'
                              ? 'text-primary'
                              : 'text-tertiary';

                        return (
                          <Box key={benefit.id} className="bg-muted w-[48.5%] rounded-xl p-3">
                            <VStack space="xs">
                              <Icon as={BenefitIcon} size="lg" className={iconColorClass} />
                              <Text size="xs" bold className="text-foreground">
                                {benefit.title}
                              </Text>
                              <Text size="xs" className="text-muted-foreground">
                                {benefit.description}
                              </Text>
                            </VStack>
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </VStack>
              </Card>
            )}

            {activeTab === 'company' && (
              <Card className="bg-card border-border rounded-2xl border p-4 shadow-xs">
                <VStack space="md">
                  <HStack className="items-start justify-between" space="sm">
                    <HStack className="min-w-0 flex-1 items-center" space="sm">
                      <Box className="bg-primary-fixed/70 h-7 w-7 shrink-0 items-center justify-center rounded-lg">
                        <Icon as={Building2} size="sm" className="text-primary" />
                      </Box>
                      <Heading size="sm" bold numberOfLines={2} className="text-foreground flex-1">
                        À propos de {job.company}
                      </Heading>
                    </HStack>

                    {Boolean(job.companyRating) && (
                      <Box className="bg-accent shrink-0 rounded-full px-2.5 py-1">
                        <HStack className="items-center" space="xs">
                          <Icon as={Star} size="xs" className="text-warning fill-warning" />
                          <Text size="2xs" bold className="text-foreground">
                            {job.companyRating}
                          </Text>
                          {Boolean(job.companyReviews) && (
                            <Text size="2xs" className="text-muted-foreground">
                              {job.companyReviews}
                            </Text>
                          )}
                        </HStack>
                      </Box>
                    )}
                  </HStack>

                  <Text size="sm" className="text-muted-foreground leading-relaxed">
                    {job.companyBio || `${job.company} recrute actuellement au Maroc.`}
                  </Text>

                  <HStack className="bg-muted justify-between rounded-xl p-3" space="xs">
                    <VStack className="min-w-0 flex-1 items-center">
                      <Text size="2xs" className="text-muted-foreground">
                        Effectif
                      </Text>
                      <Text size="xs" bold numberOfLines={2} className="text-foreground mt-0.5 text-center">
                        {job.companyStats.size}
                      </Text>
                    </VStack>
                    <VStack className="min-w-0 flex-1 items-center">
                      <Text size="2xs" className="text-muted-foreground">
                        Phase
                      </Text>
                      <Text size="xs" bold numberOfLines={2} className="text-foreground mt-0.5 text-center">
                        {job.companyStats.stage}
                      </Text>
                    </VStack>
                    <VStack className="min-w-0 flex-1 items-center">
                      <Text size="2xs" className="text-muted-foreground">
                        Siège
                      </Text>
                      <Text size="xs" bold numberOfLines={2} className="text-foreground mt-0.5 text-center">
                        {job.companyStats.hq}
                      </Text>
                    </VStack>
                  </HStack>

                  {job.officePhotoUrl && (
                    <Box className="relative h-40 overflow-hidden rounded-xl">
                      <Image
                        source={{ uri: job.officePhotoUrl }}
                        alt={job.officePhotoCaption ?? job.company}
                        size="full"
                        resizeMode="cover"
                      />
                      {job.officePhotoCaption && (
                        <Box className="bg-foreground/60 absolute right-0 bottom-0 left-0 px-3 py-2">
                          <HStack className="items-center" space="xs">
                            <Icon as={Users} size="xs" className="text-background" />
                            <Text size="xs" bold className="text-background">
                              {job.officePhotoCaption}
                            </Text>
                          </HStack>
                        </Box>
                      )}
                    </Box>
                  )}
                </VStack>
              </Card>
            )}
          </VStack>
        </Animated.View>

        {/* Similar Jobs */}
        {similarJobs.length > 0 && (
          <VStack space="sm" className="px-4 pt-6">
            <Heading size="sm" bold className="text-foreground">
              Offres similaires en {job.category}
            </Heading>
            <VStack space="sm">
              {similarJobs.map((item) => (
                <Card key={item.id} className="bg-card border-border rounded-2xl border p-3.5">
                  <HStack className="items-center justify-between" space="sm">
                    <VStack className="min-w-0 flex-1">
                      <Text size="sm" bold isTruncated className="text-foreground">
                        {item.title}
                      </Text>
                      <Text size="xs" isTruncated className="text-muted-foreground">
                        {item.company} • {item.salaryRange}
                      </Text>
                    </VStack>
                    <Text
                      size="xs"
                      bold
                      onPress={() => router.push(`/job/${item.id}`)}
                      className="text-primary px-2 py-1">
                      Voir →
                    </Text>
                  </HStack>
                </Card>
              ))}
            </VStack>
          </VStack>
        )}
      </ScrollView>

      <JobApplyBar
        isSaved={saved}
        isApplied={applied}
        isApplying={isApplying}
        sourceSite={offerSource?.sourceSite}
        sourceUrl={offerSource?.sourceUrl}
        onToggleSave={handleToggleSave}
        onApply={handleOneClickApply}
      />

      <ApplySheet
        visible={showApplySheet}
        job={job}
        profile={profile}
        isSubmitting={isApplying}
        onClose={() => setShowApplySheet(false)}
        onConfirm={handleConfirmApply}
        onAttachCv={(cv) => {
          void uploadCv(cv).catch(() => {});
        }}
        sourceSite={offerSource?.sourceSite}
        sourceUrl={offerSource?.sourceUrl}
      />
    </Box>
  );
}
