import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { colors, spacing, layout, typography } from '../../../styles/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../../../services/supabase/auth';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.35;

const OutfitItem = ({ 
  title, 
  image,
  onPress, 
  onFavorite, 
  isFavorite, 
  containerColor 
}) => {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const getSignedUrl = async () => {
      try {
        if (!image) return;
        
        // Log the image path for debugging
        console.log('Attempting to get signed URL for image:', image);
        
        const { data, error } = await supabase.storage
          .from('userclothes')
          .createSignedUrl(image, 3600); // 1 hour expiry
        
        if (error) {
          console.error('Error getting signed URL:', error);
          return;
        }
        
        if (data?.signedUrl) {
          console.log('Successfully got signed URL');
          setImageUrl(data.signedUrl);
        } else {
          console.log('No signed URL in response');
        }
      } catch (error) {
        console.error('Error in getSignedUrl:', error);
      }
    };

    getSignedUrl();
  }, [image]);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.content} onPress={onPress} activeOpacity={0.8}>
        <View style={styles.imagesContainer}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="cover"
              onError={(e) => console.error('Image loading error:', e.nativeEvent.error)}
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <MaterialIcons name="image" size={24} color={colors.textSecondary} />
            </View>
          )}
        </View>
      </TouchableOpacity>
      
      <View style={styles.footer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: ITEM_WIDTH,
    marginRight: spacing.md,

    padding: spacing.sm,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagesContainer: {
    width: '100%',
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: layout.borderRadius,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  title: {
    ...typography.caption,
    color: colors.text,
    textAlign: 'center',
    fontSize: 14,
  },
  placeholderContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderRadius: layout.borderRadius,
  },
});

export default OutfitItem;
