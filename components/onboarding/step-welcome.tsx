import React from 'react';
import { Briefcase, CheckCircle2, MapPin, ShieldCheck, User, Zap } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import type { CandidateProfile } from '@/context/profile-context';

interface StepWelcomeProps {
  profile: CandidateProfile;
  onChange: (partial: Partial<CandidateProfile>) => void;
}

const VALUE_PROPS = [
  {
    icon: ShieldCheck,
    text: 'Salaires transparents affichés sur chaque offre',
  },
  {
    icon: CheckCircle2,
    text: 'Entreprises vérifiées en recrutement actif',
  },
  {
    icon: Zap,
    text: 'Candidature en 1 clic avec votre CV enregistré',
  },
];

export function StepWelcome({ profile, onChange }: StepWelcomeProps) {
  return (
    <VStack space="lg">
      <VStack space="xs">
        <Box className="bg-primary-fixed self-start rounded-full px-3 py-1">
          <Text size="xs" bold className="text-on-primary-fixed">
            Bienvenue sur Jobma
          </Text>
        </Box>
        <Heading size="2xl" bold className="text-foreground tracking-tight">
          Votre prochaine opportunité, sans friction.
        </Heading>
        <Text size="sm" className="text-muted-foreground">
          Configurons votre profil en 1 minute pour vous proposer les offres les plus pertinentes.
        </Text>
      </VStack>

      {/* Value Props */}
      <Card className="bg-card border-border rounded-2xl border p-4">
        <VStack space="sm">
          {VALUE_PROPS.map((item) => (
            <HStack key={item.text} className="items-center" space="sm">
              <Box className="bg-secondary-container/60 h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                <Icon as={item.icon} size="sm" className="text-secondary" />
              </Box>
              <Text size="xs" className="text-foreground flex-1 font-medium">
                {item.text}
              </Text>
            </HStack>
          ))}
        </VStack>
      </Card>

      {/* Identity Form */}
      <VStack space="md">
        <VStack space="xs">
          <Text size="xs" bold className="text-foreground">
            Nom complet *
          </Text>
          <Input className="bg-card border-border h-12 rounded-xl px-3">
            <InputSlot className="pr-1">
              <InputIcon as={User} className="text-muted-foreground" />
            </InputSlot>
            <InputField
              value={profile.fullName}
              onChangeText={(fullName) => onChange({ fullName })}
              placeholder="Ex : Sarah Martin"
              className="text-foreground text-sm"
            />
          </Input>
        </VStack>

        <VStack space="xs">
          <Text size="xs" bold className="text-foreground">
            Poste recherché ou titre actuel *
          </Text>
          <Input className="bg-card border-border h-12 rounded-xl px-3">
            <InputSlot className="pr-1">
              <InputIcon as={Briefcase} className="text-muted-foreground" />
            </InputSlot>
            <InputField
              value={profile.headline}
              onChangeText={(headline) => onChange({ headline })}
              placeholder="Ex : Senior Product Designer"
              className="text-foreground text-sm"
            />
          </Input>
        </VStack>

        <VStack space="xs">
          <Text size="xs" bold className="text-foreground">
            Ville ou zone souhaitée
          </Text>
          <Input className="bg-card border-border h-12 rounded-xl px-3">
            <InputSlot className="pr-1">
              <InputIcon as={MapPin} className="text-muted-foreground" />
            </InputSlot>
            <InputField
              value={profile.location}
              onChangeText={(location) => onChange({ location })}
              placeholder="Ex : Paris, Lyon ou Full Remote"
              className="text-foreground text-sm"
            />
          </Input>
        </VStack>
      </VStack>
    </VStack>
  );
}
