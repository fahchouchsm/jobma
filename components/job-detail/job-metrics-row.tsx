import React from 'react';
import { Banknote, Clock, Medal, PieChart } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import type { JobMetric } from '@/data/jobs';

const METRIC_ICON_MAP: Record<JobMetric['icon'], typeof Banknote> = {
  payments: Banknote,
  schedule: Clock,
  level: Medal,
  equity: PieChart,
};

export function JobMetricsRow({ metrics }: { metrics: JobMetric[] }) {
  return (
    <Box className="mb-4">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {metrics.map((metric) => {
          const MetricIcon = METRIC_ICON_MAP[metric.icon];
          const containerClass =
            metric.tone === 'emerald'
              ? 'bg-secondary-container/45'
              : metric.tone === 'indigo'
                ? 'bg-primary-fixed/70'
                : 'bg-muted';
          const iconClass =
            metric.tone === 'emerald'
              ? 'text-secondary'
              : metric.tone === 'indigo'
                ? 'text-primary'
                : 'text-muted-foreground';
          const textClass =
            metric.tone === 'emerald'
              ? 'text-on-secondary-container'
              : metric.tone === 'indigo'
                ? 'text-on-primary-fixed'
                : 'text-foreground';

          return (
            <Box key={metric.id} className={`${containerClass} rounded-xl px-3 py-2 shadow-2xs`}>
              <HStack className="items-center" space="xs">
                <Icon as={MetricIcon} size="sm" className={iconClass} />
                <Text size="xs" bold={metric.tone === 'emerald'} className={textClass}>
                  {metric.label}
                </Text>
              </HStack>
            </Box>
          );
        })}
      </ScrollView>
    </Box>
  );
}
