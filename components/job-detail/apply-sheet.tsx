import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FileText, Send, X, Zap } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Input, InputField } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import type { CandidateProfile } from '@/context/profile-context';
import type { JobListing } from '@/data/jobs';

interface ApplySheetProps {
  visible: boolean;
  job: JobListing;
  profile: CandidateProfile;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (note: string) => void;
}

export function ApplySheet({
  visible,
  job,
  profile,
  isSubmitting,
  onClose,
  onConfirm,
}: ApplySheetProps) {
  const insets = useSafeAreaInsets();
  const [note, setNote] = useState('');

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable onPress={onClose} className="bg-foreground/45 absolute inset-0" />

        <Box
          className="bg-card border-border rounded-t-3xl border-t px-5 pt-4"
          style={{
            paddingBottom: Platform.OS === 'web' ? 20 : Math.max(insets.bottom, 20),
          }}>
          <VStack space="md">
            {/* Handle */}
            <Box className="bg-border mb-1 h-1 w-10 self-center rounded-full" />

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
                onPress={onClose}
                className="bg-muted h-9 w-9 items-center justify-center rounded-full">
                <Icon as={X} size="sm" className="text-muted-foreground" />
              </Pressable>
            </HStack>

            {/* Attached CV Preview */}
            <Box className="bg-muted rounded-2xl p-3.5">
              <HStack className="items-center" space="sm">
                <Box className="bg-secondary-container/60 h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                  <Icon as={FileText} size="md" className="text-secondary" />
                </Box>
                <VStack className="min-w-0 flex-1">
                  <Text size="xs" bold isTruncated className="text-foreground">
                    {profile.fullName}
                  </Text>
                  <Text size="xs" isTruncated className="text-muted-foreground">
                    {profile.cvFile
                      ? `CV joint : ${profile.cvFile.name}`
                      : 'Profil Jobma complet (sans PDF)'}
                  </Text>
                </VStack>
              </HStack>
            </Box>

            {/* Optional Note */}
            <VStack space="xs">
              <Text size="xs" bold className="text-foreground">
                Mot pour le recruteur (optionnel)
              </Text>
              <Input className="bg-background border-border h-12 rounded-xl px-3">
                <InputField
                  value={note}
                  onChangeText={setNote}
                  placeholder={`Ex : Très intéressé(e) par le poste chez ${job.company}...`}
                  className="text-foreground text-sm"
                />
              </Input>
            </VStack>

            {/* Actions */}
            <HStack space="sm" className="pt-1">
              <Button
                variant="outline"
                size="lg"
                onPress={onClose}
                isDisabled={isSubmitting}
                className="rounded-xl">
                <ButtonText>Annuler</ButtonText>
              </Button>

              <Button
                size="lg"
                isDisabled={isSubmitting}
                onPress={() => onConfirm(note.trim())}
                className="flex-1 rounded-xl">
                {isSubmitting ? (
                  <>
                    <ButtonSpinner className="text-primary-foreground" />
                    <ButtonText className="font-bold">Envoi...</ButtonText>
                  </>
                ) : (
                  <>
                    <ButtonIcon as={Send} />
                    <ButtonText className="font-bold">Envoyer ma candidature</ButtonText>
                  </>
                )}
              </Button>
            </HStack>
          </VStack>
        </Box>
      </KeyboardAvoidingView>
    </Modal>
  );
}
