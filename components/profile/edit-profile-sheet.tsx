import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, Plus, X } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import type { CandidateProfile } from '@/context/profile-context';
import { triggerHaptic } from '@/lib/haptics';

const SALARY_PRESETS_MAD = [5, 8, 12, 18, 25];

interface EditProfileSheetProps {
  visible: boolean;
  profile: CandidateProfile;
  onSave: (partial: Partial<CandidateProfile>) => void;
  onClose: () => void;
}

export function EditProfileSheet({ visible, profile, onSave, onClose }: EditProfileSheetProps) {
  const insets = useSafeAreaInsets();
  const [fullName, setFullName] = useState(profile.fullName);
  const [headline, setHeadline] = useState(profile.headline);
  const [location, setLocation] = useState(profile.location);
  const [minSalaryK, setMinSalaryK] = useState(profile.minSalaryK);
  const [skills, setSkills] = useState<string[]>(profile.skills);
  const [newSkill, setNewSkill] = useState('');
  const [targetJobs, setTargetJobs] = useState<string[]>(profile.targetJobs ?? []);
  const [newTargetJob, setNewTargetJob] = useState('');
  const [targetCities, setTargetCities] = useState<string[]>(profile.targetCities ?? []);

  useEffect(() => {
    if (visible) {
      setFullName(profile.fullName);
      setHeadline(profile.headline);
      setLocation(profile.location);
      setMinSalaryK(profile.minSalaryK);
      setSkills(profile.skills);
      setNewSkill('');
      setTargetJobs(profile.targetJobs ?? []);
      setNewTargetJob('');
      setTargetCities(profile.targetCities ?? []);
    }
  }, [visible, profile]);

  const handleAddTargetJob = () => {
    const trimmed = newTargetJob.trim();
    if (!trimmed) return;
    if (!targetJobs.includes(trimmed)) {
      setTargetJobs((prev) => [...prev, trimmed]);
    }
    setNewTargetJob('');
  };

  const toggleTargetCity = (city: string) => {
    triggerHaptic('light');
    setTargetCities((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]
    );
  };

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    if (!skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skill: string) => {
    triggerHaptic('light');
    setSkills((prev) => prev.filter((item) => item !== skill));
  };

  const handleSave = () => {
    triggerHaptic('success');
    onSave({
      fullName: fullName.trim() || profile.fullName,
      headline: headline.trim() || profile.headline,
      location: location.trim() || profile.location,
      minSalaryK,
      skills,
      targetJobs,
      targetCities,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable onPress={onClose} className="bg-foreground/45 absolute inset-0" />

        <Box
          className="bg-card border-border max-h-[85%] rounded-t-3xl border-t px-5 pt-4"
          style={{
            paddingBottom: Platform.OS === 'web' ? 20 : Math.max(insets.bottom, 20),
          }}>
          <VStack space="md">
            <Box className="bg-border h-1 w-10 self-center rounded-full" />

            <HStack className="items-center justify-between">
              <Heading size="md" bold className="text-foreground">
                Modifier mon profil
              </Heading>
              <Pressable
                accessibilityLabel="Fermer"
                onPress={onClose}
                className="bg-muted h-8 w-8 items-center justify-center rounded-full">
                <Icon as={X} size="sm" className="text-muted-foreground" />
              </Pressable>
            </HStack>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <VStack space="md" className="pb-2">
                <VStack space="xs">
                  <Text size="xs" bold className="text-foreground">
                    Nom complet
                  </Text>
                  <Input className="bg-background border-border h-11 rounded-xl px-3">
                    <InputField
                      value={fullName}
                      onChangeText={setFullName}
                      placeholder="Ex : Youssef Benali"
                      className="text-foreground text-sm"
                    />
                  </Input>
                </VStack>

                <VStack space="xs">
                  <Text size="xs" bold className="text-foreground">
                    Titre du poste
                  </Text>
                  <Input className="bg-background border-border h-11 rounded-xl px-3">
                    <InputField
                      value={headline}
                      onChangeText={setHeadline}
                      placeholder="Ex : Développeur Full Stack"
                      className="text-foreground text-sm"
                    />
                  </Input>
                </VStack>

                <VStack space="xs">
                  <Text size="xs" bold className="text-foreground">
                    Ville
                  </Text>
                  <Input className="bg-background border-border h-11 rounded-xl px-3">
                    <InputField
                      value={location}
                      onChangeText={setLocation}
                      placeholder="Ex : Casablanca, Maroc"
                      className="text-foreground text-sm"
                    />
                  </Input>
                </VStack>

                <VStack space="xs">
                  <Text size="xs" bold className="text-foreground">
                    Objectif salarial mensuel ({minSalaryK} 000+ MAD/mois)
                  </Text>
                  <HStack className="flex-wrap gap-2">
                    {SALARY_PRESETS_MAD.map((amount) => {
                      const active = minSalaryK === amount;
                      return (
                        <Pressable
                          key={amount}
                          onPress={() => {
                            triggerHaptic('light');
                            setMinSalaryK(amount);
                          }}
                          className={`rounded-lg border px-3 py-1.5 ${
                            active
                              ? 'bg-secondary-container border-secondary'
                              : 'bg-muted border-transparent'
                          }`}>
                          <Text
                            size="xs"
                            bold={active}
                            className={
                              active ? 'text-on-secondary-container' : 'text-foreground'
                            }>
                            {amount}k+ MAD
                          </Text>
                        </Pressable>
                      );
                    })}
                  </HStack>
                </VStack>

                <VStack space="xs">
                  <Text size="xs" bold className="text-foreground">
                    Compétences ({skills.length})
                  </Text>
                  <Input className="bg-background border-border h-11 rounded-xl px-3">
                    <InputField
                      value={newSkill}
                      onChangeText={setNewSkill}
                      onSubmitEditing={handleAddSkill}
                      placeholder="Ajouter une compétence (ex : React)"
                      className="text-foreground text-sm"
                    />
                    <InputSlot onPress={handleAddSkill}>
                      <InputIcon as={Plus} className="text-primary" />
                    </InputSlot>
                  </Input>

                  <HStack className="flex-wrap gap-1.5 pt-1">
                    {skills.map((skill) => (
                      <Pressable
                        key={skill}
                        onPress={() => handleRemoveSkill(skill)}
                        className="bg-muted flex-row items-center gap-1 rounded-full px-3 py-1">
                        <Text size="xs" className="text-foreground font-medium">
                          {skill}
                        </Text>
                        <Icon as={X} size="xs" className="text-muted-foreground" />
                      </Pressable>
                    ))}
                  </HStack>
                </VStack>

                <VStack space="xs">
                  <Text size="xs" bold className="text-foreground">
                    Postes ciblés ({targetJobs.length})
                  </Text>
                  <Input className="bg-background border-border h-11 rounded-xl px-3">
                    <InputField
                      value={newTargetJob}
                      onChangeText={setNewTargetJob}
                      onSubmitEditing={handleAddTargetJob}
                      placeholder="Ex : Développeur Full Stack, Data Analyst"
                      className="text-foreground text-sm"
                    />
                    <InputSlot onPress={handleAddTargetJob}>
                      <InputIcon as={Plus} className="text-primary" />
                    </InputSlot>
                  </Input>
                  <HStack className="flex-wrap gap-1.5 pt-1">
                    {targetJobs.map((jobTitle) => (
                      <Pressable
                        key={jobTitle}
                        onPress={() =>
                          setTargetJobs((prev) => prev.filter((item) => item !== jobTitle))
                        }
                        className="bg-primary-fixed flex-row items-center gap-1 rounded-full px-3 py-1">
                        <Text size="xs" className="text-on-primary-fixed font-medium">
                          {jobTitle}
                        </Text>
                        <Icon as={X} size="xs" className="text-on-primary-fixed" />
                      </Pressable>
                    ))}
                  </HStack>
                </VStack>

                <VStack space="xs">
                  <Text size="xs" bold className="text-foreground">
                    Villes ciblées
                  </Text>
                  <HStack className="flex-wrap gap-2">
                    {['Casablanca', 'Rabat', 'Tanger', 'Marrakech', 'Agadir', 'Fès'].map((city) => {
                      const active = targetCities.includes(city);
                      return (
                        <Pressable
                          key={city}
                          onPress={() => toggleTargetCity(city)}
                          className={`rounded-full border px-3 py-1.5 ${
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
              </VStack>
            </ScrollView>

            <HStack space="sm">
              <Button variant="outline" size="default" onPress={onClose} className="rounded-xl px-4">
                <ButtonText>Annuler</ButtonText>
              </Button>
              <Button size="default" onPress={handleSave} className="flex-1 rounded-xl">
                <ButtonIcon as={Check} />
                <ButtonText className="font-bold">Enregistrer</ButtonText>
              </Button>
            </HStack>
          </VStack>
        </Box>
      </KeyboardAvoidingView>
    </Modal>
  );
}
