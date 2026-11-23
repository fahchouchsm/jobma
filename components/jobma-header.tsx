import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Uniwind, useUniwind } from 'uniwind';
import { ArrowLeft, MoonStar, Share2, Sun } from 'lucide-react-native';
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
}

export function JobmaHeader({ title, showBack = false, onBack, onShare }: JobmaHeaderProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useUniwind();

  const toggleTheme = () => {
    Uniwind.setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Box
      className="bg-card/90 border-border z-50 border-b"
      style={{ paddingTop: Platform.OS === 'web' ? 8 : insets.top }}>
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
          <HStack className="min-w-0 flex-1 items-center" space="xs">
            <Text size="lg" bold className="text-primary tracking-tight">
              Jobma
            </Text>
            <Text size="md" className="text-border">
              •
            </Text>
            <Heading size="sm" bold isTruncated className="text-foreground flex-1">
              {title}
            </Heading>
          </HStack>
        </HStack>

        <HStack className="shrink-0 items-center" space="xs">
          {onShare && (
            <Pressable
              accessibilityLabel="Partager"
              onPress={onShare}
              className="active:bg-muted h-10 w-10 items-center justify-center rounded-full">
              <Icon as={Share2} size="md" className="text-muted-foreground" />
            </Pressable>
          )}

          <Pressable
            accessibilityLabel="Changer le thème"
            onPress={toggleTheme}
            className="active:bg-muted h-10 w-10 items-center justify-center rounded-full">
            <Icon
              as={theme === 'dark' ? Sun : MoonStar}
              size="md"
              className="text-muted-foreground"
            />
          </Pressable>

          <Box className="pl-1">
            <Avatar className="border-primary/20 h-8 w-8 border-2">
              <AvatarFallbackText>SM</AvatarFallbackText>
              <AvatarImage source={{ uri: USER_PROFILE_AVATAR }} />
            </Avatar>
          </Box>
        </HStack>
      </HStack>
    </Box>
  );
}
