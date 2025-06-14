import React, { useState, useEffect, useRef } from 'react';
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
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { supabase } from '../../services/supabase/auth';
import { addOutfit } from '../../services/supabase/data';
import { colors, spacing, typography } from '../../styles/theme';
import DraggableClothingItem from '../../components/specific/closet/DraggableClothingItem';
import ClothingItem from '../../components/specific/home/ClothingItem';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomSheet from '../../components/common/BottomSheet';
import ViewShot from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const clothingCategories = [
  { id: 'top', label: 'Top', icon: 'tshirt-crew-outline', types: ['top'] },
  { id: 'bottom', label: 'Bottom', icon: 'human-handsdown', types: ['bottom'] },
  { id: 'dress', label: 'Dress', icon: 'hanger', types: ['dress'] },
  { id: 'shoes', label: 'Shoes', icon: 'shoe-sneaker', types: ['shoes'] },
  { id: 'accessory', label: 'Accessory', icon: 'necklace', types: ['accessory'] },
  { id: 'outerwear', label: 'Outerwear', icon: 'jacket', types: ['outerwear'] },
  { id: 'bag', label: 'Bag', icon: 'bag-personal', types: ['bag'] },
];

const CombineClothesScreen = ({ navigation }) => {
  const boardRef = useRef(null);
  const [outfitName, setOutfitName] = useState('My New Outfit');
  const [isEditingName, setIsEditingName] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [allClothes, setAllClothes] = useState([]);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [lastSelectedId, setLastSelectedId] = useState(null);

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
      setAllClothes(data);
    } catch (error) {
      console.error('Error fetching clothes:', error);
      Alert.alert('Error', error.message || 'Error fetching clothes');
    }
  };

  const getFilteredClothes = () => {
    if (activeFilters.length === 0) return allClothes;
    return allClothes.filter(item => activeFilters.includes(item.type));
  };

  const addItemToBoard = (item) => {
    const newItem = {
      ...item,
      boardId: `${item.id}-${Date.now()}`,
      position: {
        x: (SCREEN_WIDTH - 100) / 2,
        y: (SCREEN_HEIGHT - 100) / 2,
      },
    };
    setSelectedItems([...selectedItems, newItem]);
    setShowFilterSheet(false);
  };

  const removeItemFromBoard = (itemId) => {
    setSelectedItems(selectedItems.filter(item => item.boardId !== itemId));
    if (selectedItemId === itemId) {
      setSelectedItemId(null);
    }
  };

  const handleItemSelect = (itemId) => {
    // If clicking the same item, deselect it
    if (selectedItemId === itemId) {
      setSelectedItemId(null);
      setLastSelectedId(null);
    } else {
      // If clicking a different item, select it and update last selected
      setSelectedItemId(itemId);
      setLastSelectedId(itemId);
    }
  };

  const handleBoardPress = (event) => {
    // Get the coordinates of the touch
    const { locationX, locationY } = event.nativeEvent;
    
    // Check if the touch is on any clothing item
    const isOnClothingItem = selectedItems.some(item => {
      const itemX = item.position.x;
      const itemY = item.position.y;
      const itemWidth = 100; // Approximate width of clothing item
      const itemHeight = 100; // Approximate height of clothing item
      
      // Create a hit area that's exactly the size of the item
      const hitArea = {
        left: itemX,
        right: itemX + itemWidth,
        top: itemY,
        bottom: itemY + itemHeight
      };
      
      return (
        locationX >= hitArea.left &&
        locationX <= hitArea.right &&
        locationY >= hitArea.top &&
        locationY <= hitArea.bottom
      );
    });

    // Only deselect if we're not clicking on a clothing item
    if (!isOnClothingItem) {
      setSelectedItemId(null);
      setLastSelectedId(null);
    }
  };

  const captureBoardImage = async () => {
    try {
      if (!boardRef.current) {
        throw new Error('Board reference not found');
      }

      const uri = await boardRef.current.capture();
      return uri;
    } catch (error) {
      console.error('Error capturing board image:', error);
      throw error;
    }
  };

  const saveOutfit = async () => {
    if (selectedItems.length === 0) {
      Alert.alert('Error', 'Please add at least one clothing item');
      return;
    }

    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'Please login to save outfits');
        return;
      }

      // Capture the board image
      const boardImageUri = await captureBoardImage();
      
      // Convert image to base64
      const base64 = await FileSystem.readAsStringAsync(boardImageUri, {
        encoding: FileSystem.EncodingType.Base64
      });

      // Upload the board image to Supabase Storage
      const fileName = `${user.id}/outfits/${Date.now()}.png`;
      console.log('Uploading outfit image to path:', fileName);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('userclothes')
        .upload(fileName, decode(base64), {
          contentType: 'image/png',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful:', uploadData);

      const clothingIds = selectedItems.map(item => item.id);
      const { data: outfit, error } = await addOutfit(outfitName, clothingIds, fileName);

      if (error) throw error;

      resetOutfit();
      navigation.navigate('Home', { refresh: true });
      Alert.alert('Success', 'Outfit saved successfully!');

    } catch (error) {
      console.error('Error saving outfit:', error);
      Alert.alert('Error', error.message || 'Error saving outfit');
    } finally {
      setIsSaving(false);
    }
  };

  const resetOutfit = () => {
    setOutfitName('My New Outfit');
    setSelectedItems([]);
  };

  const renderFilterSheet = () => (
    <BottomSheet
      visible={showFilterSheet}
      onClose={() => setShowFilterSheet(false)}
      height={SCREEN_HEIGHT * 0.7}
      title="Add Clothes"
    >
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {clothingCategories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.filterChip,
                activeFilters.some(type => category.types.includes(type)) && styles.filterChipActive
              ]}
              onPress={() => {
                setActiveFilters(prev => {
                  const newFilters = [...prev];
                  category.types.forEach(type => {
                    const index = newFilters.indexOf(type);
                    if (index === -1) {
                      newFilters.push(type);
                    } else {
                      newFilters.splice(index, 1);
                    }
                  });
                  return newFilters;
                });
              }}
            >
              <MaterialCommunityIcons
                name={category.icon}
                size={20}
                color={activeFilters.some(type => category.types.includes(type)) ? colors.background : colors.text}
              />
              <Text style={[
                styles.filterChipText,
                activeFilters.some(type => category.types.includes(type)) && styles.filterChipTextActive
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView style={styles.clothesGrid}>
          <View style={styles.gridContainer}>
            {getFilteredClothes().map(item => (
              <View key={item.id} style={styles.gridItem}>
                <ClothingItem
                  imagePath={item.image_path}
                  name={item.name}
                  onPress={() => addItemToBoard(item)}
                />
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </BottomSheet>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
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
      </View>

      <View style={styles.board}>
        <TouchableWithoutFeedback onPress={handleBoardPress}>
          <View style={styles.boardContent}>
            <ViewShot ref={boardRef} style={styles.viewShot} options={{ format: 'png', quality: 0.9 }}>
              {[...selectedItems]
                .sort((a, b) => {
                  if (selectedItemId === a.boardId) return 1;
                  if (selectedItemId === b.boardId) return -1;
                  if (lastSelectedId === a.boardId) return 1;
                  if (lastSelectedId === b.boardId) return -1;
                  return 0;
                })
                .map((item) => (
                  <DraggableClothingItem
                    key={item.boardId}
                    imagePath={item.image_path}
                    name={item.name}
                    initialPosition={item.position}
                    onRemove={() => removeItemFromBoard(item.boardId)}
                    isSelected={selectedItemId === item.boardId}
                    onSelect={() => handleItemSelect(item.boardId)}
                  />
                ))}
            </ViewShot>
          </View>
        </TouchableWithoutFeedback>
      </View>

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

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowFilterSheet(true)}
        >
          <MaterialCommunityIcons
            name="plus"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      {renderFilterSheet()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
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
  },
  board: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    position: 'relative',
  },
  boardContent: {
    flex: 1,
    position: 'relative',
  },
  viewShot: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
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
  controls: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl + 80,
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
  filterContainer: {
    flex: 1,
  },
  filterScroll: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.background,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    marginLeft: spacing.xs,
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: colors.background,
  },
  clothesGrid: {
    flex: 1,
    padding: spacing.md,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '30%',
    marginBottom: spacing.lg,
  },
});

export default CombineClothesScreen;
