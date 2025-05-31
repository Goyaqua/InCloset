import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../../../styles/theme';

const SearchBar = ({ value, onChangeText, onSearchPress }) => {

  return (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search Clothes"
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
      />
      <TouchableOpacity style={styles.searchButton} onPress={onSearchPress}>
        <Text style={styles.searchIcon}>🔍</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: 25,
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    marginHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 12,
  },
  searchButton: {
    padding: 8,
  },
  searchIcon: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});

export default SearchBar;
