import React, { useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import {
  CheckCircle2,
  FileText,
  Globe,
  Link2,
  Trash2,
  UploadCloud,
  Zap,
} from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { type CandidateProfile, useProfile } from '@/context/profile-context';
import { triggerHaptic } from '@/lib/haptics';

interface StepCvProps {
  profile: CandidateProfile;
  onChange: (partial: Partial<CandidateProfile>) => void;
}

function formatBytes(bytes?: number): string {
  if (!bytes) return 'PDF';
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function StepCv({ profile, onChange }: StepCvProps) {
  const { uploadCv, removeCv } = useProfile();
  const [isPicking, setIsPicking] = useState(false);

  const handlePickCv = async () => {
    try {
      setIsPicking(true);
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
        await uploadCv({
          name: asset.name,
          size: asset.size,
          uri: asset.uri,
          mimeType: asset.mimeType,
        });
        triggerHaptic('success');
      }
    } finally {
      setIsPicking(false);
    }
  };

  return (
    <VStack space="lg">
      <VStack space="xs">
        <Heading size="xl" bold className="text-foreground">
          Votre CV & liens
        </Heading>
        <Text size="sm" className="text-muted-foreground">
          Importez votre CV pour postuler en 1 clic aux offres qui vous plaisent.
        </Text>
      </VStack>

      {/* CV Upload Card */}
      {profile.cvFile ? (
        <Card className="bg-card border-secondary rounded-2xl border p-4">
          <VStack space="md">
            <HStack className="items-center justify-between" space="sm">
              <HStack className="min-w-0 flex-1 items-center" space="md">
                <Box className="bg-secondary-container/60 h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                  <Icon as={FileText} size="lg" className="text-secondary" />
                </Box>
                <VStack className="min-w-0 flex-1">
                  <Text size="sm" bold isTruncated className="text-foreground">
                    {profile.cvFile.name}
                  </Text>
                  <HStack className="items-center" space="xs">
                    <Icon as={CheckCircle2} size="xs" className="text-secondary" />
                    <Text size="xs" className="text-muted-foreground">
                      {formatBytes(profile.cvFile.size)} • Prêt pour 1-clic
                    </Text>
                  </HStack>
                </VStack>
              </HStack>

              <Pressable
                accessibilityLabel="Supprimer le CV"
                onPress={() => {
                  triggerHaptic('light');
                  void removeCv();
                }}
                className="bg-muted h-9 w-9 items-center justify-center rounded-full">
                <Icon as={Trash2} size="sm" className="text-destructive" />
              </Pressable>
            </HStack>

            <Button variant="outline" size="sm" onPress={handlePickCv}>
              <ButtonIcon as={UploadCloud} />
              <ButtonText>Remplacer le fichier</ButtonText>
            </Button>
          </VStack>
        </Card>
      ) : (
        <Pressable onPress={handlePickCv} className="active:opacity-90">
          <Card className="bg-card border-primary/40 items-center rounded-2xl border-2 border-dashed p-6">
            <VStack space="sm" className="items-center">
              <Box className="bg-primary-fixed h-14 w-14 items-center justify-center rounded-full">
                <Icon as={UploadCloud} size="xl" className="text-primary" />
              </Box>
              <Heading size="sm" bold className="text-foreground text-center">
                {isPicking ? 'Ouverture des fichiers...' : 'Importer votre CV'}
              </Heading>
              <Text size="xs" className="text-muted-foreground text-center">
                Formats acceptés : PDF, DOC, DOCX (max 10 Mo)
              </Text>
              <Box className="bg-primary-fixed mt-1 rounded-full px-4 py-2">
                <Text size="xs" bold className="text-on-primary-fixed">
                  Choisir un fichier
                </Text>
              </Box>
            </VStack>
          </Card>
        </Pressable>
      )}

      {/* 1-Click Apply Toggle */}
      <Pressable
        onPress={() => {
          triggerHaptic('light');
          onChange({ oneClickApplyEnabled: !profile.oneClickApplyEnabled });
        }}>
        <Card className="bg-card border-border rounded-2xl border p-4">
          <HStack className="items-center justify-between" space="md">
            <HStack className="flex-1 items-center" space="sm">
              <Box className="bg-primary-fixed h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                <Icon as={Zap} size="md" className="text-primary" />
              </Box>
              <VStack className="flex-1">
                <Text size="sm" bold className="text-foreground">
                  Candidature en 1 clic
                </Text>
                <Text size="xs" className="text-muted-foreground">
                  Joindre automatiquement ce CV lors d'une candidature rapide
                </Text>
              </VStack>
            </HStack>

            <Box
              className={`h-6 w-11 justify-center rounded-full p-0.5 ${
                profile.oneClickApplyEnabled ? 'bg-primary' : 'bg-muted'
              }`}>
              <Box
                className={`bg-card h-5 w-5 rounded-full ${
                  profile.oneClickApplyEnabled ? 'self-end' : 'self-start'
                }`}
              />
            </Box>
          </HStack>
        </Card>
      </Pressable>

      {/* Links */}
      <VStack space="md">
        <VStack space="xs">
          <Text size="xs" bold className="text-foreground">
            Profil LinkedIn (optionnel)
          </Text>
          <Input className="bg-card border-border h-12 rounded-xl px-3">
            <InputSlot className="pr-1">
              <InputIcon as={Link2} className="text-muted-foreground" />
            </InputSlot>
            <InputField
              value={profile.linkedinUrl}
              onChangeText={(linkedinUrl) => onChange({ linkedinUrl })}
              placeholder="https://linkedin.com/in/..."
              autoCapitalize="none"
              keyboardType="url"
              className="text-foreground text-sm"
            />
          </Input>
        </VStack>

        <VStack space="xs">
          <Text size="xs" bold className="text-foreground">
            Portfolio ou GitHub (optionnel)
          </Text>
          <Input className="bg-card border-border h-12 rounded-xl px-3">
            <InputSlot className="pr-1">
              <InputIcon as={Globe} className="text-muted-foreground" />
            </InputSlot>
            <InputField
              value={profile.portfolioUrl}
              onChangeText={(portfolioUrl) => onChange({ portfolioUrl })}
              placeholder="https://portfolio.dev"
              autoCapitalize="none"
              keyboardType="url"
              className="text-foreground text-sm"
            />
          </Input>
        </VStack>
      </VStack>
    </VStack>
  );
}
