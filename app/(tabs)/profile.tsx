import React, { useState } from 'react';
import { Alert } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { useUniwind } from 'uniwind';
import {
  Banknote,
  Bell,
  Bookmark,
  Briefcase,
  Camera,
  CheckCircle2,
  Eye,
  FileText,
  Globe,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  MoonStar,
  Pencil,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
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
import { AnimatedProgressBar } from '@/components/animated/animated-progress';
import { EditProfileSheet } from '@/components/profile/edit-profile-sheet';
import { useAuth } from '@/context/auth-context';
import { useJobs } from '@/context/jobs-context';
import { useProfile } from '@/context/profile-context';
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
        <HStack className="min-w-0 flex-1 items-center" space="md">
          <Box className="bg-muted h-9 w-9 shrink-0 items-center justify-center rounded-xl">
            <Icon as={icon} size="sm" className="text-primary" />
          </Box>
          <VStack className="min-w-0 flex-1">
            <Text size="sm" bold className="text-foreground">
              {title}
            </Text>
            <Text size="xs" className="text-muted-foreground">
              {subtitle}
            </Text>
          </VStack>
        </HStack>

        <Box
          className={`h-6 w-11 shrink-0 justify-center rounded-full p-0.5 ${
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
  const { user, isAuthenticated, logout, deleteAccount } = useAuth();
  const { savedIds, appliedIds } = useJobs();
  const {
    profile,
    cvFiles,
    settings,
    savedAlerts,
    isUploadingCv,
    isUploadingAvatar,
    saveProfile,
    updateSettings,
    uploadCv,
    removeCv,
    selectPrimaryCv,
    removeJobAlert,
    uploadAvatar,
    resetOnboarding,
  } = useProfile();
  const isDark = theme === 'dark';
  const [showEditProfile, setShowEditProfile] = useState(false);

  const avatarUri = user?.avatarUrl || profile.avatarUrl;

  const initials = (profile.fullName || 'JM')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const completenessChecks = [
    profile.fullName.trim().length > 1,
    profile.domains.length > 0,
    profile.skills.length > 0,
    Boolean(profile.cvFile),
    Boolean(profile.linkedinUrl || profile.portfolioUrl),
  ];
  const completenessPct = Math.round(
    (completenessChecks.filter(Boolean).length / completenessChecks.length) * 100
  );

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
      try {
        await uploadCv({
          name: asset.name,
          size: asset.size,
          uri: asset.uri,
          mimeType: asset.mimeType,
        });
        triggerHaptic('success');
      } catch {
        // Handled silently or retryable
      }
    }
  };

  const handlePickAvatar = async () => {
    if (!isAuthenticated || isUploadingAvatar) return;
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/jpeg', 'image/png', 'image/webp'],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      try {
        await uploadAvatar({
          uri: asset.uri,
          name: asset.name || 'avatar.jpg',
          mimeType: asset.mimeType || 'image/jpeg',
        });
        triggerHaptic('success');
      } catch {
        // Ignore upload error silently or allow retry
      }
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer mon compte',
      'Cette action est irréversible et supprimera votre profil, vos CV, vos favoris, vos candidatures et vos alertes.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            void deleteAccount()
              .then(() => {
                router.replace('/auth/login');
              })
              .catch(() => {});
          },
        },
      ]
    );
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
            {/* Account / Cloud Sync Banner */}
            <Card className="bg-card border-border rounded-2xl border p-4 shadow-xs">
              {isAuthenticated && user ? (
                <HStack className="items-center justify-between" space="sm">
                  <VStack className="min-w-0 flex-1">
                    <Text size="xs" bold className="text-secondary">
                      Compte synchronisé
                    </Text>
                    <Text size="sm" numberOfLines={1} className="text-foreground font-medium">
                      {user.email}
                    </Text>
                  </VStack>
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => {
                      triggerHaptic('light');
                      void logout();
                    }}
                    className="rounded-xl">
                    <ButtonIcon as={LogOut} />
                    <ButtonText>Déconnexion</ButtonText>
                  </Button>
                </HStack>
              ) : (
                <HStack className="items-center justify-between" space="sm">
                  <VStack className="min-w-0 flex-1">
                    <Text size="sm" bold className="text-foreground">
                      Synchronisez votre profil
                    </Text>
                    <Text size="xs" className="text-muted-foreground">
                      CV, favoris, alertes et offres ciblées dans le cloud.
                    </Text>
                  </VStack>
                  <Button
                    size="sm"
                    onPress={() => router.push('/auth/login')}
                    className="rounded-xl">
                    <ButtonIcon as={LogIn} />
                    <ButtonText>Connexion</ButtonText>
                  </Button>
                </HStack>
              )}
            </Card>

            {/* Profile Identity Card */}
            <Card className="bg-card border-border rounded-2xl border p-4 shadow-xs">
              <VStack space="md">
                <HStack className="items-center" space="md">
                  <Pressable
                    accessibilityLabel="Changer la photo de profil"
                    onPress={() => void handlePickAvatar()}
                    className="relative">
                    <Avatar className="border-primary/20 h-16 w-16 border-2">
                      <AvatarFallbackText>{initials}</AvatarFallbackText>
                      {avatarUri ? <AvatarImage source={{ uri: avatarUri }} /> : null}
                    </Avatar>
                    <Box className="bg-primary border-card absolute -right-0.5 -bottom-0.5 h-6 w-6 items-center justify-center rounded-full border-2">
                      <Icon as={Camera} size="2xs" className="text-primary-foreground" />
                    </Box>
                  </Pressable>
                  <VStack space="xs" className="min-w-0 flex-1">
                    <Heading size="lg" bold className="text-foreground">
                      {profile.fullName}
                    </Heading>
                    <Text size="sm" className="text-muted-foreground">
                      {profile.headline} • {profile.experienceLevel}
                    </Text>
                    <HStack className="items-center" space="xs">
                      <Icon as={MapPin} size="xs" className="text-primary shrink-0" />
                      <Text size="xs" className="text-muted-foreground flex-1">
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
                        {profile.minSalaryK}k+ MAD / mois
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
                      <Icon as={CheckCircle2} size="sm" className="text-secondary shrink-0" />
                      <Text size="xs" bold className="text-on-secondary-container flex-1">
                        Profil prêt pour la candidature en 1 clic
                      </Text>
                    </HStack>
                  </Box>
                )}
              </VStack>
            </Card>

            {/* Profile Completeness */}
            <Card className="bg-card border-border rounded-2xl border p-4 shadow-xs">
              <VStack space="xs">
                <HStack className="items-center justify-between">
                  <Text size="xs" bold className="text-foreground">
                    Complétude du profil
                  </Text>
                  <Text size="xs" bold className="text-primary">
                    {completenessPct}%
                  </Text>
                </HStack>
                <AnimatedProgressBar progress={completenessPct} />
                {completenessPct < 100 && (
                  <Text size="2xs" className="text-muted-foreground pt-0.5">
                    {!profile.cvFile
                      ? 'Astuce : importez votre CV pour atteindre 100% et postuler plus vite.'
                      : 'Ajoutez un lien LinkedIn ou Portfolio pour compléter votre profil.'}
                  </Text>
                )}
              </VStack>
            </Card>

            {/* CV Card (Multi-CV) */}
            <Card className="bg-card border-border rounded-2xl border p-4 shadow-xs">
              <VStack space="sm">
                <HStack className="items-center justify-between">
                  <HStack className="items-center" space="xs">
                    <Icon as={FileText} size="sm" className="text-primary" />
                    <Heading size="sm" bold className="text-foreground">
                      Mes CV ({cvFiles.length || (profile.cvFile ? 1 : 0)})
                    </Heading>
                  </HStack>
                  <Pressable onPress={handlePickCv} disabled={isUploadingCv}>
                    <Text size="xs" bold className="text-primary">
                      {isUploadingCv ? 'Envoi...' : '+ Ajouter'}
                    </Text>
                  </Pressable>
                </HStack>

                {(cvFiles.length > 0 ? cvFiles : profile.cvFile ? [profile.cvFile] : []).length >
                0 ? (
                  <VStack space="xs">
                    {(cvFiles.length > 0 ? cvFiles : profile.cvFile ? [profile.cvFile] : []).map(
                      (cv) => {
                        const isPrimary =
                          cv.isPrimary ||
                          (profile.cvFile?.id
                            ? cv.id === profile.cvFile.id
                            : cv.name === profile.cvFile?.name);
                        return (
                          <HStack
                            key={cv.id ?? cv.name}
                            className={`items-center rounded-xl border p-3 ${
                              isPrimary
                                ? 'bg-secondary-container/40 border-secondary/40'
                                : 'bg-muted border-transparent'
                            }`}
                            space="sm">
                            <Pressable
                              onPress={() => {
                                if (cv.id && !isPrimary) {
                                  triggerHaptic('light');
                                  void selectPrimaryCv(cv.id);
                                }
                              }}
                              className="min-w-0 flex-1 flex-row items-center gap-2.5">
                              <Icon
                                as={FileText}
                                size="md"
                                className={isPrimary ? 'text-secondary shrink-0' : 'text-muted-foreground shrink-0'}
                              />
                              <VStack className="min-w-0 flex-1">
                                <Text size="xs" bold isTruncated className="text-foreground">
                                  {cv.name}
                                </Text>
                                <Text size="2xs" className="text-muted-foreground">
                                  {isPrimary
                                    ? 'CV principal (1-clic)'
                                    : 'Appuyer pour définir comme principal'}
                                </Text>
                              </VStack>
                            </Pressable>

                            <Pressable
                              accessibilityLabel="Supprimer le CV"
                              onPress={() => {
                                triggerHaptic('light');
                                void removeCv(cv.id);
                              }}
                              className="p-1.5">
                              <Icon as={Trash2} size="sm" className="text-destructive" />
                            </Pressable>
                          </HStack>
                        );
                      }
                    )}
                  </VStack>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    isDisabled={isUploadingCv}
                    onPress={handlePickCv}>
                    <ButtonIcon as={UploadCloud} />
                    <ButtonText>
                      {isUploadingCv ? 'Envoi en cours...' : 'Importer un CV (PDF, DOCX)'}
                    </ButtonText>
                  </Button>
                )}
              </VStack>
            </Card>

            {/* Saved Job Alerts (Interactive) */}
            {savedAlerts.length > 0 && (
              <Card className="bg-card border-border rounded-2xl border p-4 shadow-xs">
                <VStack space="sm">
                  <HStack className="items-center" space="xs">
                    <Icon as={Bell} size="sm" className="text-primary" />
                    <Heading size="sm" bold className="text-foreground">
                      Mes alertes ({savedAlerts.length})
                    </Heading>
                  </HStack>

                  <VStack space="xs">
                    {savedAlerts.map((alert) => (
                      <HStack
                        key={alert.id}
                        className="bg-muted items-center justify-between rounded-xl px-3 py-2.5"
                        space="sm">
                        <Pressable
                          onPress={() => {
                            triggerHaptic('light');
                            router.push({
                              pathname: '/',
                              params: {
                                q: alert.query,
                                workMode: alert.workMode ?? '',
                                minSalary: alert.minSalaryK ? String(alert.minSalaryK) : '',
                              },
                            });
                          }}
                          className="min-w-0 flex-1">
                          <Text size="xs" bold numberOfLines={1} className="text-foreground">
                            {alert.query}
                          </Text>
                          <Text size="2xs" className="text-muted-foreground">
                            {alert.workMode ?? 'Tous modes'}
                            {alert.minSalaryK ? ` • ${alert.minSalaryK}k+ MAD` : ''} • Voir les offres →
                          </Text>
                        </Pressable>

                        <Pressable
                          accessibilityLabel="Supprimer l'alerte"
                          onPress={() => {
                            triggerHaptic('light');
                            removeJobAlert(alert.id);
                          }}
                          className="p-1.5">
                          <Icon as={Trash2} size="xs" className="text-destructive" />
                        </Pressable>
                      </HStack>
                    ))}
                  </VStack>
                </VStack>
              </Card>
            )}

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
                <HStack className="items-center justify-between" space="sm">
                  <HStack className="min-w-0 flex-1 items-center" space="md">
                    <Box className="bg-muted h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                      <Icon as={isDark ? Sun : MoonStar} size="md" className="text-primary" />
                    </Box>
                    <VStack className="min-w-0 flex-1">
                      <Text size="sm" bold className="text-foreground">
                        Apparence
                      </Text>
                      <Text size="xs" className="text-muted-foreground" numberOfLines={1}>
                        {isDark ? 'Mode sombre actif' : 'Mode clair actif'}
                      </Text>
                    </VStack>
                  </HStack>

                  <Box className="bg-primary-fixed shrink-0 rounded-full px-3 py-1.5">
                    <Text size="xs" bold className="text-on-primary-fixed">
                      Basculer
                    </Text>
                  </Box>
                </HStack>
              </Card>
            </Pressable>

            {/* Edit Profile In-Place + Secondary Onboarding Relaunch */}
            <VStack space="sm">
              <Button
                size="default"
                onPress={() => {
                  triggerHaptic('light');
                  setShowEditProfile(true);
                }}
                className="rounded-xl">
                <ButtonIcon as={Pencil} />
                <ButtonText className="font-bold">Modifier mon profil</ButtonText>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onPress={handleRelaunchOnboarding}
                className="rounded-xl">
                <ButtonIcon as={RotateCcw} />
                <ButtonText>Relancer l&apos;assistant de configuration</ButtonText>
              </Button>

              {isAuthenticated && (
                <Button
                  variant="outline"
                  size="sm"
                  onPress={handleDeleteAccount}
                  className="border-destructive/40 rounded-xl">
                  <ButtonIcon as={Trash2} className="text-destructive" />
                  <ButtonText className="text-destructive">Supprimer mon compte</ButtonText>
                </Button>
              )}
            </VStack>
          </VStack>
        </Animated.View>
      </ScrollView>

      <EditProfileSheet
        visible={showEditProfile}
        profile={profile}
        onSave={saveProfile}
        onClose={() => setShowEditProfile(false)}
      />
    </Box>
  );
}
