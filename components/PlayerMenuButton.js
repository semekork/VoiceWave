import React, { useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MenuButton = ({ 
  onMenuToggle, 
  isMenuVisible, 
  style,
  size = 24,
  color = "#000",
  rippleColor = "#E0E0E0"
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const rippleAnimValue = useRef(new Animated.Value(0)).current;

  // Rotate animation for menu state
  React.useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: isMenuVisible ? 1 : 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [isMenuVisible]);

  // Handle press with haptic feedback and animation
  const handlePress = () => {
    // Scale animation for press feedback
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();

    // Ripple effect
    Animated.sequence([
      Animated.timing(rippleAnimValue, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
      Animated.timing(rippleAnimValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();

    onMenuToggle();
  };

  // Rotation interpolation
  const rotation = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  // Ripple scale interpolation
  const rippleScale = rippleAnimValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const rippleOpacity = rippleAnimValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.3, 0],
  });

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.touchableArea}
        onPress={handlePress}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {/* Ripple Effect */}
        <Animated.View
          style={[
            styles.ripple,
            {
              backgroundColor: rippleColor,
              transform: [{ scale: rippleScale }],
              opacity: rippleOpacity,
            }
          ]}
        />
        
        {/* Menu Button with Scale and Rotation */}
        <Animated.View
          style={[
            styles.buttonContent,
            {
              transform: [
                { scale: scaleValue },
                { rotate: rotation }
              ]
            }
          ]}
        >
          <Feather 
            name="more-horizontal" 
            size={size} 
            color={color}
          />
        </Animated.View>
        
        {/* Active indicator */}
        {isMenuVisible && (
          <Animated.View
            style={[
              styles.activeIndicator,
              {
                opacity: animatedValue,
              }
            ]}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

// Enhanced Menu Button Container Component
const MenuButtonContainer = ({ 
  children, 
  isMenuVisible, 
  onMenuToggle,
  showQueueButton = true,
  queueCount = 0,
  onQueuePress,
  containerStyle 
}) => {
  return (
    <View style={[styles.headerButtonsContainer, containerStyle]}>
      {/* Queue Button */}
      {showQueueButton && (
        <TouchableOpacity 
          style={styles.queueButton} 
          onPress={onQueuePress}
          activeOpacity={0.7}
        >
          <Feather name="list" size={24} color="#000" />
          {queueCount > 0 && (
            <View style={styles.queueBadge}>
              <Text style={styles.queueBadgeText}>
                {queueCount > 99 ? '99+' : queueCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}
      
      {/* Custom children (additional buttons) */}
      {children}
      
      {/* Menu Button */}
      <MenuButton
        onMenuToggle={onMenuToggle}
        isMenuVisible={isMenuVisible}
        style={styles.menuButtonSpacing}
      />
    </View>
  );
};


const FloatingMenuButton = ({
  isMenuVisible,
  onMenuToggle,
  position = 'bottom-right', 
  size = 56,
  style
}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const rotateValue = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(rotateValue, {
      toValue: isMenuVisible ? 1 : 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [isMenuVisible]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();

    onMenuToggle();
  };

  const rotation = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const getPositionStyle = () => {
    const baseStyle = {
      position: 'absolute',
      zIndex: 1000,
    };

    switch (position) {
      case 'bottom-right':
        return { ...baseStyle, bottom: 20, right: 20 };
      case 'bottom-center':
        return { ...baseStyle, bottom: 20, alignSelf: 'center' };
      case 'top-right':
        return { ...baseStyle, top: 60, right: 20 };
      default:
        return { ...baseStyle, bottom: 20, right: 20 };
    }
  };

  return (
    <Animated.View
      style={[
        styles.floatingButton,
        getPositionStyle(),
        { 
          width: size, 
          height: size, 
          borderRadius: size / 2,
          transform: [{ scale: scaleValue }]
        },
        style
      ]}
    >
      <TouchableOpacity
        style={styles.floatingTouchable}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Animated.View
          style={{
            transform: [{ rotate: rotation }]
          }}
        >
          <Feather 
            name={isMenuVisible ? "x" : "more-horizontal"} 
            size={24} 
            color="white"
          />
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  touchableArea: {
    padding: 8,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ripple: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -2,
    left: '50%',
    marginLeft: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D32F2F',
  },
  headerButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  queueButton: {
    padding: 8,
    marginRight: 8,
    position: 'relative',
  },
  queueBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#D32F2F',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  queueBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  menuButtonSpacing: {
    marginLeft: 4,
  },
  floatingButton: {
    backgroundColor: '#D32F2F',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  floatingTouchable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export { MenuButton, MenuButtonContainer, FloatingMenuButton };
export default MenuButton;