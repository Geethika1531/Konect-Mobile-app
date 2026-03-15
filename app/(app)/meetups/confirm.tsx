import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, updateDoc, Timestamp, addDoc, collection, increment } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { useThemeStore } from '../../stores/themeStore';

const TRUST_TAGS = [
    { id: 'great_listener', label: '👂 Great Listener', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { id: 'punctual', label: '⏰ Punctual', color: 'bg-green-100 text-green-700 border-green-300' },
    { id: 'fun_energy', label: '✨ Fun Energy', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    { id: 'kind', label: '💖 Kind', color: 'bg-pink-100 text-pink-700 border-pink-300' },
    { id: 'storyteller', label: '📚 Storyteller', color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
    { id: 'would_meet_again', label: '🤝 Would Meet Again', color: 'bg-purple-100 text-purple-700 border-purple-300' }
];

export default function MeetupConfirmScreen() {
    const { id, targetUserId } = useLocalSearchParams();
    const router = useRouter();
    const { theme } = useThemeStore();
    
    const [step, setStep] = useState<1 | 2>(1); // 1 = Confirm, 2 = Trust Flowers
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    
    const currentUserId = auth.currentUser?.uid;

    const handleConfirm = async () => {
        if (!currentUserId || !id) return;
        setLoading(true);

        try {
            const meetupRef = doc(db, 'meetups', id as string);
            const meetupDoc = await getDoc(meetupRef);
            
            if (meetupDoc.exists()) {
                const data = meetupDoc.data();
                
                // Determine which user we are to update the correct confirmation field
                const isUser1 = data.user1Id === currentUserId;
                const updateField = isUser1 ? 'user1Confirmed' : 'user2Confirmed';
                
                await updateDoc(meetupRef, { [updateField]: true });
                
                setStep(2); // Move to Trust Flowers
            }
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDecline = async () => {
        if (!currentUserId || !id) return;
        setLoading(true);

        try {
            await updateDoc(doc(db, 'meetups', id as string), {
                status: 'disputed'
            });
            Alert.alert("Recorded", "We've noted that this meetup didn't happen.");
            router.back();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const submitTrustFlowers = async () => {
        if (!currentUserId || !id || !targetUserId) return;
        
        setLoading(true);
        try {
            // 1. Record Trust Flower Document
            if (selectedTags.length > 0) {
                await addDoc(collection(db, 'trustFlowers'), {
                    giverId: currentUserId,
                    receiverId: targetUserId,
                    meetupId: id,
                    tags: selectedTags,
                    timestamp: Timestamp.now()
                });

                // 2. Increment target user's flower count
                await updateDoc(doc(db, 'users', targetUserId as string), {
                    trustFlowersReceived: increment(selectedTags.length)
                });
                
                // 3. Increment our given count
                await updateDoc(doc(db, 'users', currentUserId), {
                    trustFlowersGiven: increment(selectedTags.length)
                });
            }

            Alert.alert(
                "Meetup Verified!", 
                "Thanks for confirming. Your Trust Flowers have been sent anonymously.",
                [ { text: "Return Home", onPress: () => router.push('/(app)/(tabs)/discover') } ]
            );

        } catch (err: any) {
            Alert.alert("Error", err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleTag = (tagId: string) => {
        if (selectedTags.includes(tagId)) {
            setSelectedTags(prev => prev.filter(t => t !== tagId));
        } else {
            if (selectedTags.length < 3) {
                setSelectedTags(prev => [...prev, tagId]);
            } else {
                Alert.alert("Limit Reached", "You can only award up to 3 Trust Flowers per meetup.");
            }
        }
    };

    return (
        <View className="flex-1 bg-[var(--bg-primary)] pt-16 px-6">
            {step === 1 ? (
                <View className="flex-1 justify-center items-center pb-20">
                    <Text className="text-6xl mb-6">🥂</Text>
                    <Text className="text-3xl font-bold text-[var(--text-primary)] mb-4 text-center">Did you meet?</Text>
                    <Text className="text-base text-[var(--text-secondary)] mb-12 text-center">
                        Confirming your meetups unlocks badges and builds your reputation. Both parties must confirm for the meetup to be verified.
                    </Text>

                    <TouchableOpacity 
                        onPress={handleConfirm}
                        disabled={loading}
                        className="w-full py-4 rounded-full bg-[var(--accent-solid)] items-center mb-4"
                    >
                        {loading ? <ActivityIndicator color="#FFF" /> : <Text className="text-white font-bold text-lg tracking-wider">Yes, we met!</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={handleDecline}
                        disabled={loading}
                        className="w-full py-4 rounded-full bg-[var(--card-bg)] border border-[var(--border-light)] items-center"
                    >
                        <Text className="text-[var(--text-secondary)] font-bold text-lg">No, it didn't happen</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    <Text className="text-3xl font-bold text-[var(--text-primary)] mb-2 mt-4">Trust Flowers</Text>
                    <Text className="text-base text-[var(--text-secondary)] mb-8">
                        Award up to 3 flowers. These appear anonymously on their profile and help build community trust.
                    </Text>

                    <View className="flex-row flex-wrap justify-center mb-10">
                        {TRUST_TAGS.map(tag => {
                            const isSelected = selectedTags.includes(tag.id);
                            return (
                                <TouchableOpacity
                                    key={tag.id}
                                    onPress={() => toggleTag(tag.id)}
                                    className={`m-2 px-5 py-3 rounded-full border-2 ${isSelected ? tag.color : 'bg-[var(--card-bg)] border-[var(--border-light)]'}`}
                                >
                                    <Text className={`font-bold text-base ${isSelected ? '' : 'text-[var(--text-secondary)]'}`}>
                                        {tag.label}
                                    </Text>
                                </TouchableOpacity>
                            )
                        })}
                    </View>

                    <TouchableOpacity 
                        onPress={submitTrustFlowers}
                        disabled={loading}
                        className="w-full py-4 rounded-full bg-[var(--accent-solid)] items-center mb-4"
                    >
                        {loading ? <ActivityIndicator color="#FFF" /> : <Text className="text-white font-bold text-lg tracking-wider">Submit & Finish</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => submitTrustFlowers()} className="items-center py-4">
                        <Text className="text-[var(--text-secondary)] font-bold">Skip for now</Text>
                    </TouchableOpacity>
                </ScrollView>
            )}
        </View>
    );
}
