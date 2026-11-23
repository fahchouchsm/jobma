import React, { useMemo, useState } from 'react';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { BellPlus, CheckCircle2, Clock, Search, Sparkles, Trash2, X } from 'lucide-react-native';
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
import { EmptyState } from '@/components/empty-state';
import { JobCard } from '@/components/job-card';
import { JobmaHeader } from '@/components/jobma-header';
import { useJobs } from '@/context/jobs-context';
import { useProfile, type WorkMode } from '@/context/profile-context';
import { JOBS } from '@/data/jobs';
import { triggerHaptic } from '@/lib/haptics';
import { computeJobMatch } from '@/lib/job-match';

const WORK_MODE_FILTERS: (WorkMode | 'Tous')[] = ['Tous', 'Télétravail', 'Hybride', 'Présentiel'];

const SALARY_FILTERS = [0, 70, 100, 130];

const TRENDING_QUERIES = ['Product Designer', 'React Native', 'Hugging Face', 'FinTech', 'Paris'];

export default function SearchScreen() {
  const router = useRouter();
  const toast = useToast();
  const { isSaved, isApplied, toggleSave } = useJobs();
  const {
    profile,
    recentSearches,
    savedAlerts,
    addRecentSearch,
    clearRecentSearches,
    addJobAlert,
    removeJobAlert,
  } = useProfile();

  const [query, setQuery] = useState('');
  const [workModeFilter, setWorkModeFilter] = useState<WorkMode | 'Tous'>('Tous');
  const [minSalaryFilter, setMinSalaryFilter] = useState<number>(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return JOBS.filter((job) => {
      if (workModeFilter !== 'Tous' && job.workMode !== workModeFilter) {
        return false;
      }
      if (minSalaryFilter > 0 && job.minSalaryK < minSalaryFilter) {
        return false;
      }
      if (!q) return true;

      const searchable =
        `${job.title} ${job.company} ${job.industry} ${job.location} ${job.category} ${job.overview}`.toLowerCase();
      return searchable.includes(q);
    }).map((job) => ({
      job,
      match: computeJobMatch(job, profile),
    }));
  }, [query, workModeFilter, minSalaryFilter, profile]);

  const handleSearchSubmit = () => {
    if (query.trim()) {
      addRecentSearch(query.trim());
    }
  };

  const handleCreateAlert = () => {
    triggerHaptic('success');
    const label =
      query.trim() || (workModeFilter !== 'Tous' ? workModeFilter : 'Toutes les offres');
    addJobAlert({
      query: label,
      workMode: workModeFilter,
      minSalaryK: minSalaryFilter,
    });
    toast.show({
      placement: 'top',
      duration: 2400,
      render: ({ id }) => (
        <Toast
          nativeID={`toast-${id}`}
          className="bg-foreground flex-row items-center gap-2 rounded-full px-4 py-2.5 shadow-lg">
          <Icon as={CheckCircle2} size="sm" className="text-secondary-fixed" />
          <ToastTitle className="text-background text-xs font-semibold">
            Alerte créée pour « {label} »
          </ToastTitle>
        </Toast>
      ),
    });
  };

  return (
    <Box className="bg-background flex-1">
      <JobmaHeader title="Recherche" onAvatarPress={() => router.push('/profile')} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 28 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <VStack space="md" className="px-4 pt-4">
          {/* Search Input */}
          <Input className="bg-card border-border h-12 rounded-xl px-3">
            <InputSlot className="pr-1">
              <InputIcon as={Search} className="text-primary" />
            </InputSlot>
            <InputField
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
              placeholder="Poste, compétence, entreprise, ville..."
              className="text-foreground text-sm"
            />
            {query.length > 0 && (
              <InputSlot onPress={() => setQuery('')} className="pl-1">
                <InputIcon as={X} className="text-muted-foreground" />
              </InputSlot>
            )}
          </Input>

          {/* Work Mode & Salary Filters */}
          <VStack space="xs">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}>
              {WORK_MODE_FILTERS.map((mode) => {
                const active = workModeFilter === mode;
                return (
                  <Pressable
                    key={mode}
                    onPress={() => {
                      triggerHaptic('light');
                      setWorkModeFilter(mode);
                    }}
                    className={`rounded-full border px-3.5 py-1.5 ${
                      active ? 'bg-primary-fixed border-primary' : 'bg-card border-border'
                    }`}>
                    <Text
                      size="xs"
                      bold={active}
                      className={active ? 'text-primary' : 'text-muted-foreground'}>
                      {mode}
                    </Text>
                  </Pressable>
                );
              })}

              {SALARY_FILTERS.filter((s) => s > 0).map((salary) => {
                const active = minSalaryFilter === salary;
                return (
                  <Pressable
                    key={salary}
                    onPress={() => {
                      triggerHaptic('light');
                      setMinSalaryFilter(active ? 0 : salary);
                    }}
                    className={`rounded-full border px-3.5 py-1.5 ${
                      active
                        ? 'bg-secondary-container/60 border-secondary'
                        : 'bg-card border-border'
                    }`}>
                    <Text
                      size="xs"
                      bold={active}
                      className={active ? 'text-on-secondary-container' : 'text-muted-foreground'}>
                      {salary}k+ €
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </VStack>

          {/* Create Alert Bar */}
          <Pressable
            onPress={handleCreateAlert}
            className="bg-primary-fixed/60 border-primary/20 rounded-2xl border px-4 py-3 active:opacity-90">
            <HStack className="items-center justify-between">
              <HStack className="flex-1 items-center" space="sm">
                <Icon as={BellPlus} size="md" className="text-primary" />
                <VStack className="flex-1">
                  <Text size="xs" bold className="text-on-primary-fixed">
                    Créer une alerte emploi
                  </Text>
                  <Text size="2xs" className="text-muted-foreground">
                    Soyez notifié dès qu'une nouvelle offre correspond
                  </Text>
                </VStack>
              </HStack>
              <Text size="xs" bold className="text-primary">
                Activer
              </Text>
            </HStack>
          </Pressable>

          {/* Recent & Trending Searches when query is empty */}
          {query.trim().length === 0 && recentSearches.length > 0 && (
            <VStack space="xs">
              <HStack className="items-center justify-between">
                <HStack className="items-center" space="xs">
                  <Icon as={Clock} size="xs" className="text-muted-foreground" />
                  <Text size="xs" bold className="text-muted-foreground uppercase">
                    Recherches récentes
                  </Text>
                </HStack>
                <Pressable onPress={clearRecentSearches}>
                  <Text size="xs" className="text-primary font-medium">
                    Effacer
                  </Text>
                </Pressable>
              </HStack>

              <HStack className="flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <Pressable
                    key={term}
                    onPress={() => {
                      triggerHaptic('light');
                      setQuery(term);
                    }}
                    className="bg-muted rounded-full px-3 py-1.5">
                    <Text size="xs" className="text-foreground">
                      {term}
                    </Text>
                  </Pressable>
                ))}
              </HStack>
            </VStack>
          )}

          {query.trim().length === 0 && (
            <VStack space="xs">
              <HStack className="items-center" space="xs">
                <Icon as={Sparkles} size="xs" className="text-primary" />
                <Text size="xs" bold className="text-muted-foreground uppercase">
                  Tendances
                </Text>
              </HStack>
              <HStack className="flex-wrap gap-2">
                {TRENDING_QUERIES.map((term) => (
                  <Pressable
                    key={term}
                    onPress={() => {
                      triggerHaptic('light');
                      setQuery(term);
                      addRecentSearch(term);
                    }}
                    className="bg-card border-border rounded-full border px-3 py-1.5">
                    <Text size="xs" className="text-foreground font-medium">
                      {term}
                    </Text>
                  </Pressable>
                ))}
              </HStack>
            </VStack>
          )}

          {/* Active Saved Alerts */}
          {savedAlerts.length > 0 && (
            <VStack space="xs">
              <Text size="xs" bold className="text-muted-foreground uppercase">
                Vos alertes actives ({savedAlerts.length})
              </Text>
              <VStack space="xs">
                {savedAlerts.map((alert) => (
                  <Box
                    key={alert.id}
                    className="bg-card border-border rounded-xl border px-3 py-2.5">
                    <HStack className="items-center justify-between">
                      <VStack className="flex-1">
                        <Text size="xs" bold className="text-foreground">
                          {alert.query}
                        </Text>
                        <Text size="2xs" className="text-muted-foreground">
                          {alert.workMode ?? 'Tous modes'}
                          {alert.minSalaryK ? ` • ${alert.minSalaryK}k+ €` : ''}
                        </Text>
                      </VStack>
                      <Pressable
                        onPress={() => removeJobAlert(alert.id)}
                        className="bg-muted rounded-full p-1.5">
                        <Icon as={Trash2} size="xs" className="text-destructive" />
                      </Pressable>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </VStack>
          )}

          {/* Results */}
          <VStack space="sm" className="pt-1">
            <Heading size="sm" bold className="text-foreground">
              {results.length} {results.length > 1 ? 'résultats trouvés' : 'résultat trouvé'}
            </Heading>

            {results.length === 0 ? (
              <EmptyState
                icon={Search}
                tone="muted"
                title="Aucun résultat"
                description="Essayez un autre mot-clé ou élargissez vos filtres."
                actionLabel="Réinitialiser"
                onAction={() => {
                  setQuery('');
                  setWorkModeFilter('Tous');
                  setMinSalaryFilter(0);
                }}
              />
            ) : (
              results.map(({ job, match }, index) => (
                <Animated.View
                  key={job.id}
                  entering={FadeInDown.delay(index * 45).duration(240)}
                  layout={LinearTransition.springify()}>
                  <JobCard
                    job={job}
                    variant="discover"
                    matchScore={match.score}
                    isSaved={isSaved(job.id)}
                    isApplied={isApplied(job.id)}
                    onPress={() => {
                      handleSearchSubmit();
                      router.push(`/job/${job.id}`);
                    }}
                    onToggleSave={() => toggleSave(job.id)}
                  />
                </Animated.View>
              ))
            )}
          </VStack>
        </VStack>
      </ScrollView>
    </Box>
  );
}
