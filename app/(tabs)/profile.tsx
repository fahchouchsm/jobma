import React from 'react';
import { useRouter } from 'expo-router';
import { Uniwind, useUniwind } from 'uniwind';
import {
  Bookmark,
  Briefcase,
  CheckCircle2,
  MapPin,
  MoonStar,
  Sparkles,
  Sun,
} from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { JobmaHeader } from '@/components/jobma-header';
import { USER_PROFILE_AVATAR } from '@/data/jobs';
import { useJobs } from '@/context/jobs-context';

const SKILLS = [
  'Product Design',
  'Design Systems',
  'Figma',
  'React Native',
  'Prototypage',
  'User Research',
];

export default function ProfileScreen() {
  const router = useRouter();
  const { theme } = useUniwind();
  const { savedIds, appliedIds } = useJobs();
  const isDark = theme === 'dark';

  const toggleTheme = () => {
    Uniwind.setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <Box className="bg-background flex-1">
      <JobmaHeader title="Mon profil" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}>
        <VStack space="md" className="px-4 pt-4">
          {/* Profile Identity Card */}
          <Card className="bg-card border-border rounded-2xl border p-4 shadow-xs">
            <VStack space="md">
              <HStack className="items-center" space="md">
                <Avatar className="border-primary/20 h-16 w-16 border-2">
                  <AvatarFallbackText>SM</AvatarFallbackText>
                  <AvatarImage source={{ uri: USER_PROFILE_AVATAR }} />
                </Avatar>
                <VStack space="xs" className="flex-1">
                  <Heading size="lg" bold className="text-foreground">
                    Sarah Martin
                  </Heading>
                  <Text size="sm" className="text-muted-foreground">
                    Senior Product Designer
                  </Text>
                  <HStack className="items-center" space="xs">
                    <Icon as={MapPin} size="xs" className="text-primary" />
                    <Text size="xs" className="text-muted-foreground">
                      Paris • Ouverte au télétravail
                    </Text>
                  </HStack>
                </VStack>
              </HStack>

              <Box className="bg-secondary-container/50 rounded-xl px-3 py-2">
                <HStack className="items-center" space="xs">
                  <Icon as={CheckCircle2} size="sm" className="text-secondary" />
                  <Text size="xs" bold className="text-on-secondary-container">
                    Profil prêt pour la candidature en 1 clic
                  </Text>
                </HStack>
              </Box>
            </VStack>
          </Card>

          {/* Activity Stats */}
          <HStack space="sm">
            <Pressable onPress={() => router.push('/saved')} className="flex-1 active:opacity-90">
              <Card className="bg-card border-border rounded-2xl border p-4">
                <VStack space="xs">
                  <Box className="bg-primary-fixed h-9 w-9 items-center justify-center rounded-xl">
                    <Icon as={Bookmark} size="sm" className="text-primary" />
                  </Box>
                  <Heading size="xl" bold className="text-foreground">
                    {savedIds.length}
                  </Heading>
                  <Text size="xs" className="text-muted-foreground">
                    Offres favorites
                  </Text>
                </VStack>
              </Card>
            </Pressable>

            <Pressable
              onPress={() => router.push('/applications')}
              className="flex-1 active:opacity-90">
              <Card className="bg-card border-border rounded-2xl border p-4">
                <VStack space="xs">
                  <Box className="bg-secondary-container/60 h-9 w-9 items-center justify-center rounded-xl">
                    <Icon as={Briefcase} size="sm" className="text-secondary" />
                  </Box>
                  <Heading size="xl" bold className="text-foreground">
                    {appliedIds.length}
                  </Heading>
                  <Text size="xs" className="text-muted-foreground">
                    Candidatures
                  </Text>
                </VStack>
              </Card>
            </Pressable>
          </HStack>

          {/* Skills */}
          <Card className="bg-card border-border rounded-2xl border p-4 shadow-xs">
            <VStack space="sm">
              <HStack className="items-center" space="xs">
                <Icon as={Sparkles} size="sm" className="text-primary" />
                <Heading size="sm" bold className="text-foreground">
                  Compétences clés
                </Heading>
              </HStack>
              <HStack className="flex-wrap gap-2">
                {SKILLS.map((skill) => (
                  <Box key={skill} className="bg-muted rounded-full px-3 py-1.5">
                    <Text size="xs" className="text-foreground font-medium">
                      {skill}
                    </Text>
                  </Box>
                ))}
              </HStack>
            </VStack>
          </Card>

          {/* Appearance Toggle */}
          <Pressable onPress={toggleTheme} className="active:opacity-90">
            <Card className="bg-card border-border rounded-2xl border p-4 shadow-xs">
              <HStack className="items-center justify-between">
                <HStack className="items-center" space="md">
                  <Box className="bg-muted h-10 w-10 items-center justify-center rounded-xl">
                    <Icon as={isDark ? Sun : MoonStar} size="md" className="text-primary" />
                  </Box>
                  <VStack>
                    <Text size="sm" bold className="text-foreground">
                      Apparence
                    </Text>
                    <Text size="xs" className="text-muted-foreground">
                      {isDark ? 'Mode sombre actif' : 'Mode clair JobPulse actif'}
                    </Text>
                  </VStack>
                </HStack>

                <Box className="bg-primary-fixed rounded-full px-3 py-1.5">
                  <Text size="xs" bold className="text-on-primary-fixed">
                    Basculer
                  </Text>
                </Box>
              </HStack>
            </Card>
          </Pressable>
        </VStack>
      </ScrollView>
    </Box>
  );
}
