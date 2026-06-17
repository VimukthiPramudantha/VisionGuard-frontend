import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

let GoeyToaster: any = null;
if (Platform.OS === 'web') {
  try {
    GoeyToaster = require('goey-toast').GoeyToaster;
    require('goey-toast/styles.css');
  } catch (e) {
    console.warn('goey-toast styles or component failed to load', e);
  }
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      {Platform.OS === 'web' && GoeyToaster && <GoeyToaster position="top-right" />}
    </SafeAreaProvider>
  );
}