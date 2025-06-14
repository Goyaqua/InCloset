import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Alert,
  Modal,
  Animated,
  Dimensions,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../services/supabase/auth';
import { colors, spacing, typography, layout } from '../../styles/theme';
import { Input } from '../../components/common/Input';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerType, setPickerType] = useState(null);
  const slideAnim = useState(new Animated.Value(SCREEN_HEIGHT))[0];
  const backdropOpacity = useState(new Animated.Value(0))[0];

  useEffect(() => {
    fetchProfile();
  }, []);

  const showPickerModal = (type) => {
    setPickerType(type);
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

  const hidePickerModal = () => {
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
      setPickerType(null);
    });
  };

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        if (data) {
          setFirstName(data.first_name || '');
          setLastName(data.last_name || '');
          setAge(data.age ? data.age.toString() : '');
          setGender(data.gender || '');
          setAvatarUrl(data.avatar_url);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        await uploadAvatar(imageUri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadAvatar = async (uri) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      const fileExt = uri.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const response = await fetch(uri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl }, error: urlError } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (urlError) throw urlError;

      setAvatarUrl(publicUrl);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      Alert.alert('Error', 'Failed to upload avatar');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Error', 'First name and last name are required');
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      const updates = {
        id: user.id,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        age: age ? parseInt(age) : null,
        gender,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates)
        .select()
        .single();

      if (error) throw error;
      
      Alert.alert('Success', 'Profile updated successfully', [
        {
          text: 'OK',
          onPress: () => {
            navigation.goBack();
          }
        }
      ]);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const renderPicker = () => {
    if (pickerType === 'age') {
      return (
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={age}
            onValueChange={(itemValue) => {
              setAge(itemValue);
              hidePickerModal();
            }}
            style={styles.picker}
            dropdownIconColor={colors.text}
            mode="dropdown"
          >
            <Picker.Item label="Select Age" value="" color={colors.text} />
            {Array.from({ length: 100 }, (_, i) => i + 1).map((num) => (
              <Picker.Item 
                key={num.toString()} 
                label={num.toString()} 
                value={num.toString()} 
                color={colors.text}
              />
            ))}
          </Picker>
        </View>
      );
    } else if (pickerType === 'gender') {
      return (
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={gender}
            onValueChange={(itemValue) => {
              setGender(itemValue);
              hidePickerModal();
            }}
            style={styles.picker}
            dropdownIconColor={colors.text}
            mode="dropdown"
          >
            <Picker.Item label="Select Gender" value="" color={colors.text} />
            <Picker.Item label="Female" value="female" color={colors.text} />
            <Picker.Item label="Male" value="male" color={colors.text} />
            <Picker.Item label="Other" value="other" color={colors.text} />
            <Picker.Item label="Prefer not to say" value="not_specified" color={colors.text} />
          </Picker>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
              <Image
                source={avatarUrl ? { uri: avatarUrl } : require('../../../assets/adaptive-icon.png')}
                style={styles.avatar}
              />
              <View style={styles.avatarOverlay}>
                <Text style={styles.avatarText}>Change Photo</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>FIRST NAME</Text>
                <Input
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Enter first name"
                  style={styles.shortInput}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>LAST NAME</Text>
                <Input
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Enter last name"
                  style={styles.shortInput}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>AGE</Text>
                <TouchableOpacity 
                  style={[styles.pickerButton, styles.shortInput]} 
                  onPress={() => showPickerModal('age')}
                >
                  <Text style={[styles.pickerValue, !age && styles.placeholderText]}>
                    {age || 'Enter age'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>GENDER</Text>
                <TouchableOpacity 
                  style={[styles.pickerButton, styles.shortInput]} 
                  onPress={() => showPickerModal('gender')}
                >
                  <Text style={[styles.pickerValue, !gender && styles.placeholderText]}>
                    {gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : 'Enter gender'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'SAVING...' : 'SAVE'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showPicker} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={hidePickerModal}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={hidePickerModal}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={hidePickerModal}>
                <Text style={[styles.modalButtonText, styles.modalDoneButton]}>Done</Text>
              </TouchableOpacity>
            </View>
            {renderPicker()}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: spacing.xl,
    width: 160,
    height: 160,
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: spacing.sm,
    alignItems: 'center',
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
  },
  avatarText: {
    color: colors.background,
    ...typography.caption,
  },
  form: {
    paddingHorizontal: spacing.xl,
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  shortInput: {
    height: 40,
  },
  pickerButton: {
    backgroundColor: colors.secondary,
    borderRadius: layout.borderRadius,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  pickerValue: {
    fontSize: 16,
    color: colors.text,
  },
  placeholderText: {
    color: colors.textSecondary,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: layout.borderRadius,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
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
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalButtonText: {
    fontSize: 16,
    color: colors.primary,
    padding: spacing.sm,
  },
  modalDoneButton: {
    fontWeight: '600',
  },
  pickerContainer: {
    backgroundColor: colors.background,
    height: 200,
  },
  picker: {
    width: '100%',
    height: 200,
    color: colors.text,
  },
});

export default EditProfileScreen;
