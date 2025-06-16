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
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../../services/supabase/auth';
import { addOutfit, updateOutfit } from '../../services/supabase/data';
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
  { id: 'top', label: 'Tops', icon: '👕', types: ['top'] },
  { id: 'bottom', label: 'Bottoms', icon: '👖', types: ['bottom'] },
  { id: 'shoes', label: 'Shoes', icon: '👟', types: ['shoes'] },
  { id: 'accessory', label: 'Accessories', icon: '💍', types: ['accessory'] },
];

const CombineClothesScreen = ({ route, navigation }) => {
  const { outfitId = null, outfit = null, suggestedItems = null, outfitName: suggestedOutfitName = null } = route?.params || {};
  
  // Debug route parameters
  console.log('=== COMBINE CLOTHES SCREEN PARAMS ===');
  console.log('route.params:', route?.params);
  console.log('outfitId:', outfitId);
  console.log('outfit:', outfit);
  console.log('suggestedItems:', suggestedItems);
  console.log('suggestedOutfitName:', suggestedOutfitName);
  console.log('===================================');
  
  const boardRef = useRef(null);
  const [outfitName, setOutfitName] = useState(
    suggestedOutfitName || outfit?.title || 'My New Outfit'
  );
  const [isEditingName, setIsEditingName] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [allClothes, setAllClothes] = useState([]);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [activeFilters, setActiveFilters] = useState(['top']);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [lastSelectedId, setLastSelectedId] = useState(null);
  const [isGeneratingName, setIsGeneratingName] = useState(false);
  const preloadDoneRef = useRef(false);
  const suggestedItemsLoadedRef = useRef(false);

  useEffect(() => {
    fetchClothes();
  }, []);

  // Set outfit name when outfit changes (for editing)
  useEffect(() => {
    if (outfit?.title && outfitId) {
      setOutfitName(outfit.title);
    }
  }, [outfit, outfitId]);

  // Load suggested items from AI assistant
  useEffect(() => {
    console.log('=== SUGGESTED ITEMS USEEFFECT ===');
    console.log('suggestedItems:', suggestedItems);
    console.log('suggestedItemsLoadedRef.current:', suggestedItemsLoadedRef.current);
    console.log('suggestedItems exists:', !!suggestedItems);
    console.log('suggestedItems length:', suggestedItems?.length);
    
    if (suggestedItems && suggestedItems.length > 0) {
      console.log('Loading AI suggested items:', suggestedItems);
      
      const formattedSuggestedItems = suggestedItems.map((item, index) => ({
        id: item.id,
        name: item.name,
        image_path: item.image_path,
        type: item.type,
        boardId: Date.now().toString() + Math.random().toString().slice(2),
        // Position items in a grid-like pattern
        position: { 
          x: 50 + (index % 3) * 120, 
          y: 50 + Math.floor(index / 3) * 120 
        },
      }));

      console.log('formattedSuggestedItems:', formattedSuggestedItems);
      setSelectedItems(formattedSuggestedItems);
      
      // Set active filter to show the first item's type
      if (formattedSuggestedItems[0]?.type) {
        setActiveFilters([formattedSuggestedItems[0].type]);
      }
      
      suggestedItemsLoadedRef.current = true;
      console.log('Loaded AI suggested items:', formattedSuggestedItems.length);
    }
    console.log('================================');
    
    // Cleanup function to reset the ref when component unmounts
    return () => {
      suggestedItemsLoadedRef.current = false;
    };
  }, [suggestedItems]);

  // Add focus listener to refresh data when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Reset the preload flag to allow reloading when data is refreshed
      preloadDoneRef.current = false;
      fetchClothes();
    });

    return unsubscribe;
  }, [navigation]);

  // When all clothes are fetched and we have an outfit to edit, preload items
  useEffect(() => {
    // Don't load outfit items if we have suggested items (AI suggestions take priority)
    if (suggestedItems && suggestedItems.length > 0) {
      console.log('Skipping outfit loading because suggestedItems are present');
      return;
    }
    
    if (!outfit || preloadDoneRef.current || allClothes.length === 0) return;

    console.log('Loading outfit items for editing:', outfit.items);
    console.log('Available clothes count:', allClothes.length);

    const initialItems = outfit.items
      ?.map((item) => {
        // First try to use the item data directly if it has all required fields
        if (item.name && item.type && item.image) {
          console.log('Using outfit item data directly:', item.name);
          return {
            id: item.id,
            name: item.name,
            image_path: item.image,
            type: item.type,
            boardId: Date.now().toString() + Math.random().toString().slice(2),
            position: { x: 50, y: 50 },
          };
        }
        
        // Fallback: try to find in allClothes
        const clothing = allClothes.find((c) => c.id === item.id);
        if (!clothing) {
          console.warn('Could not find clothing item with ID:', item.id);
          return null;
        }
        console.log('Found matching clothing item:', clothing.name, 'for ID:', item.id);
        return {
          id: clothing.id,
          name: clothing.name,
          image_path: clothing.image_path,
          type: clothing.type,
          boardId: Date.now().toString() + Math.random().toString().slice(2),
          position: { x: 50, y: 50 },
        };
      })
      .filter(Boolean);

    console.log('Loaded initial items for editing:', initialItems?.length || 0);

    if (initialItems?.length) {
      setSelectedItems(initialItems);
      // Optionally set filters to include the first item's type
      if (initialItems[0]?.type) {
        setActiveFilters([initialItems[0].type]);
      }
    }

    preloadDoneRef.current = true;
  }, [allClothes, outfit]);

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
      // Ensure each item has the correct structure and proper string values
      const formattedData = data.map(item => ({
        id: item.id,
        name: typeof item.name === 'string' ? item.name : String(item.name || ''),
        type: typeof item.type === 'string' ? item.type : String(item.type || ''),
        image_path: typeof item.image_path === 'string' ? item.image_path : String(item.image_path || ''),
        styles: Array.isArray(item.styles) ? item.styles : [],
        occasions: Array.isArray(item.occasions) ? item.occasions : []
      }));
      setAllClothes(formattedData);
    } catch (error) {
      console.error('Error fetching clothes:', error);
      Alert.alert('Error', error.message || 'Error fetching clothes');
    }
  };

  const getFilteredClothes = () => {
    if (activeFilters.length === 0) return [];
    return allClothes.filter(item => activeFilters.includes(item.type));
  };

  const addItemToBoard = (item) => {
    // Ensure we have a properly formatted item
    const formattedItem = {
      id: item.id,
      name: typeof item.name === 'string' ? item.name : String(item.name || ''),
      image_path: typeof item.image_path === 'string' ? item.image_path : String(item.image_path || ''),
      type: typeof item.type === 'string' ? item.type : String(item.type || '')
    };

    const newItem = {
      ...formattedItem,
      boardId: Date.now().toString(),
      position: { x: 50, y: 50 }
    };
    setSelectedItems(prev => [...prev, newItem]);
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

      let outfitResponse;
      let error;
      if (outfitId) {
        ({ data: outfitResponse, error } = await updateOutfit(outfitId, outfitName, clothingIds, fileName));
      } else {
        ({ data: outfitResponse, error } = await addOutfit(outfitName, clothingIds, fileName));
      }

      if (error) throw error;

      resetOutfit();
      if (outfitId) {
        navigation.goBack();
        Alert.alert('Success', 'Outfit updated successfully!');
      } else {
        navigation.navigate('Home', { 
          screen: 'HomeScreen',
          params: { refresh: true }
        });
        Alert.alert('Success', 'Outfit saved successfully!');
      }

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

  const generateAIOutfitName = async () => {
    if (selectedItems.length === 0) {
      Alert.alert('No Items', 'Please add some clothing items first to generate a name.');
      return;
    }

    setIsGeneratingName(true);
    try {
      // Create a description of the outfit items
      const itemDescriptions = selectedItems.map(item => 
        `${item.name} (${item.type})`
      ).join(', ');

      const systemPrompt = `You are a creative fashion stylist. Generate a catchy, creative outfit name based on the clothing items provided. The name should be:
- Fun and memorable
- 2-4 words maximum
- Reflect the style/vibe of the items
- Suitable for a personal wardrobe app

Respond with ONLY the outfit name, no additional text or quotes.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Create an outfit name for these items: ${itemDescriptions}` }
          ],
          max_tokens: 20,
          temperature: 0.8,
        }),
      });

      const data = await response.json();
      const generatedName = data.choices?.[0]?.message?.content?.trim();
      
      if (generatedName) {
        setOutfitName(generatedName);
        Alert.alert('✨ Name Generated!', `Your outfit is now called "${generatedName}"`);
      } else {
        throw new Error('No name generated');
      }
    } catch (error) {
      console.error('Error generating AI outfit name:', error);
      Alert.alert('Error', 'Failed to generate outfit name. Please try again.');
    } finally {
      setIsGeneratingName(false);
    }
  };

  const renderFilterSheet = () => (
    <BottomSheet
      visible={showFilterSheet}
      onClose={() => setShowFilterSheet(false)}
      height={SCREEN_HEIGHT * 0.7}
      title="Add Clothes"
    >
      <View style={styles.filterContainer}>
        <View style={styles.filterGrid}>
          {clothingCategories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.filterChip,
                activeFilters[0] === category.types[0] && styles.filterChipActive
              ]}
              onPress={() => {
                setActiveFilters(prev =>
                  prev[0] === category.types[0] ? [] : [category.types[0]]
                );
              }}
            >
              {category.icon ? (
                <Text style={[
                  styles.filterChipIcon,
                  activeFilters[0] === category.types[0] && styles.filterChipIconActive
                ]}>
                  {category.icon}
                </Text>
              ) : (
                <Text style={[
                  styles.filterChipText,
                  activeFilters.length === 0 && styles.filterChipTextActive
                ]}>
                  {category.label}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={styles.clothesGrid}>
          <View style={styles.gridContainer}>
            {getFilteredClothes().map(item => {
              // Ensure we have a proper item object
              const formattedItem = {
                id: item.id,
                name: typeof item.name === 'string' ? item.name : '',
                image_path: item.image_path || '',
                type: item.type || '',
                styles: item.styles,
                occasions: item.occasions
              };
              return (
                <View key={item.id} style={styles.gridItem}>
                  <ClothingItem
                    imagePath={formattedItem.image_path}
                    name={formattedItem.name}
                    onPress={() => addItemToBoard(formattedItem)}
                    styles={formattedItem.styles}
                    occasions={formattedItem.occasions}
                  />
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </BottomSheet>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.outfitNameContainer}>
          <Text style={styles.outfitNameLabel}>OUTFIT NAME</Text>
          <View style={styles.nameActions}>
            <TouchableOpacity 
              onPress={generateAIOutfitName}
              style={[
                styles.aiNameButton,
                (isGeneratingName || selectedItems.length === 0) && styles.aiNameButtonDisabled
              ]}
              disabled={isGeneratingName || selectedItems.length === 0}
            >
              {isGeneratingName ? (
                <ActivityIndicator size="small" color="#6366F1" />
              ) : (
                <MaterialCommunityIcons 
                  name="auto-fix" 
                  size={16} 
                  color={selectedItems.length === 0 ? '#9CA3AF' : '#6366F1'} 
                />
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsEditingName(true)}>
              <MaterialCommunityIcons name="pencil" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
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
            <Text style={styles.outfitNameText}>
              {isGeneratingName ? 'Generating...' : outfitName}
            </Text>
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
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
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
            size={32}
            color={colors.background}
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  cancelButton: {
    width: '48%',
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
    width: '48%',
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
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  filterChip: {
    padding: spacing.sm,
    borderRadius: 10,
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: spacing.sm,
    marginBottom: spacing.xs,
    width: '22%',
    aspectRatio: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  filterChipText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  filterChipTextActive: {
    color: colors.background,
  },
  filterChipIcon: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  filterChipIconActive: {
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
    borderWidth: 0,
    borderColor: 'transparent',
  },
  nameActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiNameButton: {
    padding: spacing.xs,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: spacing.sm,
  },
  aiNameButtonDisabled: {
    backgroundColor: '#D1D5DB',
    opacity: 0.6,
  },
});

export default CombineClothesScreen;
