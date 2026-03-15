import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { useThemeStore } from '../../stores/themeStore';

export default function CirclesScreen() {
  const [circles, setCircles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { theme } = useThemeStore();
  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    fetchCircles();
  }, []);

  const fetchCircles = async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'circles'),
        where('members', 'array-contains', currentUserId)
      );
      
      const querySnapshot = await getDocs(q);
      const fetchedCircles: any[] = [];
      querySnapshot.forEach((docSnap) => {
        fetchedCircles.push({ id: docSnap.id, ...docSnap.data() });
      });

      setCircles(fetchedCircles);
    } catch (error) {
      console.error("Error fetching circles: ", error);
    } finally {
      setLoading(false);
    }
  };

  const renderCircleCard = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity 
        onPress={() => router.push(`/(app)/circles/${item.id}`)}
        className="bg-[var(--card-bg)] rounded-3xl mb-4 overflow-hidden border border-[var(--border-light)] shadow-sm flex-row items-center p-4"
      >
        <View className="w-16 h-16 rounded-2xl bg-gray-200 mr-4 overflow-hidden items-center justify-center">
             {item.coverImage ? (
                <Image source={{ uri: item.coverImage }} className="w-full h-full" style={{resizeMode: 'cover'}} />
             ) : (
                <Text className="text-3xl">⭕</Text>
             )}
        </View>

        <View className="flex-1">
            <Text className="text-xl font-bold text-[var(--text-primary)] mb-1" numberOfLines={1}>{item.name}</Text>
            <Text className="text-sm text-[var(--text-secondary)]">{item.members?.length || 0} members</Text>
        </View>

        <View className="bg-[var(--bg-primary)] p-3 rounded-full border border-[var(--border-light)]">
            <Text className="text-[var(--accent-solid)] font-bold text-xs uppercase">Open</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-[var(--bg-primary)]">
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="var(--accent-solid)" />
        </View>
      ) : (
        <FlatList
          data={circles}
          keyExtractor={(item) => item.id}
          renderItem={renderCircleCard}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={fetchCircles}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center mt-20">
              <Text className="text-6xl mb-4">🙌</Text>
              <Text className="text-[var(--text-primary)] text-xl font-bold mb-2">No Circles Yet</Text>
              <Text className="text-[var(--text-secondary)] text-center px-8">
                Circles are private groups formed over time. Once you meet at least 2 people in verified meetups, you can create one!
              </Text>
            </View>
          }
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity 
        onPress={() => router.push('/(app)/circles/create')}
        className="absolute bottom-6 right-6 w-16 h-16 rounded-full items-center justify-center shadow-lg border-2 border-white"
        style={{ backgroundColor: 'var(--accent-solid)', elevation: 5 }}
      >
        <Text className="text-white text-3xl font-light">+</Text>
      </TouchableOpacity>
    </View>
  );
}
