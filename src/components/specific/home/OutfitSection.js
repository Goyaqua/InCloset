import React from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native';
import { colors, spacing } from '../../../styles/theme';
import OutfitItem from './OutfitItem';
import AddOutfitButton from './AddOutfitButton';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - spacing.md * 2 - spacing.sm * 2 - spacing.md * 2) / 2;

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
  const data = [...outfits, { id: 'add-button', isAddButton: true }];

  const renderItem = ({ item }) => {
    if (item.isAddButton) {
      return (
        <View style={styles.outfitItemWrapper}>
          <AddOutfitButton 
            onPress={onAddPress} 
            containerColor={itemContainerColor1 || itemContainerColor2}
          />
        </View>
      );
    }
    return (
      <View style={styles.outfitItemWrapper}>
        <OutfitItem
          title={item.title}
          image={item.image}
          onPress={() => onOutfitPress(item.id)}
          onDelete={() => onDelete(item.id)}
          onFavorite={() => onFavorite(item.id)}
          isFavorite={title.toLowerCase().includes('favourite')}
          containerColor={itemContainerColor1 || itemContainerColor2}
        />
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: itemContainerColor1 || itemContainerColor2 }]}>{title}</Text>
        <Text style={styles.count}>{outfits.length} outfits</Text>
      </View>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.columnWrapper}
      />
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
    minHeight: 250,
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
  gridContent: {
    paddingHorizontal: spacing.sm,
    flexGrow: 1,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  outfitItemWrapper: {
    width: ITEM_WIDTH,
    marginBottom: spacing.md,
  },
});

export default OutfitSection;
