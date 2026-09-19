import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Species } from '@/analysis/types';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { setPendingSnap } from '@/storage/session';

function parseSpecies(value: string | string[] | undefined): Species {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === 'dog' || raw === 'other') return raw;
  return 'cat';
}

export default function CameraScreen() {
  const router = useRouter();
  const { species: speciesParam } = useLocalSearchParams<{ species?: string }>();
  const species = parseSpecies(speciesParam);
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
      setPendingSnap({ imageUri: photo.uri, imageKey: photo.uri, species });
      router.replace('/result');
    } finally {
      setBusy(false);
    }
  };

  if (!permission) {
    return <View style={styles.fallback} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permission}>
        <ThemedText type="subtitle">Camera access</ThemedText>
        <ThemedText themeColor="textSecondary">
          Snappet uses the camera for a still photo. You can also pick from the library on the Snap
          tab, or run a sample.
        </ThemedText>
        <PrimaryButton label="Allow camera" onPress={requestPermission} />
        <PrimaryButton label="Not now" variant="outline" onPress={close} />
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
          <ThemedText type="smallBold" style={styles.onDark}>
            {species === 'cat' ? 'Cat' : species === 'dog' ? 'Dog' : 'Other'} · still photo
          </ThemedText>
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
  fallback: {
    flex: 1,
    backgroundColor: Palette.cream,
  },
  permission: {
    flex: 1,
    backgroundColor: Palette.cream,
    padding: Spacing.four,
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
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },
  bottomBar: {
    alignItems: 'center',
    paddingBottom: Spacing.four,
  },
  ghost: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.pill,
  },
  onDark: {
    color: Palette.white,
  },
  shutter: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: Palette.white,
    borderWidth: 6,
    borderColor: Palette.terracotta,
  },
});
