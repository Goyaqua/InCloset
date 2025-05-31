import React from 'react';
import { View, FlatList, StyleSheet, Dimensions } from 'react-native';
import ClothingItem from '../home/ClothingItem';
import AddItemButton from './AddItemButton';
import { colors, spacing } from '../../../styles/theme';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const ITEM_SPACING = spacing.sm;
const ITEM_WIDTH = (width - (spacing.lg * 2 + (COLUMN_COUNT - 1) * ITEM_SPACING)) / COLUMN_COUNT;

const ClothesGrid = ({ clothes, onPressItem, onPressAdd }) => {
  const renderItem = ({ item, index }) => {
    if (item.isAddButton) {
      return <AddItemButton onPress={onPressAdd} />;
    }
    
    return (
      <View style={[styles.itemContainer, { width: ITEM_WIDTH }]}>
        <ClothingItem
          imageUrl={item.image_url}
          name={item.name}
          onPress={() => onPressItem(item)}
        />
      </View>
    );
  };

  const data = [...clothes, { id: 'add-button', isAddButton: true }];

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      numColumns={COLUMN_COUNT}
      columnWrapperStyle={styles.row}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  row: {
    justifyContent: 'flex-start',
    gap: ITEM_SPACING,
    marginBottom: ITEM_SPACING,
  },
  itemContainer: {
    aspectRatio: 1,
  },
});

export default ClothesGrid;
