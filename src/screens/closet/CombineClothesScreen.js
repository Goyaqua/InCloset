import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  Image,
  TextInput,
} from 'react-native';
import { supabase } from '../../services/supabase/auth';
import { colors, spacing, typography } from '../../styles/theme';
import ClothingItem from '../../components/specific/home/ClothingItem';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const clothingCategories = [
  { id: 'accessories', label: 'Hat/Accessories', icon: 'hat-fedora', types: ['accessories'] },
  { id: 'shirt', label: 'Top', icon: 'tshirt-crew-outline', types: ['shirt', 'jacket', 'dress'] },
  { id: 'pants', label: 'Bottom', icon: 'human-handsdown', types: ['pants'] },
  { id: 'shoes', label: 'Shoes', icon: 'shoe-sneaker', types: ['shoes'] },
];

const CombineClothesScreen = () => {
  const [outfitName, setOutfitName] = useState('My New Outfit');
  const [isEditingName, setIsEditingName] = useState(false);
  const [selectedItems, setSelectedItems] = useState({
    accessories: null,
    shirt: null,
    pants: null,
    shoes: null,
  });
  const [categoryItems, setCategoryItems] = useState({
    accessories: [],
    shirt: [],
    pants: [],
    shoes: [],
  });
  const [currentIndices, setCurrentIndices] = useState({
    accessories: 0,
    shirt: 0,
    pants: 0,
    shoes: 0,
  });
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchClothes();
  }, []);

  const fetchClothes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'Please login to view your clothes');
        return;
      }

      const { data, error } = await supabase
        .from('clothes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group clothes by category
      const groupedItems = {
        accessories: [],
        shirt: [],
        pants: [],
        shoes: [],
      };

      data.forEach(item => {
        clothingCategories.forEach(category => {
          if (category.types.includes(item.type)) {
            groupedItems[category.id].push(item);
          }
        });
      });

      setCategoryItems(groupedItems);

      // Set initial selected items to first item in each category
      const initialSelected = {};
      Object.keys(groupedItems).forEach(categoryId => {
        if (groupedItems[categoryId].length > 0) {
          initialSelected[categoryId] = groupedItems[categoryId][0];
        } else {
          initialSelected[categoryId] = null;
        }
      });
      setSelectedItems(initialSelected);

    } catch (error) {
      console.error('Error fetching clothes:', error);
      Alert.alert('Error', error.message || 'Error fetching clothes');
    }
  };

  const navigateItem = (categoryId, direction) => {
    const items = categoryItems[categoryId];
    if (items.length === 0) return;

    const currentIndex = currentIndices[categoryId];
    let newIndex;

    if (direction === 'left') {
      newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
    } else {
      newIndex = currentIndex === items.length - 1 ? 0 : currentIndex + 1;
    }

    setCurrentIndices(prev => ({
      ...prev,
      [categoryId]: newIndex
    }));

    setSelectedItems(prev => ({
      ...prev,
      [categoryId]: items[newIndex]
    }));
  };

  const openItemPicker = (categoryId) => {
    setActiveCategory(categoryId);
    setShowItemPicker(true);
  };

  const selectItemFromPicker = (item) => {
    if (activeCategory) {
      setSelectedItems(prev => ({
        ...prev,
        [activeCategory]: item
      }));

      // Update current index
      const categoryIndex = categoryItems[activeCategory].findIndex(i => i.id === item.id);
      setCurrentIndices(prev => ({
        ...prev,
        [activeCategory]: categoryIndex
      }));
    }
    setShowItemPicker(false);
    setActiveCategory(null);
  };

  const saveOutfit = async () => {
    const selectedItemsList = Object.values(selectedItems).filter(item => item !== null);
    
    if (selectedItemsList.length === 0) {
      Alert.alert('Error', 'Please select at least one clothing item');
      return;
    }

    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'Please login to save outfits');
        return;
      }

      // Create outfit
      const { data: outfit, error: outfitError } = await supabase
        .from('outfits')
        .insert([{
          name: outfitName,
          user_id: user.id,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (outfitError) throw outfitError;

      // Create outfit items
      const outfitItems = selectedItemsList.map(item => ({
        outfit_id: outfit.id,
        clothing_id: item.id
      }));

      const { error: itemsError } = await supabase
        .from('outfit_items')
        .insert(outfitItems);

      if (itemsError) throw itemsError;

      Alert.alert('Success', 'Outfit saved successfully!', [
        { text: 'OK', onPress: () => resetOutfit() }
      ]);

    } catch (error) {
      console.error('Error saving outfit:', error);
      Alert.alert('Error', error.message || 'Error saving outfit');
    } finally {
      setIsSaving(false);
    }
  };

  const resetOutfit = () => {
    setOutfitName('My New Outfit');
    setCurrentIndices({
      accessories: 0,
      shirt: 0,
      pants: 0,
      shoes: 0,
    });
    // Reset to first items
    const initialSelected = {};
    Object.keys(categoryItems).forEach(categoryId => {
      if (categoryItems[categoryId].length > 0) {
        initialSelected[categoryId] = categoryItems[categoryId][0];
      } else {
        initialSelected[categoryId] = null;
      }
    });
    setSelectedItems(initialSelected);
  };

  const renderClothingSlot = (category) => {
    const selectedItem = selectedItems[category.id];
    const items = categoryItems[category.id];
    const hasItems = items.length > 0;

    return (
      <View key={category.id} style={styles.clothingSlot}>
        <View style={styles.slotContainer}>
          <TouchableOpacity
            style={[styles.navButton, !hasItems && styles.navButtonDisabled]}
            onPress={() => navigateItem(category.id, 'left')}
            disabled={!hasItems}
          >
            <MaterialCommunityIcons name="chevron-left" size={24} color={hasItems ? colors.primary : colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.itemContainer}
            onPress={() => hasItems && openItemPicker(category.id)}
          >
            {selectedItem ? (
              <ClothingItemImage imagePath={selectedItem.image_path} />
            ) : (
              <View style={styles.emptySlot}>
                <MaterialCommunityIcons name={category.icon} size={40} color={colors.textSecondary} />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, !hasItems && styles.navButtonDisabled]}
            onPress={() => navigateItem(category.id, 'right')}
            disabled={!hasItems}
          >
            <MaterialCommunityIcons name="chevron-right" size={24} color={hasItems ? colors.primary : colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.itemName}>
          {selectedItem ? selectedItem.name : category.label}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>CREATE YOUR OUTFIT</Text>
        
        <View style={styles.outfitNameContainer}>
          <Text style={styles.outfitNameLabel}>OUTFIT NAME</Text>
          <TouchableOpacity onPress={() => setIsEditingName(true)}>
            <MaterialCommunityIcons name="pencil" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {isEditingName ? (
          <TextInput
            style={styles.outfitNameInput}
            value={outfitName}
            onChangeText={setOutfitName}
            onBlur={() => setIsEditingName(false)}
            onSubmitEditing={() => setIsEditingName(false)}
            autoFocus
            selectTextOnFocus
          />
        ) : (
          <TouchableOpacity onPress={() => setIsEditingName(true)}>
            <Text style={styles.outfitNameText}>{outfitName}</Text>
          </TouchableOpacity>
        )}

        <View style={styles.slotsContainer}>
          {clothingCategories.map(category => renderClothingSlot(category))}
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={resetOutfit}>
          <Text style={styles.cancelButtonText}>CANCEL</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} 
          onPress={saveOutfit}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'SAVING...' : 'SAVE'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Item Picker Modal */}
      <Modal visible={showItemPicker} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowItemPicker(false)}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              Select {activeCategory && clothingCategories.find(c => c.id === activeCategory)?.label}
            </Text>
            <TouchableOpacity onPress={() => setShowItemPicker(false)}>
              <Text style={[styles.modalButtonText, styles.modalDoneButton]}>Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.modalGrid}>
              {activeCategory && categoryItems[activeCategory].map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.modalGridItem}
                  onPress={() => selectItemFromPicker(item)}
                >
                  <ClothingItem
                    imagePath={item.image_path}
                    name={item.name}
                    selected={selectedItems[activeCategory]?.id === item.id}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

