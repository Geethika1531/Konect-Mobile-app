import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import Modal from 'react-native-modal';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface ReportModalProps {
  isVisible: boolean;
  onClose: () => void;
  reportedUserId: string;
  reportedContentId?: string;
}

const REPORT_REASONS = ['harassment', 'hate_speech', 'fake_profile', 'inappropriate_content', 'other'] as const;

export function ReportModal({ isVisible, onClose, reportedUserId, reportedContentId }: ReportModalProps) {
  const [reason, setReason] = useState<string>('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const submitReport = async () => {
    if (!reason) {
      Alert.alert("Missing Info", "Please select a reason for the report.");
      return;
    }
    const reporterId = auth.currentUser?.uid;
    if (!reporterId) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'reports'), {
        reporterId,
        reportedUserId,
        reportedContentId: reportedContentId || null,
        reason,
        description,
        status: 'pending',
        createdAt: Timestamp.now()
      });
      
      Alert.alert("Report Submitted", "Thanks for keeping Konect safe. Our team will review within 24 hours.");
      onClose();
      // Reset state for next open
      setReason('');
      setDescription('');
    } catch (error: any) {
      Alert.alert("Submit Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatReason = (str: string) => {
      return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <Modal 
      isVisible={isVisible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection="down"
      style={{ margin: 0, justifyContent: 'flex-end' }}
      propagateSwipe
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="bg-[var(--bg-primary)] rounded-t-3xl pt-2 px-6 pb-10"
      >
        <View className="w-12 h-1 bg-[var(--border-light)] rounded-full self-center mb-6" />
        
        <Text className="text-2xl font-bold text-[var(--text-primary)] mb-2">Report Content</Text>
        <Text className="text-sm text-[var(--text-secondary)] mb-6">
            Help us understand what's happening. Your report is kept strictly anonymous.
        </Text>

        <Text className="text-sm font-bold text-[var(--text-primary)] mb-3">Reason</Text>
        <View className="flex-row flex-wrap mb-4">
            {REPORT_REASONS.map(r => (
                <TouchableOpacity 
                    key={r}
                    onPress={() => setReason(r)}
                    className={`px-4 py-2 rounded-full border border-[var(--border-light)] mr-2 mb-2 ${
                        reason === r ? 'bg-[var(--accent-solid)] border-[var(--accent-solid)]' : 'bg-[var(--card-bg)]'
                    }`}
                >
                    <Text className={`font-bold ${reason === r ? 'text-white' : 'text-[var(--text-primary)]'}`}>
                        {formatReason(r)}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>

        <Text className="text-sm font-bold text-[var(--text-primary)] mb-3">Additional Details (Optional)</Text>
        <TextInput
            className="w-full bg-[var(--card-bg)] text-[var(--text-primary)] px-4 py-3 rounded-2xl border border-[var(--border-light)] shadow-sm text-base h-24 mb-8"
            placeholder="Tell us more about the situation..."
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical='top'
            value={description}
            onChangeText={setDescription}
        />

        <TouchableOpacity 
          onPress={submitReport}
          disabled={loading}
          className="w-full py-4 rounded-full flex-row justify-center items-center shadow-md bg-red-500"
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text className="text-white text-lg font-bold tracking-wider text-center">Submit Report</Text>
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}
