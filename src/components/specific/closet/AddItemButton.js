import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AddItemButton = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.addItemContainer}>
        <Text style={styles.addItemIcon}>+</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  addItemContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  addItemIcon: {
    fontSize: 32,
    color: '#CCCCCC',
    fontWeight: '300',
  },
});

export default AddItemButton;
