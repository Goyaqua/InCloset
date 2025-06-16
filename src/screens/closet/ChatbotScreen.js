import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getClothes } from '../../services/supabase/data';
import ClothingItem from '../../components/specific/home/ClothingItem';

const ChatbotScreen = () => {
  const [messages, setMessages] = useState([
    { id: '1', sender: 'ai', text: 'Hi! Tell me what kind of outfit you need and I will suggest a combination from your closet.' }
  ]);
  const [input, setInput] = useState('');
  const [closetData, setClosetData] = useState([]); // simplified closet objects
  const [outfitIds, setOutfitIds] = useState([]); // currently suggested outfit item ids
  const flatListRef = useRef(null);

  // Fetch closet data whenever screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      const loadClothes = async () => {
        const { data, error } = await getClothes();
        if (!error) {
          const simplified = data.map(it => ({
            id: it.id,
            name: it.name,
            type: it.type,
            color: it.color,
            material: it.material,
            brand: it.brand,
            season: it.season,
            fit: it.fit,
            styles: it.styles,
            occasions: it.occasions,
            description: it.description,
            image_path: it.image_path,
          }));
          setClosetData(simplified);
        }
      };
      loadClothes();
    }, [])
  );

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessage = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    Keyboard.dismiss();

    try {
      const systemPrompt = `You are INCLOSET AI Stylist. The user owns a personal closet catalog provided in JSON.\nEach item has id, name, type, color, material, brand, season, fit, styles, occasions, description.\nWhen you answer, you can either:\n1) Ask a follow-up question if you need more info. Respond ONLY with JSON of the form {"question": "<your question>"}.\n2) Propose an outfit. Respond ONLY with JSON of the form {"outfit": [<item_id>, ...], "commentary": "<why these items work together>"}. Do NOT include anything else.`;

      const payloadMessages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify({ closet: closetData }) },
        { role: 'user', content: input }
      ];

      console.log('Sending request to OpenAI:', { model: 'gpt-4o-mini', messages: payloadMessages });

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: payloadMessages,
        }),
      });

      const data = await response.json();
      console.log('Received response from OpenAI:', data);
      const rawContent = data.choices?.[0]?.message?.content ?? '';
      console.log('Raw AI content:', rawContent);

      let parsed;
      try {
        const firstBrace = rawContent.indexOf('{');
        const lastBrace = rawContent.lastIndexOf('}');
        if (firstBrace !== -1) {
          parsed = JSON.parse(rawContent.slice(firstBrace, lastBrace + 1));
        }
      } catch (err) {
        console.warn('Failed to parse JSON from AI, treating as text');
      }

      if (parsed?.question) {
        const aiMsg = { id: Date.now().toString(), sender: 'ai', text: parsed.question };
        setMessages(prev => [...prev, aiMsg]);
      } else if (parsed?.outfit) {
        setOutfitIds(parsed.outfit);
        const aiMsg = { id: Date.now().toString(), sender: 'ai', text: parsed.commentary || 'Here is an outfit suggestion!' };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        const aiMsg = { id: Date.now().toString(), sender: 'ai', text: rawContent };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (error) {
      console.error('Error calling AI:', error);
      const errorMessage = { id: Date.now().toString(), sender: 'ai', text: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.messageText, isUser && { color: '#fff' }]}>{item.text}</Text>
      </View>
    );
  };

  // Render outfit thumbnails if available
  const renderOutfitPreview = () => {
    if (!outfitIds.length) return null;
    const items = closetData.filter(c => outfitIds.includes(c.id));
    return (
      <View style={styles.outfitContainer}>
        <FlatList
          horizontal
          data={items}
          keyExtractor={it => String(it.id)}
          renderItem={({ item }) => (
            <View style={styles.thumbnailWrapper}>
              <ClothingItem imagePath={item.image_path} name={item.name} onPress={() => {}} />
            </View>
          )}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 30}
      >
        {renderOutfitPreview()}

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesContainer}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type your message..."
            placeholderTextColor="#9CA3AF"
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Ionicons name="send" size={22} color="#6366F1" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  userBubble: {
    backgroundColor: '#4F46E5', // darker for better contrast
    alignSelf: 'flex-end',
  },
  aiBubble: {
    backgroundColor: '#E5E7EB',
    alignSelf: 'flex-start',
  },
  outfitContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  thumbnailWrapper: {
    width: 100,
    alignItems: 'center',
  },
  messageText: {
    color: '#222',
    fontSize: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#222',
    marginRight: 8,
  },
  sendButton: {
    padding: 8,
  },
});

export default ChatbotScreen; 