import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Text,
  Animated,
  Dimensions,
} from 'react-native';
import { colors, spacing, typography } from '../../styles/theme';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const BottomSheet = ({
  visible,
  onClose,
  onDone,
  height = SCREEN_HEIGHT * 0.7,
  title,
  children,
}) => {
  const slideAnim = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      showBottomSheet();
    }
  }, [visible]);

  const showBottomSheet = () => {
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

  const hideBottomSheet = (shouldComplete = false) => {
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
      onClose();
      if (shouldComplete && onDone) {
        onDone();
      }
    });
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.container, { opacity: backdropOpacity }]}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => hideBottomSheet()}
        />
        <Animated.View 
          style={[
            styles.content, 
            { 
              height,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => hideBottomSheet()}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            {title && <Text style={styles.title}>{title}</Text>}
            <TouchableOpacity onPress={() => hideBottomSheet(true)}>
              <Text style={[styles.buttonText, styles.doneButton]}>Done</Text>
            </TouchableOpacity>
          </View>
          {children}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.subtitle,
    fontWeight: '600',
  },
  buttonText: {
    fontSize: 16,
    color: colors.primary,
  },
  doneButton: {
    fontWeight: '600',
  },
});

export default BottomSheet;
