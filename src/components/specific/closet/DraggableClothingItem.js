import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { colors, typography, layout } from '../../../styles/theme';
import { supabase } from '../../../services/supabase/auth';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const MIN_SIZE = 60;
const MAX_SIZE = 300;
const RESIZE_SENSITIVITY = 1.5;

const DraggableClothingItem = ({ 
  imagePath, 
  name, 
  initialPosition, 
  onRemove,
  isSelected,
  onSelect 
}) => {
  const pan = useRef(new Animated.ValueXY(initialPosition)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const [imageUrl, setImageUrl] = useState(null);
  const [size, setSize] = useState(100);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const getSignedUrl = async () => {
      try {
        const { data: { signedUrl }, error } = await supabase.storage
          .from('userclothes')
          .createSignedUrl(imagePath, 3600);
        
        if (error) {
          console.error('Error getting signed URL:', error);
          return;
        }
        
        if (signedUrl) {
          setImageUrl(signedUrl);
        }
      } catch (error) {
        console.error('Error in getSignedUrl:', error);
      }
    };

    if (imagePath) {
      getSignedUrl();
    }
  }, [imagePath]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
        pan.setValue({ x: 0, y: 0 });
        Animated.spring(scale, {
          toValue: 1.1,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: Animated.event(
        [
          null,
          {
            dx: pan.x,
            dy: pan.y,
          },
        ],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gestureState) => {
        pan.flattenOffset();
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
        
        // If there was no movement, treat it as a tap
        if (Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5) {
          onSelect();
        }
      },
    })
  ).current;

  const resizeResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsResizing(true);
      },
      onPanResponderMove: (_, gestureState) => {
        const newSize = Math.max(
          MIN_SIZE,
          Math.min(MAX_SIZE, size + (gestureState.dx * RESIZE_SENSITIVITY))
        );
        setSize(newSize);
      },
      onPanResponderRelease: () => {
        setIsResizing(false);
      },
    })
  ).current;

  const animatedStyle = {
    transform: [
      { translateX: pan.x },
      { translateY: pan.y },
      { scale: scale },
    ],
    width: size,
    zIndex: isSelected ? 1000 : 1,
  };

  return (
    <Animated.View
      style={[styles.container, animatedStyle]}
      {...panResponder.panHandlers}
    >
      <View 
        style={[
          styles.imageContainer, 
          { width: size, height: size },
          isSelected && styles.selectedContainer
        ]}
      >
        {imageUrl && (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="contain"
          />
        )}
        {isSelected && onRemove && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={onRemove}
          >
            <MaterialCommunityIcons
              name="close"
              size={20}
              color={colors.primary}
            />
          </TouchableOpacity>
        )}
        {isSelected && (
          <View
            style={styles.resizeHandle}
            {...resizeResponder.panHandlers}
          >
            <MaterialCommunityIcons
              name="resize"
              size={16}
              color={colors.primary}
            />
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 1,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  selectedContainer: {
    borderColor: colors.primary,
    borderWidth: 2,
    borderRadius: 4,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  resizeHandle: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default DraggableClothingItem;
