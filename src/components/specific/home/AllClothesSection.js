import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { colors, spacing } from '../../../styles/theme';
import ClothingItem from './ClothingItem';
import AddItemButton from '../closet/AddItemButton';
import { Ionicons } from '@expo/vector-icons';

const AllClothesSection = ({ clothes, onItemPress, onSeeAllPress, onAddPress }) => {
  const renderItem = ({ item }) => {
    if (item.isAddButton) {
      return (
        <View style={styles.clothingItem}>
          <AddItemButton onPress={onAddPress} />
        </View>
      );
    }
    
    return (
      <View style={styles.clothingItem}>
        <ClothingItem
          imagePath={item.image_path}
          name={item.name}
          onPress={() => onItemPress(item.id)}
          styles={item.styles}
          occasions={item.occasions}
        />
      </View>
    );
  };

  // Add the "Add" button to the end of the first 5 items
  const limitedClothes = clothes.slice(0, 5);
  const data = [...limitedClothes, { id: 'add-button', isAddButton: true }];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ALL CLOTHES</Text>
        <TouchableOpacity onPress={onSeeAllPress} style={styles.seeAllContainer}>
          <Text style={styles.seeAll}>SEE ALL</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.gridContainer}>
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          scrollEnabled={false}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No clothes added yet</Text>
            </View>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: spacing.md,
    marginHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  seeAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: spacing.xs,
    color: colors.primary,
  },
  gridContainer: {
    flex: 1,
    paddingHorizontal: spacing.sm,
  },
  listContainer: {
    paddingHorizontal: 0,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  clothingItem: {
    width: '30%',
    alignItems: 'center',
    height: 160,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});

export default AllClothesSection;
