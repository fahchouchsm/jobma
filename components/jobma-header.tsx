import React from 'react';
import { Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';
import { ArrowLeft, Bookmark, Share2 } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { Icon } from '@/components/ui/icon';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { USER_PROFILE_AVATAR } from '@/data/jobs';

interface JobmaHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  onShare?: () => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
  onAvatarPress?: () => void;
}

export function JobmaHeader({
  title,
  showBack = false,
  onBack,
  onShare,
  isSaved,
  onToggleSave,
  onAvatarPress,
}: JobmaHeaderProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useUniwind();
  const isDark = theme === 'dark';

  const content = (
    <HStack className="h-14 items-center justify-between px-3" space="xs">
      <HStack className="min-w-0 flex-1 items-center" space="xs">
        {showBack && (
          <Pressable
            accessibilityLabel="Retour"
            onPress={onBack}
            className="active:bg-muted h-10 w-10 items-center justify-center rounded-full">
            <Icon as={ArrowLeft} size="lg" className="text-foreground" />
          </Pressable>
        )}
        <HStack className="min-w-0 flex-1 items-center px-1" space="xs">
          <Text size="lg" bold className="text-primary tracking-tight">
            Jobma
          </Text>
          <Text size="md" className="text-muted-foreground/50">
            •
          </Text>
          <Heading size="sm" bold isTruncated className="text-foreground flex-1">
            {title}
          </Heading>
        </HStack>
      </HStack>

      <HStack className="shrink-0 items-center" space="xs">
        {onToggleSave && (
          <Pressable
            accessibilityLabel="Sauvegarder l'offre"
            onPress={onToggleSave}
            className="active:bg-muted h-10 w-10 items-center justify-center rounded-full">
            <Icon
              as={Bookmark}
              size="md"
              className={isSaved ? 'text-primary fill-primary' : 'text-muted-foreground'}
            />
          </Pressable>
        )}

        {onShare && (
          <Pressable
            accessibilityLabel="Partager"
            onPress={onShare}
            className="active:bg-muted h-10 w-10 items-center justify-center rounded-full">
            <Icon as={Share2} size="md" className="text-muted-foreground" />
          </Pressable>
        )}

        {!showBack && (
          <Pressable
            accessibilityLabel="Mon profil"
            onPress={onAvatarPress}
            className="pl-1 active:opacity-80">
            <Avatar className="border-primary/20 h-8 w-8 border-2">
              <AvatarFallbackText>SM</AvatarFallbackText>
              <AvatarImage source={{ uri: USER_PROFILE_AVATAR }} />
            </Avatar>
          </Pressable>
        )}
      </HStack>
    </HStack>
  );

  const paddingTop = Platform.OS === 'web' ? 8 : insets.top;

  if (Platform.OS === 'ios' || Platform.OS === 'web') {
    return (
      <BlurView
        intensity={75}
        tint={isDark ? 'dark' : 'light'}
        style={{ paddingTop }}
        className="border-border/70 bg-card/75 z-50 border-b">
        {content}
      </BlurView>
    );
  }

  return (
    <Box className="bg-card border-border z-50 border-b" style={{ paddingTop }}>
      {content}
    </Box>
  );
}
