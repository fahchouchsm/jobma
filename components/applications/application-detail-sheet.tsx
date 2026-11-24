import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, Check, ExternalLink, FileText, Trash2, X } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Input, InputField } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import type { ApplicationStatus, JobApplication } from '@/context/jobs-context';
import type { JobListing } from '@/data/jobs';
import { triggerHaptic } from '@/lib/haptics';

const STATUS_STAGES: ApplicationStatus[] = ['Envoyée', 'En cours', 'Entretien', 'Offre'];
const MAX_NOTE_LENGTH = 300;

interface ApplicationDetailSheetProps {
  visible: boolean;
  job: JobListing | null;
  application: JobApplication | null;
  onClose: () => void;
  onUpdateStatus: (jobId: string, status: ApplicationStatus) => void;
  onUpdateNote: (jobId: string, note?: string) => void;
  onWithdraw: (jobId: string) => void;
  onViewJob: (jobId: string) => void;
}

function formatAppliedDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function ApplicationDetailSheet({
  visible,
  job,
  application,
  onClose,
  onUpdateStatus,
  onUpdateNote,
  onWithdraw,
  onViewJob,
}: ApplicationDetailSheetProps) {
  const insets = useSafeAreaInsets();
  const [note, setNote] = useState('');

  useEffect(() => {
    setNote(application?.note ?? '');
  }, [application?.jobId, application?.note, visible]);

  if (!job || !application) return null;

  const trimmedNote = note.trim();
  const hasNoteChanged = trimmedNote !== (application.note ?? '');

  const handleSaveNote = () => {
    triggerHaptic('success');
    onUpdateNote(job.id, trimmedNote || undefined);
  };

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
            <Box className="bg-border mb-1 h-1 w-10 self-center rounded-full" />

            {/* Header */}
            <HStack className="items-start justify-between" space="sm">
              <VStack className="flex-1">
                <Heading size="lg" bold className="text-foreground">
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

            {/* Metadata */}
            <Box className="bg-muted rounded-2xl p-3.5">
              <VStack space="xs">
                <HStack className="items-center" space="xs">
                  <Icon as={Calendar} size="xs" className="text-muted-foreground" />
                  <Text size="xs" className="text-muted-foreground">
                    Envoyée le {formatAppliedDate(application.appliedAt)}
                  </Text>
                </HStack>
                <HStack className="items-center" space="xs">
                  <Icon as={FileText} size="xs" className="text-secondary" />
                  <Text size="xs" isTruncated className="text-foreground flex-1">
                    {application.cvName
                      ? `CV joint : ${application.cvName}`
                      : 'Profil Jobma envoyé (sans PDF)'}
                  </Text>
                </HStack>
              </VStack>
            </Box>

            {/* Stage selector */}
            <VStack space="xs">
              <Text size="xs" bold className="text-foreground">
                Étape actuelle
              </Text>
              <HStack space="xs">
                {STATUS_STAGES.map((stage) => {
                  const active = application.status === stage;
                  return (
                    <Pressable
                      key={stage}
                      onPress={() => {
                        triggerHaptic('light');
                        onUpdateStatus(job.id, stage);
                      }}
                      className={`flex-1 items-center rounded-lg border px-1 py-2 ${
                        active
                          ? 'bg-secondary-container/60 border-secondary'
                          : 'bg-muted border-transparent'
                      }`}>
                      <Text
                        size="2xs"
                        bold={active}
                        numberOfLines={1}
                        className={
                          active ? 'text-on-secondary-container' : 'text-muted-foreground'
                        }>
                        {stage}
                      </Text>
                    </Pressable>
                  );
                })}
              </HStack>
            </VStack>

            {/* Recruiter note */}
            <VStack space="xs">
              <HStack className="items-center justify-between">
                <Text size="xs" bold className="text-foreground">
                  Note personnelle / mot au recruteur
                </Text>
                <Text size="2xs" className="text-muted-foreground">
                  {note.length}/{MAX_NOTE_LENGTH}
                </Text>
              </HStack>
              <Input className="bg-background border-border h-24 items-start rounded-xl px-3 py-2">
                <InputField
                  value={note}
                  onChangeText={setNote}
                  multiline
                  numberOfLines={3}
                  maxLength={MAX_NOTE_LENGTH}
                  textAlignVertical="top"
                  placeholder="Ajoutez un mémo d'entretien ou modifiez votre note..."
                  className="text-foreground h-full text-sm"
                />
              </Input>
              {hasNoteChanged && (
                <Button size="sm" onPress={handleSaveNote} className="self-end rounded-lg">
                  <ButtonIcon as={Check} />
                  <ButtonText>Enregistrer la note</ButtonText>
                </Button>
              )}
            </VStack>

            {/* Footer actions */}
            <HStack space="sm" className="pt-1">
              <Button
                variant="outline"
                size="default"
                onPress={() => {
                  triggerHaptic('light');
                  onWithdraw(job.id);
                  onClose();
                }}
                className="border-destructive/40 rounded-xl">
                <ButtonIcon as={Trash2} className="text-destructive" />
                <ButtonText className="text-destructive">Retirer</ButtonText>
              </Button>

              <Button
                size="default"
                onPress={() => {
                  onClose();
                  onViewJob(job.id);
                }}
                className="flex-1 rounded-xl">
                <ButtonIcon as={ExternalLink} />
                <ButtonText className="font-bold">Voir l'offre</ButtonText>
              </Button>
            </HStack>
          </VStack>
        </Box>
      </KeyboardAvoidingView>
    </Modal>
  );
}
