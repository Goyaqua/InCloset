import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../../services/supabase/auth';
import { Image as CachedImage } from 'expo-image';

const ClothingDetailsScreen = ({ route, navigation }) => {
  const { item } = route.params;
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getSignedUrl = async () => {
      try {
        setIsLoading(true);
        const { data: { signedUrl }, error } = await supabase.storage
          .from('userclothes')
          .createSignedUrl(item.image_path, 3600); // 1 hour expiry

        if (error) {
          console.error('Error getting signed URL:', error);
          return;
        }

        setImageUrl(signedUrl);
      } catch (err) {
        console.error('Error in getSignedUrl:', err);
      } finally {
        setIsLoading(false);
      }
    };

    getSignedUrl();
  }, [item.image_path]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.imageContainer}>
          {isLoading ? (
            <View style={styles.placeholderImage}>
              <ActivityIndicator size="large" color="#6366F1" />
            </View>
          ) : imageUrl ? (
            <CachedImage
              source={{ uri: imageUrl }}
              style={styles.image}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
            />
          ) : null}
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.type}>Type: {item.type}</Text>
          <Text style={styles.date}>
            Added: {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>BACK</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  imageContainer: {
    width: '100%',
    height: 400,
    backgroundColor: '#F3F4F6',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 10,
  },
  type: {
    fontSize: 18,
    color: '#4B5563',
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    color: '#6B7280',
  },
  buttonContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  backButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default ClothingDetailsScreen; 