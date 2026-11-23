import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bookmark, CheckCheck, Zap } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';

interface JobApplyBarProps {
  isSaved: boolean;
  isApplied: boolean;
  isApplying: boolean;
  onToggleSave: () => void;
  onApply: () => void;
}

export function JobApplyBar({
  isSaved,
  isApplied,
  isApplying,
  onToggleSave,
  onApply,
}: JobApplyBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <Box
      className="bg-card/95 border-border absolute right-0 bottom-0 left-0 border-t px-4 pt-3 shadow-lg"
      style={{
        paddingBottom: Platform.OS === 'web' ? 14 : Math.max(insets.bottom, 14),
      }}>
      <HStack className="w-full max-w-md items-center self-center" space="sm">
        <Pressable
          accessibilityLabel="Enregistrer cette offre"
          onPress={onToggleSave}
          className="bg-muted h-12 w-12 shrink-0 items-center justify-center rounded-xl active:opacity-80">
          <Icon
            as={Bookmark}
            size="md"
            className={isSaved ? 'text-primary fill-primary' : 'text-muted-foreground'}
          />
        </Pressable>

        <Button
          size="lg"
          variant={isApplied ? 'secondary' : 'default'}
          isDisabled={isApplying || isApplied}
          onPress={onApply}
          className="h-12 flex-1 rounded-xl">
          {isApplying ? (
            <>
              <ButtonSpinner className="text-primary-foreground" />
              <ButtonText className="font-bold">Envoi du profil...</ButtonText>
            </>
          ) : isApplied ? (
            <>
              <ButtonIcon as={CheckCheck} className="text-secondary-foreground" />
              <ButtonText className="font-bold">Candidature envoyée</ButtonText>
            </>
          ) : (
            <>
              <ButtonIcon as={Zap} className="text-primary-foreground" />
              <ButtonText className="font-bold">Postuler en 1 clic</ButtonText>
            </>
          )}
        </Button>
      </HStack>
    </Box>
  );
}
