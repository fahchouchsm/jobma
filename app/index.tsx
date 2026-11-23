import React, { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Banknote,
  Bookmark,
  Briefcase,
  CheckCircle2,
  Clock,
  Globe,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { Card } from '@/components/ui/card';
import { Image } from '@/components/ui/image';
import { Icon } from '@/components/ui/icon';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Toast, ToastTitle, useToast } from '@/components/ui/toast';
import { JobmaHeader } from '@/components/jobma-header';
import { JOBS, type JobListing } from '@/data/jobs';
import { useJobs } from '@/context/jobs-context';

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
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { isSaved, isApplied, toggleSave, savedIds } = useJobs();

  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterChip>('Toutes');

  const filteredJobs = useMemo(() => {
    return JOBS.filter((job) => {
      const matchesQuery =
        !query.trim() ||
        job.title.toLowerCase().includes(query.toLowerCase()) ||
        job.company.toLowerCase().includes(query.toLowerCase()) ||
        job.industry.toLowerCase().includes(query.toLowerCase()) ||
        job.location.toLowerCase().includes(query.toLowerCase());

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
      duration: 2400,
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
      <JobmaHeader title="Découvrir les offres" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 24) + 16,
        }}
        showsVerticalScrollIndicator={false}>
        <VStack space="md" className="px-4 pt-4">
          {/* Hero Intro */}
          <VStack space="xs">
            <HStack className="items-center" space="xs">
              <Box className="bg-primary-fixed rounded-full px-2.5 py-1">
                <HStack className="items-center" space="xs">
                  <Icon as={Sparkles} size="xs" className="text-primary" />
                  <Text size="xs" bold className="text-on-primary-fixed">
                    {JOBS.length} opportunités sélectionnées
                  </Text>
                </HStack>
              </Box>
            </HStack>
            <Heading size="2xl" bold className="text-foreground tracking-tight">
              Trouvez votre prochain rôle
            </Heading>
            <Text size="sm" className="text-muted-foreground">
              Salaires transparents, recrutement actif et candidature en 1 clic.
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
            {query.length > 0 ? (
              <InputSlot onPress={() => setQuery('')} className="pl-1">
                <InputIcon as={X} className="text-muted-foreground" />
              </InputSlot>
            ) : (
              <InputSlot className="pl-1">
                <InputIcon as={SlidersHorizontal} className="text-primary" />
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
                  onPress={() => setActiveFilter(chip)}
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

          {/* Job Cards List */}
          <VStack space="md" className="pt-1">
            {filteredJobs.length === 0 ? (
              <Card className="bg-card border-border items-center rounded-2xl border p-6">
                <VStack space="sm" className="items-center">
                  <Box className="bg-muted h-12 w-12 items-center justify-center rounded-full">
                    <Icon as={Briefcase} size="lg" className="text-muted-foreground" />
                  </Box>
                  <Heading size="md" bold className="text-foreground">
                    Aucune offre trouvée
                  </Heading>
                  <Text size="sm" className="text-muted-foreground text-center">
                    Essayez de modifier votre recherche ou vos filtres actifs.
                  </Text>
                </VStack>
              </Card>
            ) : (
              filteredJobs.map((job) => {
                const saved = isSaved(job.id);
                const applied = isApplied(job.id);

                return (
                  <Pressable
                    key={job.id}
                    onPress={() => router.push(`/job/${job.id}`)}
                    className="active:opacity-95">
                    <Card className="bg-card border-border rounded-2xl border p-4 shadow-xs">
                      <VStack space="sm">
                        {/* Top Row: Logo + Title + Bookmark */}
                        <HStack className="items-start justify-between" space="md">
                          <HStack className="min-w-0 flex-1 items-start" space="md">
                            <Box className="bg-accent border-border h-12 w-12 shrink-0 overflow-hidden rounded-xl border">
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
                                  <Box className="bg-secondary-container/60 rounded-full px-2 py-0.5">
                                    <HStack className="items-center" space="xs">
                                      <Box className="bg-secondary h-1.5 w-1.5 rounded-full" />
                                      <Text size="2xs" bold className="text-on-secondary-container">
                                        Recrutement actif
                                      </Text>
                                    </HStack>
                                  </Box>
                                </HStack>
                              )}
                              <Heading size="md" bold isTruncated className="text-foreground">
                                {job.title}
                              </Heading>
                              <Text size="xs" className="text-muted-foreground" isTruncated>
                                {job.company} • {job.industry}
                              </Text>
                            </VStack>
                          </HStack>

                          <Pressable
                            accessibilityLabel="Sauvegarder l'offre"
                            onPress={(e) => {
                              e.stopPropagation();
                              handleToggleBookmark(job);
                            }}
                            className="bg-muted h-9 w-9 items-center justify-center rounded-full">
                            <Icon
                              as={Bookmark}
                              size="sm"
                              className={
                                saved ? 'text-primary fill-primary' : 'text-muted-foreground'
                              }
                            />
                          </Pressable>
                        </HStack>

                        {/* Middle Block: Salary + Mode */}
                        <HStack className="flex-wrap items-center" space="sm">
                          <Box className="bg-secondary-container/40 rounded-full px-2.5 py-1">
                            <HStack className="items-center" space="xs">
                              <Icon as={Banknote} size="xs" className="text-secondary" />
                              <Text size="xs" bold className="text-on-secondary-container">
                                {job.salaryRange}
                              </Text>
                            </HStack>
                          </Box>

                          <Box className="bg-muted rounded-full px-2.5 py-1">
                            <HStack className="items-center" space="xs">
                              <Icon as={Globe} size="xs" className="text-primary" />
                              <Text size="xs" className="text-foreground font-medium">
                                {job.workMode}
                              </Text>
                            </HStack>
                          </Box>

                          {applied && (
                            <Box className="bg-primary-fixed rounded-full px-2.5 py-1">
                              <HStack className="items-center" space="xs">
                                <Icon as={CheckCircle2} size="xs" className="text-primary" />
                                <Text size="xs" bold className="text-on-primary-fixed">
                                  Postulé
                                </Text>
                              </HStack>
                            </Box>
                          )}
                        </HStack>

                        {/* Bottom Row: Recency & Applicants */}
                        <HStack
                          className="border-border/60 items-center justify-between border-t pt-1"
                          space="sm">
                          <HStack className="items-center" space="xs">
                            <Icon as={Clock} size="xs" className="text-secondary" />
                            <Text size="xs" className="text-muted-foreground">
                              {job.postedAgo} •{' '}
                              <Text size="xs" bold className="text-foreground">
                                {job.applicantsCount}
                              </Text>
                            </Text>
                          </HStack>

                          <Text size="xs" bold className="text-primary">
                            Voir l'offre →
                          </Text>
                        </HStack>
                      </VStack>
                    </Card>
                  </Pressable>
                );
              })
            )}
          </VStack>
        </VStack>
      </ScrollView>
    </Box>
  );
}
