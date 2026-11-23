import React, { useState } from 'react';
import { Platform, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Award,
  Banknote,
  Bookmark,
  Building2,
  Check,
  CheckCheck,
  CheckCircle2,
  Clock,
  Eye,
  GitBranch,
  Globe,
  GraduationCap,
  HeartPulse,
  Medal,
  PartyPopper,
  PenTool,
  PieChart,
  PiggyBank,
  Share2,
  ShieldCheck,
  Star,
  Umbrella,
  Users,
  Zap,
} from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Button, ButtonIcon, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { Card } from '@/components/ui/card';
import { Image } from '@/components/ui/image';
import { Icon } from '@/components/ui/icon';
import { Toast, ToastTitle, useToast } from '@/components/ui/toast';
import { JobmaHeader } from '@/components/jobma-header';
import { JOBS, type JobBenefit, type JobMetric, type JobQualification } from '@/data/jobs';
import { useJobs } from '@/context/jobs-context';

type TabId = 'overview' | 'requirements' | 'company' | 'benefits';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Aperçu' },
  { id: 'requirements', label: 'Prérequis' },
  { id: 'company', label: 'Entreprise' },
  { id: 'benefits', label: 'Avantages' },
];

const METRIC_ICON_MAP: Record<JobMetric['icon'], typeof Banknote> = {
  payments: Banknote,
  schedule: Clock,
  level: Medal,
  equity: PieChart,
};

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

  const job = JOBS.find((item) => item.id === id) ?? JOBS[0];
  const saved = isSaved(job.id);
  const applied = isApplied(job.id);

  const [activeTab, setActiveTab] = useState<TabId>('overview');
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
    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      markApplied(job.id);
      showToast(`Postulé ! L'équipe ${job.company} a été notifiée.`);
    }, 1000);
  };

  return (
    <Box className="bg-background flex-1">
      <JobmaHeader title="Détails de l'offre" showBack onBack={handleBack} onShare={handleShare} />

      <ScrollView
        className="flex-1"
        stickyHeaderIndices={[3]}
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 16) + 96,
        }}
        showsVerticalScrollIndicator={false}>
        {/* 0: Top Action Sub-bar */}
        <HStack className="items-center justify-between px-4 pt-2 pb-3">
          <Pressable
            accessibilityLabel="Retour"
            onPress={handleBack}
            className="bg-muted h-10 w-10 items-center justify-center rounded-full active:opacity-80">
            <Icon as={ArrowLeft} size="md" className="text-foreground" />
          </Pressable>

          <HStack space="xs">
            <Pressable
              accessibilityLabel="Sauvegarder l'offre"
              onPress={handleToggleSave}
              className="bg-muted h-10 w-10 items-center justify-center rounded-full active:opacity-80">
              <Icon
                as={Bookmark}
                size="md"
                className={saved ? 'text-primary fill-primary' : 'text-muted-foreground'}
              />
            </Pressable>
            <Pressable
              accessibilityLabel="Partager l'opportunité"
              onPress={handleShare}
              className="bg-muted h-10 w-10 items-center justify-center rounded-full active:opacity-80">
              <Icon as={Share2} size="md" className="text-muted-foreground" />
            </Pressable>
          </HStack>
        </HStack>

        {/* 1: Main Hero Profile Card */}
        <Box className="mb-4 px-4">
          <Card className="bg-card border-border/80 overflow-hidden rounded-2xl border p-4 shadow-xs">
            <VStack space="sm">
              <HStack className="items-start" space="md">
                <Box className="bg-accent border-border/60 h-14 w-14 shrink-0 overflow-hidden rounded-xl border">
                  <Image
                    source={{ uri: job.logoUrl }}
                    alt={job.company}
                    size="full"
                    resizeMode="cover"
                  />
                </Box>

                <VStack space="xs" className="min-w-0 flex-1">
                  {job.isActivelyHiring && (
                    <HStack className="items-center">
                      <Box className="bg-secondary-container/60 rounded-full px-2.5 py-0.5">
                        <HStack className="items-center" space="xs">
                          <Box className="bg-secondary h-1.5 w-1.5 rounded-full" />
                          <Text size="2xs" bold className="text-on-secondary-container">
                            Recrutement actif
                          </Text>
                        </HStack>
                      </Box>
                    </HStack>
                  )}

                  <Heading size="lg" bold isTruncated className="text-foreground leading-tight">
                    {job.title}
                  </Heading>

                  <HStack className="items-center" space="xs">
                    <Text size="xs" className="text-muted-foreground font-medium">
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
                    {job.workMode}
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

        {/* 2: Key Metrics Pill Row */}
        <Box className="mb-4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
            {job.metrics.map((metric) => {
              const MetricIcon = METRIC_ICON_MAP[metric.icon];
              const containerClass =
                metric.tone === 'emerald'
                  ? 'bg-secondary-container/45'
                  : metric.tone === 'indigo'
                    ? 'bg-primary-fixed/70'
                    : 'bg-muted';
              const iconClass =
                metric.tone === 'emerald'
                  ? 'text-secondary'
                  : metric.tone === 'indigo'
                    ? 'text-primary'
                    : 'text-muted-foreground';
              const textClass =
                metric.tone === 'emerald'
                  ? 'text-on-secondary-container'
                  : metric.tone === 'indigo'
                    ? 'text-on-primary-fixed'
                    : 'text-foreground';

              return (
                <Box
                  key={metric.id}
                  className={`${containerClass} rounded-xl px-3 py-2 shadow-2xs`}>
                  <HStack className="items-center" space="xs">
                    <Icon as={MetricIcon} size="sm" className={iconClass} />
                    <Text size="xs" bold={metric.tone === 'emerald'} className={textClass}>
                      {metric.label}
                    </Text>
                  </HStack>
                </Box>
              );
            })}
          </ScrollView>
        </Box>

        {/* 3: Sticky Segmented Tab Navigation */}
        <Box className="bg-background/95 px-4 pt-1 pb-3">
          <HStack className="bg-muted rounded-xl p-1" space="xs">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id)}
                  className={`flex-1 items-center justify-center rounded-lg py-2 ${
                    isActive ? 'bg-card shadow-2xs' : ''
                  }`}>
                  <Text
                    size="xs"
                    bold={isActive}
                    className={isActive ? 'text-primary' : 'text-muted-foreground'}>
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </HStack>
        </Box>

        {/* 4: Tab Content Sections */}
        <VStack space="md" className="px-4">
          {activeTab === 'overview' && (
            <VStack space="md">
              {/* Role Overview Card */}
              <Card className="bg-card border-border/60 rounded-2xl border p-4 shadow-xs">
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

                  {/* Contextual Highlight Micro-banner */}
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

              {/* Impact & Responsibilities */}
              <Card className="bg-card border-border/60 rounded-2xl border p-4 shadow-xs">
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
            <Card className="bg-card border-border/60 rounded-2xl border p-4 shadow-xs">
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
            <Card className="bg-card border-border/60 rounded-2xl border p-4 shadow-xs">
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
            <Card className="bg-card border-border/60 rounded-2xl border p-4 shadow-xs">
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

                {/* Company Quick Stats */}
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

                {/* Office Culture Preview Photo */}
                <Box className="relative h-40 overflow-hidden rounded-xl">
                  <Image
                    source={{ uri: job.officePhotoUrl }}
                    alt={job.officePhotoCaption}
                    size="full"
                    resizeMode="cover"
                  />
                  <Box className="bg-foreground/60 absolute right-0 bottom-0 left-0 px-3 py-2">
                    <HStack className="items-center" space="xs">
                      <Icon as={Users} size="xs" className="text-background" />
                      <Text size="xs" bold className="text-background">
                        {job.officePhotoCaption}
                      </Text>
                    </HStack>
                  </Box>
                </Box>
              </VStack>
            </Card>
          )}
        </VStack>
      </ScrollView>

      {/* Persistent Sticky Bottom Action Surface (Level 3 Elevation) */}
      <Box
        className="bg-card/95 border-border absolute right-0 bottom-0 left-0 border-t px-4 pt-3 shadow-lg"
        style={{ paddingBottom: Platform.OS === 'web' ? 14 : Math.max(insets.bottom, 14) }}>
        <HStack className="w-full max-w-md items-center self-center" space="sm">
          <Pressable
            accessibilityLabel="Enregistrer cette offre"
            onPress={handleToggleSave}
            className="bg-muted h-12 w-12 shrink-0 items-center justify-center rounded-xl active:opacity-80">
            <Icon
              as={Bookmark}
              size="md"
              className={saved ? 'text-primary fill-primary' : 'text-muted-foreground'}
            />
          </Pressable>

          <Button
            size="lg"
            variant={applied ? 'secondary' : 'default'}
            isDisabled={isApplying}
            onPress={handleOneClickApply}
            className="h-12 flex-1 rounded-xl">
            {isApplying ? (
              <>
                <ButtonSpinner className="text-primary-foreground" />
                <ButtonText className="font-bold">Envoi du profil...</ButtonText>
              </>
            ) : applied ? (
              <>
                <ButtonIcon as={CheckCheck} className="text-secondary-foreground" />
                <ButtonText className="font-bold">Candidature envoyée</ButtonText>
              </>
            ) : (
              <>
                <ButtonIcon as={Zap} className="text-primary-foreground" />
                <ButtonText className="font-bold">Postuler en 1 clic</ButtonText>
              </>
            )}
          </Button>
        </HStack>
      </Box>
    </Box>
  );
}
