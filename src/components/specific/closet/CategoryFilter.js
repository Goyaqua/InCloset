import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import CategoryButton from './CategoryButton';

const CATEGORIES = [
  { id: 'ALL', title: 'ALL', icon: null },
  { id: 'HATS', title: 'Hats', icon: '🎩' },
  { id: 'TOPS', title: 'Tops', icon: '👕' },
  { id: 'BOTTOMS', title: 'Bottoms', icon: '👖' },
  { id: 'SHOES', title: 'Shoes', icon: '👟' },
];

const CategoryFilter = ({ activeCategory, onSelectCategory }) => {
  return (
    <View style={styles.categoryContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryContent}
      >
        {CATEGORIES.map((category) => (
          <CategoryButton
            key={category.id}
            title={category.title}
            icon={category.icon}
            isActive={activeCategory === category.id}
            onPress={() => onSelectCategory(category.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  categoryContainer: {
    marginBottom: 20,
  },
  categoryContent: {
    paddingHorizontal: 16,
  },
});

export default CategoryFilter;
