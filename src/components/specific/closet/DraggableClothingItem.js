import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Image,
  Text,
} from 'react-native';
import { colors, typography, layout } from '../../../styles/theme';
import { supabase } from '../../../services/supabase/auth';

const DraggableClothingItem = ({ imagePath, name, initialPosition }) => {
  const pan = useRef(new Animated.ValueXY(initialPosition)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const getSignedUrl = async () => {
      try {
        const { data: { signedUrl }, error } = await supabase.storage
          .from('userclothes')
          .createSignedUrl(imagePath, 3600); // 1 hour expiry
        
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
        // Scale up slightly when dragging starts
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
      onPanResponderRelease: () => {
        pan.flattenOffset();
        // Scale back to normal when dragging ends
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  const animatedStyle = {
    transform: [
      { translateX: pan.x },
      { translateY: pan.y },
      { scale: scale },
    ],
  };

  return (
    <Animated.View
      style={[styles.container, animatedStyle]}
      {...panResponder.panHandlers}
    >
      <View style={styles.imageContainer}>
        {imageUrl && (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        )}
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {name}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    width: 100,
    zIndex: 1,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.background,
    borderRadius: layout.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: layout.borderRadius,
  },
  name: {
    ...typography.caption,
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
});

export default DraggableClothingItem;
