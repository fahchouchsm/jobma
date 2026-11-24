import React, { useEffect, useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { Linking } from 'react-native';
import { ExternalLink, FileText, Send, Sparkles, UploadCloud, X, Zap } from 'lucide-react-native';
import { AppBottomSheet, BottomSheetTextInput } from '@/components/ui/app-bottom-sheet';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useUniwind } from 'uniwind';
import type { CandidateProfile, CvAttachment } from '@/context/profile-context';
import type { JobListing } from '@/data/jobs';
import { triggerHaptic } from '@/lib/haptics';
import { THEME } from '@/lib/theme';

const MAX_NOTE_LENGTH = 300;

interface ApplySheetProps {
  visible: boolean;
  job: JobListing;
  profile: CandidateProfile;
  cvFiles?: CvAttachment[];
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (note: string, selectedCv?: CvAttachment | null) => void;
  onAttachCv?: (cv: CvAttachment) => void;
  sourceSite?: string;
  sourceUrl?: string;
}

export function ApplySheet({
  visible,
  job,
  profile,
  cvFiles = [],
  isSubmitting,
  onClose,
  onConfirm,
  onAttachCv,
  sourceSite,
  sourceUrl,
}: ApplySheetProps) {
  const { theme } = useUniwind();
  const colors = THEME[theme === 'dark' ? 'dark' : 'light'];
  const [note, setNote] = useState('');
  const [isPickingCv, setIsPickingCv] = useState(false);
  const [selectedCvId, setSelectedCvId] = useState<string | undefined>(profile.cvFile?.id);

  const handleGeneratePitch = () => {
    triggerHaptic('light');
    const jobSkills = (job.skills ?? []).map((s) => s.toLowerCase());
    const matched = profile.skills.filter((s) => jobSkills.includes(s.toLowerCase())).slice(0, 3);
    const skillText =
      matched.length > 0
        ? `Ma maîtrise de ${matched.join(', ')}`
        : profile.skills.length > 0
          ? `Mon expérience en ${profile.skills.slice(0, 2).join(' et ')}`
          : `Mon parcours (${profile.experienceLevel})`;
    const draft = `Bonjour, très intéressé(e) par le poste de ${job.title} chez ${job.company}. ${skillText} correspond à vos besoins. Disponible ${profile.availability.toLowerCase()} pour en discuter !`;
    setNote(draft.slice(0, MAX_NOTE_LENGTH));
  };

  const availableCvs = cvFiles.length > 0 ? cvFiles : profile.cvFile ? [profile.cvFile] : [];
  const activeCv =
    availableCvs.find((c) => (selectedCvId ? c.id === selectedCvId : c.isPrimary)) ??
    availableCvs[0] ??
    profile.cvFile;

  useEffect(() => {
    if (!visible) {
      setNote('');
    } else {
      setSelectedCvId(profile.cvFile?.id);
    }
  }, [visible, profile.cvFile?.id]);

  const handleSafeClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const handlePickCv = async () => {
    if (!onAttachCv || isSubmitting || isPickingCv) return;
    try {
      setIsPickingCv(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        triggerHaptic('success');
        onAttachCv({
          name: asset.name,
          size: asset.size,
          uri: asset.uri,
          mimeType: asset.mimeType,
        });
      }
    } finally {
      setIsPickingCv(false);
    }
  };

  return (
    <AppBottomSheet
      visible={visible}
      onClose={handleSafeClose}
      disableDismiss={isSubmitting}
      snapPoints={['62%', '88%']}>
      <VStack space="md">
        {/* Header */}
            <HStack className="items-start justify-between" space="sm">
              <VStack className="flex-1">
                <HStack className="items-center" space="xs">
                  <Icon as={Zap} size="sm" className="text-primary" />
                  <Text size="xs" bold className="text-primary uppercase">
                    Candidature en 1 clic
                  </Text>
                </HStack>
                <Heading size="lg" bold className="text-foreground mt-0.5">
                  {job.title}
                </Heading>
                <Text size="xs" className="text-muted-foreground">
                  {job.company} • {job.location}
                </Text>
              </VStack>

              <Pressable
                accessibilityLabel="Fermer"
                disabled={isSubmitting}
                onPress={handleSafeClose}
                className="bg-muted h-9 w-9 items-center justify-center rounded-full">
                <Icon as={X} size="sm" className="text-muted-foreground" />
              </Pressable>
            </HStack>

            {/* Attached CV Preview */}
            <Box className="bg-muted rounded-2xl p-3.5">
              <HStack className="items-center justify-between" space="sm">
                <HStack className="min-w-0 flex-1 items-center" space="sm">
                  <Box className="bg-secondary-container/60 h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                    <Icon as={FileText} size="md" className="text-secondary" />
                  </Box>
                  <VStack className="min-w-0 flex-1">
                    <Text size="xs" bold isTruncated className="text-foreground">
                      {profile.fullName}
                    </Text>
                    <Text size="xs" isTruncated className="text-muted-foreground">
                      {activeCv
                        ? `CV joint : ${activeCv.name}`
                        : 'Profil Jobma complet (sans PDF)'}
                    </Text>
                  </VStack>
                </HStack>

                {!activeCv && onAttachCv && (
                  <Button
                    variant="outline"
                    size="sm"
                    isDisabled={isSubmitting || isPickingCv}
                    onPress={handlePickCv}
                    className="rounded-lg">
                    <ButtonIcon as={UploadCloud} />
                    <ButtonText>Joindre</ButtonText>
                  </Button>
                )}
              </HStack>

              {availableCvs.length > 1 && (
                <HStack className="mt-2.5 flex-wrap gap-1.5">
                  {availableCvs.map((cv) => {
                    const selected = activeCv?.id ? cv.id === activeCv.id : cv.name === activeCv?.name;
                    return (
                      <Pressable
                        key={cv.id ?? cv.name}
                        onPress={() => {
                          triggerHaptic('light');
                          setSelectedCvId(cv.id);
                        }}
                        className={`rounded-full border px-2.5 py-1 ${
                          selected
                            ? 'bg-primary-fixed border-primary'
                            : 'bg-card border-border'
                        }`}>
                        <Text
                          size="2xs"
                          bold={selected}
                          numberOfLines={1}
                          className={selected ? 'text-primary' : 'text-muted-foreground'}>
                          {cv.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </HStack>
              )}
            </Box>

            {/* Optional Note */}
            <VStack space="xs">
              <HStack className="items-center justify-between" space="sm">
                <Text size="xs" bold className="text-foreground">
                  Mot pour le recruteur
                </Text>
                <HStack className="items-center" space="sm">
                  <Pressable
                    onPress={handleGeneratePitch}
                    className="bg-primary-fixed flex-row items-center gap-1 rounded-full px-2.5 py-0.5">
                    <Icon as={Sparkles} size="2xs" className="text-primary" />
                    <Text size="2xs" bold className="text-primary">
                      Générer
                    </Text>
                  </Pressable>
                  <Text size="2xs" className="text-muted-foreground">
                    {note.length}/{MAX_NOTE_LENGTH}
                  </Text>
                </HStack>
              </HStack>
              <BottomSheetTextInput
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={3}
                maxLength={MAX_NOTE_LENGTH}
                textAlignVertical="top"
                placeholder={`Ex : Très intéressé(e) par le poste chez ${job.company}...`}
                placeholderTextColor={colors.mutedForeground}
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  height: 96,
                  color: colors.foreground,
                  fontSize: 14,
                }}
              />
            </VStack>

            {/* Actions */}
            <HStack space="sm" className="pt-1">
              <Button
                variant="outline"
                size="default"
                onPress={handleSafeClose}
                isDisabled={isSubmitting}
                className="rounded-xl px-4">
                <ButtonText>Annuler</ButtonText>
              </Button>

              <Button
                size="default"
                isDisabled={isSubmitting}
                onPress={() => onConfirm(note.trim(), activeCv)}
                className="flex-1 rounded-xl">
                {isSubmitting ? (
                  <>
                    <ButtonSpinner className="text-primary-foreground" />
                    <ButtonText className="font-bold">Envoi...</ButtonText>
                  </>
                ) : (
                  <>
                    <ButtonIcon as={Send} />
                    <ButtonText className="font-bold">Envoyer</ButtonText>
                  </>
                )}
              </Button>
            </HStack>

            {sourceUrl && (
              <Button
                variant="outline"
                size="sm"
                isDisabled={isSubmitting}
                onPress={() => void Linking.openURL(sourceUrl)}
                className="rounded-xl">
                <ButtonIcon as={ExternalLink} />
                <ButtonText>
                  Voir l&apos;annonce originale{sourceSite ? ` (${sourceSite})` : ''}
                </ButtonText>
              </Button>
            )}
      </VStack>
    </AppBottomSheet>
  );
}
