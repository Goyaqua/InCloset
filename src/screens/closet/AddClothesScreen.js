import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Alert,
  Image, StatusBar, SafeAreaView, Modal, Animated, Dimensions
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../../services/supabase/auth';
import { addClothing } from '../../services/supabase/data';

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
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      setSelectedImage(result.assets[0]);
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
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      setSelectedImage(result.assets[0]);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return Alert.alert('Missing Name', 'Please enter a name');
    if (!type) return Alert.alert('Missing Type', 'Please select a type');
    if (!selectedImage) return Alert.alert('Missing Image', 'Please select an image');

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

      // 2. Compress image
      const manipResult = await ImageManipulator.manipulateAsync(
        selectedImage.uri,
        [{ resize: { width: 1024 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      console.log('Image compressed:', {
        originalUri: selectedImage.uri,
        compressedUri: manipResult.uri,
        width: manipResult.width,
        height: manipResult.height
      });

      // 3. Prepare storage file path
      const fileExt = 'jpg';
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      console.log('Prepared file path', filePath);

      // 4. Read file as base64 & convert to ArrayBuffer (React Native recommended way)
      const base64 = await FileSystem.readAsStringAsync(manipResult.uri, {
        encoding: FileSystem.EncodingType.Base64
      });

      const arrayBuffer = decode(base64);

      console.log('ArrayBuffer prepared:', {
        byteLength: arrayBuffer.byteLength
      });

      // 5. Upload to Supabase Storage with retry logic
      let uploadError = null;
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          const { data: uploadData, error: error } = await supabase.storage
            .from('userclothes')
            .upload(filePath, arrayBuffer, {
              contentType: 'image/jpeg',
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

      // 6. Get signed URL
      const { data: { signedUrl }, error: signedUrlError } = await supabase.storage
        .from('userclothes')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (signedUrlError) {
        console.error('Signed URL error:', signedUrlError);
        throw new Error(`Failed to generate signed URL: ${signedUrlError.message}`);
      }

      // 7. Save to database
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
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.imagePicker} onPress={showImagePicker}>
          {selectedImage ? (
            <Image source={{ uri: selectedImage.uri }} style={styles.selectedImage} />
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

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>CANCEL</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>SAVE</Text>
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
});

export default AddClothesScreen;
