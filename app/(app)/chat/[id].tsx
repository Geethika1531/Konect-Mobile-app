import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, doc, onSnapshot, setDoc, query, orderBy, addDoc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Audio } from 'expo-av';
import { auth, db, storage } from '../../lib/firebase';

export default function ChatRoomScreen() {
  const { id: otherUserId, name: otherUserName } = useLocalSearchParams();
  const router = useRouter();
  
  const currentUserId = auth.currentUser?.uid || '';
  const chatId = currentUserId > otherUserId ? `${currentUserId}_${otherUserId}` : `${otherUserId}_${currentUserId}`;
  
  const [messages, setMessages] = useState<any[]>([]);
  const [textInput, setTextInput] = useState('');
  const [chatMeta, setChatMeta] = useState<any>(null);
  
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingId, setIsPlayingId] = useState<string | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!currentUserId || !otherUserId) return;

    // Initialize chat document if not exists
    const initChat = async () => {
      const chatDoc = await getDoc(doc(db, 'chats', chatId));
      if (!chatDoc.exists()) {
        await setDoc(doc(db, 'chats', chatId), {
          participants: [currentUserId, otherUserId],
          voiceCounts: {
            [currentUserId]: 0,
            [otherUserId as string]: 0
          },
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        });
      }
    };
    initChat();

    // Listen to chat metadata
    const unsubMeta = onSnapshot(doc(db, 'chats', chatId), (docSnap) => {
      if (docSnap.exists()) {
        setChatMeta(docSnap.data());
      }
    });

    // Listen to messages
    const q = query(collection(db, `chats/${chatId}/messages`), orderBy('timestamp', 'asc'));
    const unsubMessages = onSnapshot(q, (snapshot) => {
      const msgs: any[] = [];
      snapshot.forEach(doc => {
        msgs.push({ id: doc.id, ...doc.data() });
      });
      setMessages(msgs);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
    });

    return () => {
      unsubMeta();
      unsubMessages();
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [chatId]);

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      setIsRecording(true);

      setTimeout(() => { if (isRecording) stopRecording(recording); }, 15000);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async (activeRecording = recording) => {
    if (!activeRecording) return;
    setIsRecording(false);
    await activeRecording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    const uri = activeRecording.getURI();
    setRecording(null);

    if (uri) {
      await sendVoiceNote(uri);
    }
  };

  const sendVoiceNote = async (uri: string) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = `voice_${Date.now()}.m4a`;
      const storageRef = ref(storage, `chats/${chatId}/${filename}`);
      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);

      // Add message
      await addDoc(collection(db, `chats/${chatId}/messages`), {
        type: 'voice',
        url,
        senderId: currentUserId,
        timestamp: new Date().toISOString()
      });

      // Update voice count
      await updateDoc(doc(db, 'chats', chatId), {
        [`voiceCounts.${currentUserId}`]: increment(1),
        lastUpdated: new Date().toISOString()
      });
    } catch (e) {
      console.error(e);
    }
  };

  const sendText = async () => {
    if (!textInput.trim()) return;
    try {
       await addDoc(collection(db, `chats/${chatId}/messages`), {
        type: 'text',
        text: textInput.trim(),
        senderId: currentUserId,
        timestamp: new Date().toISOString()
      });
      setTextInput('');
      await updateDoc(doc(db, 'chats', chatId), { lastUpdated: new Date().toISOString() });
    } catch (e) {
      console.error(e);
    }
  };

  const playVoiceNote = async (url: string, msgId: string) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        setIsPlayingId(null);
      }
      const { sound } = await Audio.Sound.createAsync({ uri: url });
      soundRef.current = sound;
      setIsPlayingId(msgId);
      await sound.playAsync();

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlayingId(null);
        }
      });
    } catch (e) {
      console.error("Playback error", e);
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.senderId === currentUserId;
    return (
      <View className={`mb-4 max-w-[80%] ${isMe ? 'self-end' : 'self-start'}`}>
        <View 
          className={`p-4 rounded-3xl ${isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
          style={{ backgroundColor: isMe ? 'var(--accent-solid)' : 'var(--card-bg)' }}
        >
          {item.type === 'text' ? (
            <Text className={`${isMe ? 'text-white' : 'text-[var(--text-primary)]'} text-base`}>
              {item.text}
            </Text>
          ) : (
            <TouchableOpacity 
              onPress={() => playVoiceNote(item.url, item.id)}
              className="flex-row items-center w-32"
            >
              <Text className={`${isMe ? 'text-white' : 'text-[var(--accent-solid)]'} text-2xl mr-3`}>
                {isPlayingId === item.id ? '⏹' : '▶'}
              </Text>
              <View className="flex-1 h-1 bg-[var(--border-light)] opacity-50 rounded-full overflow-hidden">
                <View className="h-full bg-white" style={{ width: isPlayingId === item.id ? '100%' : '20%' }} />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Check text unlock condition
  let textUnlocked = false;
  if (chatMeta && chatMeta.voiceCounts) {
    const myCount = chatMeta.voiceCounts[currentUserId] || 0;
    const theirCount = chatMeta.voiceCounts[otherUserId as string] || 0;
    if (myCount >= 2 && theirCount >= 2) {
      textUnlocked = true;
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-[var(--bg-primary)]">
      <View className="flex-row items-center p-4 border-b border-[var(--border-light)] bg-[var(--card-bg)]">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 px-2">
          <Text className="text-2xl text-[var(--accent-solid)]">←</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-[var(--text-primary)]">{otherUserName || 'Chat'}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
        <View className="p-4 bg-[var(--card-bg)] border-t border-[var(--border-light)] flex-row items-center">
          {textUnlocked ? (
            <>
              <TextInput
                value={textInput}
                onChangeText={setTextInput}
                className="flex-1 bg-[var(--bg-primary)] px-4 py-3 rounded-full border border-[var(--border-light)] text-[var(--text-primary)] mr-3"
                placeholder="Type a message..."
                placeholderTextColor="#9CA3AF"
              />
              {textInput.trim() ? (
                <TouchableOpacity onPress={sendText} className="w-12 h-12 rounded-full items-center justify-center bg-[var(--accent-solid)]">
                  <Text className="text-white text-lg">➤</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={isRecording ? () => stopRecording() : startRecording} className={`w-12 h-12 rounded-full items-center justify-center ${isRecording ? 'bg-red-500' : 'bg-[var(--accent-solid)]'}`}>
                  <Text className="text-white text-xl">{isRecording ? '⏹' : '🎤'}</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
             <View className="flex-1 items-center py-2">
               <Text className="text-[var(--text-secondary)] text-xs mb-3 text-center">
                 Voice-first connection: text unlocks after 2 voice notes each.
               </Text>
               <TouchableOpacity 
                 onPress={isRecording ? () => stopRecording() : startRecording} 
                 className={`w-16 h-16 rounded-full items-center justify-center ${isRecording ? 'bg-red-500' : 'bg-[var(--accent-solid)]'} shadow-sm`}
               >
                 <Text className="text-white text-3xl">{isRecording ? '⏹' : '🎤'}</Text>
               </TouchableOpacity>
               {isRecording && <Text className="text-red-500 font-bold mt-2 animate-pulse">Recording (Max 15s)</Text>}
             </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
