import { Stack } from 'expo-router';
import { ThemeToggle } from '../components/ThemeToggle';
import { View } from 'react-native';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: 'transparent',
        },
        headerTransparent: true,
        headerTintColor: '#000',
        contentStyle: { backgroundColor: 'var(--bg-primary)' },
        headerRight: () => (
          <View className="mr-4">
            <ThemeToggle />
          </View>
        ),
      }}
    >
      <Stack.Screen name="login" options={{ title: '' }} />
      <Stack.Screen name="signup" options={{ title: '' }} />
      <Stack.Screen name="forgot-password" options={{ title: '' }} />
    </Stack>
  );
}
