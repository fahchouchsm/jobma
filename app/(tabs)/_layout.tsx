import React from 'react';
import { Platform } from 'react-native';
import { NativeTabs } from 'expo-router/native-tabs';
import { useUniwind } from 'uniwind';
import { useJobs } from '@/context/jobs-context';
import { THEME } from '@/lib/theme';

export default function TabsLayout() {
  const { theme } = useUniwind();
  const { savedIds, appliedIds } = useJobs();
  const isDark = theme === 'dark';
  const colors = THEME[isDark ? 'dark' : 'light'];

  return (
    <NativeTabs
      tintColor={colors.primary}
      backgroundColor={Platform.OS === 'android' ? colors.card : undefined}
      blurEffect={isDark ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight'}
      minimizeBehavior="onScrollDown"
      indicatorColor={isDark ? '#0D253F' : '#DDE1FF'}
      iconColor={{
        default: colors.mutedForeground,
        selected: colors.primary,
      }}
      labelStyle={{
        default: { color: colors.mutedForeground },
        selected: { color: colors.primary, fontWeight: '600' },
      }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf={{ default: 'safari', selected: 'safari.fill' }} md="explore" />
        <NativeTabs.Trigger.Label>Découvrir</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="saved">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'bookmark', selected: 'bookmark.fill' }}
          md="bookmark"
        />
        <NativeTabs.Trigger.Label>Favoris</NativeTabs.Trigger.Label>
        {savedIds.length > 0 && (
          <NativeTabs.Trigger.Badge>{String(savedIds.length)}</NativeTabs.Trigger.Badge>
        )}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="applications">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'briefcase', selected: 'briefcase.fill' }}
          md="work"
        />
        <NativeTabs.Trigger.Label>Candidatures</NativeTabs.Trigger.Label>
        {appliedIds.length > 0 && (
          <NativeTabs.Trigger.Badge>{String(appliedIds.length)}</NativeTabs.Trigger.Badge>
        )}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Icon
          sf={{
            default: 'person.crop.circle',
            selected: 'person.crop.circle.fill',
          }}
          md="person"
        />
        <NativeTabs.Trigger.Label>Profil</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
