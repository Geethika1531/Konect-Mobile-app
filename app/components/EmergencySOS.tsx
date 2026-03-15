import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import Modal from 'react-native-modal';
import * as Haptics from 'expo-haptics';

export function EmergencySOS() {
  const [isModalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const triggerSOS = async () => {
    setLoading(true);
    // Vibrate heavily to assure user the action was registered
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    
    // Simulate SMS dispatch and Location payload sharing
    setTimeout(() => {
        setLoading(false);
        setModalVisible(false);
        Alert.alert(
            "SOS Dispatched", 
            "Your live location has been shared with your emergency contacts.",
            [{ text: "OK", style: "default" }]
        );
    }, 1500);
  };

  return (
    <>
      {/* Header Button */}
      <TouchableOpacity 
        onPress={toggleModal}
        className="w-10 h-10 rounded-full items-center justify-center bg-red-100 border border-red-300"
      >
        <Text className="text-red-600 text-sm font-bold">SOS</Text>
      </TouchableOpacity>

      {/* Confirmation Modal */}
      <Modal 
        isVisible={isModalVisible}
        onBackdropPress={toggleModal}
        animationIn="fadeIn"
        animationOut="fadeOut"
        backdropOpacity={0.6}
      >
        <View className="bg-[var(--bg-primary)] rounded-3xl p-6 items-center border-[2px] border-red-500 shadow-xl">
            <View className="w-16 h-16 rounded-full bg-red-100 items-center justify-center mb-4">
                <Text className="text-red-500 text-3xl">⚠️</Text>
            </View>
            
            <Text className="text-2xl font-bold text-[var(--text-primary)] mb-2 text-center">Are you in danger?</Text>
            <Text className="text-base text-[var(--text-secondary)] text-center mb-8">
                Confirming will immediately send your current live location to your defined emergency contacts and log an urgent support ticket.
            </Text>

            <View className="flex-row w-full justify-between">
                <TouchableOpacity 
                    onPress={toggleModal}
                    className="flex-1 py-3 bg-[var(--card-bg)] border border-[var(--border-light)] rounded-full mr-2 items-center"
                >
                    <Text className="text-[var(--text-primary)] font-bold">Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={triggerSOS}
                    disabled={loading}
                    className="flex-1 py-3 bg-red-500 rounded-full ml-2 items-center justify-center"
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" size="small"/>
                    ) : (
                        <Text className="text-white font-bold">Trigger SOS</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
      </Modal>
    </>
  );
}
