import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing, Alert } from 'react-native';
import Modal from 'react-native-modal';
import * as Haptics from 'expo-haptics';

export function SilentExit() {
  const [isActive, setIsActive] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
      let interval: NodeJS.Timeout;
      if (isRinging) {
        // Haptic ringing simulation (since expo-av ringtones require asset bundles)
        interval = setInterval(() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }, 1500);

        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.2,
              duration: 500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            })
          ])
        ).start();
      } else {
        Animated.timing(pulseAnim, { toValue: 1, duration: 0, useNativeDriver: true }).stop();
        pulseAnim.setValue(1);
      }

      return () => {
          if (interval) clearInterval(interval);
      };
  }, [isRinging]);

  const triggerFakeCall = () => {
    setIsRinging(true);
    // Auto-timeout if they ignore it
    setTimeout(() => {
        if (isRinging) setIsRinging(false);
    }, 15000);
  };

  const handleAnswer = () => {
      setIsRinging(false);
      // Opens a mock "active call" screen where they can pretend to talk.
      // After they hang up, we prompt safety checks.
      Alert.alert(
          "Call Ended", 
          "Are you safe? Do you need any help leaving the venue?",
          [
              { text: "I'm safe", style: "cancel" },
              { text: "Help me Out", onPress: () => Alert.alert("SOS Triggered", "We're notifying your emergency contacts.") }
          ]
      );
  };

  const handleDecline = () => {
      setIsRinging(false);
  };

  return (
    <>
      <TouchableOpacity 
        onPress={() => setIsActive(true)}
        className="px-4 py-2 bg-[var(--card-bg)] border border-[var(--border-light)] rounded-full mr-2"
      >
        <Text className="text-[var(--text-secondary)] font-bold">Silent Exit</Text>
      </TouchableOpacity>

      {/* Preparation Modal */}
      <Modal 
        isVisible={isActive}
        onBackdropPress={() => setIsActive(false)}
        style={{ margin: 0, justifyContent: 'flex-end' }}
      >
        <View className="bg-[var(--bg-primary)] rounded-t-3xl p-6 pb-12">
            <View className="w-12 h-1 bg-[var(--border-light)] rounded-full self-center mb-6" />
            <Text className="text-2xl font-bold text-[var(--text-primary)] mb-2">Need an excuse to leave?</Text>
            <Text className="text-sm text-[var(--text-secondary)] mb-6">
                Trigger a fake incoming call from "Mom" in 5 seconds. Let it ring, apologize to your meetup, and step outside to "take it."
            </Text>
            
            <TouchableOpacity 
                onPress={() => {
                    setIsActive(false);
                    setTimeout(triggerFakeCall, 5000);
                }}
                className="w-full py-4 rounded-full bg-[var(--accent-solid)] items-center"
            >
                <Text className="text-white font-bold text-lg">Queue Fake Call</Text>
            </TouchableOpacity>
        </View>
      </Modal>

      {/* Fake Call Full Screen Overlay */}
      <Modal 
        isVisible={isRinging} 
        style={{ margin: 0 }} 
        backdropOpacity={1}
        backdropColor="#1F2937"
        animationIn="fadeIn"
      >
          <View className="flex-1 items-center justify-between py-24 px-8 bg-gray-900">
              <View className="items-center mt-12">
                 <Text className="text-gray-400 text-xl font-medium tracking-widest mb-2">incoming call</Text>
                 <Text className="text-white text-5xl font-bold">Mom</Text>
                 <Text className="text-gray-400 text-lg mt-2">Mobile</Text>
              </View>

              <View className="flex-row w-full justify-between px-6 mb-12">
                  <TouchableOpacity onPress={handleDecline} className="items-center">
                      <View className="w-20 h-20 rounded-full bg-red-500 items-center justify-center mb-2">
                           <Text className="text-white text-3xl font-bold">✗</Text>
                      </View>
                      <Text className="text-white text-lg">Decline</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={handleAnswer} className="items-center">
                      <Animated.View style={{ transform: [{ scale: pulseAnim }] }} className="w-20 h-20 rounded-full bg-green-500 items-center justify-center mb-2">
                           <Text className="text-white text-3xl font-bold">✆</Text>
                      </Animated.View>
                      <Text className="text-white text-lg">Accept</Text>
                  </TouchableOpacity>
              </View>
          </View>
      </Modal>
    </>
  );
}
