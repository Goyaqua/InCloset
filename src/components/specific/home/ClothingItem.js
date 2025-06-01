import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Image, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, layout, typography } from '../../../styles/theme';
import { supabase } from '../../../services/supabase/auth';

const ClothingItem = ({ imagePath, name, onPress, selected }) => {
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

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.imageContainer, selected && styles.selectedContainer]}>
        {imageUrl && (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        )}
        {selected && (
          <View style={styles.selectedOverlay}>
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          </View>
        )}
      </View>
      <Text style={[styles.name, selected && styles.selectedName]} numberOfLines={2}>
        {name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '31%', // Allows 3 items per row with spacing
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  imageContainer: {
    width: 120,
    height: 120,
    backgroundColor: colors.background,
    borderRadius: layout.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  selectedContainer: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: layout.borderRadius,
  },
  name: {
    ...typography.caption,
    fontSize: 13,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 16,
    fontWeight: '500',
  },
  selectedName: {
    color: colors.primary,
    fontWeight: '600',
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ClothingItem;
