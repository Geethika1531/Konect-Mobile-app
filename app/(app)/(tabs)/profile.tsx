import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { auth, db } from '../../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { updateDoc } from 'firebase/firestore';
import { useThemeStore } from '../../stores/themeStore';
import { First5Progress } from '../../components/First5Progress';
import { ThemeToggle } from '../../components/ThemeToggle';
import { EmergencySOS } from '../../components/EmergencySOS';

export default function ProfileScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        setUserData(doc.data());
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleMode = async (mode: string) => {
      const user = auth.currentUser;
      if (!user) return;
      
      const newMode = userData?.activeMode === mode ? null : mode;
      try {
          await updateDoc(doc(db, 'users', user.uid), {
              activeMode: newMode
          });
      } catch (error: any) {
          Alert.alert("Mode Switch Failed", error.message);
      }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: async () => {
          await signOut(auth);
          router.replace('/(auth)/login');
      }}
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[var(--bg-primary)]">
        <ActivityIndicator size="large" color="var(--accent-solid)" />
      </View>
    );
  }

  const badges = userData?.badges || [];
  const flowers = userData?.trustFlowersReceived || 0;
  const meetupCount = userData?.meetupCount || 0;

  return (
    <View className="flex-1 bg-[var(--bg-primary)]">
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 pt-16 pb-4">
        <Text className="text-2xl font-bold text-[var(--text-primary)]">Profile</Text>
        <View className="flex-row items-center gap-3">
          <EmergencySOS />
          <ThemeToggle />
        </View>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View className="items-center mt-4 mb-8">
          <View className="relative">
            <View className="w-28 h-28 rounded-full border-4 border-[var(--accent-solid)] p-1">
              <Image 
                source={{ uri: userData?.photos?.[0] || 'https://via.placeholder.com/150' }} 
                className="w-full h-full rounded-full bg-gray-200"
              />
            </View>
            <TouchableOpacity className="absolute bottom-0 right-0 bg-[var(--accent-solid)] w-8 h-8 rounded-full items-center justify-center border-2 border-[var(--bg-primary)]">
               <Text className="text-white text-xs">✏️</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-2xl font-bold text-[var(--text-primary)] mt-4">{userData?.name}, {userData?.age}</Text>
          <Text className="text-sm text-[var(--text-secondary)] font-medium">{userData?.pronouns} • {userData?.phoneNumber || 'Phone Unverified'}</Text>
        </View>

        {/* First 5 Progress */}
        <First5Progress meetupCount={meetupCount} />

        {/* Stats Grid */}
        <View className="flex-row gap-4 mb-8">
           <View className="flex-1 bg-[var(--card-bg)] p-4 rounded-3xl border border-[var(--border-light)] items-center">
              <Text className="text-2xl mb-1">🌸</Text>
              <Text className="text-xl font-bold text-[var(--text-primary)]">{flowers}</Text>
              <Text className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-widest">Flowers</Text>
           </View>
           <View className="flex-1 bg-[var(--card-bg)] p-4 rounded-3xl border border-[var(--border-light)] items-center">
              <Text className="text-2xl mb-1">🤝</Text>
              <Text className="text-xl font-bold text-[var(--text-primary)]">{meetupCount}</Text>
              <Text className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-widest">Meetups</Text>
           </View>
           <View className="flex-1 bg-[var(--card-bg)] p-4 rounded-3xl border border-[var(--border-light)] items-center">
              <Text className="text-2xl mb-1">🏅</Text>
              <Text className="text-xl font-bold text-[var(--text-primary)]">{badges.length}</Text>
              <Text className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-widest">Badges</Text>
           </View>
        </View>

        {/* Badges Section */}
        {badges.length > 0 && (
          <View className="mb-8">
            <Text className="text-sm font-bold text-[var(--text-primary)] mb-4 uppercase tracking-widest opacity-60">Earned Badges</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
              {badges.map((badge: string, index: number) => (
                <View key={index} className="bg-[var(--accent-light)] px-4 py-2 rounded-full mr-2 border border-[var(--accent-solid)]/20">
                  <Text className="text-[var(--accent-solid)] font-bold">{badge}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Settings Groups */}
        <Text className="text-sm font-bold text-[var(--text-primary)] mb-4 uppercase tracking-widest opacity-60">Account Settings</Text>
        
        <View className="bg-[var(--card-bg)] rounded-3xl border border-[var(--border-light)] overflow-hidden mb-6">
          <TouchableOpacity className="flex-row items-center justify-between p-5 border-b border-[var(--border-light)]">
            <Text className="text-base text-[var(--text-primary)] font-medium">Edit Profile & Photos</Text>
            <Text className="text-[var(--text-secondary)]">›</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => router.push('/(app)/paywall')}
            className="flex-row items-center justify-between p-5 border-b border-[var(--border-light)]"
          >
            <View className="flex-row items-center">
                <Text className="text-base text-[var(--text-primary)] font-medium">Subscription & Boosts</Text>
                {userData?.subscription?.tier !== 'free' && (
                    <View className="ml-2 bg-amber-500 px-2 py-0.5 rounded-md">
                        <Text className="text-[10px] text-white font-bold uppercase">PRO</Text>
                    </View>
                )}
            </View>
            <Text className="text-[var(--text-secondary)]">›</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center justify-between p-5">
            <Text className="text-base text-[var(--text-primary)] font-medium">Safety Center & SOS</Text>
            <Text className="text-[var(--text-secondary)]">›</Text>
          </TouchableOpacity>
        </View>

        {/* Privacy & Compliance */}
        <Text className="text-sm font-bold text-[var(--text-primary)] mb-4 uppercase tracking-widest opacity-60">Privacy & Compliance</Text>
        <View className="bg-[var(--card-bg)] rounded-3xl border border-[var(--border-light)] overflow-hidden mb-6">
          <View className="flex-row items-center justify-between p-5 border-b border-[var(--border-light)]">
            <View>
                <Text className="text-base text-[var(--text-primary)] font-medium">Analytics & Usage</Text>
                <Text className="text-[10px] text-[var(--text-secondary)]">Help us improve Konect</Text>
            </View>
            <TouchableOpacity 
                onPress={() => toggleMode('analytics')}
                className={`w-12 h-6 rounded-full px-1 justify-center ${userData?.activeMode === 'analytics' ? 'bg-green-500' : 'bg-gray-300'}`}
            >
                <View className={`w-4 h-4 rounded-full bg-white ${userData?.activeMode === 'analytics' ? 'self-end' : 'self-start'}`} />
            </TouchableOpacity>
          </View>
          <View className="flex-row items-center justify-between p-5">
            <View>
                <Text className="text-base text-[var(--text-primary)] font-medium">Personalized Experience</Text>
                <Text className="text-[10px] text-[var(--text-secondary)]">GDPR / CCPA controls</Text>
            </View>
             <TouchableOpacity 
                onPress={() => toggleMode('personalized')}
                className={`w-12 h-6 rounded-full px-1 justify-center ${userData?.activeMode === 'personalized' ? 'bg-green-500' : 'bg-gray-300'}`}
            >
                <View className={`w-4 h-4 rounded-full bg-white ${userData?.activeMode === 'personalized' ? 'self-end' : 'self-start'}`} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Special Modes */}
        <Text className="text-sm font-bold text-[var(--text-primary)] mb-4 uppercase tracking-widest opacity-60">Special Modes</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-8">
           <TouchableOpacity 
              onPress={() => toggleMode('breakup')}
              className={`p-4 rounded-3xl border mr-3 w-40 ${userData?.activeMode === 'breakup' ? 'bg-indigo-600 border-indigo-700' : 'bg-indigo-100 border-indigo-200'}`}
           >
              <Text className="text-2xl mb-1">💔</Text>
              <Text className={`font-bold ${userData?.activeMode === 'breakup' ? 'text-white' : 'text-indigo-900'}`}>Breakup Recovery</Text>
              <Text className={`text-[10px] ${userData?.activeMode === 'breakup' ? 'text-indigo-100' : 'text-indigo-700'} font-medium`}>Toggle off dating vibes</Text>
           </TouchableOpacity>

           <TouchableOpacity 
              onPress={() => toggleMode('traveler')}
              className={`p-4 rounded-3xl border mr-3 w-40 ${userData?.activeMode === 'traveler' ? 'bg-emerald-600 border-emerald-700' : 'bg-emerald-100 border-emerald-200'}`}
           >
              <Text className="text-2xl mb-1">✈️</Text>
              <Text className={`font-bold ${userData?.activeMode === 'traveler' ? 'text-white' : 'text-emerald-900'}`}>Traveler Mode</Text>
              <Text className={`text-[10px] ${userData?.activeMode === 'traveler' ? 'text-emerald-100' : 'text-emerald-700'} font-medium`}>Meet locals anywhere</Text>
           </TouchableOpacity>

           <TouchableOpacity 
              onPress={() => toggleMode('university')}
              className={`p-4 rounded-3xl border w-40 ${userData?.activeMode === 'university' ? 'bg-blue-600 border-blue-700' : 'bg-blue-100 border-blue-200'}`}
           >
              <Text className="text-2xl mb-1">🎓</Text>
              <Text className={`font-bold ${userData?.activeMode === 'university' ? 'text-white' : 'text-blue-900'}`}>University Mode</Text>
              <Text className={`text-[10px] ${userData?.activeMode === 'university' ? 'text-blue-100' : 'text-blue-700'} font-medium`}>Connect on campus</Text>
           </TouchableOpacity>
        </ScrollView>

        <TouchableOpacity 
          onPress={handleLogout}
          className="w-full py-4 rounded-full flex-row justify-center items-center border border-red-500 mb-12"
        >
          <Text className="text-red-500 text-lg font-bold">Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
