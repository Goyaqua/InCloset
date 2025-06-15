import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { colors, spacing, typography } from '../../styles/theme';
import OutfitSection from '../../components/specific/home/OutfitSection';
import AllClothesSection from '../../components/specific/home/AllClothesSection';
import AIRequestSection from '../../components/specific/home/AIRequestSection';
import { getOutfits, getFavorites, getClothes, deleteOutfit, toggleFavorite } from '../../services/supabase/data';

const InclosetHomepage = ({ navigation, route }) => {
  const [loading, setLoading] = useState(true);
  const [savedOutfits, setSavedOutfits] = useState([]);
  const [favoriteOutfits, setFavoriteOutfits] = useState([]);
  const [clothes, setClothes] = useState([]);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  const loadData = useCallback(async (forceRefresh = false) => {
    // Don't refresh if it's been less than 30 seconds and not forced
    if (!forceRefresh && Date.now() - lastRefresh < 30000) {
      return;
    }

    try {
      setLoading(true);
      const [outfitsRes, favoritesRes, clothesRes] = await Promise.all([
        getOutfits(),
        getFavorites(),
        getClothes(5) // Only fetch first 5 clothes
      ]);

      if (outfitsRes.error) throw outfitsRes.error;
      if (favoritesRes.error) throw favoritesRes.error;
      if (clothesRes.error) throw clothesRes.error;

      const saved = outfitsRes.data || [];
      const favorites = favoritesRes.data || [];

      // Create a set of favorite outfit IDs for quick lookup
      const favoriteOutfitIds = new Set(favorites.map(fav => fav.id));

      // Add an isFavorite flag to saved outfits
      const savedOutfitsWithFavoriteFlag = saved.map(outfit => ({
        ...outfit,
        isFavorite: favoriteOutfitIds.has(outfit.id)
      }));

      setSavedOutfits(savedOutfitsWithFavoriteFlag);
      setFavoriteOutfits(favorites);
      setClothes(clothesRes.data || []);
      setLastRefresh(Date.now());
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [lastRefresh]);

  // Initial load
  useEffect(() => {
    loadData(true);
  }, []);

  // Focus listener with debounce
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });

    return unsubscribe;
  }, [navigation, loadData]);

  // Route params listener
  useEffect(() => {
    if (route.params?.refresh) {
      loadData(true);
      navigation.setParams({ refresh: undefined });
    }
  }, [route.params?.refresh, loadData]);

  const handleOutfitPress = (outfitId) => {
    navigation.navigate('OutfitScreen', { outfitId });
  };

  const handleAddOutfit = (section) => {
    navigation.navigate('Combine');
  };

  const handleDeleteOutfit = async (outfitId) => {
    try {
      const { data, error } = await deleteOutfit(outfitId);
      if (error) throw error;
      
      // Update both saved outfits and favorite outfits with the new data
      if (data) {
        // First remove the outfit from both lists immediately for instant feedback
        setSavedOutfits(prevOutfits => 
          prevOutfits.filter(outfit => outfit.id !== outfitId)
        );
        setFavoriteOutfits(prevFavorites => 
          prevFavorites.filter(outfit => outfit.id !== outfitId)
        );

        // Then update with the fresh data from the server
        setSavedOutfits(data.outfits);
        setFavoriteOutfits(data.favorites);
      }
    } catch (error) {
      console.error('Error deleting outfit:', error);
      Alert.alert('Error', 'Failed to delete outfit. Please try again.');
    }
  };

  const handleToggleFavorite = async (outfitId) => {
    try {
      const { data, error } = await toggleFavorite(outfitId);
      if (error) throw error;
      
      // Update both saved outfits and favorite outfits with the new data
      if (data) {
        setSavedOutfits(data.outfits);
        setFavoriteOutfits(data.favorites);
      }
      
      // Show feedback
      Alert.alert(
        data.isFavorite ? 'Added to Favorites' : 'Removed from Favorites',
        data.isFavorite ? 'The outfit has been added to your favorites.' : 'The outfit has been removed from your favorites.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorite status. Please try again.');
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

        <AIRequestSection style={{ marginHorizontal: spacing.lg, marginBottom: spacing.md }} />

        <OutfitSection
          title="SAVED OUTFITS"
          outfits={savedOutfits}
          onOutfitPress={handleOutfitPress}
          onAddPress={() => handleAddOutfit('saved')}
          onDelete={handleDeleteOutfit}
          onFavorite={handleToggleFavorite}
          onSectionPress={handleSavedOutfitsPress}
          backgroundColor={colors.container1}
          itemContainerColor={colors.itemcontainer1}
          textColor={colors.textcontainer1}
          style={{ marginHorizontal: spacing.lg, marginBottom: spacing.md }}
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
          itemContainerColor={colors.itemcontainer2}
          textColor={colors.textcontainer2}
          forceFavoriteIcon={true}
          style={{ marginHorizontal: spacing.lg, marginBottom: spacing.md }}
        />

        <AllClothesSection
          clothes={clothes}
          onItemPress={handleClothingPress}
          onSeeAllPress={handleSeeAll}
          onAddPress={handleAddClothes}
          style={{ marginHorizontal: spacing.lg, marginBottom: spacing.md }}
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
    fontSize: typography.title.fontSize,
    fontWeight: typography.title.fontWeight,
    letterSpacing: typography.title.letterSpacing,
    marginBottom: spacing.xs,
  },
  greeting: {
    fontSize: typography.subtitle.fontSize,
    fontWeight: typography.subtitle.fontWeight,
    color: colors.textSecondary,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
  },
});

export default InclosetHomepage;
