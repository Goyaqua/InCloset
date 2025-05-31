import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Modal,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { supabase } from '../../services/supabase/auth';
import { colors, spacing, typography } from '../../styles/theme';
import ClothingItem from '../../components/specific/home/ClothingItem';
import DraggableClothingItem from '../../components/specific/closet/DraggableClothingItem';
import CategoryFilter from '../../components/specific/closet/CategoryFilter';
import SearchBar from '../../components/specific/closet/SearchBar';
import { Button } from '../../components/common/Button';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.7;
const ITEM_WIDTH = 100; // Width of draggable items
const ITEM_SPACING = 20; // Spacing between items

const CombineClothesScreen = () => {
  const [clothes, setClothes] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [canvasItems, setCanvasItems] = useState([]);
  
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const calculateInitialPosition = (index) => {
    const itemsPerRow = Math.floor((SCREEN_WIDTH - spacing.md * 2) / (ITEM_WIDTH + ITEM_SPACING));
    const row = Math.floor(index / itemsPerRow);
    const col = index % itemsPerRow;
    
    return {
      x: spacing.md + col * (ITEM_WIDTH + ITEM_SPACING),
      y: spacing.md + row * (ITEM_WIDTH + ITEM_SPACING),
    };
  };

  const showBottomSheet = () => {
    setShowPicker(true);
    fetchClothes();
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideBottomSheet = (shouldAddItems = false) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowPicker(false);
      if (shouldAddItems && selectedItems.length > 0) {
        const newItems = selectedItems.map((item) => ({
          ...item,
          position: calculateInitialPosition(canvasItems.length),
        }));
        setCanvasItems([...canvasItems, ...newItems]);
        setSelectedItems([]);
      }
    });
  };

  const fetchClothes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'Please login to view your clothes');
        return;
      }

      let query = supabase
        .from('clothes')
        .select('*')
        .eq('user_id', user.id);

      if (activeCategory !== 'ALL') {
        const categoryMap = {
          'HATS': 'hat',
          'TOPS': 'top',
          'BOTTOMS': 'bottom',
          'SHOES': 'shoe',
          'ACCESSORIES': 'accessories'
        };
        query = query.eq('category', categoryMap[activeCategory]);
      }

      const { data, error } = await query;
      if (error) throw error;

      const filteredData = data.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setClothes(filteredData || []);
    } catch (error) {
      Alert.alert('Error', error.message || 'Error fetching clothes');
    }
  };

  const toggleItemSelection = (item) => {
    if (selectedItems.find(selected => selected.id === item.id)) {
      setSelectedItems(selectedItems.filter(selected => selected.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleSearch = () => {
    fetchClothes();
  };

  const isItemSelected = (item) => {
    return selectedItems.some(selected => selected.id === item.id);
  };

  const saveOutfit = async () => {
    if (canvasItems.length === 0) {
      Alert.alert('Error', 'Please add some items to your outfit');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'Please login to save outfits');
        return;
      }

      const { data, error } = await supabase
        .from('outfits')
        .insert([{
          name: 'New Outfit',
          clothes_ids: canvasItems.map(item => item.id),
          user_id: user.id,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;
      
      Alert.alert('Success', 'Outfit saved successfully!');
      setCanvasItems([]);
    } catch (error) {
      Alert.alert('Error', error.message || 'Error saving outfit');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {canvasItems.length === 0 ? (
        <TouchableOpacity style={styles.emptyCanvas} onPress={showBottomSheet}>
          <View style={styles.addButton}>
            <MaterialCommunityIcons name="plus" size={40} color={colors.primary} />
          </View>
          <Text style={styles.emptyText}>Tap to add clothes</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.canvasContainer}>
          <View style={styles.canvas}>
            {canvasItems.map((item, index) => (
              <DraggableClothingItem
                key={`${item.id}-${index}`}
                imageUrl={item.image_url}
                name={item.name}
                initialPosition={item.position}
              />
            ))}
          </View>
          <TouchableOpacity 
            style={styles.floatingButton}
            onPress={showBottomSheet}
          >
            <MaterialCommunityIcons name="plus" size={30} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.footer}>
        <Button
          title="Save Outfit"
          onPress={saveOutfit}
          disabled={canvasItems.length === 0}
        />
      </View>

      <Modal visible={showPicker} transparent animationType="none">
        <Animated.View style={[styles.modalContainer, { opacity: backdropOpacity }]}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => hideBottomSheet()}
          />
          <Animated.View 
            style={[
              styles.modalContent, 
              { transform: [{ translateY: slideAnim }] }
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTop}>
                <TouchableOpacity onPress={() => hideBottomSheet()}>
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>
                  Select Items ({selectedItems.length})
                </Text>
                <TouchableOpacity onPress={() => hideBottomSheet(true)}>
                  <Text style={[styles.modalButtonText, styles.modalDoneButton]}>
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
              <SearchBar 
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSearchPress={handleSearch}
              />
              <CategoryFilter 
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
              />
            </View>

            <ScrollView style={styles.gridContainer}>
              <View style={styles.grid}>
                {clothes.map((item) => (
                  <View key={item.id} style={styles.gridItem}>
                    <ClothingItem
                      imageUrl={item.image_url}
                      name={item.name}
                      onPress={() => toggleItemSelection(item)}
                      selected={isItemSelected(item)}
                    />
                  </View>
                ))}
              </View>
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  emptyCanvas: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.subtitle,
    color: colors.textSecondary,
  },
  canvasContainer: {
    flex: 1,
  },
  canvas: {
    flex: 1,
    backgroundColor: colors.background,
  },
  floatingButton: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  footer: {
    padding: spacing.md,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    height: MODAL_HEIGHT,
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalTitle: {
    ...typography.subtitle,
    fontWeight: '600',
  },
  modalButtonText: {
    fontSize: 16,
    color: colors.primary,
  },
  modalDoneButton: {
    fontWeight: '600',
  },
  gridContainer: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.sm,
  },
  gridItem: {
    width: '33.33%',
    padding: spacing.xs,
  },
});

export default CombineClothesScreen;
