import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import ClothingItem from '../home/ClothingItem';
import AddItemButton from './AddItemButton';
import { colors, spacing } from '../../../styles/theme';

const ClothesGrid = ({ clothes, onPressItem, onPressAdd }) => {
  const renderItem = ({ item, index }) => {
    if (item.isAddButton) {
      return (
        <View style={styles.clothingItem}>
          <AddItemButton onPress={onPressAdd} />
        </View>
      );
    }
    
    return (
      <View style={styles.clothingItem}>
        <ClothingItem
          imagePath={item.image_path}
          name={item.name}
          onPress={() => onPressItem(item)}
          styles={item.styles}
          occasions={item.occasions}
        />
      </View>
    );
  };

  const data = [...clothes, { id: 'add-button', isAddButton: true }];

  return (
    <View style={styles.gridContainer}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  listContainer: {
    paddingHorizontal: 0,
  },
  clothingItem: {
    width: '32%',
    marginBottom: 20,
    alignItems: 'center',
    height: 160,
  },
});

export default ClothesGrid;
