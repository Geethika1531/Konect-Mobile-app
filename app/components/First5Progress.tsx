import React from 'react';
import { View, Text } from 'react-native';

interface First5ProgressProps {
  meetupCount: number;
}

export function First5Progress({ meetupCount }: First5ProgressProps) {
    const meetupsBeforePaywall = Math.max(5 - meetupCount, 0);
    const isComplete = meetupsBeforePaywall === 0;

    return (
        <View className={`w-full p-5 rounded-3xl border mb-6 ${
            isComplete ? 'bg-amber-100 border-amber-300' : 'bg-[var(--card-bg)] border-[var(--border-light)]'
        }`}>
            <View className="flex-row justify-between items-end mb-3">
                <View>
                    <Text className={`text-sm font-bold uppercase tracking-widest mb-1 ${
                        isComplete ? 'text-amber-600' : 'text-[var(--text-secondary)]'
                    }`}>
                        First 5 Journey
                    </Text>
                    <Text className={`text-xl font-bold ${
                        isComplete ? 'text-amber-800' : 'text-[var(--text-primary)]'
                    }`}>
                        {isComplete ? '✨ Free Tier Complete!' : `🎁 ${meetupCount} of 5 Meetups`}
                    </Text>
                </View>
                {!isComplete && (
                    <Text className="text-[var(--accent-solid)] font-bold text-lg">{meetupsBeforePaywall} left</Text>
                )}
            </View>

            {/* Progress Bar Track */}
            <View className="h-3 w-full bg-gray-200 rounded-full overflow-hidden flex-row">
                {[1, 2, 3, 4, 5].map((step) => (
                    <View 
                        key={step} 
                        className={`h-full flex-1 border-r border-white/50 ${
                            meetupCount >= step ? (isComplete ? 'bg-amber-500' : 'bg-[var(--accent-solid)]') : 'bg-transparent'
                        }`}
                    />
                ))}
            </View>
        </View>
    );
}
