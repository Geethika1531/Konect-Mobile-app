import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { collection, doc, onSnapshot, query, orderBy, addDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../../../lib/firebase';
import { useThemeStore } from '../../../stores/themeStore';

export default function CircleChatScreen() {
  const { id: circleId } = useLocalSearchParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const { theme } = useThemeStore();
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!circleId) return;

    const messagesRef = collection(db, `circles/${circleId}/messages`);
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages: any[] = [];
      snapshot.forEach(doc => {
        fetchedMessages.push({ id: doc.id, ...doc.data() });
      });
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [circleId]);

  const sendMessage = async () => {
    if (!inputText.trim() || !currentUser || !circleId) return;

    try {
      const newMsg = {
        senderId: currentUser.uid,
        text: inputText.trim(),
        createdAt: Timestamp.now(),
        type: 'text' // As opposed to 'system'
      };

      await addDoc(collection(db, `circles/${circleId}/messages`), newMsg);
      setInputText('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    if (item.type === 'system') {
        return (
            <View className="items-center my-2">
                <Text className="text-xs text-[var(--text-secondary)] font-medium px-4 py-1 bg-[var(--card-bg)] rounded-full text-center">
                    {item.text}
                </Text>
            </View>
        )
    }

    const isMe = item.senderId === currentUser?.uid;
    
    return (
      <View className={`flex-row my-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
        {!isMe && (
            <View className="w-8 h-8 rounded-full bg-gray-300 mr-2 items-center justify-center">
                <Text className="text-xs">👤</Text>
            </View>
        )}
        <View className={`rounded-2xl px-4 py-2 max-w-[75%] ${
            isMe ? 'bg-[var(--accent-solid)] rounded-br-sm' : 'bg-[var(--card-bg)] border border-[var(--border-light)] rounded-bl-sm'
        }`}>
          <Text className={`text-base ${isMe ? 'text-white' : 'text-[var(--text-primary)]'}`}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-[var(--bg-primary)]"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
      
      <View className="p-4 border-t border-[var(--border-light)] bg-[var(--bg-primary)] flex-row items-center">
        <TextInput
          className="flex-1 min-h-[50px] bg-[var(--card-bg)] text-[var(--text-primary)] px-4 rounded-full border border-[var(--border-light)] text-base mr-3"
          placeholder="Send a message..."
          placeholderTextColor="#9CA3AF"
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity 
          onPress={sendMessage}
          disabled={!inputText.trim()}
          className="w-12 h-12 rounded-full items-center justify-center"
          style={{ backgroundColor: inputText.trim() ? 'var(--accent-solid)' : 'var(--card-bg)' }}
        >
          <Text className={inputText.trim() ? "text-white text-xl" : "text-gray-400 text-xl"}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
