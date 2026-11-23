import React, { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Box } from '@/components/ui/box';

export function AnimatedProgressBar({ progress }: { progress: number }) {
  const widthPct = useSharedValue(progress);

  useEffect(() => {
    widthPct.value = withTiming(progress, {
      duration: 180,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, widthPct]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${widthPct.value}%`,
  }));

  return (
    <Box className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
      <Animated.View style={[{ height: '100%', borderRadius: 999 }, animatedStyle]}>
        <Box className="bg-primary h-full w-full rounded-full" />
      </Animated.View>
    </Box>
  );
}
