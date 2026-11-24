import React, { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';

export function JobCardSkeleton() {
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(0.85, { duration: 750 }), withTiming(0.45, { duration: 750 })),
      -1,
      false
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Box className="bg-card border-border/80 rounded-2xl border p-4">
        <Box className="bg-muted h-4 w-4/5 rounded" />
        <Box className="bg-muted mt-2 h-3.5 w-36 rounded" />
        <Box className="bg-muted mt-1 h-3 w-48 rounded" />
        <HStack className="mt-3 gap-2">
          <Box className="bg-muted h-6 w-28 rounded-lg" />
          <Box className="bg-muted h-6 w-20 rounded-lg" />
          <Box className="bg-muted h-6 w-16 rounded-lg" />
        </HStack>
        <Box className="bg-muted mt-3 h-2.5 w-20 rounded" />
      </Box>
    </Animated.View>
  );
}
