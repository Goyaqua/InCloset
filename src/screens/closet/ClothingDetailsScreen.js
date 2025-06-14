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
  const [editStyles, setEditStyles] = useState(item.styles || []);
  const [editOccasions, setEditOccasions] = useState(item.occasions || []);
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [showOccasionPicker, setShowOccasionPicker] = useState(false);

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
    setEditStyles(item.styles || []);
    setEditOccasions(item.occasions || []);
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
      const { error } = await updateClothing(item.id, {
        name: editName.trim(),
        type: editType,
        styles: editStyles,
        occasions: editOccasions
      });

      if (error) throw error;

      // Update the local item data
      item.name = editName.trim();
      item.type = editType;
      item.styles = editStyles;
      item.occasions = editOccasions;
      
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

  const renderTags = (tags) => {
    if (!tags || tags.length === 0) return null;
    
    return (
      <View style={styles.tagsContainer}>
        {tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
    );
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

              <View style={styles.editSection}>
                <Text style={styles.label}>Style</Text>
                <TouchableOpacity 
                  style={styles.editInput} 
                  onPress={() => setShowStylePicker(true)}
                >
                  <Text style={[styles.editInputText, editStyles.length === 0 && styles.placeholderText]}>
                    {editStyles.length > 0 
                      ? `${editStyles.length} style${editStyles.length > 1 ? 's' : ''} selected`
                      : 'Select styles'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.editSection}>
                <Text style={styles.label}>Occasion</Text>
                <TouchableOpacity 
                  style={styles.editInput} 
                  onPress={() => setShowOccasionPicker(true)}
                >
                  <Text style={[styles.editInputText, editOccasions.length === 0 && styles.placeholderText]}>
                    {editOccasions.length > 0 
                      ? `${editOccasions.length} occasion${editOccasions.length > 1 ? 's' : ''} selected`
                      : 'Select occasions'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.type}>Type: {item.type}</Text>
              {item.styles && item.styles.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Styles</Text>
                  {renderTags(item.styles)}
                </View>
              )}
              {item.occasions && item.occasions.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Occasions</Text>
                  {renderTags(item.occasions)}
                </View>
              )}
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
                    editStyles.includes(style) && styles.tagItemSelected
                  ]}
                  onPress={() => {
                    setEditStyles(prev => 
                      prev.includes(style)
                        ? prev.filter(s => s !== style)
                        : [...prev, style]
                    );
                  }}
                >
                  <Text style={[
                    styles.tagText,
                    editStyles.includes(style) && styles.tagTextSelected
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
                    editOccasions.includes(occasion) && styles.tagItemSelected
                  ]}
                  onPress={() => {
                    setEditOccasions(prev => 
                      prev.includes(occasion)
                        ? prev.filter(o => o !== occasion)
                        : [...prev, occasion]
                    );
                  }}
                >
                  <Text style={[
                    styles.tagText,
                    editOccasions.includes(occasion) && styles.tagTextSelected
                  ]}>
                    {occasion.charAt(0).toUpperCase() + occasion.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tagText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  date: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
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
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalButtonText: {
    fontSize: 16,
    color: '#6B7280',
    padding: 8,
  },
  modalDoneButton: {
    color: '#6366F1',
    fontWeight: '600',
  },
  picker: {
    width: '100%',
    height: 200,
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
    opacity: 0.6,
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
  tagTextSelected: {
    color: '#FFFFFF',
  },
});

export default ClothingDetailsScreen; 