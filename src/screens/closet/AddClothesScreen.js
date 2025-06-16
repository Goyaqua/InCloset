import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Alert,
  Image, StatusBar, SafeAreaView, Modal, Animated, Dimensions, ActivityIndicator, ScrollView,
  Platform, KeyboardAvoidingView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../../services/supabase/auth';
import { addClothing } from '../../services/supabase/data';
import { removeBackground } from '../../services/backgroundRemoval';
import { classifyClothingItem } from '../../services/openai/classifier';
import { Ionicons } from '@expo/vector-icons';

const clothingTypes = [
  { label: 'Pick a type', value: '' },
  { label: 'Top', value: 'top' },
  { label: 'Bottom', value: 'bottom' },
  { label: 'Dress', value: 'dress' },
  { label: 'Shoes', value: 'shoes' },
  { label: 'Accessory', value: 'accessory' },
  { label: 'Outerwear', value: 'outerwear' },
  { label: 'Bag', value: 'bag' },
];

const clothingStyles = [
  'casual',
  'formal',
  'business',
  'party',
  'sporty',
  'streetwear',
  'elegant',
  'romantic',
  'edgy',
  'retro',
  'minimalist'
];

const clothingOccasions = [
  'work',
  'interview',
  'wedding',
  'date',
  'gym',
  'school',
  'beach',
  'holiday',
  'party',
  'funeral',
  'everyday',
  'chill at home'
];

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MODAL_HEIGHT = 300;

const AddClothesScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessingBackground, setIsProcessingBackground] = useState(false);
  const [showBackgroundPreview, setShowBackgroundPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [showOccasionPicker, setShowOccasionPicker] = useState(false);
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [selectedOccasions, setSelectedOccasions] = useState([]);
  const [isClassifying, setIsClassifying] = useState(false);
  const slideAnim = useState(new Animated.Value(SCREEN_HEIGHT))[0];
  const backdropOpacity = useState(new Animated.Value(0))[0];
  const [uploadedFilePath, setUploadedFilePath] = useState(null);
  const [color, setColor] = useState('');
  const [material, setMaterial] = useState('');
  const [brand, setBrand] = useState('');
  const [season, setSeason] = useState('');
  const [fit, setFit] = useState('');
  const [notes, setNotes] = useState('');
  const [description, setDescription] = useState('');

  const showPickerModal = () => {
    setShowPicker(true);
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

  const hidePickerModal = (shouldSetType = false) => {
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
      if (shouldSetType && !type) setType('shirt');
    });
  };

  const showImagePicker = () => {
    Alert.alert('Select Image', 'Choose an option', [
      { text: 'Camera', onPress: openCamera },
      { text: 'Gallery', onPress: openGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera access is required.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      setSelectedImage(result.assets[0]);
      await processBackgroundRemoval(result.assets[0].uri);
    }
  };

  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Gallery access is required.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      setSelectedImage(result.assets[0]);
      await processBackgroundRemoval(result.assets[0].uri);
    }
  };

  const processBackgroundRemoval = async (imageUri) => {
    setIsProcessingBackground(true);
    
    try {
      console.log('Starting background removal for:', imageUri);
      const result = await removeBackground(imageUri);
      
      if (result.success) {
        setProcessedImage({ uri: result.processedImageUri });
        setShowBackgroundPreview(true);
      } else {
        Alert.alert(
          'Background Removal Failed', 
          result.error || 'Failed to remove background. You can continue with the original image.',
          [
            { text: 'Use Original', onPress: () => setProcessedImage(null) },
            { text: 'Try Again', onPress: () => processBackgroundRemoval(imageUri) }
          ]
        );
      }
    } catch (error) {
      console.error('Background removal error:', error);
      Alert.alert(
        'Error', 
        'Something went wrong with background removal. You can continue with the original image.',
        [{ text: 'OK', onPress: () => setProcessedImage(null) }]
      );
    } finally {
      setIsProcessingBackground(false);
    }
  };

  const acceptProcessedImage = () => {
    setShowBackgroundPreview(false);
    // The processed image will be used in handleSave
  };

  const rejectProcessedImage = () => {
    setProcessedImage(null);
    setShowBackgroundPreview(false);
    // Will use the original image in handleSave
  };

  // Helper to upload image to Supabase Storage and return the file path
  const uploadImageToSupabase = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Authentication failed');
      const imageToUpload = processedImage || selectedImage;
      let manipResult = { uri: imageToUpload.uri };
      if (!processedImage && selectedImage) {
        const { width, height } = selectedImage;
        const MAX_DIMENSION = 1024;
        let resize = null;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            resize = { width: MAX_DIMENSION };
          } else {
            resize = { height: MAX_DIMENSION };
          }
        }
        if (resize) {
          manipResult = await ImageManipulator.manipulateAsync(
            selectedImage.uri,
            [{ resize }],
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
          );
        }
      }
      const fileExt = processedImage ? 'png' : 'jpg';
      const fileName = `${user.id}/clothes/${Date.now()}.${fileExt}`;
      const base64 = await FileSystem.readAsStringAsync(manipResult.uri, {
        encoding: FileSystem.EncodingType.Base64
      });
      const arrayBuffer = decode(base64);
      const contentType = processedImage ? 'image/png' : 'image/jpeg';
      let uploadError = null;
      let retryCount = 0;
      const maxRetries = 3;
      while (retryCount < maxRetries) {
        try {
          const { data: uploadData, error: error } = await supabase.storage
            .from('userclothes')
            .upload(fileName, arrayBuffer, {
              contentType: contentType,
              upsert: false,
              cacheControl: '3600'
            });
          if (error) {
            uploadError = error;
            retryCount++;
            if (retryCount < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 1000));
              continue;
            }
          } else {
            break;
          }
        } catch (err) {
          uploadError = err;
          retryCount++;
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
        }
      }
      if (uploadError) throw new Error(`Failed to upload image after ${maxRetries} attempts: ${uploadError.message}`);
      setUploadedFilePath(fileName);
      return fileName;
    } catch (err) {
      throw err;
    }
  };

  const handleAIClassification = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }
    setIsClassifying(true);
    try {
      let filePath = uploadedFilePath;
      if (!filePath) {
        filePath = await uploadImageToSupabase();
      }
      const { data: { signedUrl }, error: signedUrlError } = await supabase.storage
        .from('userclothes')
        .createSignedUrl(filePath, 3600);
      if (signedUrlError) throw new Error('Failed to generate signed URL for AI analysis');
      const result = await classifyClothingItem(signedUrl);
      if (result.success) {
        if (result.name) setName(result.name);
        if (result.type) setType(result.type);
        setSelectedStyles(result.styles);
        setSelectedOccasions(result.occasions);
        if (result.color) setColor(result.color);
        if (result.material) setMaterial(result.material);
        if (result.brand) setBrand(result.brand);
        if (result.season) setSeason(result.season);
        if (result.fit) setFit(result.fit);
        if (result.description) setDescription(result.description);
        Alert.alert('Success', 'AI has analyzed your clothing item and suggested all metadata!');
      } else {
        throw new Error(result.error || 'Failed to analyze the image');
      }
    } catch (error) {
      console.error('AI classification error:', error);
      Alert.alert('Error', 'Failed to analyze the image. Please select fields manually.');
    } finally {
      setIsClassifying(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return Alert.alert('Missing Name', 'Please enter a name');
    if (!type) return Alert.alert('Missing Type', 'Please select a type');
    if (!selectedImage) return Alert.alert('Missing Image', 'Please select an image');
    if (isSaving) return;
    setIsSaving(true);
    try {
      let filePath = uploadedFilePath;
      if (!filePath) {
        filePath = await uploadImageToSupabase();
      }
      const { error: dbError } = await addClothing(
        name,
        type,
        filePath,
        selectedStyles,
        selectedOccasions,
        color,
        material,
        brand,
        season,
        fit,
        notes,
        description
      );
      if (dbError) {
        throw new Error(`Failed to save clothing item: ${dbError.message}`);
      }
      Alert.alert('Success', 'Clothing item saved!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', err.message || 'Something went wrong');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStyle = (style) => {
    setSelectedStyles(prev => 
      prev.includes(style)
        ? prev.filter(s => s !== style)
        : [...prev, style]
    );
  };

  const toggleOccasion = (occasion) => {
    setSelectedOccasions(prev => 
      prev.includes(occasion)
        ? prev.filter(o => o !== occasion)
        : [...prev, occasion]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 40}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollViewContent, { paddingBottom: 70 }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <TouchableOpacity style={styles.imagePicker} onPress={showImagePicker}>
              {selectedImage ? (
                <View style={styles.imageContainer}>
                  <Image 
                    source={{ uri: processedImage ? processedImage.uri : selectedImage.uri }} 
                    style={styles.selectedImage} 
                  />
                  {processedImage && (
                    <View style={styles.processedBadge}>
                      <Text style={styles.processedBadgeText}>✨ Background Removed</Text>
                    </View>
                  )}
                  {isProcessingBackground && (
                    <View style={styles.processingOverlay}>
                      <ActivityIndicator size="large" color="#6366F1" />
                      <Text style={styles.processingText}>Removing Background...</Text>
                    </View>
                  )}
                </View>
              ) : (
                <Text style={styles.plusIcon}>+</Text>
              )}
            </TouchableOpacity>

            {selectedImage && (
              <TouchableOpacity 
                style={styles.aiButton} 
                onPress={handleAIClassification}
                disabled={isClassifying}
              >
                <Ionicons name="sparkles" size={20} color="#6366F1" />
                <Text style={styles.aiButtonText}>
                  {isClassifying ? 'Analyzing...' : 'Analyze with AI'}
                </Text>
                {isClassifying && (
                  <ActivityIndicator size="small" color="#6366F1" style={styles.aiButtonLoader} />
                )}
              </TouchableOpacity>
            )}

            <View style={styles.inputSection}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter a name"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.label}>Type</Text>
              <TouchableOpacity style={styles.pickerButton} onPress={showPickerModal}>
                <Text style={[styles.pickerButtonText, !type && styles.pickerPlaceholder]}>
                  {type ? clothingTypes.find(item => item.value === type)?.label : 'Pick a type'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.label}>Style</Text>
              <TouchableOpacity 
                style={styles.pickerButton} 
                onPress={() => setShowStylePicker(true)}
              >
                <Text style={[styles.pickerButtonText, selectedStyles.length === 0 && styles.pickerPlaceholder]}>
                  {selectedStyles.length > 0 
                    ? `${selectedStyles.length} style${selectedStyles.length > 1 ? 's' : ''} selected`
                    : 'Select styles'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.label}>Occasion</Text>
              <TouchableOpacity 
                style={styles.pickerButton} 
                onPress={() => setShowOccasionPicker(true)}
              >
                <Text style={[styles.pickerButtonText, selectedOccasions.length === 0 && styles.pickerPlaceholder]}>
                  {selectedOccasions.length > 0 
                    ? `${selectedOccasions.length} occasion${selectedOccasions.length > 1 ? 's' : ''} selected`
                    : 'Select occasions'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.label}>Color</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter color"
                placeholderTextColor="#9CA3AF"
                value={color}
                onChangeText={setColor}
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.label}>Material</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter material"
                placeholderTextColor="#9CA3AF"
                value={material}
                onChangeText={setMaterial}
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.label}>Brand</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter brand"
                placeholderTextColor="#9CA3AF"
                value={brand}
                onChangeText={setBrand}
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.label}>Season</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter season"
                placeholderTextColor="#9CA3AF"
                value={season}
                onChangeText={setSeason}
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.label}>Fit</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter fit"
                placeholderTextColor="#9CA3AF"
                value={fit}
                onChangeText={setFit}
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.largeInput]}
                placeholder="Enter description"
                placeholderTextColor="#9CA3AF"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                maxLength={300}
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.textInput, styles.largeInput]}
                placeholder="Enter Personal Notes"
                placeholderTextColor="#9CA3AF"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                maxLength={300}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showPicker} transparent animationType="none">
        <Animated.View style={[styles.modalContainer, { opacity: backdropOpacity }]}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => hidePickerModal()}
          />
          <Animated.View style={[styles.modalContent, { transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => hidePickerModal()}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => hidePickerModal(true)}>
                <Text style={[styles.modalButtonText, styles.modalDoneButton]}>Done</Text>
              </TouchableOpacity>
            </View>
            <Picker selectedValue={type} onValueChange={setType} style={styles.picker}>
              {clothingTypes.map(item => (
                <Picker.Item
                  key={item.value}
                  label={item.label}
                  value={item.value}
                  color={item.value === '' ? '#9CA3AF' : '#000000'}
                />
              ))}
            </Picker>
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* Background Removal Preview Modal */}
      <Modal visible={showBackgroundPreview} transparent animationType="fade">
        <View style={styles.previewModalContainer}>
          <View style={styles.previewModalContent}>
            <Text style={styles.previewModalTitle}>Background Removal Preview</Text>
            <Text style={styles.previewModalSubtitle}>Compare original and processed images</Text>
            
            <View style={styles.comparisonContainer}>
              <View style={styles.imageComparisonItem}>
                <Text style={styles.comparisonLabel}>Original</Text>
                <View style={styles.comparisonImageContainer}>
                  {selectedImage && (
                    <Image source={{ uri: selectedImage.uri }} style={styles.comparisonImage} />
                  )}
                </View>
              </View>
              
              <View style={styles.imageComparisonItem}>
                <Text style={styles.comparisonLabel}>Processed</Text>
                <View style={styles.comparisonImageContainer}>
                  {processedImage && (
                    <Image source={{ uri: processedImage.uri }} style={styles.comparisonImage} />
                  )}
                </View>
              </View>
            </View>
            
            <View style={styles.previewButtonContainer}>
              <TouchableOpacity style={styles.rejectButton} onPress={rejectProcessedImage}>
                <Text style={styles.rejectButtonText}>Use Original</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.acceptButton} onPress={acceptProcessedImage}>
                <Text style={styles.acceptButtonText}>Use Processed</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Style Picker Modal */}
      <Modal visible={showStylePicker} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowStylePicker(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowStylePicker(false)}>
                <Text style={[styles.modalButtonText, styles.modalDoneButton]}>Done</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.tagList}>
              {clothingStyles.map(style => (
                <TouchableOpacity
                  key={style}
                  style={[
                    styles.tagItem,
                    selectedStyles.includes(style) && styles.tagItemSelected
                  ]}
                  onPress={() => toggleStyle(style)}
                >
                  <Text style={[
                    styles.tagText,
                    selectedStyles.includes(style) && styles.tagTextSelected
                  ]}>
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Occasion Picker Modal */}
      <Modal visible={showOccasionPicker} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowOccasionPicker(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowOccasionPicker(false)}>
                <Text style={[styles.modalButtonText, styles.modalDoneButton]}>Done</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.tagList}>
              {clothingOccasions.map(occasion => (
                <TouchableOpacity
                  key={occasion}
                  style={[
                    styles.tagItem,
                    selectedOccasions.includes(occasion) && styles.tagItemSelected
                  ]}
                  onPress={() => toggleOccasion(occasion)}
                >
                  <Text style={[
                    styles.tagText,
                    selectedOccasions.includes(occasion) && styles.tagTextSelected
                  ]}>
                    {occasion.charAt(0).toUpperCase() + occasion.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Save Loading Overlay */}
      {isSaving && (
        <View style={styles.savingOverlay}>
          <View style={styles.savingContent}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={styles.savingText}>Saving your clothing item...</Text>
            <Text style={styles.savingSubtext}>Please wait</Text>
          </View>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>CANCEL</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'SAVING...' : 'SAVE'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  imagePicker: {
    width: 160,
    height: 160,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    backgroundColor: '#F9FAFB',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  plusIcon: {
    fontSize: 40,
    color: '#9CA3AF',
    fontWeight: '300',
  },
  inputSection: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#000000',
  },
  pickerButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'center',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#000000',
  },
  pickerPlaceholder: {
    color: '#9CA3AF',
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
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalButton: {
    padding: 4,
  },
  modalButtonText: {
    fontSize: 16,
    color: '#6366F1',
  },
  modalDoneButton: {
    fontWeight: '600',
  },
  picker: {
    height: 215,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#EC4899',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  processedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  processedBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
  },
  previewModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  previewModalContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    maxWidth: '80%',
    maxHeight: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 10,
  },
  previewModalSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 20,
  },
  comparisonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imageComparisonItem: {
    flex: 1,
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 10,
  },
  comparisonImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
  },
  comparisonImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  previewButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  rejectButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 10,
    flex: 1,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  acceptButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginLeft: 10,
    flex: 1,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  savingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  savingContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    maxWidth: '80%',
    maxHeight: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  savingText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 10,
  },
  savingSubtext: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  tagList: {
    padding: 16,
  },
  tagItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginBottom: 8,
  },
  tagItemSelected: {
    backgroundColor: '#6366F1',
  },
  tagText: {
    fontSize: 16,
    color: '#000000',
  },
  tagTextSelected: {
    color: '#FFFFFF',
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 30,
    gap: 8,
  },
  aiButtonText: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '600',
  },
  aiButtonLoader: {
    marginLeft: 8,
  },
  largeInput: {
    minHeight: 60,
    maxHeight: 120,
    textAlignVertical: 'top',
  },
});

export default AddClothesScreen;
