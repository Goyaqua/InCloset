import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { colors, spacing } from '../../styles/theme';
import { getOutfits, deleteOutfit, toggleFavorite, getFavorites } from '../../services/supabase/data';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ClothingItem from '../../components/specific/home/ClothingItem';
import { supabase } from '../../services/supabase/auth';

const { width } = Dimensions.get('window');

const OutfitScreen = ({ route, navigation }) => {
  const { outfitId } = route.params;
  const [loading, setLoading] = useState(true);
  const [outfit, setOutfit] = useState(null);
  const [outfitImageUrl, setOutfitImageUrl] = useState(null);

  useEffect(() => {
    loadOutfit();
  }, [outfitId]);

  const getSignedUrl = async (path) => {
    try {
      const { data, error } = await supabase.storage
        .from('userclothes')
        .createSignedUrl(path, 3600);
      
      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      return null;
    }
  };

  const loadOutfit = async () => {
    try {
      setLoading(true);
      const [outfitsRes, favoritesRes] = await Promise.all([
        getOutfits(),
        getFavorites()
      ]);
      
      if (outfitsRes.error) throw outfitsRes.error;
      if (favoritesRes.error) throw favoritesRes.error;

      const outfits = outfitsRes.data;
      const favorites = favoritesRes.data || [];

      let foundOutfit = outfits.find(o => o.id === outfitId);
      // Check if the outfit is in favorites
      const isFavorite = favorites.some(f => f.id === outfitId);
      foundOutfit = { ...foundOutfit, isFavorite };
      if (!foundOutfit) {
        throw new Error('Outfit not found');
      }

      // Get signed URL for the outfit image
      if (foundOutfit.image) {
        const signedUrl = await getSignedUrl(foundOutfit.image);
        setOutfitImageUrl(signedUrl);
      }

      setOutfit(foundOutfit);
    } catch (error) {
      console.error('Error loading outfit:', error);
      Alert.alert('Error', 'Failed to load outfit details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Outfit',
      'Are you sure you want to delete this outfit?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await deleteOutfit(outfitId);
              if (error) throw error;
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting outfit:', error);
              Alert.alert('Error', 'Failed to delete outfit');
            }
          }
        }
      ]
    );
  };

  const handleToggleFavorite = async () => {
    try {
      const { data, error } = await toggleFavorite(outfitId);
      if (error) throw error;
      
      // Update the outfit's favorite status locally
      setOutfit(prev => ({ ...prev, isFavorite: data.isFavorite }));
      
      // Show feedback
      Alert.alert(
        data.isFavorite ? 'Added to Favorites' : 'Removed from Favorites',
        data.isFavorite ? 'The outfit has been added to your favorites.' : 'The outfit has been removed from your favorites.',
        [{ text: 'OK' }]
      );
      
      // Navigate back to home with refresh parameter
      navigation.navigate('Home', { 
        refresh: true,
        screen: 'HomeScreen',
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorite status. Please try again.');
    }
  };

  const handleClothingPress = (clothingId) => {
    navigation.navigate('ClothingDetails', { itemId: clothingId });
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

  if (!outfit) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Outfit not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>OUTFIT DETAILS</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={handleToggleFavorite} style={styles.actionButton}>
              <MaterialCommunityIcons
                name={outfit.isFavorite ? "heart" : "heart-outline"}
                size={24}
                color={outfit.isFavorite ? colors.error : colors.text}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
              <MaterialCommunityIcons name="delete-outline" size={24} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Outfit Image */}
        <View style={styles.imageContainer}>
          {outfitImageUrl ? (
            <Image
              source={{ uri: outfitImageUrl }}
              style={styles.outfitImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <MaterialCommunityIcons name="image-outline" size={48} color={colors.textSecondary} />
            </View>
          )}
        </View>

        {/* Outfit Name */}
        <View style={styles.nameContainer}>
          <Text style={styles.outfitName}>{outfit.title}</Text>
        </View>

        {/* Items Grid */}
        <View style={styles.itemsContainer}>
          <Text style={styles.sectionTitle}>ITEMS IN THIS OUTFIT</Text>
          <View style={styles.grid}>
            {outfit.items.map((item, index) => (
              <View key={item.id} style={styles.gridItem}>
                <ClothingItem
                  imagePath={item.image}
                  onPress={() => handleClothingPress(item.id)}
                />
              </View>
            ))}
          </View>
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
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  imageContainer: {
    width: width,
    height: width * 0.8,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  outfitImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  nameContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  outfitName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  itemsContainer: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.md,
    color: colors.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -spacing.xs,
  },
  gridItem: {
    width: width * 0.3,
    marginHorizontal: spacing.xs,
    marginBottom: spacing.md,
  },
});

export default OutfitScreen;
