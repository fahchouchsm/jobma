import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Building2, Compass, MapPin, Users } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { CompanyLogo } from '@/components/company-logo';
import { EmptyState } from '@/components/empty-state';
import { JobCard } from '@/components/job-card';
import { JobmaHeader } from '@/components/jobma-header';
import { useJobs } from '@/context/jobs-context';
import { useProfile } from '@/context/profile-context';
import type { JobListing } from '@/data/jobs';
import { computeJobMatch } from '@/lib/job-match';
import { fetchOffersPage } from '@/services/jobs-service';

export default function CompanyScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const companyName = decodeURIComponent(name || '');
  const router = useRouter();
  const { isSaved, isApplied, toggleSave } = useJobs();
  const { profile } = useProfile();

  const [companyOffers, setCompanyOffers] = useState<JobListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    if (!companyName) {
      setIsLoading(false);
      return;
    }

    fetchOffersPage({ search: companyName, limit: 50, forceRefresh: true })
      .then((res) => {
        if (!mounted) return;
        const normalized = companyName.toLowerCase();
        const exact = res.items.filter((item) => item.company.toLowerCase().includes(normalized));
        setCompanyOffers(exact.length > 0 ? exact : res.items);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [companyName]);

  const sample = companyOffers[0];

  return (
    <Box className="bg-background flex-1">
      <JobmaHeader
        title={companyName || 'Entreprise'}
        showBack
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}>
        <VStack space="md" className="px-4 pt-4">
          <Card className="bg-card border-border rounded-2xl border p-4">
            <VStack space="sm">
              <HStack className="items-center" space="md">
                <CompanyLogo
                  name={companyName || 'Entreprise'}
                  logoUrl={sample?.logoUrl}
                  size="lg"
                  tone={sample?.brandTone ?? 'primary'}
                />
                <VStack className="min-w-0 flex-1" space="xs">
                  <Heading size="lg" bold numberOfLines={2} className="text-foreground">
                    {companyName}
                  </Heading>
                  {sample?.industry ? (
                    <HStack className="items-center" space="xs">
                      <Icon as={Building2} size="xs" className="text-primary shrink-0" />
                      <Text size="xs" className="text-muted-foreground flex-1">
                        {sample.industry}
                      </Text>
                    </HStack>
                  ) : null}
                </VStack>
              </HStack>

              {sample?.companyBio ? (
                <Text size="xs" className="text-muted-foreground leading-relaxed">
                  {sample.companyBio}
                </Text>
              ) : null}

              {sample && (
                <HStack className="flex-wrap gap-2 pt-1">
                  <HStack className="bg-muted items-center rounded-lg px-2.5 py-1" space="xs">
                    <Icon as={MapPin} size="2xs" className="text-muted-foreground" />
                    <Text size="xs" className="text-foreground">
                      {sample.companyStats.hq}
                    </Text>
                  </HStack>
                  {sample.companyStats.size !== 'N/A' && (
                    <HStack className="bg-muted items-center rounded-lg px-2.5 py-1" space="xs">
                      <Icon as={Users} size="2xs" className="text-muted-foreground" />
                      <Text size="xs" className="text-foreground">
                        {sample.companyStats.size}
                      </Text>
                    </HStack>
                  )}
                </HStack>
              )}
            </VStack>
          </Card>

          <Text size="xs" bold className="text-muted-foreground uppercase">
            Offres ouvertes ({companyOffers.length})
          </Text>

          {isLoading ? (
            <Box className="items-center py-10">
              <ActivityIndicator size="small" />
            </Box>
          ) : companyOffers.length === 0 ? (
            <EmptyState
              icon={Building2}
              tone="muted"
              title="Aucune offre active"
              description={`Aucune autre offre trouvée pour ${companyName} pour le moment.`}
              actionLabel="Explorer toutes les offres"
              actionIcon={Compass}
              onAction={() => router.replace('/')}
            />
          ) : (
            <VStack space="sm">
              {companyOffers.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  variant="discover"
                  matchScore={computeJobMatch(job, profile).score}
                  isSaved={isSaved(job.id)}
                  isApplied={isApplied(job.id)}
                  onPress={() => router.push(`/job/${job.id}`)}
                  onToggleSave={() => toggleSave(job.id)}
                />
              ))}
            </VStack>
          )}
        </VStack>
      </ScrollView>
    </Box>
  );
}
