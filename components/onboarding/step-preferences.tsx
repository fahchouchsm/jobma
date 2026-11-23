import React from 'react';
import { Banknote, Building2, Calendar, Globe, Home } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import type {
  Availability,
  CandidateProfile,
  ContractType,
  WorkMode,
} from '@/context/profile-context';
import { triggerHaptic } from '@/lib/haptics';

interface StepPreferencesProps {
  profile: CandidateProfile;
  onChange: (partial: Partial<CandidateProfile>) => void;
}

const WORK_MODES: { id: WorkMode; label: string; icon: typeof Globe }[] = [
  { id: 'Télétravail', label: 'Télétravail', icon: Globe },
  { id: 'Hybride', label: 'Hybride', icon: Home },
  { id: 'Présentiel', label: 'Présentiel', icon: Building2 },
];

const CONTRACT_TYPES: ContractType[] = ['CDI', 'Freelance', 'Stage / Alternance'];

const SALARY_STEPS = [45, 65, 90, 120, 150];

const AVAILABILITIES: Availability[] = ['Immédiate', 'Sous 1 mois', 'Sous 3 mois', 'En veille'];

export function StepPreferences({ profile, onChange }: StepPreferencesProps) {
  const toggleWorkMode = (mode: WorkMode) => {
    triggerHaptic('light');
    const exists = profile.workModes.includes(mode);
    const next = exists
      ? profile.workModes.filter((m) => m !== mode)
      : [...profile.workModes, mode];
    onChange({ workModes: next });
  };

  const toggleContract = (contract: ContractType) => {
    triggerHaptic('light');
    const exists = profile.contractTypes.includes(contract);
    const next = exists
      ? profile.contractTypes.filter((c) => c !== contract)
      : [...profile.contractTypes, contract];
    onChange({ contractTypes: next });
  };

  return (
    <VStack space="lg">
      <VStack space="xs">
        <Heading size="xl" bold className="text-foreground">
          Vos préférences de travail
        </Heading>
        <Text size="sm" className="text-muted-foreground">
          Définissez votre mode de travail, votre contrat et votre objectif salarial.
        </Text>
      </VStack>

      {/* Work Mode */}
      <VStack space="xs">
        <Text size="xs" bold className="text-foreground">
          Mode de travail souhaité
        </Text>
        <HStack space="sm">
          {WORK_MODES.map((item) => {
            const active = profile.workModes.includes(item.id);
            return (
              <Pressable
                key={item.id}
                onPress={() => toggleWorkMode(item.id)}
                className={`flex-1 items-center rounded-2xl border p-3 ${
                  active ? 'bg-primary-fixed border-primary' : 'bg-card border-border'
                }`}>
                <VStack space="xs" className="items-center">
                  <Icon
                    as={item.icon}
                    size="md"
                    className={active ? 'text-primary' : 'text-muted-foreground'}
                  />
                  <Text
                    size="xs"
                    bold={active}
                    className={active ? 'text-on-primary-fixed' : 'text-foreground'}>
                    {item.label}
                  </Text>
                </VStack>
              </Pressable>
            );
          })}
        </HStack>
      </VStack>

      {/* Contract Types */}
      <VStack space="xs">
        <Text size="xs" bold className="text-foreground">
          Type de contrat
        </Text>
        <HStack className="flex-wrap gap-2">
          {CONTRACT_TYPES.map((contract) => {
            const active = profile.contractTypes.includes(contract);
            return (
              <Pressable
                key={contract}
                onPress={() => toggleContract(contract)}
                className={`rounded-full border px-4 py-2 ${
                  active ? 'bg-primary-fixed border-primary' : 'bg-card border-border'
                }`}>
                <Text
                  size="xs"
                  bold={active}
                  className={active ? 'text-primary' : 'text-muted-foreground'}>
                  {contract}
                </Text>
              </Pressable>
            );
          })}
        </HStack>
      </VStack>

      {/* Salary Target */}
      <Card className="bg-card border-border rounded-2xl border p-4">
        <VStack space="sm">
          <HStack className="items-center justify-between">
            <HStack className="items-center" space="xs">
              <Icon as={Banknote} size="sm" className="text-secondary" />
              <Text size="xs" bold className="text-foreground">
                Salaire annuel minimum
              </Text>
            </HStack>
            <Box className="bg-secondary-container/60 rounded-full px-2.5 py-1">
              <Text size="xs" bold className="text-on-secondary-container">
                {profile.minSalaryK} 000 €+ / an
              </Text>
            </Box>
          </HStack>

          <HStack className="flex-wrap gap-2">
            {SALARY_STEPS.map((amount) => {
              const active = profile.minSalaryK === amount;
              return (
                <Pressable
                  key={amount}
                  onPress={() => {
                    triggerHaptic('light');
                    onChange({ minSalaryK: amount });
                  }}
                  className={`rounded-xl border px-3.5 py-2 ${
                    active
                      ? 'bg-secondary-container/60 border-secondary'
                      : 'bg-muted border-transparent'
                  }`}>
                  <Text
                    size="xs"
                    bold={active}
                    className={active ? 'text-on-secondary-container' : 'text-foreground'}>
                    {amount}k+ €
                  </Text>
                </Pressable>
              );
            })}
          </HStack>
        </VStack>
      </Card>

      {/* Availability */}
      <VStack space="xs">
        <HStack className="items-center" space="xs">
          <Icon as={Calendar} size="xs" className="text-muted-foreground" />
          <Text size="xs" bold className="text-foreground">
            Disponibilité
          </Text>
        </HStack>
        <HStack className="flex-wrap gap-2">
          {AVAILABILITIES.map((avail) => {
            const active = profile.availability === avail;
            return (
              <Pressable
                key={avail}
                onPress={() => {
                  triggerHaptic('light');
                  onChange({ availability: avail });
                }}
                className={`rounded-full border px-3.5 py-2 ${
                  active ? 'bg-primary-fixed border-primary' : 'bg-card border-border'
                }`}>
                <Text
                  size="xs"
                  bold={active}
                  className={active ? 'text-primary' : 'text-muted-foreground'}>
                  {avail}
                </Text>
              </Pressable>
            );
          })}
        </HStack>
      </VStack>
    </VStack>
  );
}
