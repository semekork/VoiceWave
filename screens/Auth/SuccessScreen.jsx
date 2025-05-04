import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Image,
  Animated,
  Dimensions,
  Easing
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

const SuccessScreen = () => {
  const navigation = useNavigation();
  const scaleAnim = new Animated.Value(0);
  const opacityAnim = new Animated.Value(0);
  const slideUpAnim = new Animated.Value(50);
  
  // Animated values for decorative circles
  const circle1Anim = useRef(new Animated.Value(0)).current;
  const circle2Anim = useRef(new Animated.Value(0)).current;
  const circle3Anim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Animation sequence for content
    Animated.sequence([
      // First animate the success check mark
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
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
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Continuous floating animations for decorative circles
    const startCircleAnimations = () => {
      // Circle 1 animation - floating up and down
      Animated.loop(
        Animated.sequence([
          Animated.timing(circle1Anim, {
            toValue: 1,
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(circle1Anim, {
            toValue: 0,
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
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
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(circle2Anim, {
            toValue: 0,
            duration: 6000,
            easing: Easing.inOut(Easing.ease),
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

    startCircleAnimations();
  }, []);

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
          
          {/* Success Icon with Animation */}
          <Animated.View style={[
            styles.successContainer,
            { transform: [{ scale: scaleAnim }] }
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
            {/* Main Title */}
            <Text style={styles.titleText}>SUCCESS</Text>
            
            {/* Tagline */}
            <Text style={styles.taglineText}>
              Your account has been created successfully!
            </Text>
            
            {/* Continue Button */}
            <TouchableOpacity
              onPress={() => navigation.navigate("LoginScreen")}
              style={styles.buttonWrapper}
              activeOpacity={0.9}
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
          
          {/* Background "SUCCESS" Letters */}
          <View style={styles.backgroundLetters}>
            <Text style={styles.backgroundLettersText}>SUC{'\n'}CESS</Text>
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
  titleText: {
    fontSize: 36,
    color: "#fff",
    fontWeight: "bold",
    letterSpacing: 2,
    marginBottom: 15,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  taglineText: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 40,
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
    marginTop: 10,
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