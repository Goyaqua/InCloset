import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { colors, spacing } from '../../styles/theme';
import OutfitSection from '../../components/specific/home/OutfitSection';
import AllClothesSection from '../../components/specific/home/AllClothesSection';
import InclosetAIAssistantSection from '../../components/specific/home/InclosetAIAssistantSection';
import { getOutfits, getFavorites, getClothes, deleteOutfit, toggleFavorite } from '../../services/supabase/data';

const InclosetHomepage = ({ navigation, route }) => {
  const [loading, setLoading] = useState(true);
  const [savedOutfits, setSavedOutfits] = useState([]);
  const [favoriteOutfits, setFavoriteOutfits] = useState([]);
  const [clothes, setClothes] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  // Add focus listener to refresh data when returning to this screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
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
    // Navigate to outfit detail screen
    console.log('Navigate to outfit:', outfitId);
  };

  const handleAddOutfit = async (section) => {
    // Navigate to create outfit screen
    console.log('Navigate to create outfit for section:', section);
    navigation.navigate('Combine'); // Navigate to the Combine page
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

  const handleClothingPress = (itemId) => {
    // Navigate to clothing detail screen
    console.log('Navigate to clothing:', itemId);
  };

  const handleSeeAll = () => {
    // Navigate to all clothes screen
    console.log('Navigate to all clothes');
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
      <View style={[styles.contentContainer, styles.scrollContent]}>
        <View style={styles.header}>
          <Text style={styles.title}>INCLOSET</Text>
          <Text style={styles.greeting}>Hello User!</Text>
        </View>

        <InclosetAIAssistantSection />

        <OutfitSection
          title="SAVED OUTFITS"
          outfits={savedOutfits}
          onOutfitPress={handleOutfitPress}
          onAddPress={() => handleAddOutfit('saved')}
          onDelete={handleDeleteOutfit}
          onFavorite={handleToggleFavorite}
          backgroundColor={colors.container1}
          itemContainerColor1={colors.textcontainer1}
        />

        <AllClothesSection
          clothes={clothes}
          onItemPress={handleClothingPress}
          onSeeAllPress={handleSeeAll}
        />
      </View>
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
  contentContainer: {
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
