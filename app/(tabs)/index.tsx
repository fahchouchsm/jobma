import React, { useMemo, useState } from 'react';
import { RefreshControl } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import {
  ArrowUpDown,
  Briefcase,
  CheckCircle2,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { Toast, ToastTitle, useToast } from '@/components/ui/toast';
import { VStack } from '@/components/ui/vstack';
import { FilterSheet } from '@/components/discover/filter-sheet';
import { EmptyState } from '@/components/empty-state';
import { JobCard } from '@/components/job-card';
import { JobmaHeader } from '@/components/jobma-header';
import { useJobs } from '@/context/jobs-context';
import { useProfile, type WorkMode } from '@/context/profile-context';
import { JOBS, type JobListing } from '@/data/jobs';
import { triggerHaptic } from '@/lib/haptics';
import { computeJobMatch } from '@/lib/job-match';

type FilterChip =
  | 'Toutes'
  | 'Recommandées'
  | 'Télétravail'
  | 'Favoris'
  | 'Design'
  | 'Engineering'
  | 'Product'
  | 'IA & Data';

type SortMode = 'match' | 'salary';

const FILTER_CHIPS: FilterChip[] = [
  'Toutes',
  'Recommandées',
  'Télétravail',
  'Favoris',
  'Design',
  'Engineering',
  'Product',
  'IA & Data',
];

export default function JobDiscoveryScreen() {
  const router = useRouter();
  const toast = useToast();
  const { isSaved, isApplied, toggleSave, savedIds } = useJobs();
  const {
    profile,
    recentSearches,
    savedAlerts,
    addRecentSearch,
    clearRecentSearches,
    addJobAlert,
    removeJobAlert,
  } = useProfile();

  const firstName = profile.fullName.trim().split(' ')[0] || 'Sarah';

  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterChip>('Toutes');
  const [workModeFilter, setWorkModeFilter] = useState<WorkMode | 'Tous'>('Tous');
  const [minSalaryFilter, setMinSalaryFilter] = useState<number>(0);
  const [sortMode, setSortMode] = useState<SortMode>('match');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const hasAdvancedFilters = workModeFilter !== 'Tous' || minSalaryFilter > 0;

  const filteredJobs = useMemo(() => {
    const matches = JOBS.filter((job) => {
      if (workModeFilter !== 'Tous' && job.workMode !== workModeFilter) {
        return false;
      }
      if (minSalaryFilter > 0 && job.minSalaryK < minSalaryFilter) {
        return false;
      }

      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.industry.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        job.overview.toLowerCase().includes(q);

      if (!matchesQuery) return false;
      if (activeFilter === 'Toutes') return true;
      if (activeFilter === 'Recommandées') {
        return profile.domains.length === 0 || profile.domains.includes(job.category);
      }
      if (activeFilter === 'Télétravail') return job.workMode === 'Télétravail';
      if (activeFilter === 'Favoris') return isSaved(job.id);
      return job.category === activeFilter;
    });

    return [...matches].sort((a, b) => {
      if (sortMode === 'salary') {
        return b.minSalaryK - a.minSalaryK;
      }
      return computeJobMatch(b, profile).score - computeJobMatch(a, profile).score;
    });
  }, [query, activeFilter, workModeFilter, minSalaryFilter, sortMode, isSaved, profile]);

  const showSuccessToast = (message: string) => {
    toast.show({
      placement: 'top',
      duration: 2200,
      render: ({ id }) => (
        <Toast
          nativeID={`toast-${id}`}
          className="bg-foreground flex-row items-center gap-2 rounded-full px-4 py-2.5 shadow-lg">
          <Icon as={CheckCircle2} size="sm" className="text-secondary-fixed" />
          <ToastTitle className="text-background text-xs font-semibold">{message}</ToastTitle>
        </Toast>
      ),
    });
  };

  const handleRefresh = () => {
    triggerHaptic('light');
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  const handleToggleBookmark = (job: JobListing) => {
    const saved = toggleSave(job.id);
    showSuccessToast(
      saved ? `${job.company} enregistré dans vos favoris` : 'Retiré de vos favoris'
    );
  };

  const handleCreateAlert = () => {
    triggerHaptic('success');
    const label = query.trim() || (workModeFilter !== 'Tous' ? workModeFilter : activeFilter);
    addJobAlert({
      query: label,
      workMode: workModeFilter,
      minSalaryK: minSalaryFilter,
    });
    showSuccessToast(`Alerte créée pour « ${label} »`);
  };

  const resetAll = () => {
    setQuery('');
    setActiveFilter('Toutes');
    setWorkModeFilter('Tous');
    setMinSalaryFilter(0);
  };

  return (
    <Box className="bg-background flex-1">
      <JobmaHeader title="Découvrir" onAvatarPress={() => router.push('/profile')} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
        <VStack space="md" className="px-4 pt-4">
          {/* Greeting & Intro */}
          <VStack space="xs">
            <HStack className="items-center" space="xs">
              <Box className="bg-primary-fixed rounded-full px-2.5 py-1">
                <HStack className="items-center" space="xs">
                  <Icon as={Sparkles} size="xs" className="text-primary" />
                  <Text size="xs" bold className="text-on-primary-fixed">
                    {JOBS.length} offres sélectionnées
                  </Text>
                </HStack>
              </Box>
            </HStack>
            <Heading size="2xl" bold className="text-foreground tracking-tight">
              Bonjour {firstName}
            </Heading>
            <Text size="sm" className="text-muted-foreground">
              {profile.domains.length > 0
                ? `Sélection ${profile.domains.join(' • ')} • ${profile.minSalaryK}k+ €`
                : 'Salaires transparents et candidature en 1 clic.'}
            </Text>
          </VStack>

          {/* Search Input + Filter Sheet Trigger */}
          <Input className="bg-card border-border h-12 rounded-xl px-3">
            <InputSlot className="pr-1">
              <InputIcon as={Search} className="text-muted-foreground" />
            </InputSlot>
            <InputField
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={() => {
                if (query.trim()) addRecentSearch(query.trim());
              }}
              returnKeyType="search"
              placeholder="Poste, entreprise, compétence ou ville..."
              className="text-foreground text-sm"
            />
            {query.length > 0 && (
              <InputSlot onPress={() => setQuery('')} className="px-1">
                <InputIcon as={X} className="text-muted-foreground" />
              </InputSlot>
            )}
            <InputSlot
              onPress={() => {
                triggerHaptic('light');
                setShowFilters(true);
              }}
              className="border-border/70 relative border-l pl-2">
              <InputIcon
                as={SlidersHorizontal}
                className={hasAdvancedFilters ? 'text-primary' : 'text-muted-foreground'}
              />
              {hasAdvancedFilters && (
                <Box className="bg-primary absolute top-0 right-0 h-2 w-2 rounded-full" />
              )}
            </InputSlot>
          </Input>

          {/* Horizontal Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
            {FILTER_CHIPS.map((chip) => {
              const isActive = activeFilter === chip;
              const label =
                chip === 'Favoris' && savedIds.length > 0 ? `${chip} (${savedIds.length})` : chip;

              return (
                <Pressable
                  key={chip}
                  onPress={() => {
                    triggerHaptic('light');
                    setActiveFilter(chip);
                  }}
                  className={`rounded-full border px-3.5 py-2 ${
                    isActive ? 'bg-primary-fixed border-primary' : 'bg-card border-border'
                  }`}>
                  <Text
                    size="xs"
                    bold={isActive}
                    className={isActive ? 'text-primary' : 'text-muted-foreground'}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Results & Sort Header */}
          <HStack className="items-center justify-between pt-1">
            <Text size="xs" bold className="text-muted-foreground uppercase">
              {filteredJobs.length} {filteredJobs.length > 1 ? 'opportunités' : 'opportunité'}
            </Text>

            <HStack className="items-center" space="sm">
              {(query.trim().length > 0 || activeFilter !== 'Toutes' || hasAdvancedFilters) && (
                <Pressable onPress={resetAll}>
                  <Text size="xs" bold className="text-primary">
                    Réinitialiser
                  </Text>
                </Pressable>
              )}

              <Pressable
                onPress={() => {
                  triggerHaptic('light');
                  setSortMode((prev) => (prev === 'match' ? 'salary' : 'match'));
                }}
                className="bg-muted flex-row items-center gap-1 rounded-full px-2.5 py-1">
                <Icon as={ArrowUpDown} size="xs" className="text-primary" />
                <Text size="2xs" bold className="text-foreground">
                  {sortMode === 'match' ? 'Pertinence' : 'Salaire ↓'}
                </Text>
              </Pressable>
            </HStack>
          </HStack>

          {/* Job Cards */}
          <VStack space="md">
            {filteredJobs.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                tone="muted"
                title="Aucune offre trouvée"
                description="Essayez de modifier votre recherche ou vos filtres actifs."
                actionLabel="Voir toutes les offres"
                onAction={resetAll}
              />
            ) : (
              filteredJobs.map((job, index) => (
                <Animated.View
                  key={job.id}
                  entering={FadeInDown.delay(index * 55).duration(280)}
                  layout={LinearTransition.springify()}>
                  <JobCard
                    job={job}
                    variant="discover"
                    matchScore={computeJobMatch(job, profile).score}
                    isSaved={isSaved(job.id)}
                    isApplied={isApplied(job.id)}
                    onPress={() => {
                      if (query.trim()) addRecentSearch(query.trim());
                      router.push(`/job/${job.id}`);
                    }}
                    onToggleSave={() => handleToggleBookmark(job)}
                  />
                </Animated.View>
              ))
            )}
          </VStack>
        </VStack>
      </ScrollView>

      <FilterSheet
        visible={showFilters}
        workMode={workModeFilter}
        minSalaryK={minSalaryFilter}
        recentSearches={recentSearches}
        savedAlerts={savedAlerts}
        onChangeWorkMode={setWorkModeFilter}
        onChangeMinSalary={setMinSalaryFilter}
        onSelectSearch={setQuery}
        onClearSearches={clearRecentSearches}
        onCreateAlert={handleCreateAlert}
        onRemoveAlert={removeJobAlert}
        onReset={resetAll}
        onClose={() => setShowFilters(false)}
      />
    </Box>
  );
}
