import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert } from 'react-native';
import * as Location from 'expo-location';
import { collection, getDocs, query, where, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { auth, db } from '../../lib/firebase';
import { Image } from 'react-native';
import { UserCard } from '../../components/UserCard';
import { MoodSelector } from '../../components/MoodSelector';

export default function DiscoverScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Listen to current user for their preferences and activeMode
    const unsubMe = onSnapshot(doc(db, 'users', user.uid), (snap) => {
        if (snap.exists()) {
            setCurrentUserData(snap.data());
        }
    });

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to find nearby users.');
        setLoading(false);
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      
      // Update current user's location in Firestore
      if (auth.currentUser) {
        try {
          await updateDoc(doc(db, 'users', auth.currentUser.uid), {
            location: {
              lat: loc.coords.latitude,
              lng: loc.coords.longitude
            }
          });
        } catch(e) { console.error("Could not update location", e); }
      }

      fetchUsers();
    })();

    return () => unsubMe();
  }, []);

  const fetchUsers = async () => {
    try {
      const q = query(
        collection(db, 'users'), 
        where('onboardingCompleted', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      const fetchedUsers: any[] = [];
      const currentUserId = auth.currentUser?.uid;

      querySnapshot.forEach((docSnap) => {
        if (docSnap.id !== currentUserId) {
          const data = docSnap.data();
          fetchedUsers.push({
            id: docSnap.id,
            name: data.name,
            age: data.age,
            pronouns: data.pronouns || [],
            currentMood: data.currentMood,
            photoUrl: data.photos && data.photos.length > 0 ? data.photos[0] : null,
            distance: `${Math.floor(Math.random() * 10) + 1} miles away` // Mock distance for MVP
          });
        }
      });

      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSayHi = (userId: string, userName: string) => {
    router.push({
      pathname: '/(app)/chat/[id]',
      params: { id: userId, name: userName }
    });
  };

  const filteredUsers = users.filter(u => {
      if (selectedMood && u.currentMood !== selectedMood) return false;
      if (!currentUserData) return true;
      const { activeMode, university } = currentUserData;

      if (activeMode === 'breakup') {
          // If in breakup mode, hide people looking for dating
          return u.intent !== 'Dating';
      }

      if (activeMode === 'university') {
          // If in university mode, only show people from the same university
          return u.university === university;
      }
      
      // Traveler mode highlights rather than filters in this MVP
      return true;
  });

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[var(--bg-primary)]">
        <ActivityIndicator size="large" color="var(--accent-solid)" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[var(--bg-primary)] pt-4">
      <View>
        <MoodSelector selectedMood={selectedMood} onSelect={setSelectedMood} />
      </View>
      
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <UserCard 
            {...item} 
            onSayHi={handleSayHi}
          />
        )}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-20">
            <Text className="text-[var(--text-secondary)] text-lg text-center font-medium">
              No users found nearby with this mood.
            </Text>
          </View>
        }
      />
    </View>
  );
}
