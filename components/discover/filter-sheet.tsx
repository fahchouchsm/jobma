import React from 'react';
import { BellPlus, Clock, MapPin, SlidersHorizontal, Trash2, X } from 'lucide-react-native';
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import type { JobAlert, WorkMode } from '@/context/profile-context';
import { triggerHaptic } from '@/lib/haptics';
import type { OfferContractType } from '@/types/offer';

const WORK_MODE_FILTERS: (WorkMode | 'Tous')[] = ['Tous', 'Télétravail', 'Hybride', 'Présentiel'];
const CONTRACT_TYPE_FILTERS: { id: OfferContractType | 'all'; label: string }[] = [
  { id: 'all', label: 'Tous' },
  { id: 'full_time', label: 'CDI / Temps plein' },
  { id: 'internship', label: 'Stage' },
  { id: 'freelance', label: 'Freelance' },
  { id: 'part_time', label: 'Temps partiel' },
];
const CITY_FILTERS = ['Toutes', 'Casablanca', 'Rabat', 'Tanger', 'Marrakech', 'Agadir', 'Fès'];
const SALARY_FILTERS_MAD = [0, 5, 10, 15, 25];

interface FilterSheetProps {
  visible: boolean;
  workMode: WorkMode | 'Tous';
  contractType: OfferContractType | 'all';
  location: string;
  minSalaryK: number;
  recentSearches: string[];
  savedAlerts: JobAlert[];
  onChangeWorkMode: (mode: WorkMode | 'Tous') => void;
  onChangeContractType: (contract: OfferContractType | 'all') => void;
  onChangeLocation: (city: string) => void;
  onChangeMinSalary: (salary: number) => void;
  onSelectSearch: (term: string) => void;
  onClearSearches: () => void;
  onCreateAlert: () => void;
  onApplyAlert?: (alert: JobAlert) => void;
  onRemoveAlert: (id: string) => void;
  onReset: () => void;
  onClose: () => void;
}

