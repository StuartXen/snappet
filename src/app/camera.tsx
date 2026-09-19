import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { setPendingSnap } from '@/storage/session';

export default function CameraScreen() {
  const router = useRouter();
  const theme = useTheme();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [busy, setBusy] = useState(false);

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const capture = async () => {
    if (!cameraRef.current || busy) return;
    setBusy(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (!photo?.uri) return;
      setPendingSnap({ imageUri: photo.uri, imageKey: photo.uri });
      router.replace('/result');
    } finally {
      setBusy(false);
    }
  };

  if (!permission) {
    return <View style={[styles.fill, { backgroundColor: theme.background }]} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.permission, { backgroundColor: theme.background }]}>
        <ThemedText type="title">Camera</ThemedText>
        <ThemedText themeColor="textSecondary">
          One still photo. You can also pick from Photo Library.
        </ThemedText>
        <PrimaryButton label="Allow Camera" onPress={requestPermission} />
        <PrimaryButton label="Not Now" variant="ghost" onPress={close} />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.fill}>
      <CameraView ref={cameraRef} style={styles.fill} facing={facing} />
      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.topBar}>
          <Pressable onPress={close} style={styles.ghost} accessibilityRole="button">
            <ThemedText type="smallBold" style={styles.onDark}>
              Close
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => setFacing((current) => (current === 'back' ? 'front' : 'back'))}
            style={styles.ghost}
            accessibilityRole="button">
            <ThemedText type="smallBold" style={styles.onDark}>
              Flip
            </ThemedText>
          </Pressable>
        </View>
        <View style={styles.bottomBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Capture photo"
            disabled={busy}
            onPress={capture}
            style={({ pressed }) => [styles.shutter, { opacity: pressed || busy ? 0.7 : 1 }]}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: '#000',
  },
  permission: {
    flex: 1,
    padding: Spacing.five,
    justifyContent: 'center',
    gap: Spacing.three,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },
  bottomBar: {
    alignItems: 'center',
    paddingBottom: Spacing.four,
  },
  ghost: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    minHeight: 36,
    justifyContent: 'center',
  },
  onDark: {
    color: Palette.white,
  },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Palette.white,
    borderWidth: 5,
    borderColor: Palette.terracotta,
  },
});
