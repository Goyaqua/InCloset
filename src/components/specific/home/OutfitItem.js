import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { colors, spacing, layout, typography } from '../../../styles/theme';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.35;

const OutfitItem = ({ title, items, onPress, onDelete, onFavorite, isFavorite }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.content} onPress={onPress}>
      <View style={styles.imagesContainer}>
        {items?.slice(0, 2).map((item, index) => (
          <Image
            key={item.id}
            source={{ uri: item.image }}
            style={[
              styles.image,
              index === 1 && styles.stackedImage
            ]}
          />
        ))}
      </View>
      <View style={styles.overlay}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.count}>
          {items?.length || 0} items
        </Text>
      </View>
      </TouchableOpacity>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onFavorite}
        >
          <MaterialIcons
            name={isFavorite ? "favorite" : "favorite-border"}
            size={20}
            color={isFavorite ? colors.error : colors.textSecondary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onDelete}
        >
          <MaterialIcons
            name="delete-outline"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 1.3,
    marginRight: spacing.md,
    borderRadius: layout.borderRadius,
    backgroundColor: colors.background,
    shadowColor: colors.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  content: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.xs,
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  actionButton: {
    padding: spacing.xs,
  },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imagesContainer: {
    flex: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '70%',
    resizeMode: 'cover',
  },
  stackedImage: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    transform: [{ translateY: 10 }],
    opacity: 0.8,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  title: {
    ...typography.caption,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  count: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
});

export default OutfitItem;
