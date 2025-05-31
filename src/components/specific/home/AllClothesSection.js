import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { colors, spacing } from '../../../styles/theme';
import ClothingItem from './ClothingItem';

const AllClothesSection = ({ clothes, onItemPress, onSeeAllPress }) => {
  const renderItem = ({ item }) => (
    <ClothingItem
      image={item.image}
      onPress={() => onItemPress(item.id)}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>All Clothes</Text>
        <TouchableOpacity onPress={onSeeAllPress}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={clothes.slice(0, 6)} // Show only first 6 items
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        scrollEnabled={false}
        contentContainerStyle={styles.gridContainer}
      />
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  seeAll: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.primary,
  },
  gridContainer: {
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
});

export default AllClothesSection;
