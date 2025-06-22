import { useEffect, useRef, useState } from "react";
import { View,Text,StyleSheet,SafeAreaView,TouchableOpacity,StatusBar,Image,Animated,Dimensions,Easing,Vibration } from "react-native";
import { useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get("window");

const SuccessScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [animationComplete, setAnimationComplete] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const buttonScaleAnim = useRef(new Animated.Value(0.95)).current;

  const confettiOpacity = useRef(new Animated.Value(0)).current;
  const confettiTranslateY = useRef(new Animated.Value(-100)).current;

  const particleAnims = Array(8).fill().map(() => ({
    opacity: useRef(new Animated.Value(0)).current,
    translate: useRef(new Animated.Value(0)).current,
    scale: useRef(new Animated.Value(0)).current,
  }));

  const circle1Anim = useRef(new Animated.Value(0)).current;
  const circle2Anim = useRef(new Animated.Value(0)).current;
  const circle3Anim = useRef(new Animated.Value(0)).current;

  const progressAnim = useRef(new Animated.Value(0)).current;

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Vibration.vibrate([0, 50, 50, 50]);
    } catch (error) {
      // Fallback to standard vibration if haptics not available
      Vibration.vibrate(100);
    }

    // Progress indicator animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // We need to animate width which requires layout
    }).start();

    // Animation sequence for content
    Animated.sequence([
      // First animate the success check mark
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.back(1.5),
        useNativeDriver: true,
      }),
      
      // Trigger particle animations
      Animated.parallel(
        particleAnims.map((anim, index) => {
          const angle = (index / particleAnims.length) * 2 * Math.PI;
          const delay = index * 30;
          
          return Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
              Animated.timing(anim.opacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(anim.translate, {
                toValue: 1,
                duration: 700,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
              Animated.timing(anim.scale, {
                toValue: 1,
                duration: 700,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
              }),
              Animated.sequence([
                Animated.delay(400),
                Animated.timing(anim.opacity, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: true,
                }),
              ]),
            ]),
          ]);
        })
      ),
      
      // Then fade in the text content
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideUpAnim, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(confettiOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(confettiTranslateY, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      
      // Finally, activate the button animation
      Animated.spring(buttonScaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setAnimationComplete(true);
      startPulseAnimation();
    });

    // Start the background decorative animations
    startCircleAnimations();
  }, []);

  // Start pulse animation for success circle after main animation completes
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startCircleAnimations = () => {
    // Circle 1 animation - floating up and down
    Animated.loop(
      Animated.sequence([
        Animated.timing(circle1Anim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(circle1Anim, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Circle 2 animation - floating side to side
    Animated.loop(
      Animated.sequence([
        Animated.timing(circle2Anim, {
          toValue: 1,
          duration: 6000,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(circle2Anim, {
          toValue: 0,
          duration: 6000,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    // Circle 3 animation - floating in a circular pattern
    Animated.loop(
      Animated.timing(circle3Anim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  const handleContinue = () => {
    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Trigger haptic feedback
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      Vibration.vibrate(50);
    }
    
    // Navigate after a slight delay for animation
    setTimeout(() => {
      navigation.navigate("MainStack");
    }, 100);
  };

  // Generate confetti elements
  const renderConfetti = () => {
    const confettiElements = [];
    const confettiCount = 30;
    
    for (let i = 0; i < confettiCount; i++) {
      const size = Math.random() * 8 + 4;
      const initialRotation = Math.random() * 360;
      const rotationDirection = Math.random() > 0.5 ? 1 : -1;
      const left = Math.random() * width;
      const delay = Math.random() * 500;
      const duration = 1000 + Math.random() * 2000;
      
      // Random color from a pleasant palette
      const colors = ['#FFD700', '#1963A7', '#49A1D1', '#FF6B6B', '#4CAF50', '#9C27B0'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      confettiElements.push(
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            width: size,
            height: size,
            backgroundColor: color,
            borderRadius: Math.random() > 0.3 ? size / 2 : 0,
            left: left,
            top: -20,
            opacity: confettiOpacity.interpolate({
              inputRange: [0, 0.4, 1],
              outputRange: [0, Math.random() * 0.8 + 0.2, 0],
            }),
            transform: [
              {
                translateY: confettiTranslateY.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, height * 0.6 + Math.random() * height * 0.4],
                }),
              },
              {
                rotate: `${initialRotation}deg`,
              },
              {
                rotateZ: confettiTranslateY.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', `${rotationDirection * (Math.random() * 360 + 180)}deg`],
                }),
              },
            ],
          }}
        />
      );
    }

    return confettiElements;
  };

  // Generate particle elements for success animation
  const renderParticles = () => {
    return particleAnims.map((anim, index) => {
      const angle = (index / particleAnims.length) * 2 * Math.PI;
      const distance = 60;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      const isCircle = index % 2 === 0;

      return (
        <Animated.View
          key={index}
          style={{
            position: 'absolute',
            width: 10,
            height: 10,
            backgroundColor: isCircle ? '#49A1D1' : '#FFD700',
            borderRadius: isCircle ? 5 : 0,
            opacity: anim.opacity,
            transform: [
              {
                translateX: anim.translate.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, x],
                }),
              },
              {
                translateY: anim.translate.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, y],
                }),
              },
              {
                scale: anim.scale.interpolate({
                  inputRange: [0, 0.7, 1],
                  outputRange: [0, 1.2, 1],
                }),
              },
              {
                rotate: isCircle ? '0deg' : '45deg',
              },
            ],
          }}
        />
      );
    });
  };

  return (
    <>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient 
        colors={["#862B4D", "#5E1B26"]} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <SafeAreaView style={styles.safeContainer}>
          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            <Animated.View 
              style={[
                styles.progressBar,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  })
                }
              ]} 
            />
          </View>
          
          {/* Success Icon with Animation */}
          <Animated.View style={[
            styles.successContainer,
            { 
              transform: [
                { scale: scaleAnim },
                { scale: pulseAnim } 
              ] 
            }
          ]}>
            <LinearGradient
              colors={["rgba(255,255,255,0.2)", "rgba(255,255,255,0.05)"]}
              style={styles.successCircle}
            >
              <Image
                source={require("../../assets/Auth/success.png")}
                style={styles.successImage}
                resizeMode="contain"
              />

              {renderParticles()}
            </LinearGradient>
          </Animated.View>
          
          {/* Content Container with Animation */}
          <Animated.View style={[
            styles.contentContainer, 
            { 
              opacity: opacityAnim,
              transform: [{ translateY: slideUpAnim }]
            }
          ]}>
            {/* Main Title with shimmer effect */}
            <View style={styles.titleContainer}>
              <Text style={styles.titleText}>SUCCESS</Text>
              <View style={styles.shimmerOverlay} />
            </View>
            
            {/* Tagline */}
            <Text style={styles.taglineText}>
              Your account has been created successfully!
            </Text>
            
            {/* What's next section */}
            {animationComplete && (
              <View style={styles.nextStepsContainer}>
                <Text style={styles.nextStepsTitle}>What's next?</Text>
                <View style={styles.nextStepItem}>
                  <View style={styles.stepNumberCircle}>
                    <Text style={styles.stepNumber}>1</Text>
                  </View>
                  <Text style={styles.stepText}>Continue to Login</Text>
                </View>
                <View style={styles.nextStepItem}>
                  <View style={styles.stepNumberCircle}>
                    <Text style={styles.stepNumber}>2</Text>
                  </View>
                  <Text style={styles.stepText}>Complete your profile information </Text>
                </View>
                <View style={styles.nextStepItem}>
                  <View style={styles.stepNumberCircle}>
                    <Text style={styles.stepNumber}>3</Text>
                  </View>
                  <Text style={styles.stepText}>Explore the app features</Text>
                </View>
              </View>
            )}
            
            {/* Continue Button with Animation */}
            <Animated.View style={[
              styles.buttonWrapper,
              {
                transform: [{ scale: buttonScaleAnim }],
                opacity: opacityAnim
              }
            ]}>
              <TouchableOpacity
                onPress={handleContinue}
                activeOpacity={0.95}
                style={{width: '100%'}}
              >
                <LinearGradient
                  colors={["#1963A7", "#49A1D1"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.continueButton}
                >
                  <View style={styles.buttonContent}>
                    <Text style={styles.continueButtonText}>CONTINUE</Text>
                    <Ionicons name="chevron-forward" size={22} color="#fff" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
          
          {/* Background "SUCCESS" Letters */}
          <View style={styles.backgroundLetters}>
            <Text style={styles.backgroundLettersText}>SUC{'\n'}CESS</Text>
          </View>
          
          {/* Confetti animation overlay */}
          <View style={styles.confettiContainer}>
            {renderConfetti()}
          </View>
          
          {/* Decorative Elements with Animation */}
          <Animated.View 
            style={[
              styles.decorativeCircle1,
              {
                transform: [
                  { translateY: circle1Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -30]
                    })
                  },
                  { scale: circle1Anim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [1, 1.1, 1]
                    })
                  }
                ]
              }
            ]} 
          />
          <Animated.View 
            style={[
              styles.decorativeCircle2,
              {
                transform: [
                  { translateX: circle2Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 30]
                    })
                  },
                  { translateY: circle2Anim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, -15, 0]
                    })
                  }
                ]
              }
            ]} 
          />
          <Animated.View 
            style={[
              styles.decorativeCircle3,
              {
                transform: [
                  { 
                    translateX: circle3Anim.interpolate({
                      inputRange: [0, 0.25, 0.5, 0.75, 1],
                      outputRange: [0, 15, 0, -15, 0]
                    })
                  },
                  { 
                    translateY: circle3Anim.interpolate({
                      inputRange: [0, 0.25, 0.5, 0.75, 1],
                      outputRange: [0, -15, 0, 15, 0]
                    })
                  },
                  {
                    scale: circle3Anim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [1, 1.2, 1]
                    })
                  }
                ],
                opacity: circle3Anim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.07, 0.12, 0.07]
                })
              }
            ]} 
          />
        </SafeAreaView>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  progressContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    zIndex: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#49A1D1',
  },
  successContainer: {
    marginBottom: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  successCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'visible', 
  },
  successImage: {
    width: 160,
    height: 160,
  },
  contentContainer: {
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 30,
    zIndex: 2,
  },
  titleContainer: {
    position: 'relative',
    marginBottom: 15,
    overflow: 'hidden',
  },
  titleText: {
    fontSize: 36,
    color: "#fff",
    fontWeight: "bold",
    letterSpacing: 2,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.2)',
    opacity: 0.5,
  },
  taglineText: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 30,
  },
  nextStepsContainer: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 30,
  },
  nextStepsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
  },
  nextStepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepNumberCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(73, 161, 209, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  stepNumber: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  backgroundLetters: {
    position: "absolute",
    bottom: -20,
    left: 0,
    right: 0,
    zIndex: 0,
    height: "60%",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingLeft: 20,
  },
  backgroundLettersText: {
    color: "rgba(255, 255, 255, 0.06)",
    fontSize: 160,
    fontWeight: "900",
    lineHeight: 180,
  },
  buttonWrapper: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButton: {
    width: "100%",
    borderRadius: 16,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 8,
    letterSpacing: 1,
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    pointerEvents: 'none',
  },
  decorativeCircle1: {
    position: "absolute",
    top: height * 0.1,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    zIndex: 0,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  decorativeCircle2: {
    position: "absolute",
    top: height * 0.35,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    zIndex: 0,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.07)",
  },
  decorativeCircle3: {
    position: "absolute",
    bottom: height * 0.15,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.07)",
    zIndex: 0,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
});

export default SuccessScreen;