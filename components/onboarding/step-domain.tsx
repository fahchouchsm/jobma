import React, { useState } from 'react';
import {
  BarChart3,
  BrainCircuit,
  Code2,
  Compass,
  Landmark,
  Palette,
  Plus,
  X,
} from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import type { CandidateProfile, ExperienceLevel, JobDomain } from '@/context/profile-context';
import { triggerHaptic } from '@/lib/haptics';

interface StepDomainProps {
  profile: CandidateProfile;
  onChange: (partial: Partial<CandidateProfile>) => void;
}

const DOMAIN_OPTIONS: {
  id: JobDomain;
  label: string;
  subtitle: string;
  icon: typeof Palette;
}[] = [
  {
    id: 'Design',
    label: 'Design & UX',
    subtitle: 'Product, UI, Research',
    icon: Palette,
  },
  {
    id: 'Engineering',
    label: 'Engineering',
    subtitle: 'Web, Mobile, Cloud',
    icon: Code2,
  },
  {
    id: 'Product',
    label: 'Produit',
    subtitle: 'PM, Strategy, Ops',
    icon: Compass,
  },
  {
    id: 'IA & Data',
    label: 'IA & Data',
    subtitle: 'ML, Analytics, LLM',
    icon: BrainCircuit,
  },
  {
    id: 'Marketing',
    label: 'Growth',
    subtitle: 'Brand, Acquisition',
    icon: BarChart3,
  },
  {
    id: 'Finance',
    label: 'Finance & Ops',
    subtitle: 'FinTech, Stratégie',
    icon: Landmark,
  },
];

const EXPERIENCE_LEVELS: { id: ExperienceLevel; label: string }[] = [
  { id: 'Junior', label: 'Junior (0-2 ans)' },
  { id: 'Confirmé', label: 'Confirmé (2-5 ans)' },
  { id: 'Senior', label: 'Senior (5-8 ans)' },
  { id: 'Lead / Staff', label: 'Lead / Staff (8+)' },
];

const SUGGESTED_SKILLS: Record<JobDomain, string[]> = {
  Design: ['Product Design', 'Figma', 'Design Systems', 'Prototypage', 'UX Research'],
  Engineering: ['TypeScript', 'React Native', 'React', 'Node.js', 'GraphQL'],
  Product: ['Product Strategy', 'Discovery', 'Roadmap', 'SQL', 'A/B Testing'],
  'IA & Data': ['Python', 'LLM / Agents', 'PyTorch', 'dbt', 'Data Modeling'],
  Marketing: ['Growth', 'SEO / SEA', 'CRM', 'Product Marketing', 'Analytics'],
  Finance: ['FP&A', 'Modélisation', 'FinTech', 'Audit', 'Strategy'],
};

export function StepDomain({ profile, onChange }: StepDomainProps) {
  const [customSkill, setCustomSkill] = useState('');

  const toggleDomain = (domain: JobDomain) => {
    triggerHaptic('light');
    const exists = profile.domains.includes(domain);
    const next = exists
      ? profile.domains.filter((d) => d !== domain)
      : [...profile.domains, domain];
    onChange({ domains: next });
  };

  const toggleSkill = (skill: string) => {
    triggerHaptic('light');
    const exists = profile.skills.includes(skill);
    const next = exists ? profile.skills.filter((s) => s !== skill) : [...profile.skills, skill];
    onChange({ skills: next });
  };

  const addCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (!trimmed) return;
    if (!profile.skills.includes(trimmed)) {
      onChange({ skills: [...profile.skills, trimmed] });
    }
    setCustomSkill('');
  };

  const activeSuggestions = Array.from(
    new Set(
      (profile.domains.length > 0 ? profile.domains : (['Design'] as JobDomain[])).flatMap(
        (d) => SUGGESTED_SKILLS[d]
      )
    )
  ).slice(0, 10);

  return (
    <VStack space="lg">
      <VStack space="xs">
        <Heading size="xl" bold className="text-foreground">
          Quel est votre domaine ?
        </Heading>
        <Text size="sm" className="text-muted-foreground">
          Sélectionnez un ou plusieurs domaines pour personnaliser votre flux d'offres.
        </Text>
      </VStack>

      {/* 2-Column Domain Grid */}
      <Box className="flex-row flex-wrap justify-between gap-y-2.5">
        {DOMAIN_OPTIONS.map((item) => {
          const selected = profile.domains.includes(item.id);
          return (
            <Pressable
              key={item.id}
              onPress={() => toggleDomain(item.id)}
              className={`w-[48.5%] rounded-2xl border p-3.5 ${
                selected ? 'bg-primary-fixed border-primary' : 'bg-card border-border'
              }`}>
              <VStack space="xs">
                <Box
                  className={`h-9 w-9 items-center justify-center rounded-xl ${
                    selected ? 'bg-primary' : 'bg-muted'
                  }`}>
                  <Icon
                    as={item.icon}
                    size="sm"
                    className={selected ? 'text-primary-foreground' : 'text-muted-foreground'}
                  />
                </Box>
                <Text
                  size="sm"
                  bold
                  className={selected ? 'text-on-primary-fixed' : 'text-foreground'}>
                  {item.label}
                </Text>
                <Text size="2xs" className="text-muted-foreground">
                  {item.subtitle}
                </Text>
              </VStack>
            </Pressable>
          );
        })}
      </Box>

      {/* Experience Level */}
      <VStack space="xs">
        <Text size="xs" bold className="text-foreground">
          Niveau d'expérience
        </Text>
        <HStack className="flex-wrap gap-2">
          {EXPERIENCE_LEVELS.map((lvl) => {
            const active = profile.experienceLevel === lvl.id;
            return (
              <Pressable
                key={lvl.id}
                onPress={() => {
                  triggerHaptic('light');
                  onChange({ experienceLevel: lvl.id });
                }}
                className={`rounded-full border px-3.5 py-2 ${
                  active ? 'bg-primary-fixed border-primary' : 'bg-card border-border'
                }`}>
                <Text
                  size="xs"
                  bold={active}
                  className={active ? 'text-primary' : 'text-muted-foreground'}>
                  {lvl.label}
                </Text>
              </Pressable>
            );
          })}
        </HStack>
      </VStack>

      {/* Skills */}
      <VStack space="sm">
        <Text size="xs" bold className="text-foreground">
          Compétences clés ({profile.skills.length})
        </Text>

        <Input className="bg-card border-border h-11 rounded-xl px-3">
          <InputField
            value={customSkill}
            onChangeText={setCustomSkill}
            onSubmitEditing={addCustomSkill}
            placeholder="Ajouter une compétence (ex : Next.js)"
            className="text-foreground text-sm"
          />
          <InputSlot onPress={addCustomSkill}>
            <InputIcon as={Plus} className="text-primary" />
          </InputSlot>
        </Input>

        <HStack className="flex-wrap gap-2">
          {Array.from(new Set([...profile.skills, ...activeSuggestions])).map((skill) => {
            const selected = profile.skills.includes(skill);
            return (
              <Pressable
                key={skill}
                onPress={() => toggleSkill(skill)}
                className={`flex-row items-center gap-1 rounded-full border px-3 py-1.5 ${
                  selected ? 'bg-secondary-container/60 border-secondary' : 'bg-card border-border'
                }`}>
                <Text
                  size="xs"
                  bold={selected}
                  className={selected ? 'text-on-secondary-container' : 'text-muted-foreground'}>
                  {skill}
                </Text>
                {selected && <Icon as={X} size="xs" className="text-on-secondary-container" />}
              </Pressable>
            );
          })}
        </HStack>
      </VStack>
    </VStack>
  );
}
