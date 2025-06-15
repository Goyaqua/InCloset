import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { colors, spacing } from '../../styles/theme';
import { getOutfits, getFavorites } from '../../services/supabase/data';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import OutfitItem from '../../components/specific/home/OutfitItem';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.44; // Slightly less than half for margin

const SavedOutfitsScreen = ({ route, navigation }) => {
  const [loading, setLoading] = useState(true);
  const [outfits, setOutfits] = useState([]);
  const { type = 'saved' } = route.params || {};

  useEffect(() => {
    loadOutfits();
  }, [type]);

  const loadOutfits = async () => {
    try {
      setLoading(true);
      const [outfitsRes, favoritesRes] = await Promise.all([
        getOutfits(),
        getFavorites()
      ]);
      
      if (outfitsRes.error) throw outfitsRes.error;
      if (favoritesRes.error) throw favoritesRes.error;

      let displayOutfits = [];
      if (type === 'saved') {
        displayOutfits = outfitsRes.data;
      } else if (type === 'favorite') {
        displayOutfits = favoritesRes.data;
      }

      // Add isFavorite flag to each outfit
      const favorites = favoritesRes.data || [];
      displayOutfits = displayOutfits.map(outfit => ({
        ...outfit,
        isFavorite: favorites.some(f => f.id === outfit.id)
      }));

      setOutfits(displayOutfits);
    } catch (error) {
      console.error('Error loading outfits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOutfitPress = (outfitId) => {
    navigation.navigate('OutfitScreen', { outfitId });
  };

  const handleAddPress = () => {
    navigation.navigate('Combine');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {type === 'saved' ? 'SAVED OUTFITS' : 'FAVORITE OUTFITS'}
        </Text>
        <TouchableOpacity onPress={handleAddPress} style={styles.addButton}>
          <MaterialCommunityIcons name="plus" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.grid}>
          {outfits.map((outfit) => (
            <View key={outfit.id} style={styles.gridItem}>
              <OutfitItem
                title={outfit.title}
                image={outfit.image}
                onPress={() => handleOutfitPress(outfit.id)}
                isFavorite={outfit.isFavorite}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
  },
  addButton: {
    padding: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  gridItem: {
    width: ITEM_WIDTH,
    marginBottom: spacing.lg,
  },
});

export default SavedOutfitsScreen;
