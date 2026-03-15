import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import { auth, db } from '../../../lib/firebase';
import { useThemeStore } from '../../../stores/themeStore';

export default function CircleMembersScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [circle, setCircle] = useState<any>(null);
  const [membersInfo, setMembersInfo] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    fetchCircleData();
  }, [id]);

  const fetchCircleData = async () => {
    if (!id) return;
    try {
      const docRef = doc(db, 'circles', id as string);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCircle(data);
        
        // Fetch details for all members
        const membersData = await Promise.all(
            data.members.map(async (mId: string) => {
                const uDoc = await getDoc(doc(db, 'users', mId));
                if (uDoc.exists()) {
                    return { id: mId, ...uDoc.data(), isAdmin: data.admins?.includes(mId) };
                }
                return { id: mId, name: 'Unknown User', isAdmin: data.admins?.includes(mId) };
            })
        );
        setMembersInfo(membersData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const leaveCircle = async () => {
      if (!currentUserId || !circle) return;

      const isAdmin = circle.admins?.includes(currentUserId);
      if (isAdmin && circle.admins.length === 1 && circle.members.length > 1) {
          Alert.alert("Cannot Leave", "You are the only admin. Please promote someone else before leaving.");
          return;
      }

      Alert.alert(
        "Leave Circle",
        "Are you sure you want to leave this circle?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Leave", 
            style: "destructive",
            onPress: async () => {
              const docRef = doc(db, 'circles', id as string);
              await updateDoc(docRef, {
                members: arrayRemove(currentUserId),
                admins: arrayRemove(currentUserId) // Safely remove from admins too if they are one
              });
              router.replace('/(app)/(tabs)/circles');
            }
          }
        ]
      );
  };

  const renderMember = ({ item }: { item: any }) => (
      <View className="flex-row items-center p-4 border-b border-[var(--border-light)] bg-[var(--card-bg)]">
          <View className="w-12 h-12 rounded-full bg-gray-200 mr-4 items-center justify-center">
              <Text className="text-xl">👤</Text>
          </View>
          <View className="flex-1">
              <Text className="font-bold text-[var(--text-primary)] text-lg">
                  {item.name} {item.id === currentUserId ? '(You)' : ''}
              </Text>
              {item.isAdmin && (
                  <Text className="text-xs font-bold text-[var(--accent-solid)] uppercase">Admin</Text>
              )}
          </View>
      </View>
  );

  if (loading) {
      return (
         <View className="flex-1 bg-[var(--bg-primary)] justify-center items-center">
            <ActivityIndicator size="large" color="var(--accent-solid)" />
         </View>
      );
  }

  return (
    <View className="flex-1 bg-[var(--bg-primary)]">
      <FlatList
        data={membersInfo}
        keyExtractor={item => item.id}
        renderItem={renderMember}
        ListHeaderComponent={
            <View className="px-6 pt-6 pb-4">
                <Text className="text-3xl font-bold text-[var(--text-primary)]">{circle?.name}</Text>
                <Text className="text-base text-[var(--text-secondary)] mt-1">{membersInfo.length} Members</Text>
            </View>
        }
        ListFooterComponent={
            <TouchableOpacity 
                onPress={leaveCircle}
                className="mx-6 mt-8 py-4 rounded-full flex-row justify-center items-center border-[1px] border-red-500 bg-red-50"
            >
                <Text className="text-red-500 text-lg font-bold">Leave Circle</Text>
            </TouchableOpacity>
        }
      />
    </View>
  );
}
