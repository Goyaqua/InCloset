import React from 'react';
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

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.25;

const OutfitItem = ({ 
  title, 
  items = [], 
  onPress, 
  onDelete, 
  onFavorite, 
  isFavorite, 
  containerColor 
}) => {
  return (
    <View style={[styles.container, { backgroundColor: containerColor }]}>
      <TouchableOpacity style={styles.content} onPress={onPress} activeOpacity={0.8}>
        <View style={styles.imagesContainer}>
          {items?.slice(0, 3).map((item, index) => (
            <Image
              key={item.id}
              source={{ uri: item.image }}
              style={[
                styles.image,
                { zIndex: 3 - index },
              ]}
            />
          ))}
        </View>
      </TouchableOpacity>
      
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={onFavorite}>
          <MaterialIcons
            name={isFavorite ? 'favorite' : 'favorite-border'}
            size={16}
            color={isFavorite ? colors.danger : colors.textSecondary}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
          <MaterialIcons
            name="delete-outline"
            size={16}
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
    height: ITEM_WIDTH * 1.5,
    marginRight: spacing.md,
    borderRadius: layout.borderRadius * 1.5,
    padding: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagesContainer: {
    width: '100%',
    height: '75%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  image: {
    width: '85%',
    height: '85%',
    resizeMode: 'cover',
    borderRadius: layout.borderRadius,
    position: 'absolute',
    backgroundColor: colors.background,
  },
  title: {
    ...typography.caption,
    color: colors.text,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    fontWeight: '600',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.xs,
  },
  actionButton: {
    padding: spacing.xs,
  },
});

export default OutfitItem;
