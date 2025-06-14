import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing } from '../../../styles/theme';
import OutfitItem from './OutfitItem';
import AddOutfitButton from './AddOutfitButton';

const OutfitSection = ({
  title,
  outfits,
  onOutfitPress,
  onAddPress,
  onDelete,
  onFavorite,
  backgroundColor,
  itemContainerColor1,
  itemContainerColor2
}) => {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: itemContainerColor1 || itemContainerColor2 }]}>{title}</Text>
        <Text style={styles.count}>{outfits.length} outfits</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {outfits.map((outfit) => (
          <OutfitItem
            key={outfit.id}
            title={outfit.title}
            image={outfit.image}
            onPress={() => onOutfitPress(outfit.id)}
            onDelete={() => onDelete(outfit.id)}
            onFavorite={() => onFavorite(outfit.id)}
            isFavorite={title.toLowerCase().includes('favourite')}
            containerColor={itemContainerColor1 || itemContainerColor2}
          />
        ))}
        <AddOutfitButton 
          onPress={onAddPress} 
          containerColor={itemContainerColor1 || itemContainerColor2}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    marginHorizontal: spacing.md,
    borderRadius: 25,
    backgroundColor: colors.container1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
    flex: 1,
  },
  count: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
});

export default OutfitSection;
