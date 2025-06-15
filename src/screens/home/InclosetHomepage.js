import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { colors, spacing } from '../../styles/theme';
import OutfitSection from '../../components/specific/home/OutfitSection';
import AllClothesSection from '../../components/specific/home/AllClothesSection';
import { getOutfits, getFavorites, getClothes, deleteOutfit, toggleFavorite } from '../../services/supabase/data';

const InclosetHomepage = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [savedOutfits, setSavedOutfits] = useState([]);
  const [favoriteOutfits, setFavoriteOutfits] = useState([]);
  const [clothes, setClothes] = useState([]);

  useEffect(() => {
    loadData();

    // Add navigation listener for when screen comes into focus
    const unsubscribe = navigation.addListener('focus', (e) => {
      // Check for refresh param in route
      const refresh = navigation.getState().routes
        .find(route => route.name === 'Home')?.params?.refresh;
      if (refresh) {
        loadData();
        // Clear the refresh param
        navigation.setParams({ refresh: undefined });
      }
    });

    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [outfitsRes, favoritesRes, clothesRes] = await Promise.all([
        getOutfits(),
        getFavorites(),
        getClothes()
      ]);

      if (outfitsRes.error) throw outfitsRes.error;
      if (favoritesRes.error) throw favoritesRes.error;
      if (clothesRes.error) throw clothesRes.error;

      setSavedOutfits(outfitsRes.data || []);
      setFavoriteOutfits(favoritesRes.data || []);
      setClothes(clothesRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      // You might want to show an error message to the user here
    } finally {
      setLoading(false);
    }
  };

  const handleOutfitPress = (outfitId) => {
    navigation.navigate('OutfitScreen', { outfitId });
  };

  const handleAddOutfit = (section) => {
    navigation.navigate('Combine');
  };

  const handleDeleteOutfit = async (outfitId) => {
    try {
      const { error } = await deleteOutfit(outfitId);
      if (error) throw error;
      await loadData(); // Reload data after deletion
    } catch (error) {
      console.error('Error deleting outfit:', error);
      // Show error message to user
    }
  };

  const handleToggleFavorite = async (outfitId) => {
    try {
      const { error } = await toggleFavorite(outfitId);
      if (error) throw error;
      await loadData(); // Reload data after toggling favorite
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Show error message to user
    }
  };

  const handleSavedOutfitsPress = () => {
    navigation.navigate('SavedOutfits', { type: 'saved' });
  };

  const handleFavoriteOutfitsPress = () => {
    navigation.navigate('SavedOutfits', { type: 'favorite' });
  };

  const handleClothingPress = (itemId) => {
    navigation.navigate('ClothingDetails', { itemId });
  };

  const handleSeeAll = () => {
    navigation.navigate('Closet');
  };

  const handleAddClothes = () => {
    navigation.navigate('AddClothes');
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
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>INCLOSET</Text>
          <Text style={styles.greeting}>Hello User!</Text>
        </View>

        <OutfitSection
          title="SAVED OUTFITS"
          outfits={savedOutfits}
          onOutfitPress={handleOutfitPress}
          onAddPress={() => handleAddOutfit('saved')}
          onDelete={handleDeleteOutfit}
          onFavorite={handleToggleFavorite}
          onSectionPress={handleSavedOutfitsPress}
          backgroundColor={colors.container1}
          itemContainerColor1={colors.textcontainer1}
        />

        <OutfitSection
          title="FAVOURITE OUTFITS"
          outfits={favoriteOutfits}
          onOutfitPress={handleOutfitPress}
          onAddPress={() => handleAddOutfit('favourite')}
          onDelete={handleDeleteOutfit}
          onFavorite={handleToggleFavorite}
          onSectionPress={handleFavoriteOutfitsPress}
          backgroundColor={colors.container2}
          itemContainerColor2={colors.textcontainer2}
        />

        <AllClothesSection
          clothes={clothes}
          onItemPress={handleClothingPress}
          onSeeAllPress={handleSeeAll}
          onAddPress={handleAddClothes}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
  },
});

export default InclosetHomepage;
