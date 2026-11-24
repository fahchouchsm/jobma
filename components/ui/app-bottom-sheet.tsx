import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Platform } from 'react-native';
import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';
import { THEME } from '@/lib/theme';

export { BottomSheetTextInput };

interface AppBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  snapPoints?: (string | number)[];
  disableDismiss?: boolean;
  scrollable?: boolean;
  children: React.ReactNode;
}

export function AppBottomSheet({
  visible,
  onClose,
  snapPoints = ['62%', '90%'],
  disableDismiss = false,
  scrollable = true,
  children,
}: AppBottomSheetProps) {
  const modalRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();
  const { theme } = useUniwind();
  const colors = THEME[theme === 'dark' ? 'dark' : 'light'];

  const snapKey = snapPoints.join('|');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoSnapPoints = useMemo(() => snapPoints, [snapKey]);

  useEffect(() => {
    if (visible) {
      modalRef.current?.present();
    } else {
      modalRef.current?.dismiss();
    }
  }, [visible]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior={disableDismiss ? 'none' : 'close'}
        opacity={0.45}
      />
    ),
    [disableDismiss]
  );

  const paddingBottom = Platform.OS === 'web' ? 24 : Math.max(insets.bottom + 12, 24);

  return (
    <BottomSheetModal
      ref={modalRef}
      index={0}
      snapPoints={memoSnapPoints}
      stackBehavior="replace"
      enableDynamicSizing={false}
      enablePanDownToClose={!disableDismiss}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: colors.card,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
      }}
      handleIndicatorStyle={{
        backgroundColor: colors.border,
        width: 40,
        height: 4,
      }}>
      {scrollable ? (
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom,
          }}>
          {children}
        </BottomSheetScrollView>
      ) : (
        <BottomSheetView
          style={{
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom,
          }}>
          {children}
        </BottomSheetView>
      )}
    </BottomSheetModal>
  );
}
