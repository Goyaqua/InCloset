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
  Dimensions,
  Platform
} from 'react-native';
import { colors, spacing } from '../../styles/theme';
import { getOutfits, deleteOutfit, toggleFavorite, getFavorites, getClothes } from '../../services/supabase/data';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ClothingItem from '../../components/specific/home/ClothingItem';
import { supabase } from '../../services/supabase/auth';

const { width } = Dimensions.get('window');

const OutfitScreen = ({ route, navigation }) => {
  const { outfitId, refresh } = route.params;
  const [loading, setLoading] = useState(true);
  const [outfit, setOutfit] = useState(null);
  const [outfitImageUrl, setOutfitImageUrl] = useState(null);
  const [itemLoading, setItemLoading] = useState(false);

  useEffect(() => {
    loadOutfit();
  }, [outfitId]);

  // Handle refresh parameter and focus events
  useEffect(() => {
    if (refresh) {
      loadOutfit();
    }
  }, [refresh]);

  // Add focus listener to refresh data when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadOutfit();
    });

    return unsubscribe;
  }, [navigation]);

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

  const handleClothingPress = async (clothingId) => {
    setItemLoading(true);
    try {
      const { data, error } = await getClothes();
      if (error) throw error;
      const clothingItem = data.find(i => i.id === clothingId);
      if (clothingItem) {
        navigation.navigate('ClothingDetails', { item: clothingItem });
      } else {
        Alert.alert('Error', 'Clothing item not found.');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to load clothing item.');
    } finally {
      setItemLoading(false);
    }
  };

  if (loading || itemLoading) {
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
      <View style={[styles.headerSafe, Platform.OS === 'android' && { paddingTop: 32 }]}> 
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.pageTitleHeader}>OUTFIT DETAILS</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => navigation.navigate('Combine', { screen: 'CombineScreen', params: { outfitId, outfit } })} style={styles.actionButton}>
              <MaterialCommunityIcons name="pencil" size={22} color={colors.text} />
            </TouchableOpacity>
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
      </View>
      <View style={styles.titleContainer}>
        <Text style={styles.outfitName}>{outfit.title}</Text>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Outfit Image */}
        <View style={styles.imageCard}>
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
        </View>
        {/* Items Grid */}
        <View style={styles.itemsContainer}>
          <Text style={styles.sectionTitle}>ITEMS IN THIS OUTFIT</Text>
          <View style={styles.closetGrid}>
            {Array.from({ length: Math.ceil(outfit.items.length / 3) }).map((_, rowIdx) => (
              <View key={rowIdx} style={styles.closetGridRow}>
                {outfit.items.slice(rowIdx * 3, rowIdx * 3 + 3).map(item => (
                  <View key={item.id} style={styles.closetGridItem}>
                    <ClothingItem
                      imagePath={item.image}
                      onPress={() => handleClothingPress(item.id)}
                    />
                  </View>
                ))}
                {/* Fill empty columns if needed */}
                {Array.from({ length: 3 - (outfit.items.slice(rowIdx * 3, rowIdx * 3 + 3).length) }).map((_, idx) => (
                  <View key={`empty-${idx}`} style={styles.closetGridItem} />
                ))}
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
  titleContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
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
  imageCard: {
    margin: spacing.lg,
  },
  closetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -spacing.xs,
  },
  closetGridItem: {
    width: width * 0.3,
    marginHorizontal: spacing.xs,
    marginBottom: spacing.md,
    backgroundColor: 'transparent',
    borderRadius: 0,
    shadowColor: 'transparent',
    elevation: 0,
    overflow: 'visible',
  },
  closetGridRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: spacing.md,
  },
  headerSafe: {
    backgroundColor: colors.background,
    zIndex: 10,
  },
  pageTitleHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.textSecondary,
  },
});

export default OutfitScreen;
