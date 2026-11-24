import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Platform, RefreshControl } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowUpDown,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  MapPin,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react-native';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { Toast, ToastTitle, useToast } from '@/components/ui/toast';
import { VStack } from '@/components/ui/vstack';
import { FilterSheet } from '@/components/discover/filter-sheet';
import { JobCardSkeleton } from '@/components/discover/job-card-skeleton';
import { EmptyState } from '@/components/empty-state';
import { JobCard } from '@/components/job-card';
import { useAuth } from '@/context/auth-context';
import { useJobs } from '@/context/jobs-context';
import { useProfile, type WorkMode } from '@/context/profile-context';
import type { JobListing } from '@/data/jobs';
import { triggerHaptic } from '@/lib/haptics';
import { computeJobMatch } from '@/lib/job-match';
import type {
  OfferCategory,
  OfferContractType,
  OffersQueryParams,
  OfferWorkMode,
} from '@/types/offer';

type CategoryTab = 'Toutes' | 'Engineering' | 'Design' | 'Product' | 'IA & Data' | 'Télétravail';
type SortMode = 'match' | 'salary';

const CATEGORY_TABS: { id: CategoryTab; label: string }[] = [
  { id: 'Toutes', label: 'Pour vous' },
  { id: 'Engineering', label: 'Tech' },
  { id: 'Design', label: 'Design' },
  { id: 'Product', label: 'Produit' },
  { id: 'IA & Data', label: 'IA & Data' },
  { id: 'Télétravail', label: 'Remote' },
];

const UI_WORK_MODE_TO_API: Record<WorkMode, OfferWorkMode> = {
  Télétravail: 'remote',
  Hybride: 'hybrid',
  Présentiel: 'onsite',
};

const CATEGORY_CHIPS = new Set<OfferCategory>(['Design', 'Engineering', 'Product', 'IA & Data']);

