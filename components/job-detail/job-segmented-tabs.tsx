import React from 'react';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { triggerHaptic } from '@/lib/haptics';

export type JobDetailTabId = 'overview' | 'requirements' | 'company' | 'benefits';

const TABS: { id: JobDetailTabId; label: string }[] = [
  { id: 'overview', label: 'Aperçu' },
  { id: 'requirements', label: 'Prérequis' },
  { id: 'company', label: 'Entreprise' },
  { id: 'benefits', label: 'Avantages' },
];

interface JobSegmentedTabsProps {
  activeTab: JobDetailTabId;
  onChange: (tab: JobDetailTabId) => void;
}

export function JobSegmentedTabs({ activeTab, onChange }: JobSegmentedTabsProps) {
  return (
    <Box className="bg-background/95 px-4 pt-1 pb-3">
      <HStack className="bg-muted rounded-xl p-1" space="xs">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => {
                triggerHaptic('light');
                onChange(tab.id);
              }}
              className={`flex-1 items-center justify-center rounded-lg py-2 ${
                isActive ? 'bg-card shadow-2xs' : ''
              }`}>
              <Text
                size="xs"
                bold={isActive}
                className={isActive ? 'text-primary' : 'text-muted-foreground'}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </HStack>
    </Box>
  );
}
