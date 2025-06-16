import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, SafeAreaView, SectionList, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../services/supabase/auth';
import { colors } from '../../styles/theme';
import { Ionicons } from '@expo/vector-icons';

// Import components
import SearchBar from '../../components/specific/closet/SearchBar';
import CategoryFilter from '../../components/specific/closet/CategoryFilter';
import ClothesGrid from '../../components/specific/closet/ClothesGrid';
import ClothingItem from '../../components/specific/home/ClothingItem';

const ClosetScreen = () => {
  const navigation = useNavigation();
  const [clothes, setClothes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchClothes = async () => {
    try {
      console.log('Fetching clothes with searchQuery:', searchQuery);
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

      const { data, error } = await query;
      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }
      // console.log('Supabase query data:', data);

      // Filter by search query
      const filteredData = data.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      // console.log('Filtered data for display:', filteredData);

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

  // Fetch clothes when search changes
  useEffect(() => {
    console.log('searchQuery changed, refetching clothes.');
    fetchClothes();
  }, [searchQuery]);

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

  // SectionList data
  const categoryOrder = [
    { key: 'top', label: 'Tops' },
    { key: 'bottom', label: 'Bottoms' },
    { key: 'shoes', label: 'Shoes' },
    { key: 'accessory', label: 'Accessories' },
  ];
  const sections = categoryOrder.map(cat => ({
    title: cat.label,
    key: cat.key,
    data: clothes.filter(item => item.type === cat.key)
  })).filter(section => section.data.length > 0);

  const sectionListRef = useRef();
  const categoryKeyToSectionIndex = Object.fromEntries(categoryOrder.map((cat, idx) => [cat.key, idx]));

  const handleCategoryPress = (catKey) => {
    const sectionIndex = sections.findIndex(section => section.key === catKey);
    if (sectionIndex !== -1 && sectionListRef.current) {
      sectionListRef.current.scrollToLocation({ sectionIndex, itemIndex: 0, viewOffset: 0, animated: true });
    }
  };

  // Render grid rows (3 items per row)
  const renderGridRow = ({ item }) => (
    <View style={styles.gridRow}>
      {item.map(cloth => (
        <View style={styles.clothingItem} key={cloth.id}>
          <ClothingItem
            imagePath={cloth.image_path}
            name={cloth.name}
            onPress={() => handlePressItem(cloth)}
            styles={cloth.styles}
            occasions={cloth.occasions}
          />
        </View>
      ))}
      {/* Fill empty columns if needed */}
      {Array.from({ length: 3 - item.length }).map((_, idx) => (
        <View style={styles.clothingItem} key={`empty-${idx}`} />
      ))}
    </View>
  );

  // Prepare section data as grid rows
  const getGridRows = (data) => {
    const rows = [];
    for (let i = 0; i < data.length; i += 3) {
      rows.push(data.slice(i, i + 3));
    }
    return rows;
  };

  return (
    <SafeAreaView style={styles.container}>
      <SearchBar 
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSearchPress={handleSearch}
      />
      <CategoryFilter 
        activeCategory={null}
        onSelectCategory={() => {}}
        onCategoryPress={handleCategoryPress}
      />
      <SectionList
        ref={sectionListRef}
        sections={sections.map(section => ({ ...section, data: getGridRows(section.data) }))}
        keyExtractor={(item, index) => item.map(i => i.id).join('-') + '-' + index}
        renderItem={renderGridRow}
        renderSectionHeader={({ section }) => (
          <View style={styles.categoryHeader}><Text style={styles.categoryHeaderText}>{section.title}</Text></View>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
      />
      <TouchableOpacity style={styles.fab} onPress={handleAddClothes}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
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
  categoryHeader: {
    marginBottom: 8,
    marginTop: 8,
    paddingHorizontal: 8,
  },
  categoryHeaderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 20,
    minHeight: 160,
  },
  clothingItem: {
    width: '33.33%',
    marginRight: 10,
  },
});

export default ClosetScreen;
