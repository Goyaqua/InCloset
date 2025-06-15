import React, { useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { colors, spacing } from '../../../styles/theme';
import { PanGestureHandler } from 'react-native-gesture-handler';
import OutfitItem from './OutfitItem';
import AddOutfitButton from './AddOutfitButton';
import { Ionicons } from '@expo/vector-icons';

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
  itemContainerColor,
  textColor,
  forceFavoriteIcon = false
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
            containerColor={itemContainerColor}
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
          isFavorite={forceFavoriteIcon || item.isFavorite}
          containerColor={itemContainerColor}
          textColor={textColor}
        />
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <TouchableOpacity style={styles.header} onPress={onSectionPress}>
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
        <View style={styles.seeAllContainer}>
          <Text style={[styles.seeAllText, { color: textColor }]}>SEE ALL</Text>
          <Ionicons name="chevron-forward" size={20} color={textColor} />
        </View>
      </TouchableOpacity>
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
    </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
    flex: 1,
  },
  seeAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: spacing.xs,
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
