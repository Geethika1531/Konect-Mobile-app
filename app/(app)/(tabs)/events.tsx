import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { MoodSelector } from '../../components/MoodSelector';
import { useThemeStore } from '../../stores/themeStore';

const CATEGORIES = ["coffee", "sports", "study", "games", "food", "arts", "other"];

const getCategoryIcon = (category: string) => {
    switch(category) {
        case 'coffee': return '☕';
        case 'sports': return '⚽';
        case 'study': return '📚';
        case 'games': return '🎮';
        case 'food': return '🍔';
        case 'arts': return '🎨';
        default: return '🎉';
    }
}

export default function EventsScreen() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const router = useRouter();
  const { theme } = useThemeStore();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const now = Timestamp.now();
      const q = query(
        collection(db, 'events'),
        where('status', 'in', ['open', 'full']),
        where('dateTime', '>=', now),
        orderBy('dateTime', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const fetchedEvents: any[] = [];
      querySnapshot.forEach((docSnap) => {
        fetchedEvents.push({ id: docSnap.id, ...docSnap.data() });
      });

      setEvents(fetchedEvents);
    } catch (error) {
      console.error("Error fetching events: ", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = selectedCategory 
    ? events.filter(e => e.category === selectedCategory)
    : events;

  const renderEventCard = ({ item }: { item: any }) => {
    const isFull = item.status === 'full';
    const dateStr = item.dateTime.toDate().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

    return (
      <TouchableOpacity 
        onPress={() => router.push(`/(app)/events/${item.id}`)}
        className="bg-[var(--card-bg)] rounded-3xl mb-4 overflow-hidden border border-[var(--border-light)] shadow-sm p-5"
      >
        <View className="flex-row justify-between items-start mb-3">
            <View className="flex-row items-center">
                <Text className="text-2xl mr-2">{getCategoryIcon(item.category)}</Text>
                <View className="bg-[var(--bg-primary)] px-3 py-1 rounded-full">
                    <Text className="text-[var(--text-primary)] text-xs font-bold uppercase">{item.category}</Text>
                </View>
            </View>
            {isFull && (
                <View className="bg-red-100 px-3 py-1 rounded-full border border-red-300">
                    <Text className="text-red-600 text-xs font-bold uppercase">Full</Text>
                </View>
            )}
        </View>

        <Text className="text-xl font-bold text-[var(--text-primary)] mb-1" numberOfLines={2}>{item.title}</Text>
        <Text className="text-sm text-[var(--text-secondary)] mb-4">{dateStr} • {item.location.name}</Text>
        
        <View className="flex-row justify-between items-center mt-2 border-t border-[var(--border-light)] pt-4">
            <Text className="text-sm font-medium text-[var(--accent-solid)]">{item.attendees?.length || 0} / {item.maxAttendees} going</Text>
            <TouchableOpacity 
                onPress={() => router.push(`/(app)/events/${item.id}`)}
                className="px-6 py-2 rounded-full"
                style={{ backgroundColor: 'var(--accent-solid)' }}
            >
                <Text className="text-white font-bold">Join</Text>
            </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-[var(--bg-primary)]">
      <View className="pt-4 pb-2">
        <MoodSelector 
            selectedMood={selectedCategory} 
            onSelect={setSelectedCategory} 
        />
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="var(--accent-solid)" />
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id}
          renderItem={renderEventCard}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={fetchEvents}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center mt-20">
              <Text className="text-6xl mb-4">🏜️</Text>
              <Text className="text-[var(--text-primary)] text-xl font-bold mb-2">No events found</Text>
              <Text className="text-[var(--text-secondary)] text-center px-8">
                Be the first to create an event in your area and gather people together.
              </Text>
            </View>
          }
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity 
        onPress={() => router.push('/(app)/events/create')}
        className="absolute bottom-6 right-6 w-16 h-16 rounded-full items-center justify-center shadow-lg border-2 border-white"
        style={{ backgroundColor: 'var(--accent-solid)', elevation: 5 }}
      >
        <Text className="text-white text-3xl font-light">+</Text>
      </TouchableOpacity>
    </View>
  );
}
