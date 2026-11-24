import React, { useEffect, useRef, useState } from 'react';
import { Check, Plus, X } from 'lucide-react-native';
import { useUniwind } from 'uniwind';
import { AppBottomSheet, BottomSheetTextInput } from '@/components/ui/app-bottom-sheet';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import type { CandidateProfile } from '@/context/profile-context';
import { triggerHaptic } from '@/lib/haptics';
import { THEME } from '@/lib/theme';
import { ApiValidationError } from '@/services/auth-service';

const SALARY_PRESETS_MAD = [5, 8, 12, 18, 25];
const ALL_CITIES_LABEL = 'Tout le Maroc';
const MOROCCAN_CITIES = [
  ALL_CITIES_LABEL,
  'Casablanca',
  'Rabat',
  'Tanger',
  'Marrakech',
  'Agadir',
  'Fès',
];

interface EditProfileSheetProps {
  visible: boolean;
  profile: CandidateProfile;
  onSave: (partial: Partial<CandidateProfile>) => Promise<void>;
  onClose: () => void;
}

export function EditProfileSheet({ visible, profile, onSave, onClose }: EditProfileSheetProps) {
  const { theme } = useUniwind();
  const colors = THEME[theme === 'dark' ? 'dark' : 'light'];

  const headlineRef = useRef<{ focus: () => void } | null>(null);
  const phoneRef = useRef<{ focus: () => void } | null>(null);
  const locationRef = useRef<{ focus: () => void } | null>(null);
  const bioRef = useRef<{ focus: () => void } | null>(null);
  const githubRef = useRef<{ focus: () => void } | null>(null);
  const portfolioRef = useRef<{ focus: () => void } | null>(null);

  const inputStyle = {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    color: colors.foreground,
    fontSize: 14,
  } as const;

  const [fullName, setFullName] = useState(profile.fullName);
  const [headline, setHeadline] = useState(profile.headline);
  const [phone, setPhone] = useState(profile.phone ?? '');
  const [location, setLocation] = useState(profile.location);
  const [bio, setBio] = useState(profile.bio ?? '');
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedinUrl ?? '');
  const [githubUrl, setGithubUrl] = useState(profile.githubUrl ?? '');
  const [portfolioUrl, setPortfolioUrl] = useState(profile.portfolioUrl ?? '');
  const [minSalaryK, setMinSalaryK] = useState(profile.minSalaryK);
  const [skills, setSkills] = useState<string[]>(profile.skills);
  const [newSkill, setNewSkill] = useState('');
  const [targetJobs, setTargetJobs] = useState<string[]>(profile.targetJobs ?? []);
  const [newTargetJob, setNewTargetJob] = useState('');
  const [targetCities, setTargetCities] = useState<string[]>(profile.targetCities ?? []);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (visible) {
      setFullName(profile.fullName);
      setHeadline(profile.headline);
      setPhone(profile.phone ?? '');
      setLocation(profile.location);
      setBio(profile.bio ?? '');
      setLinkedinUrl(profile.linkedinUrl ?? '');
      setGithubUrl(profile.githubUrl ?? '');
      setPortfolioUrl(profile.portfolioUrl ?? '');
      setMinSalaryK(profile.minSalaryK);
      setSkills(profile.skills);
      setNewSkill('');
      setTargetJobs(profile.targetJobs ?? []);
      setNewTargetJob('');
      setTargetCities(profile.targetCities ?? []);
      setSubmitError(null);
      setFieldErrors({});
    }
  }, [visible, profile]);

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
    setTargetCities((prev) => {
      if (city === ALL_CITIES_LABEL) {
        return prev.includes(ALL_CITIES_LABEL) ? [] : [ALL_CITIES_LABEL];
      }
      const withoutAll = prev.filter((c) => c !== ALL_CITIES_LABEL);
      return withoutAll.includes(city)
        ? withoutAll.filter((c) => c !== city)
        : [...withoutAll, city];
    });
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setSubmitError(null);
    setFieldErrors({});
    try {
      await onSave({
        fullName: fullName.trim() || profile.fullName,
        headline: headline.trim() || profile.headline,
        phone: phone.trim(),
        location: location.trim() || profile.location,
        bio: bio.trim(),
        linkedinUrl: linkedinUrl.trim(),
        githubUrl: githubUrl.trim(),
        portfolioUrl: portfolioUrl.trim(),
        minSalaryK,
        skills,
        targetJobs,
        targetCities,
      });
      triggerHaptic('success');
      onClose();
    } catch (err) {
      if (err instanceof ApiValidationError) {
        setSubmitError(err.message);
        setFieldErrors(err.fieldErrors);
      } else {
        setSubmitError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppBottomSheet
      visible={visible}
      onClose={onClose}
      disableDismiss={isSaving}
      snapPoints={['75%', '92%']}>
      <VStack space="md">
        <HStack className="items-center justify-between">
          <Heading size="md" bold className="text-foreground">
            Modifier mon profil
          </Heading>
          <Pressable
            accessibilityLabel="Fermer"
            disabled={isSaving}
            onPress={onClose}
            className="bg-muted h-8 w-8 items-center justify-center rounded-full">
            <Icon as={X} size="sm" className="text-muted-foreground" />
          </Pressable>
        </HStack>

        {submitError && (
          <Box className="bg-destructive/10 border-destructive/30 rounded-xl border px-3 py-2">
            <Text size="xs" className="text-destructive">
              {submitError}
            </Text>
          </Box>
        )}

        <VStack space="md" className="pb-2">
          <VStack space="xs">
            <Text size="xs" bold className="text-foreground">
              Nom complet
            </Text>
            <BottomSheetTextInput
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              autoCorrect={false}
              autoComplete="name"
              textContentType="name"
              importantForAutofill="yes"
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => headlineRef.current?.focus()}
              placeholder="Ex : Youssef Benali"
              placeholderTextColor={colors.mutedForeground}
              style={inputStyle}
            />
            {fieldErrors.fullName && (
              <Text size="2xs" className="text-destructive">
                {fieldErrors.fullName}
              </Text>
            )}
          </VStack>

          <VStack space="xs">
            <Text size="xs" bold className="text-foreground">
              Titre du poste
            </Text>
            <BottomSheetTextInput
              ref={headlineRef as never}
              value={headline}
              onChangeText={setHeadline}
              autoCapitalize="sentences"
              textContentType="jobTitle"
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => phoneRef.current?.focus()}
              placeholder="Ex : Développeur Full Stack"
              placeholderTextColor={colors.mutedForeground}
              style={inputStyle}
            />
            {fieldErrors.headline && (
              <Text size="2xs" className="text-destructive">
                {fieldErrors.headline}
              </Text>
            )}
          </VStack>

          <VStack space="xs">
            <Text size="xs" bold className="text-foreground">
              Téléphone
            </Text>
            <BottomSheetTextInput
              ref={phoneRef as never}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              inputMode="tel"
              autoComplete="tel"
              textContentType="telephoneNumber"
              importantForAutofill="yes"
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => locationRef.current?.focus()}
              placeholder="+212 6 12 34 56 78"
              placeholderTextColor={colors.mutedForeground}
              style={inputStyle}
            />
            {fieldErrors.phone && (
              <Text size="2xs" className="text-destructive">
                {fieldErrors.phone}
              </Text>
            )}
          </VStack>

          <VStack space="xs">
            <Text size="xs" bold className="text-foreground">
              Ville
            </Text>
            <BottomSheetTextInput
              ref={locationRef as never}
              value={location}
              onChangeText={setLocation}
              autoCapitalize="words"
              autoComplete="street-address"
              textContentType="addressCity"
              importantForAutofill="yes"
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => bioRef.current?.focus()}
              placeholder="Ex : Casablanca, Maroc"
              placeholderTextColor={colors.mutedForeground}
              style={inputStyle}
            />
            {fieldErrors.location && (
              <Text size="2xs" className="text-destructive">
                {fieldErrors.location}
              </Text>
            )}
          </VStack>

          <VStack space="xs">
            <Text size="xs" bold className="text-foreground">
              Bio courte
            </Text>
            <BottomSheetTextInput
              ref={bioRef as never}
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              placeholder="Présentez votre parcours en quelques lignes..."
              placeholderTextColor={colors.mutedForeground}
              style={{
                ...inputStyle,
                height: 84,
                paddingVertical: 10,
              }}
            />
          </VStack>

          <VStack space="xs">
            <Text size="xs" bold className="text-foreground">
              Liens professionnels
            </Text>
            <VStack space="xs">
              <BottomSheetTextInput
                value={linkedinUrl}
                onChangeText={setLinkedinUrl}
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                keyboardType="url"
                inputMode="url"
                autoComplete="url"
                textContentType="URL"
                importantForAutofill="yes"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => githubRef.current?.focus()}
                placeholder="LinkedIn (https://linkedin.com/in/...)"
                placeholderTextColor={colors.mutedForeground}
                style={inputStyle}
              />
              <BottomSheetTextInput
                ref={githubRef as never}
                value={githubUrl}
                onChangeText={setGithubUrl}
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                keyboardType="url"
                inputMode="url"
                autoComplete="url"
                textContentType="URL"
                importantForAutofill="yes"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => portfolioRef.current?.focus()}
                placeholder="GitHub (https://github.com/...)"
                placeholderTextColor={colors.mutedForeground}
                style={inputStyle}
              />
              <BottomSheetTextInput
                ref={portfolioRef as never}
                value={portfolioUrl}
                onChangeText={setPortfolioUrl}
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                keyboardType="url"
                inputMode="url"
                autoComplete="url"
                textContentType="URL"
                importantForAutofill="yes"
                returnKeyType="done"
                placeholder="Portfolio (https://...)"
                placeholderTextColor={colors.mutedForeground}
                style={inputStyle}
              />
            </VStack>
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
                      className={active ? 'text-on-secondary-container' : 'text-foreground'}>
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
            <HStack className="items-center" space="xs">
              <BottomSheetTextInput
                value={newSkill}
                onChangeText={setNewSkill}
                onSubmitEditing={handleAddSkill}
                returnKeyType="done"
                placeholder="Ajouter une compétence (ex : React)"
                placeholderTextColor={colors.mutedForeground}
                style={{ ...inputStyle, flex: 1 }}
              />
              <Pressable
                accessibilityLabel="Ajouter une compétence"
                onPress={handleAddSkill}
                className="bg-primary-fixed h-11 w-11 items-center justify-center rounded-xl">
                <Icon as={Plus} size="md" className="text-primary" />
              </Pressable>
            </HStack>

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
            <HStack className="items-center" space="xs">
              <BottomSheetTextInput
                value={newTargetJob}
                onChangeText={setNewTargetJob}
                onSubmitEditing={handleAddTargetJob}
                autoCapitalize="sentences"
                returnKeyType="done"
                placeholder="Ex : Développeur Full Stack, Data Analyst"
                placeholderTextColor={colors.mutedForeground}
                style={{ ...inputStyle, flex: 1 }}
              />
              <Pressable
                accessibilityLabel="Ajouter un poste ciblé"
                onPress={handleAddTargetJob}
                className="bg-primary-fixed h-11 w-11 items-center justify-center rounded-xl">
                <Icon as={Plus} size="md" className="text-primary" />
              </Pressable>
            </HStack>
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
              {MOROCCAN_CITIES.map((city) => {
                const active = targetCities.includes(city);
                return (
                  <Pressable
                    key={city}
                    onPress={() => toggleTargetCity(city)}
                    className={`rounded-full border px-3 py-1.5 ${
                      active ? 'bg-primary-fixed border-primary' : 'bg-background border-border'
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

        <HStack space="sm" className="pt-1">
          <Button
            variant="outline"
            size="default"
            isDisabled={isSaving}
            onPress={onClose}
            className="rounded-xl px-4">
            <ButtonText>Annuler</ButtonText>
          </Button>
          <Button
            size="default"
            isDisabled={isSaving}
            onPress={() => void handleSave()}
            className="flex-1 rounded-xl">
            {isSaving ? (
              <>
                <ButtonSpinner className="text-primary-foreground" />
                <ButtonText className="font-bold">Enregistrement...</ButtonText>
              </>
            ) : (
              <>
                <ButtonIcon as={Check} />
                <ButtonText className="font-bold">Enregistrer</ButtonText>
              </>
            )}
          </Button>
        </HStack>
      </VStack>
    </AppBottomSheet>
  );
}
