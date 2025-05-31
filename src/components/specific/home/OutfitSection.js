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
  backgroundColor 
}) => {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
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
            items={outfit.items}
            onPress={() => onOutfitPress(outfit.id)}
          />
        ))}
        <AddOutfitButton onPress={onAddPress} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
    flex: 1,
  },
  count: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
});

export default OutfitSection;
