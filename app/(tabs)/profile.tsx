import React from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { useUniwind } from 'uniwind';
import {
  Banknote,
  Bell,
  Bookmark,
  Briefcase,
  CheckCircle2,
  Eye,
  FileText,
  Globe,
  Mail,
  MapPin,
  MoonStar,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Sun,
  UploadCloud,
} from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { JobmaHeader } from '@/components/jobma-header';
import { useJobs } from '@/context/jobs-context';
import { useProfile } from '@/context/profile-context';
import { USER_PROFILE_AVATAR } from '@/data/jobs';
import { triggerHaptic } from '@/lib/haptics';

function SettingToggleRow({
  icon,
  title,
  subtitle,
  enabled,
  onToggle,
}: {
  icon: typeof Bell;
  title: string;
  subtitle: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable onPress={onToggle} className="py-2.5 active:opacity-80">
      <HStack className="items-center justify-between" space="md">
        <HStack className="flex-1 items-center" space="md">
          <Box className="bg-muted h-9 w-9 shrink-0 items-center justify-center rounded-xl">
            <Icon as={icon} size="sm" className="text-primary" />
          </Box>
          <VStack className="flex-1">
            <Text size="sm" bold className="text-foreground">
              {title}
            </Text>
            <Text size="xs" className="text-muted-foreground">
              {subtitle}
            </Text>
          </VStack>
        </HStack>

        <Box
          className={`h-6 w-11 justify-center rounded-full p-0.5 ${
            enabled ? 'bg-primary' : 'bg-muted'
          }`}>
          <Box className={`bg-card h-5 w-5 rounded-full ${enabled ? 'self-end' : 'self-start'}`} />
        </Box>
      </HStack>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { theme } = useUniwind();
  const { savedIds, appliedIds } = useJobs();
  const { profile, settings, savedAlerts, updateProfile, updateSettings, resetOnboarding } =
    useProfile();
  const isDark = theme === 'dark';

  const initials = (profile.fullName || 'JM')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const toggleTheme = () => {
    triggerHaptic('light');
    updateSettings({ themePreference: isDark ? 'light' : 'dark' });
  };

  const handlePickCv = async () => {
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
      updateProfile({
        cvFile: {
          name: asset.name,
          size: asset.size,
          uri: asset.uri,
          mimeType: asset.mimeType,
        },
      });
    }
  };

  const handleRelaunchOnboarding = async () => {
    triggerHaptic('light');
    await resetOnboarding();
    router.replace('/onboarding');
  };

  return (
    <Box className="bg-background flex-1">
      <JobmaHeader title="Mon profil" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(300)}>
          <VStack space="md" className="px-4 pt-4">
            {/* Profile Identity Card */}
            <Card className="bg-card border-border rounded-2xl border p-4 shadow-xs">
              <VStack space="md">
                <HStack className="items-center" space="md">
                  <Avatar className="border-primary/20 h-16 w-16 border-2">
                    <AvatarFallbackText>{initials}</AvatarFallbackText>
                    <AvatarImage source={{ uri: USER_PROFILE_AVATAR }} />
                  </Avatar>
                  <VStack space="xs" className="flex-1">
                    <Heading size="lg" bold className="text-foreground">
                      {profile.fullName}
                    </Heading>
                    <Text size="sm" className="text-muted-foreground">
                      {profile.headline} • {profile.experienceLevel}
                    </Text>
                    <HStack className="items-center" space="xs">
                      <Icon as={MapPin} size="xs" className="text-primary" />
                      <Text size="xs" className="text-muted-foreground">
                        {profile.location}
                      </Text>
                    </HStack>
                  </VStack>
                </HStack>

                <HStack className="flex-wrap gap-2">
                  <Box className="bg-secondary-container/50 rounded-full px-3 py-1.5">
                    <HStack className="items-center" space="xs">
                      <Icon as={Banknote} size="xs" className="text-secondary" />
                      <Text size="xs" bold className="text-on-secondary-container">
                        {profile.minSalaryK}k+ € / an
                      </Text>
                    </HStack>
                  </Box>

                  {profile.workModes.length > 0 && (
                    <Box className="bg-muted rounded-full px-3 py-1.5">
                      <HStack className="items-center" space="xs">
                        <Icon as={Globe} size="xs" className="text-primary" />
                        <Text size="xs" className="text-foreground font-medium">
                          {profile.workModes.join(', ')}
                        </Text>
                      </HStack>
                    </Box>
                  )}
                </HStack>

                {profile.oneClickApplyEnabled && (
                  <Box className="bg-secondary-container/50 rounded-xl px-3 py-2">
                    <HStack className="items-center" space="xs">
                      <Icon as={CheckCircle2} size="sm" className="text-secondary" />
                      <Text size="xs" bold className="text-on-secondary-container">
                        Profil prêt pour la candidature en 1 clic
                      </Text>
                    </HStack>
                  </Box>
                )}
              </VStack>
            </Card>

            {/* CV Card */}
            <Card className="bg-card border-border rounded-2xl border p-4 shadow-xs">
              <VStack space="sm">
                <HStack className="items-center justify-between">
                  <HStack className="items-center" space="xs">
                    <Icon as={FileText} size="sm" className="text-primary" />
                    <Heading size="sm" bold className="text-foreground">
                      Mon CV
                    </Heading>
                  </HStack>
                  <Pressable onPress={handlePickCv}>
                    <Text size="xs" bold className="text-primary">
                      {profile.cvFile ? 'Remplacer' : 'Importer'}
                    </Text>
                  </Pressable>
                </HStack>

                {profile.cvFile ? (
                  <HStack className="bg-muted items-center rounded-xl p-3" space="sm">
                    <Icon as={FileText} size="md" className="text-secondary" />
                    <VStack className="min-w-0 flex-1">
                      <Text size="xs" bold isTruncated className="text-foreground">
                        {profile.cvFile.name}
                      </Text>
                      <Text size="2xs" className="text-muted-foreground">
                        Utilisé automatiquement pour 1-clic
                      </Text>
                    </VStack>
                  </HStack>
                ) : (
                  <Button variant="outline" size="sm" onPress={handlePickCv}>
                    <ButtonIcon as={UploadCloud} />
                    <ButtonText>Importer un CV (PDF, DOCX)</ButtonText>
                  </Button>
                )}
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
                  {profile.skills.map((skill) => (
                    <Box key={skill} className="bg-muted rounded-full px-3 py-1.5">
                      <Text size="xs" className="text-foreground font-medium">
                        {skill}
                      </Text>
                    </Box>
                  ))}
                </HStack>
              </VStack>
            </Card>

            {/* Settings & Preferences */}
            <Card className="bg-card border-border rounded-2xl border p-4 shadow-xs">
              <VStack space="xs">
                <Heading size="sm" bold className="text-foreground mb-1">
                  Paramètres & Alertes
                </Heading>

                <SettingToggleRow
                  icon={Eye}
                  title="Visible par les recruteurs"
                  subtitle="Statut Open to Work actif sur votre profil"
                  enabled={settings.recruiterVisibility}
                  onToggle={() => {
                    triggerHaptic('light');
                    updateSettings({
                      recruiterVisibility: !settings.recruiterVisibility,
                    });
                  }}
                />
                <Divider className="bg-border/60" />

                <SettingToggleRow
                  icon={Bell}
                  title="Alertes emploi instantanées"
                  subtitle={`${savedAlerts.length} alerte(s) active(s) configurée(s)`}
                  enabled={settings.jobAlertsEnabled}
                  onToggle={() => {
                    triggerHaptic('light');
                    updateSettings({
                      jobAlertsEnabled: !settings.jobAlertsEnabled,
                    });
                  }}
                />
                <Divider className="bg-border/60" />

                <SettingToggleRow
                  icon={Mail}
                  title="Sélection hebdomadaire"
                  subtitle="Recevoir le top 5 des offres chaque lundi"
                  enabled={settings.emailDigestEnabled}
                  onToggle={() => {
                    triggerHaptic('light');
                    updateSettings({
                      emailDigestEnabled: !settings.emailDigestEnabled,
                    });
                  }}
                />
                <Divider className="bg-border/60" />

                <SettingToggleRow
                  icon={ShieldCheck}
                  title="Salaires transparents uniquement"
                  subtitle="Masquer les offres sans fourchette salariale"
                  enabled={settings.salaryTransparencyOnly}
                  onToggle={() => {
                    triggerHaptic('light');
                    updateSettings({
                      salaryTransparencyOnly: !settings.salaryTransparencyOnly,
                    });
                  }}
                />
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
                        {isDark ? 'Mode sombre Instagram actif' : 'Mode clair JobPulse actif'}
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

            {/* Relaunch Onboarding */}
            <Button
              variant="outline"
              size="lg"
              onPress={handleRelaunchOnboarding}
              className="rounded-xl">
              <ButtonIcon as={RotateCcw} />
              <ButtonText>Modifier mon profil & CV</ButtonText>
            </Button>
          </VStack>
        </Animated.View>
      </ScrollView>
    </Box>
  );
}
