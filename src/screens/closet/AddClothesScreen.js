import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Alert,
  Image, StatusBar, SafeAreaView, Modal, Animated, Dimensions, ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../../services/supabase/auth';
import { addClothing } from '../../services/supabase/data';
import { removeBackground } from '../../services/backgroundRemoval';

const clothingTypes = [
  { label: 'Pick a type', value: '' },
  { label: 'Shirt', value: 'shirt' },
  { label: 'Pants', value: 'pants' },
  { label: 'Dress', value: 'dress' },
  { label: 'Jacket', value: 'jacket' },
  { label: 'Shoes', value: 'shoes' },
  { label: 'Accessories', value: 'accessories' },
  { label: 'Other', value: 'other' },
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
  const slideAnim = useState(new Animated.Value(SCREEN_HEIGHT))[0];
  const backdropOpacity = useState(new Animated.Value(0))[0];

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

  const handleSave = async () => {
    if (!name.trim()) return Alert.alert('Missing Name', 'Please enter a name');
    if (!type) return Alert.alert('Missing Type', 'Please select a type');
    if (!selectedImage) return Alert.alert('Missing Image', 'Please select an image');
    if (isSaving) return; // Prevent multiple submissions

    setIsSaving(true);

    try {
      // 1. Get user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('User error:', userError);
        throw new Error("Authentication failed");
      }

      // 2. Determine which image to use - processed image (if available) or original
      const imageToUpload = processedImage || selectedImage;
      console.log('Using image for upload:', {
        hasProcessedImage: !!processedImage,
        imageUri: imageToUpload.uri
      });

      // 3. Compress image if needed (only for original images, processed images are already optimized)
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

      console.log('Image prepared for upload:', {
        originalUri: imageToUpload.uri,
        finalUri: manipResult.uri,
        isProcessed: !!processedImage
      });

      // 4. Prepare storage file path - use PNG for processed images to preserve transparency
      const fileExt = processedImage ? 'png' : 'jpg';
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      console.log('Prepared file path', filePath);

      // 5. Read file as base64 & convert to ArrayBuffer (React Native recommended way)
      const base64 = await FileSystem.readAsStringAsync(manipResult.uri, {
        encoding: FileSystem.EncodingType.Base64
      });

      const arrayBuffer = decode(base64);

      console.log('ArrayBuffer prepared:', {
        byteLength: arrayBuffer.byteLength
      });

      // 6. Upload to Supabase Storage with retry logic
      let uploadError = null;
      let retryCount = 0;
      const maxRetries = 3;
      const contentType = processedImage ? 'image/png' : 'image/jpeg';

      while (retryCount < maxRetries) {
        try {
          const { data: uploadData, error: error } = await supabase.storage
            .from('userclothes')
            .upload(filePath, arrayBuffer, {
              contentType: contentType,
              upsert: false,
              cacheControl: '3600'
            });

          if (error) {
            uploadError = error;
            console.warn(`Upload attempt ${retryCount + 1} failed:`, error);
            retryCount++;
            if (retryCount < maxRetries) {
              // Wait for 1 second before retrying
              await new Promise(resolve => setTimeout(resolve, 1000));
              continue;
            }
          } else {
            console.log('Upload successful:', uploadData);
            break;
          }
        } catch (err) {
          uploadError = err;
          console.warn(`Upload attempt ${retryCount + 1} failed with exception:`, err);
          retryCount++;
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
        }
      }

      if (uploadError) {
        console.error('All upload attempts failed:', uploadError);
        throw new Error(`Failed to upload image after ${maxRetries} attempts: ${uploadError.message}`);
      }

      // 7. Get signed URL
      const { data: { signedUrl }, error: signedUrlError } = await supabase.storage
        .from('userclothes')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (signedUrlError) {
        console.error('Signed URL error:', signedUrlError);
        throw new Error(`Failed to generate signed URL: ${signedUrlError.message}`);
      }

      // 8. Save to database
      const { error: dbError } = await addClothing(name, type, filePath);
      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error(`Failed to save clothing item: ${dbError.message}`);
      }

      Alert.alert('Success', 'Clothing item saved!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error('Error in handleSave:', {
        error: err,
        message: err.message,
        stack: err.stack
      });
      Alert.alert('Error', err.message || 'Something went wrong');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
      </View>

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
  content: {
    flex: 1,
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
});

export default AddClothesScreen;
