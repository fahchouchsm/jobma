import React, { useState } from 'react';
import { Briefcase, MapPin, Phone, Plus, User, X } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import type { CandidateProfile } from '@/context/profile-context';
import { triggerHaptic } from '@/lib/haptics';

const MOROCCAN_CITIES = ['Casablanca', 'Rabat', 'Tanger', 'Marrakech', 'Agadir', 'Fès'];
const SUGGESTED_JOBS = [
  'Développeur Full Stack',
  'Développeur Mobile',
  'Product Designer',
  'Data Analyst',
  'Chef de Projet',
  'Ingénieur DevOps',
];

interface StepIdentityProps {
  profile: CandidateProfile;
  fieldErrors?: Record<string, string>;
  onChange: (partial: Partial<CandidateProfile>) => void;
}

export function StepIdentity({ profile, fieldErrors = {}, onChange }: StepIdentityProps) {
  const [customTargetJob, setCustomTargetJob] = useState('');

  const targetJobs = profile.targetJobs ?? [];
  const targetCities = profile.targetCities ?? [];

  const toggleTargetJob = (job: string) => {
    triggerHaptic('light');
    const exists = targetJobs.includes(job);
    const next = exists ? targetJobs.filter((j) => j !== job) : [...targetJobs, job];
    onChange({ targetJobs: next });
  };

  const addCustomJob = () => {
    const trimmed = customTargetJob.trim();
    if (!trimmed) return;
    if (!targetJobs.includes(trimmed)) {
      onChange({ targetJobs: [...targetJobs, trimmed] });
    }
    setCustomTargetJob('');
  };

  const toggleTargetCity = (city: string) => {
    triggerHaptic('light');
    const exists = targetCities.includes(city);
    const next = exists ? targetCities.filter((c) => c !== city) : [...targetCities, city];
    onChange({
      targetCities: next,
      location: profile.location.trim() ? profile.location : next[0] ? `${next[0]}, Maroc` : '',
    });
  };

  return (
    <VStack space="lg">
      <VStack space="xs">
        <Heading size="xl" bold className="text-foreground">
          Complétez votre profil
        </Heading>
        <Text size="sm" className="text-muted-foreground">
          Ces informations permettent aux recruteurs de vous contacter et de personnaliser vos offres.
        </Text>
      </VStack>

      <VStack space="md">
        <VStack space="xs">
          <Text size="xs" bold className="text-foreground">
            Nom complet *
          </Text>
          <Input className="bg-card border-border h-11 rounded-xl px-3">
            <InputSlot className="pr-2">
              <InputIcon as={User} className="text-muted-foreground" />
            </InputSlot>
            <InputField
              value={profile.fullName}
              onChangeText={(text) => onChange({ fullName: text })}
              placeholder="Ex : Youssef Benali"
              className="text-foreground text-sm"
            />
          </Input>
          {fieldErrors.fullName && (
            <Text size="2xs" className="text-destructive">
              {fieldErrors.fullName}
            </Text>
          )}
        </VStack>

        <VStack space="xs">
          <Text size="xs" bold className="text-foreground">
            Titre du poste actuel ou visé *
          </Text>
          <Input className="bg-card border-border h-11 rounded-xl px-3">
            <InputSlot className="pr-2">
              <InputIcon as={Briefcase} className="text-muted-foreground" />
            </InputSlot>
            <InputField
              value={profile.headline}
              onChangeText={(text) => onChange({ headline: text })}
              placeholder="Ex : Développeur Full Stack React / Spring"
              className="text-foreground text-sm"
            />
          </Input>
          {fieldErrors.headline && (
            <Text size="2xs" className="text-destructive">
              {fieldErrors.headline}
            </Text>
          )}
        </VStack>

        <VStack space="xs">
          <Text size="xs" bold className="text-foreground">
            Téléphone *
          </Text>
          <Input className="bg-card border-border h-11 rounded-xl px-3">
            <InputSlot className="pr-2">
              <InputIcon as={Phone} className="text-muted-foreground" />
            </InputSlot>
            <InputField
              value={profile.phone ?? ''}
              onChangeText={(text) => onChange({ phone: text })}
              keyboardType="phone-pad"
              placeholder="+212 6 12 34 56 78"
              className="text-foreground text-sm"
            />
          </Input>
          {fieldErrors.phone && (
            <Text size="2xs" className="text-destructive">
              {fieldErrors.phone}
            </Text>
          )}
        </VStack>

        <VStack space="xs">
          <Text size="xs" bold className="text-foreground">
            Ville actuelle *
          </Text>
          <Input className="bg-card border-border h-11 rounded-xl px-3">
            <InputSlot className="pr-2">
              <InputIcon as={MapPin} className="text-muted-foreground" />
            </InputSlot>
            <InputField
              value={profile.location}
              onChangeText={(text) => onChange({ location: text })}
              placeholder="Ex : Casablanca, Maroc"
              className="text-foreground text-sm"
            />
          </Input>
          {fieldErrors.location && (
            <Text size="2xs" className="text-destructive">
              {fieldErrors.location}
            </Text>
          )}
        </VStack>

        {/* Target Jobs */}
        <VStack space="xs">
          <Text size="xs" bold className="text-foreground">
            Postes recherchés * ({targetJobs.length})
          </Text>
          <Input className="bg-card border-border h-11 rounded-xl px-3">
            <InputField
              value={customTargetJob}
              onChangeText={setCustomTargetJob}
              onSubmitEditing={addCustomJob}
              placeholder="Ajouter un poste ciblé..."
              className="text-foreground text-sm"
            />
            <InputSlot onPress={addCustomJob}>
              <InputIcon as={Plus} className="text-primary" />
            </InputSlot>
          </Input>
          <HStack className="flex-wrap gap-2 pt-1">
            {Array.from(new Set([...targetJobs, ...SUGGESTED_JOBS])).map((jobTitle) => {
              const selected = targetJobs.includes(jobTitle);
              return (
                <Pressable
                  key={jobTitle}
                  onPress={() => toggleTargetJob(jobTitle)}
                  className={`flex-row items-center gap-1 rounded-full border px-3 py-1.5 ${
                    selected ? 'bg-primary-fixed border-primary' : 'bg-card border-border'
                  }`}>
                  <Text
                    size="xs"
                    bold={selected}
                    className={selected ? 'text-primary' : 'text-muted-foreground'}>
                    {jobTitle}
                  </Text>
                  {selected && <Icon as={X} size="xs" className="text-primary" />}
                </Pressable>
              );
            })}
          </HStack>
          {fieldErrors.targetJobs && (
            <Text size="2xs" className="text-destructive">
              {fieldErrors.targetJobs}
            </Text>
          )}
        </VStack>

        {/* Target Cities */}
        <VStack space="xs">
          <Text size="xs" bold className="text-foreground">
            Villes ciblées au Maroc * ({targetCities.length})
          </Text>
          <HStack className="flex-wrap gap-2">
            {MOROCCAN_CITIES.map((city) => {
              const active = targetCities.includes(city);
              return (
                <Pressable
                  key={city}
                  onPress={() => toggleTargetCity(city)}
                  className={`rounded-full border px-3.5 py-2 ${
                    active ? 'bg-secondary-container border-secondary' : 'bg-card border-border'
                  }`}>
                  <Text
                    size="xs"
                    bold={active}
                    className={active ? 'text-on-secondary-container' : 'text-muted-foreground'}>
                    {city}
                  </Text>
                </Pressable>
              );
            })}
          </HStack>
          {fieldErrors.targetCities && (
            <Box>
              <Text size="2xs" className="text-destructive">
                {fieldErrors.targetCities}
              </Text>
            </Box>
          )}
        </VStack>
      </VStack>
    </VStack>
  );
}
