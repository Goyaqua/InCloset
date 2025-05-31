import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, typography } from '../../styles/theme';
import { supabase, signOut } from '../../services/supabase/auth';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';


const PURPLE = '#5F48E6';

const ProfileScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const tempName = route.params?.tempName;
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                // Fetch profile from 'profiles' table (adjust if your table is named differently)
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                if (!error && data) {
                    setProfile(data);
                }
            }
            setLoading(false);
        };
        fetchUser();
    }, []);

    const handleSignOut = async () => {
        const { error } = await signOut();
        if (!error) {
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        } else {
            Alert.alert('Error', 'Could not sign out.');
        }
    };

    const handleEditProfile = () => {
        navigation.navigate('EditProfile', { profile });
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>PROFILE</Text>

                <View style={styles.profileRow}>
                    <Image
                        source={{ uri: profile.avatar_url || 'https://randomuser.me/api/portraits/women/44.jpg' }}
                        style={styles.profileImage}
                    />
                    <View style={styles.profileInfo}>
                        <Text style={styles.name}>
                            {tempName || profile.full_name || user?.email?.split('@')[0]}
                        </Text>

                        <Text style={styles.email}>{user?.email}</Text>
                        <View style={styles.infoRow}>
                            <Text style={styles.genderAge}>Gender: {profile.gender || '-'}</Text>
                            <Text style={styles.genderAge}>Age: {profile.age || '-'}</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.actionList}>
                <TouchableOpacity style={styles.actionItem} onPress={handleEditProfile}>
                    <MaterialCommunityIcons name="pencil-outline" size={22} color={colors.text} style={{ marginRight: 12 }} />
                    <Text style={styles.actionText}>Edit Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionItem} onPress={handleSignOut}>
                    <MaterialCommunityIcons name="logout" size={22} color={colors.text} style={{ marginRight: 12 }} />
                    <Text style={styles.actionText}>Sign Out</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );

};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        backgroundColor: PURPLE,
        paddingBottom: 32,
        paddingTop: 48,
        paddingHorizontal: 0,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerTitle: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',       // Ortalanması için eklendi
        marginBottom: 12,
        marginTop: 8,
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        marginLeft: 24,
    },
    profileImage: {
        width: 72,
        height: 72,
        borderRadius: 36,
        borderWidth: 3,
        borderColor: colors.white,
    },
    profileInfo: {
        marginLeft: 18,
    },
    name: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    email: {
        color: 'white',
        fontSize: 15,
        marginTop: 2,
    },
    infoRow: {
        flexDirection: 'row',
        marginTop: 2,
    },
    genderAge: {
        color: 'white',
        fontSize: 15,
        marginRight: 12,
    },
    actionList: {
        marginTop: 32,
        backgroundColor: colors.white,
        borderRadius: 12,
        marginHorizontal: 0,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    actionText: {
        fontSize: 17,
        color: colors.text,
    },
});

export default ProfileScreen; 