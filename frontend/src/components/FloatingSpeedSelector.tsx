import React, { useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useColorScheme,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { PLAYBACK_SPEEDS } from '../constants/playback';
import { PRIMARY_COLOR } from '../helper/Theme';

interface FloatingSpeedSelectorProps {
  currentSpeed: number;
  onSpeedSelect: (speed: number) => void;
  visible: boolean;
  onClose: () => void;
}

export const FloatingSpeedSelector: React.FC<FloatingSpeedSelectorProps> = ({
  currentSpeed,
  onSpeedSelect,
  visible,
  onClose,
}) => {
  const navigation = useNavigation();
  const systemColorScheme = useColorScheme();
  const isDarkMode = systemColorScheme === 'dark';

  // Automatically close selector when the screen loses focus (e.g., user navigates away)
  useEffect(() => {
    if (!visible) return;
    
    const unsubscribe = navigation.addListener('blur', () => {
      onClose();
    });

    return unsubscribe;
  }, [navigation, visible, onClose]);

  if (!visible) return null;

  // Custom colors matching the design system
  const colors = {
    overlay: 'rgba(0, 0, 0, 0.6)',
    cardBg: isDarkMode ? '#1E293B' : '#FFFFFF',
    text: isDarkMode ? '#F1F5F9' : '#1E293B',
    mutedText: isDarkMode ? '#94A3B8' : '#64748B',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    itemHoverBg: isDarkMode ? '#334155' : '#F1F5F9',
    primary: PRIMARY_COLOR, // '#00BFFF'
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose} testID="backdrop-touchable">
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <TouchableWithoutFeedback>
            <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]} testID="selector-card">
              <Text style={[styles.title, { color: colors.text }]}>Playback Speed</Text>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              
              {PLAYBACK_SPEEDS.map((speed) => {
                const isSelected = speed === currentSpeed;
                return (
                  <TouchableOpacity
                    key={speed}
                    style={[
                      styles.item,
                      isSelected && { backgroundColor: colors.itemHoverBg },
                    ]}
                    onPress={() => {
                      onSpeedSelect(speed);
                      onClose();
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Set playback speed to ${speed}x`}
                    accessibilityState={{ selected: isSelected }}
                    testID={`speed-option-${speed}`}
                  >
                    <Text
                      style={[
                        styles.itemText,
                        { color: isSelected ? colors.primary : colors.text },
                        isSelected && styles.selectedText,
                      ]}
                    >
                      {speed}x
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={colors.primary}
                        testID="checkmark-icon"
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default FloatingSpeedSelector;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '80%',
    maxWidth: 320,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  itemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectedText: {
    fontWeight: '700',
  },
});
