import { Stack } from 'expo-router';

export default function TabsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="camaras/Camaras" />
      <Stack.Screen name="Settings/settings" />
    </Stack>
  );
}
