import React, { useState } from 'react';
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
import { JobApplyBar } from '@/components/job-detail/job-apply-bar';
import { JobHeroCard } from '@/components/job-detail/job-hero-card';
import { JobMetricsRow } from '@/components/job-detail/job-metrics-row';
import { type JobDetailTabId, JobSegmentedTabs } from '@/components/job-detail/job-segmented-tabs';
import { JobmaHeader } from '@/components/jobma-header';
import { useJobs } from '@/context/jobs-context';
import { useProfile } from '@/context/profile-context';
import { JOBS, type JobBenefit, type JobQualification } from '@/data/jobs';
import { triggerHaptic } from '@/lib/haptics';

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
  const { isSaved, isApplied, toggleSave, markApplied } = useJobs();
  const { profile } = useProfile();

  const job = JOBS.find((item) => item.id === id) ?? JOBS[0];
  const saved = isSaved(job.id);
  const applied = isApplied(job.id);

  const [activeTab, setActiveTab] = useState<JobDetailTabId>('overview');
  const [isApplying, setIsApplying] = useState(false);

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
    triggerHaptic('medium');
    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      markApplied(job.id);
      triggerHaptic('success');
      showToast(
        profile.cvFile
          ? `Postulé avec ${profile.cvFile.name} !`
          : `Postulé ! L'équipe ${job.company} a été notifiée.`
      );
    }, 900);
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
        stickyHeaderIndices={[2]}
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: Math.max(insets.bottom, 16) + 96,
        }}
        showsVerticalScrollIndicator={false}>
        {/* 0: Hero Card */}
        <JobHeroCard job={job} />

        {/* 1: Key Metrics Pills */}
        <JobMetricsRow metrics={job.metrics} />

        {/* 2: Sticky Segmented Tabs */}
        <JobSegmentedTabs activeTab={activeTab} onChange={setActiveTab} />

        {/* 3: Active Tab Content */}
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

              <Card className="bg-card border-border rounded-2xl border p-4 shadow-xs">
                <VStack space="sm">
                  <HStack className="items-center" space="sm">
                    <Box className="bg-secondary-container/60 h-7 w-7 items-center justify-center rounded-lg">
                      <Icon as={CheckCircle2} size="sm" className="text-secondary" />
                    </Box>
                    <Heading size="sm" bold className="text-foreground">
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
                  {job.qualifications.map((qual) => {
                    const QualIcon = QUALIFICATION_ICON_MAP[qual.icon];
                    return (
                      <Box key={qual.id} className="bg-muted rounded-xl p-3">
                        <VStack space="xs">
                          <HStack className="items-center" space="xs">
                            <Icon as={QualIcon} size="sm" className="text-primary" />
                            <Text size="xs" bold className="text-foreground">
                              {qual.title}
                            </Text>
                          </HStack>
                          <Text size="xs" className="text-muted-foreground leading-relaxed">
                            {qual.description}
                          </Text>
                        </VStack>
                      </Box>
                    );
                  })}
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
              </VStack>
            </Card>
          )}

          {activeTab === 'company' && (
            <Card className="bg-card border-border rounded-2xl border p-4 shadow-xs">
              <VStack space="md">
                <HStack className="items-center justify-between">
                  <HStack className="items-center" space="sm">
                    <Box className="bg-primary-fixed/70 h-7 w-7 items-center justify-center rounded-lg">
                      <Icon as={Building2} size="sm" className="text-primary" />
                    </Box>
                    <Heading size="sm" bold className="text-foreground">
                      À propos de {job.company}
                    </Heading>
                  </HStack>

                  <Box className="bg-accent rounded-full px-2.5 py-1">
                    <HStack className="items-center" space="xs">
                      <Icon as={Star} size="xs" className="text-warning fill-warning" />
                      <Text size="2xs" bold className="text-foreground">
                        {job.companyRating}
                      </Text>
                      <Text size="2xs" className="text-muted-foreground">
                        {job.companyReviews}
                      </Text>
                    </HStack>
                  </Box>
                </HStack>

                <Text size="sm" className="text-muted-foreground leading-relaxed">
                  {job.companyBio}
                </Text>

                <HStack className="bg-muted justify-between rounded-xl p-3">
                  <VStack className="flex-1 items-center">
                    <Text size="2xs" className="text-muted-foreground">
                      Effectif
                    </Text>
                    <Text size="sm" bold className="text-foreground mt-0.5">
                      {job.companyStats.size}
                    </Text>
                  </VStack>
                  <VStack className="flex-1 items-center">
                    <Text size="2xs" className="text-muted-foreground">
                      Phase
                    </Text>
                    <Text size="sm" bold className="text-foreground mt-0.5">
                      {job.companyStats.stage}
                    </Text>
                  </VStack>
                  <VStack className="flex-1 items-center">
                    <Text size="2xs" className="text-muted-foreground">
                      Siège
                    </Text>
                    <Text size="sm" bold className="text-foreground mt-0.5 text-center">
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
      </ScrollView>

      <JobApplyBar
        isSaved={saved}
        isApplied={applied}
        isApplying={isApplying}
        onToggleSave={handleToggleSave}
        onApply={handleOneClickApply}
      />
    </Box>
  );
}
