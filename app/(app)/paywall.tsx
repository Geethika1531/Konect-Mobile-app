import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useThemeStore } from '../stores/themeStore';

const FEATURES = [
    { icon: '🤝', title: 'Unlimited Meetups', desc: 'No more 5-meetup cap. Connect as much as you want.' },
    { icon: '💅', title: 'Premium Badges', desc: 'Exclusive "Founding Member" badge on your profile.' },
    { icon: '🛡️', title: 'Advanced Safety', desc: 'Priority moderation and safe-venue premium highlights.' },
    { icon: '🌈', title: 'Support the Community', desc: 'Help us keep Konect inclusive and ad-free for everyone.' }
];

export default function PaywallScreen() {
    const router = useRouter();
    const { theme } = useThemeStore();
    const [loading, setLoading] = useState<string | null>(null);

    const handlePurchase = async (tier: 'monthly' | 'lifetime') => {
        const user = auth.currentUser;
        if (!user) return;

        setLoading(tier);
        try {
            // In a real app, integrate RevenueCat here.
            // For MVP, we simulate a successful purchase.
            setTimeout(async () => {
                await updateDoc(doc(db, 'users', user.uid), {
                    'subscription.tier': tier,
                    'subscription.meetupsBeforePaywall': 999999 // Effectively unlimited
                });
                
                setLoading(null);
                Alert.alert("Welcome to Konect Pro!", "Your subscription is now active. Thank you for supporting us!", [
                    { text: "Let's Go!", onPress: () => router.replace('/(app)/(tabs)/discover') }
                ]);
            }, 2000);
        } catch (error: any) {
            Alert.alert("Purchase Failed", error.message);
            setLoading(null);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-[var(--bg-primary)]">
            <View className="flex-1 px-6 pt-10">
                <TouchableOpacity onPress={() => router.back()} className="mb-6">
                    <Text className="text-[var(--text-secondary)] text-lg">Close</Text>
                </TouchableOpacity>

                <ScrollView showsVerticalScrollIndicator={false}>
                    <View className="items-center mb-10">
                        <Text className="text-5xl mb-4">✨</Text>
                        <Text className="text-4xl font-bold text-[var(--text-primary)] text-center mb-2">Konect Premium</Text>
                        <Text className="text-base text-[var(--text-secondary)] text-center px-4">
                            You've seen the value of real connections. Join our inner circle to unlock the full experience.
                        </Text>
                    </View>

                    {/* Features List */}
                    <View className="mb-10">
                        {FEATURES.map((f, i) => (
                            <View key={i} className="flex-row items-start mb-6">
                                <View className="w-12 h-12 bg-[var(--card-bg)] rounded-2xl items-center justify-center border border-[var(--border-light)] mr-4">
                                    <Text className="text-2xl">{f.icon}</Text>
                                </View>
                                <View className="flex-1 pt-1">
                                    <Text className="text-lg font-bold text-[var(--text-primary)] mb-1">{f.title}</Text>
                                    <Text className="text-sm text-[var(--text-secondary)]">{f.desc}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Pricing Cards */}
                    <View className="gap-4 mb-8">
                        <TouchableOpacity 
                            onPress={() => handlePurchase('monthly')}
                            disabled={!!loading}
                            className="bg-[var(--card-bg)] p-6 rounded-3xl border-2 border-[var(--accent-solid)] shadow-sm relative"
                        >
                            <View className="absolute -top-3 right-6 bg-[var(--accent-solid)] px-3 py-1 rounded-full">
                                <Text className="text-[10px] text-white font-bold uppercase">Popular</Text>
                            </View>
                            <View className="flex-row justify-between items-center">
                                <View>
                                    <Text className="text-2xl font-bold text-[var(--text-primary)]">Monthly</Text>
                                    <Text className="text-sm text-[var(--text-secondary)]">Cancel anytime</Text>
                                </View>
                                <View className="items-end">
                                    <Text className="text-2xl font-black text-[var(--accent-solid)]">$2.99</Text>
                                    <Text className="text-xs text-[var(--text-secondary)]">per month</Text>
                                </View>
                            </View>
                            {loading === 'monthly' && (
                                <View className="absolute inset-0 bg-white/60 rounded-3xl items-center justify-center">
                                    <ActivityIndicator color="var(--accent-solid)" />
                                </View>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity 
                            onPress={() => handlePurchase('lifetime')}
                            disabled={!!loading}
                            className="bg-[var(--card-bg)] p-6 rounded-3xl border border-[var(--border-light)] shadow-sm"
                        >
                            <View className="flex-row justify-between items-center">
                                <View>
                                    <Text className="text-2xl font-bold text-[var(--text-primary)]">Lifetime</Text>
                                    <Text className="text-sm text-[var(--text-secondary)]">Pay once, own forever</Text>
                                </View>
                                <View className="items-end">
                                    <Text className="text-2xl font-black text-[var(--text-primary)]">$49.99</Text>
                                    <Text className="text-xs text-[var(--text-secondary)]">one-time</Text>
                                </View>
                            </View>
                            {loading === 'lifetime' && (
                                <View className="absolute inset-0 bg-white/60 rounded-3xl items-center justify-center">
                                    <ActivityIndicator color="var(--accent-solid)" />
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    <Text className="text-center text-xs text-[var(--text-secondary)] mb-10 px-6">
                        By subscribing, you agree to our Terms of Service and Privacy Policy. Subscriptions automatically renew unless cancelled.
                    </Text>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}
