import React from 'react';
import { TouchableOpacity, Image, StyleSheet, Text, View } from 'react-native';
import { layout } from '../../../styles/theme';

const ClothingItem = ({ imageUrl, name, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.name} numberOfLines={2}>{name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  image: {
    width: '75%',
    height: '75%',
  },
  name: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default ClothingItem;