// Helper component for displaying clothing images
const ClothingItemImage = ({ imagePath }) => {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const getSignedUrl = async () => {
      try {
        const { data: { signedUrl }, error } = await supabase.storage
          .from('userclothes')
          .createSignedUrl(imagePath, 3600);
        
        if (error) {
          console.error('Error getting signed URL:', error);
          return;
        }
        
        if (signedUrl) {
          setImageUrl(signedUrl);
        }
      } catch (error) {
        console.error('Error in getSignedUrl:', error);
      }
    };

    if (imagePath) {
      getSignedUrl();
    }
  }, [imagePath]);

  return (
    <View style={styles.imageContainer}>
      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          style={styles.itemImage}
          resizeMode="contain"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#000000',
    marginBottom: spacing.xl,
  },
  outfitNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  outfitNameLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    marginRight: spacing.sm,
  },
  outfitNameInput: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    padding: spacing.sm,
    minWidth: 150,
  },
  outfitNameText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  slotsContainer: {
    flex: 1,
    justifyContent: 'space-around',
    paddingVertical: spacing.lg,
  },
  clothingSlot: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  slotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  navButton: {
    padding: spacing.md,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  itemContainer: {
    width: 150,
    height: 150,
    marginHorizontal: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  emptySlot: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: '#EC4899',
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: '#6366F1',
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#D1D5DB',
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  modalButtonText: {
    fontSize: 16,
    color: colors.primary,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  modalDoneButton: {
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: spacing.md,
  },
  modalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  modalGridItem: {
    width: '30%',
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
});

export default CombineClothesScreen;
