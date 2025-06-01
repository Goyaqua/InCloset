import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../../services/supabase/auth';
import { deleteClothing, updateClothing } from '../../services/supabase/data';
import { Image as CachedImage } from 'expo-image';

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

const ClothingDetailsScreen = ({ route, navigation }) => {
  const { item } = route.params;
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editType, setEditType] = useState(item.type);
  const [showTypePicker, setShowTypePicker] = useState(false);

  useEffect(() => {
    const getSignedUrl = async () => {
      try {
        setIsLoading(true);
        const { data: { signedUrl }, error } = await supabase.storage
          .from('userclothes')
          .createSignedUrl(item.image_path, 3600); // 1 hour expiry

        if (error) {
          console.error('Error getting signed URL:', error);
          return;
        }

        setImageUrl(signedUrl);
      } catch (err) {
        console.error('Error in getSignedUrl:', err);
      } finally {
        setIsLoading(false);
      }
    };

    getSignedUrl();
  }, [item.image_path]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditName(item.name);
    setEditType(item.type);
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    if (!editType) {
      Alert.alert('Error', 'Please select a type');
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await updateClothing(item.id, editName.trim(), editType);
      if (error) {
        throw new Error(error.message);
      }

      // Update the local item data
      item.name = editName.trim();
      item.type = editType;
      
      setIsEditing(false);
      Alert.alert('Success', 'Clothing item updated successfully!');
    } catch (error) {
      console.error('Error updating clothing:', error);
      Alert.alert('Error', error.message || 'Failed to update clothing item');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Item', 
      'Are you sure you want to delete this clothing item? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: confirmDelete
        }
      ]
    );
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await deleteClothing(item.id);
      if (error) {
        throw new Error(error.message);
      }

      Alert.alert('Success', 'Clothing item deleted successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error deleting clothing:', error);
      Alert.alert('Error', error.message || 'Failed to delete clothing item');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.imageContainer}>
          {isLoading ? (
            <View style={styles.placeholderImage}>
              <ActivityIndicator size="large" color="#6366F1" />
            </View>
          ) : imageUrl ? (
            <CachedImage
              source={{ uri: imageUrl }}
              style={styles.image}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
            />
          ) : null}
        </View>

        <View style={styles.detailsContainer}>
          {isEditing ? (
            <>
              <View style={styles.editSection}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.editInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Enter name"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              
              <View style={styles.editSection}>
                <Text style={styles.label}>Type</Text>
                <TouchableOpacity 
                  style={styles.editInput} 
                  onPress={() => setShowTypePicker(true)}
                >
                  <Text style={[styles.editInputText, !editType && styles.placeholderText]}>
                    {editType ? clothingTypes.find(item => item.value === editType)?.label : 'Pick a type'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.type}>Type: {item.type}</Text>
              <Text style={styles.date}>
                Added: {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </>
          )}
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        {isEditing ? (
          <View style={styles.editButtonContainer}>
            <TouchableOpacity
              style={[styles.cancelButton, isUpdating && styles.disabledButton]}
              onPress={handleCancelEdit}
              disabled={isUpdating}
            >
              <Text style={styles.cancelButtonText}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, isUpdating && styles.disabledButton]}
              onPress={handleSaveEdit}
              disabled={isUpdating}
            >
              <Text style={styles.saveButtonText}>
                {isUpdating ? 'SAVING...' : 'SAVE'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.viewButtonContainer}>
            <TouchableOpacity
              style={[styles.deleteButton, isDeleting && styles.disabledButton]}
              onPress={handleDelete}
              disabled={isDeleting}
            >
              <Text style={styles.deleteButtonText}>
                {isDeleting ? 'DELETING...' : 'DELETE'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEdit}
            >
              <Text style={styles.editButtonText}>EDIT</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>BACK</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Type Picker Modal */}
      <Modal visible={showTypePicker} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowTypePicker(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowTypePicker(false)}>
                <Text style={[styles.modalButtonText, styles.modalDoneButton]}>Done</Text>
              </TouchableOpacity>
            </View>
            <Picker
              selectedValue={editType}
              onValueChange={setEditType}
              style={styles.picker}
            >
              {clothingTypes.map(item => (
                <Picker.Item
                  key={item.value}
                  label={item.label}
                  value={item.value}
                  color={item.value === '' ? '#9CA3AF' : '#000000'}
                />
              ))}
            </Picker>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  imageContainer: {
    width: '100%',
    height: 400,
    backgroundColor: '#F3F4F6',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 10,
  },
  type: {
    fontSize: 18,
    color: '#4B5563',
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    color: '#6B7280',
  },
  buttonContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  backButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flex: 1,
  },
  backButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  editSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
  },
  editInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 16,
  },
  editInputText: {
    fontSize: 16,
    color: '#4B5563',
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  editButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  cancelButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flex: 1,
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flex: 1,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  viewButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flex: 1,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  editButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flex: 1,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
  },
  modalDoneButton: {
    color: '#6366F1',
  },
  picker: {
    width: '100%',
    height: 50,
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
    opacity: 0.6,
  },
});

export default ClothingDetailsScreen; 