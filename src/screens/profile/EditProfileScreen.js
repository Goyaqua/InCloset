import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    SafeAreaView,
    Image,
    Platform,
    Modal,
    Pressable,
} from 'react-native';
import { colors, typography } from '../../styles/theme';
import { supabase } from '../../services/supabase/auth';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const PURPLE = '#5F48E6';
const PINK = '#E04E9F';
const GENDER_OPTIONS = ['Female', 'Male', 'Other'];

const EditProfileScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { profile } = route.params;

    const [firstName, setFirstName] = useState(profile.first_name || profile.full_name?.split(' ')[0] || '');
    const [lastName, setLastName] = useState(profile.last_name || profile.full_name?.split(' ')[1] || '');
    const [age, setAge] = useState(profile.age ? String(profile.age) : '');
    const [gender, setGender] = useState(profile.gender || '');
    const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || 'https://randomuser.me/api/portraits/women/44.jpg');
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [genderModalVisible, setGenderModalVisible] = useState(false);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
            uploadImage(result.assets[0].uri);
        }
    };

    const uploadImage = async (uri) => {
        try {
            setUploading(true);
            const response = await fetch(uri);
            const blob = await response.blob();
            let fileExt = uri.split('.').pop();
            if (!fileExt || fileExt.length > 5) fileExt = 'jpg';
            const fileName = `${profile.id}_${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, blob, {
                    contentType: blob.type || 'image/jpeg',
                    upsert: true,
                });
            if (uploadError) throw uploadError;
            const { data: publicUrlData, error: urlError } = supabase.storage.from('avatars').getPublicUrl(fileName);
            if (urlError) throw urlError;
            setAvatarUrl(publicUrlData.publicUrl);
        } catch (error) {
            Alert.alert('Upload Error', error.message || 'Could not upload image.');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!firstName || !lastName || !age || !gender) {
            Alert.alert('Missing Info', 'Please fill in all fields.');
            return;
        }
        setSaving(true);
        const fullName = `${firstName} ${lastName}`;
        const { error } = await supabase
            .from('profiles')
            .update({
                first_name: firstName,
                last_name: lastName,
                full_name: fullName,
                age: parseInt(age),
                gender,
                avatar_url: avatarUrl,
            })
            .eq('id', profile.id);
        setSaving(false);
        if (!error) {
            navigation.navigate('Profile', {
                tempName: `${firstName} ${lastName}`
            });
        }

    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>PROFILE</Text>
                <View style={styles.avatarContainer}>
                    <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                    <TouchableOpacity style={styles.editAvatar} onPress={pickImage} disabled={uploading}>
                        <MaterialCommunityIcons name="pencil" size={22} color={PURPLE} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.formContainer}>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>First Name</Text>
                    <TextInput
                        style={styles.input}
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholder="Enter a first name"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Last Name</Text>
                    <TextInput
                        style={styles.input}
                        value={lastName}
                        onChangeText={setLastName}
                        placeholder="Enter a last name"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Age</Text>
                    <TextInput
                        style={styles.input}
                        value={age}
                        onChangeText={text => setAge(text.replace(/[^0-9]/g, ''))}
                        placeholder="Enter your age"
                        keyboardType="numeric"
                        maxLength={3}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Gender</Text>
                    <View style={styles.pickerWrapper}>
                        <TouchableOpacity
                            style={styles.picker}
                            onPress={() => setGenderModalVisible(true)}
                        >
                            <Text style={{ color: gender ? colors.text : colors.textSecondary }}>
                                {gender ? gender : 'Pick a gender'}
                            </Text>
                            <MaterialCommunityIcons name="chevron-down" size={22} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: PINK }]}
                        onPress={() => navigation.goBack()}
                        disabled={saving}
                    >
                        <Text style={styles.buttonText}>CANCEL</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: PURPLE }]}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        <Text style={styles.buttonText}>SAVE</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Gender Modal */}
            <Modal
                transparent
                visible={genderModalVisible}
                animationType="slide"
                onRequestClose={() => setGenderModalVisible(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setGenderModalVisible(false)}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Select Gender</Text>
                        {GENDER_OPTIONS.map((option, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.modalItem}
                                onPress={() => {
                                    setGender(option);
                                    setGenderModalVisible(false);
                                }}
                            >
                                <Text style={styles.modalItemText}>{option}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        backgroundColor: PURPLE,
        paddingBottom: 60,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
    },
    headerTitle: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    avatarContainer: {
        marginTop: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 4,
        borderColor: 'white',
        marginBottom: 8,
    },
    editAvatar: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 6,
        borderWidth: 1,
        borderColor: PURPLE,
    },
    formContainer: {
        flex: 1,
        padding: 24,
        marginTop: -40,
    },
    formGroup: {
        marginBottom: 18,
    },
    label: {
        ...typography.body,
        color: colors.text,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: 'white',
        color: colors.text,
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        backgroundColor: 'white',
    },
    picker: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 32,
    },
    button: {
        flex: 1,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 8,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 24,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    modalItem: {
        paddingVertical: 12,
    },
    modalItemText: {
        fontSize: 16,
        textAlign: 'center',
        color: colors.text,
    },
});

export default EditProfileScreen;
