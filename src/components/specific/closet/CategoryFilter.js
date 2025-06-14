import React from 'react';
import { FlatList, StyleSheet, View, Dimensions } from 'react-native';
import CategoryButton from './CategoryButton';

const CATEGORIES = [
  { id: 'ALL', title: 'ALL', icon: null },
  { id: 'top', title: 'Tops', icon: '👕' },
  { id: 'bottom', title: 'Bottoms', icon: '👖' },
  { id: 'dress', title: 'Dresses', icon: '👗' },
  { id: 'shoes', title: 'Shoes', icon: '👟' },
  { id: 'accessory', title: 'Accessories', icon: '💍' },
  { id: 'outerwear', title: 'Outerwear', icon: '🧥' },
  { id: 'bag', title: 'Bags', icon: '👜' },
];

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width / 4 - 15;

const CategoryFilter = ({ activeCategory, onSelectCategory }) => {
  const renderCategoryButton = ({ item }) => (
    <View style={styles.categoryButtonWrapper}>
      <CategoryButton
        key={item.id}
        title={item.title}
        icon={item.icon}
        isActive={activeCategory === item.id}
        onPress={() => onSelectCategory(item.id)}
      />
    </View>
  );

  return (
    <View style={styles.categoryContainer}>
      <FlatList
        data={CATEGORIES}
        renderItem={renderCategoryButton}
        keyExtractor={(item) => item.id}
        numColumns={4}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        contentContainerStyle={styles.categoryContent}
        columnWrapperStyle={styles.columnWrapper}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  categoryContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  categoryContent: {
    paddingHorizontal: 0,
  },
  columnWrapper: {
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  categoryButtonWrapper: {
    width: ITEM_WIDTH,
    marginHorizontal: 4,
  },
});

export default CategoryFilter;