export default function JobDiscoveryScreen() {
  const router = useRouter();
  const routeParams = useLocalSearchParams<{
    q?: string;
    workMode?: string;
    minSalary?: string;
  }>();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { user, isAuthenticated } = useAuth();
  const {
    offers,
    totalOffers,
    targetMatches,
    isLoadingOffers,
    isRefreshingOffers,
    isLoadingMoreOffers,
    hasMoreOffers,
    offersError,
    queryOffers,
    loadTargetOffers,
    refreshOffers,
    loadMoreOffers,
    isSaved,
    isApplied,
    toggleSave,
  } = useJobs();
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
  const [activeTab, setActiveTab] = useState<CategoryTab>('Toutes');
  const [workModeFilter, setWorkModeFilter] = useState<WorkMode | 'Tous'>('Tous');
  const [contractTypeFilter, setContractTypeFilter] = useState<OfferContractType | 'all'>('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [minSalaryFilter, setMinSalaryFilter] = useState<number>(0);
  const [sortMode, setSortMode] = useState<SortMode>('match');
  const [showFilters, setShowFilters] = useState(false);

  const isFirstRender = useRef(true);

  // Apply alert filters when navigated from Profile alerts
  useEffect(() => {
    if (routeParams.q) setQuery(routeParams.q);
    if (
      routeParams.workMode === 'Télétravail' ||
      routeParams.workMode === 'Hybride' ||
      routeParams.workMode === 'Présentiel' ||
      routeParams.workMode === 'Tous'
    ) {
      setWorkModeFilter(routeParams.workMode);
    }
    if (routeParams.minSalary) {
      const parsed = Number.parseInt(routeParams.minSalary, 10);
      if (!Number.isNaN(parsed)) setMinSalaryFilter(parsed);
    }
  }, [routeParams.q, routeParams.workMode, routeParams.minSalary]);

  const activeFiltersCount =
    (workModeFilter !== 'Tous' ? 1 : 0) +
    (contractTypeFilter !== 'all' ? 1 : 0) +
    (locationFilter.length > 0 ? 1 : 0) +
    (minSalaryFilter > 0 ? 1 : 0);

  const initials =
    (profile.fullName || 'JM')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'JM';

  // Server-side query (debounced for search input)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      const params: OffersQueryParams = {
        sort: sortMode === 'salary' ? 'salary_desc' : 'newest',
      };

      const trimmed = query.trim();
      if (trimmed) params.search = trimmed;
      if (CATEGORY_CHIPS.has(activeTab as OfferCategory)) {
        params.category = activeTab as OfferCategory;
      }
      if (activeTab === 'Télétravail') {
        params.workMode = 'remote';
      } else if (workModeFilter !== 'Tous') {
        params.workMode = UI_WORK_MODE_TO_API[workModeFilter];
      }
      if (contractTypeFilter !== 'all') params.contractType = contractTypeFilter;
      if (locationFilter) params.location = locationFilter;
      if (minSalaryFilter > 0) params.minSalary = minSalaryFilter * 1000;

      const isPureForYou =
        activeTab === 'Toutes' &&
        !trimmed &&
        workModeFilter === 'Tous' &&
        contractTypeFilter === 'all' &&
        !locationFilter &&
        minSalaryFilter === 0 &&
        sortMode === 'match';

      if (isPureForYou && isAuthenticated) {
        void loadTargetOffers();
      } else {
        void queryOffers(params);
      }
    }, query.trim() ? 350 : 0);

    return () => clearTimeout(timer);
  }, [
    query,
    activeTab,
    workModeFilter,
    contractTypeFilter,
    locationFilter,
    minSalaryFilter,
    sortMode,
    isAuthenticated,
    loadTargetOffers,
    queryOffers,
  ]);

  const displayedJobs = useMemo(() => {
    if (sortMode === 'salary') {
      return [...offers].sort((a, b) => b.minSalaryK - a.minSalaryK);
    }
    return offers;
  }, [offers, sortMode]);

  const showToast = useCallback(
    (message: string, undoAction?: { label: string; onPress: () => void }) => {
      toast.show({
        placement: 'top',
        duration: 2800,
        render: ({ id }) => (
          <Toast
            nativeID={`toast-${id}`}
            className="bg-foreground flex-row items-center gap-2 rounded-full px-4 py-2.5 shadow-lg">
            <Icon as={CheckCircle2} size="sm" className="text-secondary-fixed" />
            <ToastTitle className="text-background text-xs font-semibold">{message}</ToastTitle>
            {undoAction && (
              <Pressable
                onPress={() => {
                  undoAction.onPress();
                  toast.close(id);
                }}
                className="pl-2">
                <Text size="xs" bold className="text-primary-fixed underline">
                  {undoAction.label}
                </Text>
              </Pressable>
            )}
          </Toast>
        ),
      });
    },
    [toast]
  );

  const handleRefresh = useCallback(() => {
    triggerHaptic('light');
    void refreshOffers();
  }, [refreshOffers]);

  const handleToggleBookmark = useCallback(
    (job: JobListing) => {
      const saved = toggleSave(job.id);
      if (saved) {
        showToast(`${job.company} enregistré`);
      } else {
        showToast('Retiré des favoris', {
          label: 'Annuler',
          onPress: () => {
            triggerHaptic('light');
            toggleSave(job.id);
          },
        });
      }
    },
    [toggleSave, showToast]
  );

  const handleCreateAlert = () => {
    triggerHaptic('success');
    const label =
      query.trim() ||
      locationFilter ||
      (workModeFilter !== 'Tous' ? workModeFilter : activeTab);
    addJobAlert({
      query: label,
      workMode: workModeFilter,
      minSalaryK: minSalaryFilter,
    });
    showToast(`Alerte créée pour « ${label} »`);
  };

  const resetAll = () => {
    setQuery('');
    setActiveTab('Toutes');
    setWorkModeFilter('Tous');
    setContractTypeFilter('all');
    setLocationFilter('');
    setMinSalaryFilter(0);
  };

  const renderItem = useCallback(
    ({ item }: { item: JobListing }) => {
      const serverMatch = targetMatches[item.id];
      const computed = serverMatch ? null : computeJobMatch(item, profile);
      return (
        <Box className="mb-3 px-4">
          <JobCard
            job={item}
            variant="discover"
            matchScore={serverMatch?.score ?? computed?.score}
            matchReason={serverMatch?.reasons[0] ?? computed?.reasons[0]}
            isSaved={isSaved(item.id)}
            isApplied={isApplied(item.id)}
            onPress={() => {
              if (query.trim()) addRecentSearch(query.trim());
              router.push(`/job/${item.id}`);
            }}
            onToggleSave={() => handleToggleBookmark(item)}
          />
        </Box>
      );
    },
    [targetMatches, profile, isSaved, isApplied, query, addRecentSearch, router, handleToggleBookmark]
  );

  const topPad = Platform.OS === 'web' ? 12 : Math.max(insets.top, 12);
  const [headerHeight, setHeaderHeight] = useState(topPad + 138);
  const hideDistance = useSharedValue(138);
  const headerOffset = useSharedValue(0);
  const lastScrollY = useSharedValue(0);

  useEffect(() => {
    hideDistance.value = Math.max(headerHeight - topPad, 0);
  }, [headerHeight, topPad, hideDistance]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const y = event.contentOffset.y;
      if (y <= 0) {
        headerOffset.value = 0;
        lastScrollY.value = 0;
        return;
      }
      const diff = y - lastScrollY.value;
      lastScrollY.value = y;
      const next = headerOffset.value + diff;
      const maxHide = hideDistance.value;
      if (next < 0) {
        headerOffset.value = 0;
      } else if (next > maxHide) {
        headerOffset.value = maxHide;
      } else {
        headerOffset.value = next;
      }
    },
  });

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -headerOffset.value }],
  }));

  return (
    <Box className="bg-background flex-1">
      {/* Status bar veil so scrolled cards never clash with clock/battery */}
      <Box
        pointerEvents="none"
        className="bg-card absolute top-0 right-0 left-0 z-20"
        style={{ height: topPad }}
      />

      {/* Scroll-linked Collapsible Startup Header (moves 1:1 with finger) */}
      <Animated.View
        onLayout={(e) => {
          const h = Math.round(e.nativeEvent.layout.height);
          if (h > 0 && Math.abs(h - headerHeight) > 1) {
            setHeaderHeight(h);
          }
        }}
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            paddingTop: topPad,
          },
          animatedHeaderStyle,
        ]}
        className="bg-card border-border/80 border-b">
        <VStack className="px-4 pt-1 pb-2.5" space="sm">
          {/* Row 1: Brand + Location Selector + Profile Avatar */}
          <HStack className="items-center justify-between" space="sm">
            <HStack className="items-center" space="sm">
              <Text size="xl" bold className="text-foreground tracking-tight">
                jobma
                <Text size="xl" bold className="text-primary">
                  .
                </Text>
              </Text>

              <Pressable
                onPress={() => {
                  triggerHaptic('light');
                  setShowFilters(true);
                }}
                className="bg-muted flex-row items-center gap-1 rounded-full px-2.5 py-1 active:opacity-80">
                <Icon as={MapPin} size="2xs" className="text-primary" />
                <Text size="xs" bold className="text-foreground">
                  {locationFilter || 'Maroc'}
                </Text>
                <Icon as={ChevronDown} size="2xs" className="text-muted-foreground" />
              </Pressable>
            </HStack>

            <Pressable
              accessibilityLabel="Mon profil"
              onPress={() => router.push('/profile')}
              className="active:opacity-80">
              <Avatar className="border-border h-9 w-9 border">
                <AvatarFallbackText>{initials}</AvatarFallbackText>
                {(user?.avatarUrl || profile.avatarUrl) ? (
                  <AvatarImage source={{ uri: user?.avatarUrl || profile.avatarUrl }} />
                ) : null}
              </Avatar>
            </Pressable>
          </HStack>

          {/* Row 2: Crisp Pill Search Bar + Filter Trigger */}
          <HStack className="items-center" space="sm">
            <Input className="bg-muted/80 border-border/70 h-11 flex-1 rounded-full px-3.5">
              <InputSlot className="pr-1.5">
                <InputIcon as={Search} className="text-muted-foreground" />
              </InputSlot>
              <InputField
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={() => {
                  if (query.trim()) addRecentSearch(query.trim());
                }}
                returnKeyType="search"
                placeholder="Poste, compétence ou entreprise"
                className="text-foreground text-sm"
              />
              {query.length > 0 && (
                <InputSlot onPress={() => setQuery('')} className="pl-1">
                  <InputIcon as={X} className="text-muted-foreground" />
                </InputSlot>
              )}
            </Input>

            <Pressable
              accessibilityLabel="Filtres"
              onPress={() => {
                triggerHaptic('light');
                setShowFilters(true);
              }}
              className={`relative h-11 w-11 shrink-0 items-center justify-center rounded-full border ${
                activeFiltersCount > 0
                  ? 'bg-foreground border-foreground'
                  : 'bg-card border-border'
              }`}>
              <Icon
                as={SlidersHorizontal}
                size="sm"
                className={activeFiltersCount > 0 ? 'text-background' : 'text-foreground'}
              />
              {activeFiltersCount > 0 && (
                <Box className="bg-primary absolute -top-1 -right-1 h-4 min-w-4 items-center justify-center rounded-full px-1">
                  <Text size="2xs" bold className="text-primary-foreground">
                    {activeFiltersCount}
                  </Text>
                </Box>
              )}
            </Pressable>
          </HStack>
        </VStack>

        {/* Row 3: Minimal Underline Category Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 20 }}>
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Pressable
                key={tab.id}
                onPress={() => {
                  triggerHaptic('light');
                  setActiveTab(tab.id);
                }}
                className={`border-b-2 pb-2.5 ${
                  isActive ? 'border-foreground' : 'border-transparent'
                }`}>
                <Text
                  size="sm"
                  bold={isActive}
                  className={isActive ? 'text-foreground' : 'text-muted-foreground'}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </Animated.View>

      {/* Virtualized Feed */}
      <Animated.FlatList
        data={isLoadingOffers && offers.length === 0 ? [] : displayedJobs}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: headerHeight + 12, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshingOffers}
            onRefresh={handleRefresh}
            progressViewOffset={headerHeight}
          />
        }
        onEndReached={() => {
          if (hasMoreOffers && !isLoadingMoreOffers && !isLoadingOffers) {
            void loadMoreOffers();
          }
        }}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <VStack space="sm" className="mb-3 px-4">
            {offersError && (
              <Box className="bg-card border-border flex-row items-center justify-between gap-2 rounded-xl border px-3 py-2.5">
                <Text size="xs" className="text-muted-foreground flex-1">
                  {offersError}
                </Text>
                <Button variant="outline" size="sm" onPress={handleRefresh} className="rounded-lg">
                  <ButtonIcon as={RefreshCw} />
                  <ButtonText>Réessayer</ButtonText>
                </Button>
              </Box>
            )}

            <HStack className="items-center justify-between" space="sm">
              <Text size="xs" numberOfLines={1} className="text-muted-foreground min-w-0 flex-1">
                {totalOffers > 0
                  ? `${totalOffers.toLocaleString('fr-FR')} offres`
                  : `${displayedJobs.length} offres`}
                {locationFilter ? ` à ${locationFilter}` : ' au Maroc'}
              </Text>

              <HStack className="items-center" space="md">
                {(query.trim().length > 0 || activeTab !== 'Toutes' || activeFiltersCount > 0) && (
                  <Pressable onPress={resetAll}>
                    <Text size="xs" bold className="text-primary">
                      Effacer
                    </Text>
                  </Pressable>
                )}

                <Pressable
                  onPress={() => {
                    triggerHaptic('light');
                    setSortMode((prev) => (prev === 'match' ? 'salary' : 'match'));
                  }}
                  className="flex-row items-center gap-1 py-0.5">
                  <Icon as={ArrowUpDown} size="xs" className="text-muted-foreground" />
                  <Text size="xs" bold className="text-foreground">
                    {sortMode === 'match' ? 'Récentes' : 'Salaire'}
                  </Text>
                </Pressable>
              </HStack>
            </HStack>
          </VStack>
        }
        ListEmptyComponent={
          isLoadingOffers ? (
            <VStack space="md" className="px-4">
              <JobCardSkeleton />
              <JobCardSkeleton />
              <JobCardSkeleton />
            </VStack>
          ) : (
            <Box className="px-4">
              <EmptyState
                icon={Briefcase}
                tone="muted"
                title="Aucune offre trouvée"
                description="Essayez un autre mot-clé ou élargissez vos filtres."
                actionLabel="Réinitialiser"
                onAction={resetAll}
              />
            </Box>
          )
        }
        ListFooterComponent={
          isLoadingMoreOffers ? (
            <Box className="items-center py-4">
              <ActivityIndicator size="small" />
            </Box>
          ) : undefined
        }
      />

      <FilterSheet
        visible={showFilters}
        workMode={workModeFilter}
        contractType={contractTypeFilter}
        location={locationFilter}
        minSalaryK={minSalaryFilter}
        recentSearches={recentSearches}
        savedAlerts={savedAlerts}
        onChangeWorkMode={setWorkModeFilter}
        onChangeContractType={setContractTypeFilter}
        onChangeLocation={setLocationFilter}
        onChangeMinSalary={setMinSalaryFilter}
        onSelectSearch={setQuery}
        onClearSearches={clearRecentSearches}
        onCreateAlert={handleCreateAlert}
        onApplyAlert={(alert) => {
          setQuery(alert.query);
          setWorkModeFilter(alert.workMode ?? 'Tous');
          setMinSalaryFilter(alert.minSalaryK ?? 0);
        }}
        onRemoveAlert={removeJobAlert}
        onReset={resetAll}
        onClose={() => setShowFilters(false)}
      />
    </Box>
  );
}
