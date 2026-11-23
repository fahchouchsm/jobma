import React, { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Box } from '@/components/ui/box';

export function PulseDot() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(withTiming(1.45, { duration: 900 }), withTiming(1, { duration: 900 })),
      -1,
      false
    );
    opacity.value = withRepeat(
      withSequence(withTiming(0.45, { duration: 900 }), withTiming(1, { duration: 900 })),
      -1,
      false
    );
  }, [opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Box className="bg-secondary h-1.5 w-1.5 rounded-full" />
    </Animated.View>
  );
}
