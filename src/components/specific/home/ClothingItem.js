import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Image, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, layout, typography } from '../../../styles/theme';
import { supabase } from '../../../services/supabase/auth';

const ClothingItem = ({ imagePath, name, onPress }) => {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const getSignedUrl = async () => {
      try {
        const { data: { signedUrl }, error } = await supabase.storage
          .from('userclothes')
          .createSignedUrl(imagePath, 3600); // 1 hour expiry
        
        if (error) {
          console.error('Error getting signed URL:', error);
          return;
        }
        
        if (signedUrl) {
          setImageUrl(signedUrl);
        }
      } catch (error) {
        console.error('Error in getSignedUrl:', error);
      }
    };

    if (imagePath) {
      getSignedUrl();
    }
  }, [imagePath]);

  const renderTags = (tags) => {
    if (!tags || tags.length === 0) return null;
    return (
      <View style={styles.tagsContainer}>
        {tags.slice(0, 2).map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
        {tags.length > 2 && (
          <View style={styles.tag}>
            <Text style={styles.tagText}>+{tags.length - 2}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        {imageUrl && (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="contain"
          />
        )}
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: 120,
    backgroundColor: colors.background,
    borderRadius: layout.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: layout.borderRadius,
  },
  name: {
    ...typography.caption,
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: spacing.xs,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 4,
  },
  tag: {
    backgroundColor: colors.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginHorizontal: 2,
    marginVertical: 2,
  },
  tagText: {
    fontSize: 10,
    color: colors.text,
    opacity: 0.8,
  },
});

export default ClothingItem;
