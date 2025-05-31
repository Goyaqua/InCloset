import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { colors, spacing } from '../../styles/theme';
import OutfitSection from '../../components/specific/home/OutfitSection';
import AllClothesSection from '../../components/specific/home/AllClothesSection';
import BottomNavigation from '../../components/specific/home/BottomNavigation';

// Sample data - replace with actual data from your backend
const sampleOutfits = [
  {
    id: 1,
    title: 'Summer Casual',
    items: [
      { id: 1, image: 'https://via.placeholder.com/150' },
      { id: 2, image: 'https://via.placeholder.com/150' }
    ]
  },
  {
    id: 2,
    title: 'Work Outfit',
    items: [
      { id: 3, image: 'https://via.placeholder.com/150' },
      { id: 4, image: 'https://via.placeholder.com/150' }
    ]
  }
];

const sampleClothes = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  image: 'https://via.placeholder.com/150',
  category: 'tops'
}));

const InclosetHomepage = () => {
  const [activeTab, setActiveTab] = useState('home');

  const handleOutfitPress = (outfitId) => {
    console.log('Outfit pressed:', outfitId);
  };

  const handleAddOutfit = (section) => {
    console.log('Add outfit to section:', section);
  };

  const handleClothingPress = (itemId) => {
    console.log('Clothing item pressed:', itemId);
  };

  const handleSeeAll = () => {
    console.log('See all clothes pressed');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>INCLOSET</Text>
          <Text style={styles.greeting}>Hello User!</Text>
        </View>

        <OutfitSection
          title="Saved Outfits"
          outfits={sampleOutfits}
          onOutfitPress={handleOutfitPress}
          onAddPress={() => handleAddOutfit('saved')}
          backgroundColor={colors.primary + '10'} // 10% opacity
        />

        <OutfitSection
          title="Favourite Outfits"
          outfits={sampleOutfits}
          onOutfitPress={handleOutfitPress}
          onAddPress={() => handleAddOutfit('favourite')}
          backgroundColor={colors.success + '10'} // 10% opacity
        />

        <AllClothesSection
          clothes={sampleClothes}
          onItemPress={handleClothingPress}
          onSeeAllPress={handleSeeAll}
        />

        {/* Add padding at the bottom for the navigation bar */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      <BottomNavigation
        activeTab={activeTab}
        onTabPress={setActiveTab}
      />
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
  bottomPadding: {
    height: 80, // Height of the bottom navigation + extra padding
  },
});

export default InclosetHomepage;
