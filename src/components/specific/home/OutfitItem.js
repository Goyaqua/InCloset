import React, { useState, useEffect, useCallback } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../services/supabase/auth';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.35;

// Cache for signed URLs
const urlCache = new Map();

const OutfitItem = ({ 
  title, 
  image,
  onPress, 
  onFavorite, 
  onDelete,
  isFavorite, 
  containerColor,
  textColor
}) => {
  const [imageUrl, setImageUrl] = useState(null);

  const getSignedUrl = useCallback(async () => {
    try {
      if (!image) return;
      
      // Check cache first
      if (urlCache.has(image)) {
        const cachedData = urlCache.get(image);
        if (Date.now() < cachedData.expiry) {
          setImageUrl(cachedData.url);
          return;
        }
      }
      
      const { data, error } = await supabase.storage
        .from('userclothes')
        .createSignedUrl(image, 3600); // 1 hour expiry
      
      if (error) {
        console.error('Error getting signed URL:', error);
        return;
      }
      
      if (data?.signedUrl) {
        // Cache the URL with expiry
        urlCache.set(image, {
          url: data.signedUrl,
          expiry: Date.now() + (3600 * 1000) // 1 hour from now
        });
        setImageUrl(data.signedUrl);
      }
    } catch (error) {
      console.error('Error in getSignedUrl:', error);
    }
  }, [image]);

  useEffect(() => {
    getSignedUrl();
  }, [getSignedUrl]);

  return (
    <View style={[styles.container, { backgroundColor: containerColor }]}>
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
      
      <View style={styles.actionButtons}>
        {onFavorite && (
          <TouchableOpacity style={styles.actionButton} onPress={onFavorite}>
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={isFavorite ? colors.danger : colors.textSecondary}
            />
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
            <Ionicons
              name="trash-outline"
              size={24}
              color={colors.danger}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
          {title}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: ITEM_WIDTH,
    borderRadius: layout.borderRadius,
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
    borderRadius: layout.borderRadius,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  actionButtons: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    zIndex: 1,
    flexDirection: 'row',
  },
  actionButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
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
