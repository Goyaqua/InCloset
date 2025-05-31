import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  SafeAreaView,
  Alert,
} from 'react-native';
import { supabase } from '../../services/supabase/auth';
import { colors, spacing, typography, layout } from '../../styles/theme';

const ProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    outfits: 0,
    items: 0,
    favorites: 0
  });

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

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
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: clothes, error: clothesError } = await supabase
          .from('clothes')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id);
        
        if (clothesError) throw clothesError;

        const { data: outfits, error: outfitsError } = await supabase
          .from('outfits')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id);

        if (outfitsError) throw outfitsError;

        const { data: favorites, error: favoritesError } = await supabase
          .from('favourites')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id);

        if (favoritesError) throw favoritesError;

        setStats({
          items: clothes?.length || 0,
          outfits: outfits?.length || 0,
          favorites: favorites?.length || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.auth.signOut();
              if (error) throw error;
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>PROFILE</Text>
        </View>
        
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={profile?.avatar_url ? { uri: profile.avatar_url } : require('../../../assets/adaptive-icon.png')}
              style={styles.profileImage}
            />
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {profile?.first_name && profile?.last_name 
                ? `${profile.first_name} ${profile.last_name}`
                : profile?.username || 'User'}
            </Text>
            <Text style={styles.profileEmail}>{profile?.email || ''}</Text>
            
            <View style={styles.profileDetails}>
              {profile?.age && (
                <Text style={styles.profileDetailText}>Age: {profile.age}</Text>
              )}
              {profile?.gender && (
                <Text style={styles.profileDetailText}>
                  Gender: {profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)}
                </Text>
              )}
            </View>

            <View style={styles.profileStats}>
              <Text style={styles.statsText}>{stats.outfits} Outfits</Text>
              <Text style={styles.statsText}> • </Text>
              <Text style={styles.statsText}>{stats.items} Items</Text>
              <Text style={styles.statsText}> • </Text>
              <Text style={styles.statsText}>{stats.favorites} Favorites</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem} onPress={handleEditProfile}>
          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>✏️</Text>
          </View>
          <Text style={styles.menuText}>Edit Profile</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.menuDivider} />

        <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>📱</Text>
          </View>
          <Text style={styles.menuText}>Sign Out</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 10,
    paddingBottom: 30,
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 28,
    color: colors.background,
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.background,
    letterSpacing: 1,
    marginLeft: 10,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    marginRight: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.background,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.background,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: colors.secondary,
    marginBottom: 8,
  },
  profileDetails: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  profileDetailText: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: '500',
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: '500',
  },
  menuSection: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: colors.background,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuIcon: {
    fontSize: 18,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  menuArrow: {
    fontSize: 20,
    color: colors.textSecondary,
    fontWeight: '300',
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 20,
  },
});

export default ProfileScreen;
