import React from 'react';
import { Tabs } from 'expo-router';
import { JobmaTabBar } from '@/components/jobma-tab-bar';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <JobmaTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: 'Découvrir' }} />
      <Tabs.Screen name="saved" options={{ title: 'Favoris' }} />
      <Tabs.Screen name="applications" options={{ title: 'Candidatures' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
    </Tabs>
  );
}
