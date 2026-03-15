import { Stack } from 'expo-router';
import { ThemeToggle } from '../components/ThemeToggle';
import { View } from 'react-native';

export default function OnboardingLayout() {
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
        // Prevent going back implicitly via swipe
        gestureEnabled: false,
        headerBackVisible: false,
      }}
    >
      <Stack.Screen name="step-1" options={{ title: 'Step 1 of 3' }} />
      <Stack.Screen name="step-2" options={{ title: 'Step 2 of 3' }} />
      <Stack.Screen name="step-3" options={{ title: 'Step 3 of 3' }} />
    </Stack>
  );
}
