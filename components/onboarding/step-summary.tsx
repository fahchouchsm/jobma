import React from 'react';
import {
  Banknote,
  Briefcase,
  CheckCircle2,
  FileText,
  Globe,
  MapPin,
  Sparkles,
} from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import type { CandidateProfile } from '@/context/profile-context';

export function StepSummary({ profile }: { profile: CandidateProfile }) {
  const initials = (profile.fullName || 'JM')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <VStack space="lg">
      <VStack space="xs">
        <Box className="bg-secondary-container/60 self-start rounded-full px-3 py-1">
          <HStack className="items-center" space="xs">
            <Icon as={CheckCircle2} size="xs" className="text-secondary" />
            <Text size="xs" bold className="text-on-secondary-container">
              Profil prêt
            </Text>
          </HStack>
        </Box>
        <Heading size="2xl" bold className="text-foreground tracking-tight">
          Tout est en place !
        </Heading>
        <Text size="sm" className="text-muted-foreground">
          Voici un récapitulatif de vos critères. Vous pourrez les modifier à tout moment depuis
          votre profil.
        </Text>
      </VStack>

      <Card className="bg-card border-border rounded-2xl border p-4 shadow-xs">
        <VStack space="md">
          {/* Identity */}
          <HStack className="items-center" space="md">
            <Box className="bg-primary h-14 w-14 shrink-0 items-center justify-center rounded-2xl">
              <Text size="lg" bold className="text-primary-foreground">
                {initials}
              </Text>
            </Box>
            <VStack className="min-w-0 flex-1">
              <Heading size="md" bold isTruncated className="text-foreground">
                {profile.fullName || 'Candidat Jobma'}
              </Heading>
              <Text size="xs" className="text-muted-foreground" isTruncated>
                {profile.headline || 'Poste à définir'} • {profile.experienceLevel}
              </Text>
              {profile.location ? (
                <HStack className="mt-0.5 items-center" space="xs">
                  <Icon as={MapPin} size="xs" className="text-primary" />
                  <Text size="xs" className="text-muted-foreground">
                    {profile.location}
                  </Text>
                </HStack>
              ) : null}
            </VStack>
          </HStack>

          <Divider />

          {/* Domains & Skills */}
          <VStack space="xs">
            <HStack className="items-center" space="xs">
              <Icon as={Sparkles} size="xs" className="text-primary" />
              <Text size="xs" bold className="text-foreground">
                Domaines & Compétences
              </Text>
            </HStack>
            <Text size="xs" className="text-muted-foreground">
              {profile.domains.length > 0 ? profile.domains.join(' • ') : 'Tous domaines'}
            </Text>
            {profile.skills.length > 0 && (
              <HStack className="flex-wrap gap-1.5 pt-1">
                {profile.skills.slice(0, 6).map((skill) => (
                  <Box key={skill} className="bg-muted rounded-full px-2.5 py-1">
                    <Text size="2xs" className="text-foreground font-medium">
                      {skill}
                    </Text>
                  </Box>
                ))}
              </HStack>
            )}
          </VStack>

          <Divider />

          {/* Preferences */}
          <VStack space="xs">
            <HStack className="items-center" space="xs">
              <Icon as={Globe} size="xs" className="text-primary" />
              <Text size="xs" className="text-foreground">
                {profile.workModes.length > 0 ? profile.workModes.join(', ') : 'Mode flexible'} •{' '}
                {profile.contractTypes.length > 0 ? profile.contractTypes.join(', ') : 'CDI'}
              </Text>
            </HStack>

            <HStack className="items-center" space="xs">
              <Icon as={Banknote} size="xs" className="text-secondary" />
              <Text size="xs" bold className="text-on-secondary-container">
                Objectif : {profile.minSalaryK} 000 €+ / an
              </Text>
              <Text size="xs" className="text-muted-foreground">
                • {profile.availability}
              </Text>
            </HStack>

            <HStack className="items-center" space="xs">
              <Icon as={FileText} size="xs" className="text-muted-foreground" />
              <Text size="xs" className="text-muted-foreground">
                {profile.cvFile
                  ? `CV attaché : ${profile.cvFile.name}`
                  : 'Aucun CV importé (ajoutable dans Profil)'}
              </Text>
            </HStack>

            <HStack className="items-center" space="xs">
              <Icon as={Briefcase} size="xs" className="text-muted-foreground" />
              <Text size="xs" className="text-muted-foreground">
                Candidature en 1 clic : {profile.oneClickApplyEnabled ? 'Activée' : 'Désactivée'}
              </Text>
            </HStack>
          </VStack>
        </VStack>
      </Card>
    </VStack>
  );
}
