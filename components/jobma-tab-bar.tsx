import React from 'react';
import { Platform } from 'react-native';
import type { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bookmark, Briefcase, Compass, User } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Pressable } from '@/components/ui/pressable';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useJobs } from '@/context/jobs-context';
import { triggerHaptic } from '@/lib/haptics';

const TAB_CONFIG: Record<string, { label: string; icon: typeof Compass }> = {
  index: { label: 'Découvrir', icon: Compass },
  saved: { label: 'Favoris', icon: Bookmark },
  applications: { label: 'Candidatures', icon: Briefcase },
  profile: { label: 'Profil', icon: User },
};

type BottomTabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];

export function JobmaTabBar({ state, descriptors, emitter, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { savedIds, appliedIds } = useJobs();

  return (
    <Box
      className="bg-card border-border border-t px-2 pt-2 shadow-lg"
      style={{
        paddingBottom: Platform.OS === 'web' ? 10 : Math.max(insets.bottom, 10),
      }}>
      <HStack className="items-center justify-around">
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const config = TAB_CONFIG[route.name] ?? {
            label: options.title ?? route.name,
            icon: Compass,
          };

          const badgeCount =
            route.name === 'saved'
              ? savedIds.length
              : route.name === 'applications'
                ? appliedIds.length
                : 0;

          const onPress = () => {
            const event = emitter.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              triggerHaptic('light');
              navigateToTab(route.key);
            }
          };

          const onLongPress = () => {
            emitter.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? config.label}
              onPress={onPress}
              onLongPress={onLongPress}
              className="flex-1 items-center justify-center py-1 active:opacity-80">
              <VStack className="items-center" space="xs">
                <Box
                  className={`relative h-8 items-center justify-center rounded-2xl px-4 ${
                    isFocused ? 'bg-primary-fixed' : 'bg-transparent'
                  }`}>
                  <Icon
                    as={config.icon}
                    size="md"
                    className={isFocused ? 'text-primary' : 'text-muted-foreground'}
                  />
                  {badgeCount > 0 && (
                    <Box className="bg-secondary absolute -top-0.5 right-1.5 h-4 min-w-4 items-center justify-center rounded-full px-1">
                      <Text size="2xs" bold className="text-secondary-foreground">
                        {badgeCount}
                      </Text>
                    </Box>
                  )}
                </Box>
                <Text
                  size="2xs"
                  bold={isFocused}
                  className={isFocused ? 'text-primary' : 'text-muted-foreground'}>
                  {config.label}
                </Text>
              </VStack>
            </Pressable>
          );
        })}
      </HStack>
    </Box>
  );
}
