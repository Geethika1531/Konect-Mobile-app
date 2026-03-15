import { Tabs } from 'expo-router';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../../../stores/themeStore';

export default function CircleDetailLayout() {
  const { id } = useLocalSearchParams();
  const { theme } = useThemeStore();
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: 'var(--bg-primary)' },
        headerTintColor: 'var(--text-primary)',
        headerShadowVisible: false,
        tabBarStyle: { 
          backgroundColor: 'var(--bg-primary)', 
          borderTopColor: 'var(--border-light)' 
        },
        tabBarActiveTintColor: 'var(--accent-solid)',
        tabBarInactiveTintColor: 'var(--text-secondary)',
        headerLeft: () => (
            <TouchableOpacity onPress={() => router.push('/(app)/(tabs)/circles')} className="ml-4 mr-2 px-2 py-1">
                <Text className="text-[var(--accent-solid)] text-xl font-bold">← Back</Text>
            </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Chat', 
          tabBarIcon: ({color}) => <Text style={{color, fontSize: 20}}>💬</Text> 
        }} 
      />
      <Tabs.Screen 
        name="calendar" 
        options={{ 
          title: 'Calendar', 
          tabBarIcon: ({color}) => <Text style={{color, fontSize: 20}}>📅</Text> 
        }} 
      />
      <Tabs.Screen 
        name="members" 
        options={{ 
          title: 'Members', 
          tabBarIcon: ({color}) => <Text style={{color, fontSize: 20}}>👥</Text> 
        }} 
      />
    </Tabs>
  );
}
