import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { useThemeStore } from '../../stores/themeStore';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useThemeStore();
  
  const [event, setEvent] = useState<any>(null);
  const [creatorName, setCreatorName] = useState('Someone');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const eventDoc = await getDoc(doc(db, 'events', id as string));
      if (eventDoc.exists()) {
        const data = eventDoc.data();
        setEvent(data);
        
        // Fetch creator name
        if (data.createdBy) {
          const userDoc = await getDoc(doc(db, 'users', data.createdBy));
          if (userDoc.exists()) {
            setCreatorName(userDoc.data()?.name || 'Someone');
          }
        }
      } else {
        Alert.alert("Error", "Event not found");
        router.back();
      }
    } catch (e) {
      console.error("fetching error", e);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLeave = async () => {
    if (!currentUserId || !event) return;
    setActionLoading(true);
    
    const isAttending = event.attendees.includes(currentUserId);
    const eventRef = doc(db, 'events', id as string);

    try {
      if (isAttending) {
        // LEAVE Logic
        const newAttendees = event.attendees.filter((a: string) => a !== currentUserId);
        const newStatus = event.status === 'full' ? 'open' : event.status;
        
        await updateDoc(eventRef, {
          attendees: arrayRemove(currentUserId),
          status: newStatus
        });
        
        setEvent({ ...event, attendees: newAttendees, status: newStatus });
      } else {
        // JOIN Logic
        if (event.status === 'full' || event.attendees.length >= event.maxAttendees) {
          Alert.alert("Sorry", "This event is full.");
          return;
        }

        const newAttendees = [...event.attendees, currentUserId];
        const newStatus = newAttendees.length >= event.maxAttendees ? 'full' : event.status;

        await updateDoc(eventRef, {
          attendees: arrayUnion(currentUserId),
          status: newStatus
        });
        
        setEvent({ ...event, attendees: newAttendees, status: newStatus });
        Alert.alert("Success", "You've successfully joined!");
      }
    } catch (error) {
      Alert.alert("Error", "Could not process your request.");
    } finally {
      setActionLoading(false);
    }
  };

  const cancelEvent = async () => {
    if (!currentUserId || !event || event.createdBy !== currentUserId) return;
    
    Alert.alert(
      "Cancel Event",
      "Are you sure you want to cancel this event?",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Yes, Cancel", 
          style: "destructive",
          onPress: async () => {
            await updateDoc(doc(db, 'events', id as string), { status: 'cancelled' });
            router.back();
          }
        }
      ]
    );
  };

  if (loading || !event) {
    return (
      <View className="flex-1 bg-[var(--bg-primary)] justify-center items-center">
        <ActivityIndicator size="large" color="var(--accent-solid)" />
      </View>
    );
  }

  const isCreator = currentUserId === event.createdBy;
  const isAttending = event.attendees?.includes(currentUserId);
  const isFull = event.status === 'full' || event.attendees?.length >= event.maxAttendees;
  const dateStr = event.dateTime.toDate().toLocaleString('en-US', { 
      weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' 
  });

  return (
    <SafeAreaView className="flex-1 bg-[var(--bg-primary)]">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover Image */}
        <View className="relative w-full h-64 bg-gray-200">
          {event.imageUrl ? (
            <Image source={{ uri: event.imageUrl }} className="w-full h-full" style={{ resizeMode: 'cover' }} />
          ) : (
             <View className="w-full h-full items-center justify-center bg-[var(--card-bg)] border-b border-[var(--border-light)]">
                <Text className="text-6xl text-[var(--accent-solid)]">{event.category === 'coffee' ? '☕' : '🎉'}</Text>
             </View>
          )}
          <TouchableOpacity 
            onPress={() => router.back()}
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/40 items-center justify-center backdrop-blur-md"
          >
            <Text className="text-white text-xl font-bold">←</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="p-6">
          <View className="flex-row items-center mb-3">
              <View className="bg-[var(--card-bg)] px-3 py-1 rounded-full border border-[var(--border-light)] mr-2">
                  <Text className="text-[var(--text-secondary)] text-xs font-bold uppercase">{event.category}</Text>
              </View>
              {isFull && !isAttending && (
                  <View className="bg-red-100 px-3 py-1 rounded-full border border-red-300">
                      <Text className="text-red-600 text-xs font-bold uppercase">Full</Text>
                  </View>
              )}
          </View>

          <Text className="text-3xl font-bold text-[var(--text-primary)] mb-2">{event.title}</Text>
          <Text className="text-base text-[var(--accent-solid)] font-medium mb-6">Hosted by {creatorName}</Text>

          {/* Logistics */}
          <View className="bg-[var(--card-bg)] rounded-3xl p-5 border border-[var(--border-light)] shadow-sm mb-6">
              <View className="flex-row items-center mb-4">
                  <Text className="text-2xl mr-4">📅</Text>
                  <View className="flex-1">
                      <Text className="font-bold text-[var(--text-primary)] text-base">Date & Time</Text>
                      <Text className="text-[var(--text-secondary)]">{dateStr}</Text>
                  </View>
              </View>
              <View className="h-[1px] bg-[var(--border-light)] mb-4" />
              <View className="flex-row items-center">
                  <Text className="text-2xl mr-4">📍</Text>
                  <View className="flex-1">
                      <Text className="font-bold text-[var(--text-primary)] text-base">Location</Text>
                      <Text className="text-[var(--text-secondary)]">{event.location?.name}</Text>
                  </View>
              </View>
          </View>

          {/* About */}
          {event.description && (
            <View className="mb-6">
                <Text className="text-xl font-bold text-[var(--text-primary)] mb-3">About</Text>
                <Text className="text-base text-[var(--text-secondary)] leading-6">{event.description}</Text>
            </View>
          )}

          {/* Attendees */}
          <View className="mb-10">
              <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-xl font-bold text-[var(--text-primary)]">Attendees</Text>
                  <Text className="text-sm font-bold text-[var(--accent-solid)]">{event.attendees?.length || 0} / {event.maxAttendees}</Text>
              </View>
              {/* Mock attendee avatars representation */}
              <View className="flex-row items-center flex-wrap gap-2">
                  {event.attendees?.slice(0, 6).map((attId: string, idx: number) => (
                      <View key={idx} className="w-12 h-12 rounded-full bg-gray-300 items-center justify-center border-2 border-[var(--bg-primary)]">
                         <Text className="text-xs">👤</Text>
                      </View>
                  ))}
                  {event.attendees?.length > 6 && (
                      <View className="w-12 h-12 rounded-full bg-[var(--card-bg)] border border-[var(--border-light)] items-center justify-center">
                         <Text className="text-xs text-[var(--text-secondary)] font-bold">+{event.attendees.length - 6}</Text>
                      </View>
                  )}
              </View>
          </View>

        </View>
      </ScrollView>

      {/* Fixed Actions Footer */}
      <View className="p-6 bg-[var(--bg-primary)] border-t border-[var(--border-light)]">
        {isCreator ? (
            <TouchableOpacity 
              onPress={cancelEvent}
              className="w-full py-4 rounded-full flex-row justify-center items-center shadow-md bg-white border-2 border-red-500"
            >
              <Text className="text-red-500 text-lg font-bold tracking-wider">Cancel Event</Text>
            </TouchableOpacity>
        ) : (
            <TouchableOpacity 
              onPress={handleJoinLeave}
              disabled={actionLoading || (!isAttending && isFull)}
              className={`w-full py-4 rounded-full flex-row justify-center items-center shadow-md border-2 ${isAttending ? 'bg-[var(--bg-primary)] border-[var(--accent-solid)]' : 'border-transparent'}`}
              style={!isAttending ? { backgroundColor: 'var(--accent-solid)' } : {}}
            >
              {actionLoading ? (
                <ActivityIndicator color={isAttending ? 'var(--accent-solid)' : '#FFF'} />
              ) : (
                <Text className={`text-lg font-bold tracking-wider ${isAttending ? 'text-[var(--accent-solid)]' : 'text-white'}`}>
                    {isAttending ? 'Leave Event' : isFull ? 'Event Full' : 'Join Event 🎉'}
                </Text>
              )}
            </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