export function FilterSheet({
  visible,
  workMode,
  contractType,
  location,
  minSalaryK,
  recentSearches,
  savedAlerts,
  onChangeWorkMode,
  onChangeContractType,
  onChangeLocation,
  onChangeMinSalary,
  onSelectSearch,
  onClearSearches,
  onCreateAlert,
  onApplyAlert,
  onRemoveAlert,
  onReset,
  onClose,
}: FilterSheetProps) {
  return (
    <AppBottomSheet visible={visible} onClose={onClose} snapPoints={['65%', '90%']}>
      <VStack space="md">
        <HStack className="items-center justify-between">
          <HStack className="items-center" space="xs">
            <Icon as={SlidersHorizontal} size="sm" className="text-primary" />
            <Heading size="md" bold className="text-foreground">
              Filtres & Alertes
            </Heading>
          </HStack>

          <HStack className="items-center" space="sm">
            <Pressable onPress={onReset}>
              <Text size="xs" bold className="text-primary">
                Réinitialiser
              </Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Fermer"
              onPress={onClose}
              className="bg-muted h-8 w-8 items-center justify-center rounded-full">
              <Icon as={X} size="sm" className="text-muted-foreground" />
            </Pressable>
          </HStack>
        </HStack>

        <VStack space="md" className="pb-2">
                {/* City Filter (Morocco) */}
                <VStack space="xs">
                  <HStack className="items-center" space="xs">
                    <Icon as={MapPin} size="xs" className="text-muted-foreground" />
                    <Text size="xs" bold className="text-foreground">
                      Ville au Maroc
                    </Text>
                  </HStack>
                  <HStack className="flex-wrap gap-2">
                    {CITY_FILTERS.map((city) => {
                      const active = (location || 'Toutes') === city;
                      return (
                        <Pressable
                          key={city}
                          onPress={() => {
                            triggerHaptic('light');
                            onChangeLocation(city === 'Toutes' ? '' : city);
                          }}
                          className={`rounded-full border px-3.5 py-2 ${
                            active
                              ? 'bg-primary-fixed border-primary'
                              : 'bg-background border-border'
                          }`}>
                          <Text
                            size="xs"
                            bold={active}
                            className={active ? 'text-primary' : 'text-muted-foreground'}>
                            {city}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </HStack>
                </VStack>

                {/* Work Mode */}
                <VStack space="xs">
                  <Text size="xs" bold className="text-foreground">
                    Mode de travail
                  </Text>
                  <HStack className="flex-wrap gap-2">
                    {WORK_MODE_FILTERS.map((mode) => {
                      const active = workMode === mode;
                      return (
                        <Pressable
                          key={mode}
                          onPress={() => {
                            triggerHaptic('light');
                            onChangeWorkMode(mode);
                          }}
                          className={`rounded-full border px-3.5 py-2 ${
                            active
                              ? 'bg-primary-fixed border-primary'
                              : 'bg-background border-border'
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
                  </HStack>
                </VStack>

                {/* Contract Type */}
                <VStack space="xs">
                  <Text size="xs" bold className="text-foreground">
                    Type de contrat
                  </Text>
                  <HStack className="flex-wrap gap-2">
                    {CONTRACT_TYPE_FILTERS.map((item) => {
                      const active = contractType === item.id;
                      return (
                        <Pressable
                          key={item.id}
                          onPress={() => {
                            triggerHaptic('light');
                            onChangeContractType(item.id);
                          }}
                          className={`rounded-full border px-3.5 py-2 ${
                            active
                              ? 'bg-primary-fixed border-primary'
                              : 'bg-background border-border'
                          }`}>
                          <Text
                            size="xs"
                            bold={active}
                            className={active ? 'text-primary' : 'text-muted-foreground'}>
                            {item.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </HStack>
                </VStack>

                {/* Minimum Monthly Salary (MAD) */}
                <VStack space="xs">
                  <Text size="xs" bold className="text-foreground">
                    Salaire mensuel minimum (MAD)
                  </Text>
                  <HStack className="flex-wrap gap-2">
                    {SALARY_FILTERS_MAD.map((salary) => {
                      const active = minSalaryK === salary;
                      return (
                        <Pressable
                          key={salary}
                          onPress={() => {
                            triggerHaptic('light');
                            onChangeMinSalary(salary);
                          }}
                          className={`rounded-full border px-3.5 py-2 ${
                            active
                              ? 'bg-secondary-container border-secondary'
                              : 'bg-background border-border'
                          }`}>
                          <Text
                            size="xs"
                            bold={active}
                            className={
                              active ? 'text-on-secondary-container' : 'text-muted-foreground'
                            }>
                            {salary === 0 ? 'Tous salaires' : `${salary}k+ MAD`}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </HStack>
                </VStack>

                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <VStack space="xs">
                    <HStack className="items-center justify-between">
                      <HStack className="items-center" space="xs">
                        <Icon as={Clock} size="xs" className="text-muted-foreground" />
                        <Text size="xs" bold className="text-foreground">
                          Recherches récentes
                        </Text>
                      </HStack>
                      <Pressable onPress={onClearSearches}>
                        <Text size="xs" className="text-primary">
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
                            onSelectSearch(term);
                            onClose();
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

                {/* Saved Alerts */}
                {savedAlerts.length > 0 && (
                  <VStack space="xs">
                    <Text size="xs" bold className="text-foreground">
                      Alertes actives ({savedAlerts.length})
                    </Text>
                    <VStack space="xs">
                      {savedAlerts.map((alert) => (
                        <Box key={alert.id} className="bg-muted rounded-xl px-3 py-2">
                          <HStack className="items-center justify-between" space="sm">
                            <Pressable
                              onPress={() => {
                                triggerHaptic('light');
                                onApplyAlert?.(alert);
                                onClose();
                              }}
                              className="min-w-0 flex-1">
                              <Text size="xs" bold className="text-foreground">
                                {alert.query}
                              </Text>
                              <Text size="2xs" className="text-muted-foreground">
                                {alert.workMode ?? 'Tous modes'}
                                {alert.minSalaryK ? ` • ${alert.minSalaryK}k+ MAD` : ''}
                              </Text>
                            </Pressable>
                            <Pressable onPress={() => onRemoveAlert(alert.id)} className="p-1.5">
                              <Icon as={Trash2} size="xs" className="text-destructive" />
                            </Pressable>
                          </HStack>
                        </Box>
                      ))}
                    </VStack>
                  </VStack>
                )}
        </VStack>

        {/* Footer Buttons */}
        <HStack space="sm" className="pt-1">
          <Button
            variant="outline"
            size="default"
            onPress={onCreateAlert}
            className="rounded-xl px-3">
            <ButtonIcon as={BellPlus} />
            <ButtonText>Alerte</ButtonText>
          </Button>
          <Button size="default" onPress={onClose} className="flex-1 rounded-xl">
            <ButtonText className="font-bold">Voir les offres</ButtonText>
          </Button>
        </HStack>
      </VStack>
    </AppBottomSheet>
  );
}
