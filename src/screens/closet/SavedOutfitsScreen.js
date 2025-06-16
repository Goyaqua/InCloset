import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
  Platform
} from 'react-native';
import { colors, spacing } from '../../styles/theme';
import { getOutfits, getFavorites, deleteOutfit } from '../../services/supabase/data';
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
      Alert.alert('Error', 'Failed to load outfits. Please try again.');
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

  const handleDeleteOutfit = async (outfitId) => {
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
              const { data, error } = await deleteOutfit(outfitId);
              if (error) throw error;
              
              // First remove the outfit from the current list
              setOutfits(prevOutfits => 
                prevOutfits.filter(outfit => outfit.id !== outfitId)
              );

              // Then update with the fresh data from the server
              if (data) {
                if (type === 'saved') {
                  setOutfits(data.outfits);
                } else if (type === 'favorite') {
                  setOutfits(data.favorites);
                }
              }

              // Navigate back if we're in the outfit details screen
              if (navigation.canGoBack()) {
                navigation.goBack();
              }
            } catch (error) {
              console.error('Error deleting outfit:', error);
              Alert.alert('Error', 'Failed to delete outfit. Please try again.');
            }
          }
        }
      ]
    );
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
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <TouchableOpacity
              style={[styles.plusCard, { width: ITEM_WIDTH, height: 200, borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}
              onPress={handleAddPress}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="plus" size={48} color={colors.primary} />
              <Text style={{ color: colors.textSecondary, marginTop: 8, fontSize: 14, fontWeight: '500' }}>Add Outfit</Text>
            </TouchableOpacity>
          </View>
          {outfits.map((outfit) => (
            <View key={outfit.id} style={styles.gridItem}>
              <OutfitItem
                title={outfit.title}
                image={outfit.image}
                onPress={() => handleOutfitPress(outfit.id)}
                onDelete={() => handleDeleteOutfit(outfit.id)}
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
    paddingTop: Platform.OS === 'android' ? 40 : spacing.md,
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
  scrollView: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  gridItem: {
    width: ITEM_WIDTH,
    marginBottom: spacing.md,
  },
  plusCard: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
});

export default SavedOutfitsScreen;
