import React from 'react';
import { TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { layout } from '../../../styles/theme';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const SPACING = 16;
const ITEM_WIDTH = (width - (SPACING * (COLUMN_COUNT + 1))) / COLUMN_COUNT;

const ClothingItem = ({ image, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: image }}
        style={styles.image}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    margin: SPACING / 2,
    borderRadius: layout.borderRadius,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default ClothingItem;
