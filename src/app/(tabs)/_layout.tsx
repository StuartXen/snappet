import { Tabs } from 'expo-router';
import { Text } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

function TabIcon({ glyph, focused }: { glyph: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 17, opacity: focused ? 1 : 0.45 }} accessibilityElementsHidden>
      {glyph}
    </Text>
  );
}

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: theme.background },
        headerTitleStyle: { fontWeight: '700', color: theme.text },
        headerTintColor: theme.text,
        tabBarActiveTintColor: theme.text,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarActiveBackgroundColor: 'transparent',
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.line,
        },
        sceneStyle: { backgroundColor: theme.background },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Snap',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon glyph="📷" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Recents',
          tabBarIcon: ({ focused }) => <TabIcon glyph="🕐" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
