import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../services/supabase/auth';
import { colors } from '../../styles/theme';

// Import components
import SearchBar from '../../components/specific/closet/SearchBar';
import CategoryFilter from '../../components/specific/closet/CategoryFilter';
import ClothesGrid from '../../components/specific/closet/ClothesGrid';

const ClosetScreen = () => {
  const navigation = useNavigation();
  const [clothes, setClothes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');

  const fetchClothes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('clothes')
        .select('*')
        .eq('user_id', user.id);

      if (activeCategory !== 'ALL') {
        // Convert category names to match database values
        const categoryMap = {
          'HATS': 'hat',
          'TOPS': 'top',
          'BOTTOMS': 'bottom',
          'SHOES': 'shoe'
        };
        query = query.eq('category', categoryMap[activeCategory]);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Filter by search query
      const filteredData = data.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setClothes(filteredData);
    } catch (error) {
      console.error('Error fetching clothes:', error.message);
    }
  };

  useEffect(() => {
    fetchClothes();
  }, [searchQuery, activeCategory]);

  // Navigate to add clothes screen
  const handleAddClothes = () => {
    navigation.navigate('AddClothes');
  };

  // Navigate to clothing details screen
  const handlePressItem = (item) => {
    navigation.navigate('ClothingDetails', { item });
  };

  const handleSearch = () => {
    // Trigger search immediately when search button is pressed
    fetchClothes();
  };

  return (
    <SafeAreaView style={styles.container}>
      <SearchBar 
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSearchPress={handleSearch}
      />
      <CategoryFilter 
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />
      <ClothesGrid 
        clothes={clothes}
        onPressItem={handlePressItem}
        onPressAdd={handleAddClothes}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export default ClosetScreen;
