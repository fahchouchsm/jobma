import React, { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Briefcase, CheckCircle2, Search, Sparkles, X } from 'lucide-react-native';
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
import { JOBS, type JobListing } from '@/data/jobs';
import { triggerHaptic } from '@/lib/haptics';

type FilterChip = 'Toutes' | 'Télétravail' | 'Favoris' | 'Design' | 'Engineering' | 'Product';

const FILTER_CHIPS: FilterChip[] = [
  'Toutes',
  'Télétravail',
  'Favoris',
  'Design',
  'Engineering',
  'Product',
];

export default function JobDiscoveryScreen() {
  const router = useRouter();
  const toast = useToast();
  const { isSaved, isApplied, toggleSave, savedIds } = useJobs();

  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterChip>('Toutes');

  const filteredJobs = useMemo(() => {
    return JOBS.filter((job) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.industry.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q);

      if (!matchesQuery) return false;
      if (activeFilter === 'Toutes') return true;
      if (activeFilter === 'Télétravail') return job.workMode === 'Télétravail';
      if (activeFilter === 'Favoris') return isSaved(job.id);
      return job.category === activeFilter;
    });
  }, [query, activeFilter, isSaved]);

  const handleToggleBookmark = (job: JobListing) => {
    const saved = toggleSave(job.id);
    toast.show({
      placement: 'top',
      duration: 2200,
      render: ({ id }) => (
        <Toast
          nativeID={`toast-${id}`}
          className="bg-foreground flex-row items-center gap-2 rounded-full px-4 py-2.5 shadow-lg">
          <Icon as={CheckCircle2} size="sm" className="text-secondary-fixed" />
          <ToastTitle className="text-background text-xs font-semibold">
            {saved ? `${job.company} enregistré dans vos favoris` : 'Retiré de vos favoris'}
          </ToastTitle>
        </Toast>
      ),
    });
  };

  return (
    <Box className="bg-background flex-1">
      <JobmaHeader title="Découvrir" onAvatarPress={() => router.push('/profile')} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}>
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
              Bonjour Sarah
            </Heading>
            <Text size="sm" className="text-muted-foreground">
              Salaires transparents et candidature en 1 clic.
            </Text>
          </VStack>

          {/* Search Input */}
          <Input className="bg-card border-border h-12 rounded-xl px-3">
            <InputSlot className="pr-1">
              <InputIcon as={Search} className="text-muted-foreground" />
            </InputSlot>
            <InputField
              value={query}
              onChangeText={setQuery}
              placeholder="Poste, entreprise ou ville..."
              className="text-foreground text-sm"
            />
            {query.length > 0 && (
              <InputSlot onPress={() => setQuery('')} className="pl-1">
                <InputIcon as={X} className="text-muted-foreground" />
              </InputSlot>
            )}
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

          {/* Results Header */}
          <HStack className="items-center justify-between pt-1">
            <Text size="xs" bold className="text-muted-foreground uppercase">
              {filteredJobs.length} {filteredJobs.length > 1 ? 'opportunités' : 'opportunité'}
            </Text>
            {(query.trim().length > 0 || activeFilter !== 'Toutes') && (
              <Pressable
                onPress={() => {
                  setQuery('');
                  setActiveFilter('Toutes');
                }}>
                <Text size="xs" bold className="text-primary">
                  Réinitialiser
                </Text>
              </Pressable>
            )}
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
                onAction={() => {
                  setQuery('');
                  setActiveFilter('Toutes');
                }}
              />
            ) : (
              filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  variant="discover"
                  isSaved={isSaved(job.id)}
                  isApplied={isApplied(job.id)}
                  onPress={() => router.push(`/job/${job.id}`)}
                  onToggleSave={() => handleToggleBookmark(job)}
                />
              ))
            )}
          </VStack>
        </VStack>
      </ScrollView>
    </Box>
  );
}
