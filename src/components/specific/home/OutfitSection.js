import React, { useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { colors, spacing } from '../../../styles/theme';
import { PanGestureHandler } from 'react-native-gesture-handler';
import OutfitItem from './OutfitItem';
import AddOutfitButton from './AddOutfitButton';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.35; // Match OutfitItem width

const OutfitSection = ({
  title,
  outfits,
  onOutfitPress,
  onAddPress,
  onFavorite,
  onSectionPress,
  backgroundColor,
  itemContainerColor1,
  itemContainerColor2
}) => {
  const data = [...outfits, { id: 'add-button', isAddButton: true }];
  const scrollViewRef = useRef(null);

  const onGestureEvent = ({ nativeEvent }) => {
    const { translationX } = nativeEvent;
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: -translationX, animated: false });
    }
  };

  const renderItem = (item) => {
    if (item.isAddButton) {
      return (
        <View style={styles.outfitItemWrapper}>
          <AddOutfitButton 
            onPress={onAddPress} 
            containerColor={itemContainerColor1 || itemContainerColor2}
          />
        </View>
      );
    }
    return (
      <View style={styles.outfitItemWrapper}>
        <OutfitItem
          title={item.title}
          image={item.image}
          onPress={() => onOutfitPress(item.id)}
          onFavorite={() => onFavorite(item.id)}
          isFavorite={title.toLowerCase().includes('favourite')}
          containerColor={itemContainerColor1 || itemContainerColor2}
        />
      </View>
    );
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor }]}
      onPress={onSectionPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: itemContainerColor1 || itemContainerColor2 }]}>{title}</Text>
        <Text style={styles.count}>{outfits.length} outfits</Text>
      </View>
      <PanGestureHandler onGestureEvent={onGestureEvent}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            bounces={false}
          >
            {data.map((item) => (
              <View key={item.id.toString()}>
                {renderItem(item)}
              </View>
            ))}
          </ScrollView>
        </PanGestureHandler>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    marginHorizontal: spacing.md,
    borderRadius: 25,
    backgroundColor: colors.container1,
    minHeight: 250,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
    flex: 1,
  },
  count: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  outfitItemWrapper: {
    width: ITEM_WIDTH,
    marginRight: spacing.md,
  },
});

export default OutfitSection;
