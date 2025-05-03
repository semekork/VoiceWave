import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

const OnboardingIndicator = ({ total = 3, activeIndex = 0 }) => {
  const animations = useRef([...Array(total)].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    animations.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: index === activeIndex ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
  }, [activeIndex]);

  return (
    <View style={styles.navIndicators}>
      {animations.map((animValue, index) => {
        const backgroundColor = animValue.interpolate({
          inputRange: [0, 1],
          outputRange: ['rgba(255, 255, 255, 0.3)', '#FFFFFF'],
        });

        const width = animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 36], // animate width too for a sleek effect
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.indicator,
              {
                backgroundColor,
                width,
              },
            ]}
          />
        );
      })}
    </View>
  );
};
const styles = StyleSheet.create({
  navIndicators: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    marginBottom: 48,
    marginRight: 10,
  },
  indicator: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
    borderRadius: 2,
  },

});

export default OnboardingIndicator;
