import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import { ThemeToggle } from '../../components/ThemeToggle';
import { useThemeStore } from '../../stores/themeStore';

export default function TabsLayout() {
  const { theme } = useThemeStore();
  
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
        headerRight: () => (
          <View className="mr-4">
             <ThemeToggle />
          </View>
        )
      }}
    >
      <Tabs.Screen 
        name="discover" 
        options={{ 
          title: 'Nearby Now', 
          tabBarIcon: ({color}) => <Text style={{color, fontSize: 20}}>🌍</Text> 
        }} 
      />
      <Tabs.Screen 
        name="events" 
        options={{ 
          title: 'Events', 
          tabBarIcon: ({color}) => <Text style={{color, fontSize: 20}}>📅</Text> 
        }} 
      />
      <Tabs.Screen 
        name="circles" 
        options={{ 
          title: 'Circles', 
          tabBarIcon: ({color}) => <Text style={{color, fontSize: 20}}>⭕</Text> 
        }} 
      />
      <Tabs.Screen 
        name="chat" 
        options={{ 
          title: 'Chats', 
          tabBarIcon: ({color}) => <Text style={{color, fontSize: 20}}>💬</Text> 
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Profile', 
          tabBarIcon: ({color}) => <Text style={{color, fontSize: 20}}>👤</Text> 
        }} 
      />
    </Tabs>
  );
}
