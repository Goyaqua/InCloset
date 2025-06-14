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
      console.log('Fetching clothes with activeCategory:', activeCategory, 'and searchQuery:', searchQuery);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found, returning empty array.');
        setClothes([]); // Ensure clothes are cleared if no user
        return;
      }

      let query = supabase
        .from('clothes')
        .select('*')
        .eq('user_id', user.id);

      if (activeCategory !== 'ALL') {
        // Directly use activeCategory as it now matches database values
        query = query.eq('type', activeCategory);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }
      console.log('Supabase query data:', data);

      // Filter by search query
      const filteredData = data.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      console.log('Filtered data for display:', filteredData);

      setClothes(filteredData);
    } catch (error) {
      console.error('Error fetching clothes:', error.message);
    }
  };

  // Focus listener to refresh data when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('ClosetScreen focused, refetching clothes.');
      fetchClothes();
    });

    return unsubscribe;
  }, [navigation]);

  // Fetch clothes when search or category changes
  useEffect(() => {
    console.log('searchQuery or activeCategory changed, refetching clothes.');
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
      <View style={styles.clothesGridContainer}>
        <ClothesGrid 
          clothes={clothes}
          onPressItem={handlePressItem}
          onPressAdd={handleAddClothes}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 10,
  },
  clothesGridContainer: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemContainer: {
    width: '47%',
    marginBottom: 15,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  itemImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  itemInfo: {
    padding: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  itemType: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default ClosetScreen;
