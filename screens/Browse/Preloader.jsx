import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  Dimensions,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Define colors (you can replace these with your actual colors object)
const colors = {
  background: '#FFFFFF',
  card: '#F8F9FA',
  border: '#E9ECEF',
  shimmer: '#F1F3F4',
  shimmerHighlight: '#FFFFFF',
  transparent: 'transparent',
};

const SkeletonPreloader = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Shimmer animation
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );

    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, []);

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
  });

  const ShimmerOverlay = ({ width = '100%', height = 20, borderRadius = 8 }) => (
    <View 
      style={[
        styles.shimmerContainer, 
        { 
          width, 
          height, 
          borderRadius,
          backgroundColor: colors.shimmer,
        }
      ]}
    >
      <Animated.View
        style={[
          styles.shimmerOverlay,
          {
            transform: [{ translateX: shimmerTranslate }],
          },
        ]}
      >
        <LinearGradient
          colors={[
            'transparent',
            colors.shimmerHighlight,
            'transparent',
          ]}
          style={styles.shimmerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </Animated.View>
    </View>
  );

  const HeroSkeleton = () => (
    <View style={styles.heroSkeleton}>
      <ShimmerOverlay width="100%" height={280} borderRadius={20} />
      <View style={styles.heroContentSkeleton}>
        <ShimmerOverlay width={80} height={16} borderRadius={8} />
        <View style={styles.spacer8} />
        <ShimmerOverlay width="70%" height={28} borderRadius={6} />
        <View style={styles.spacer4} />
        <ShimmerOverlay width="50%" height={16} borderRadius={4} />
        <View style={styles.spacer8} />
        <ShimmerOverlay width="90%" height={14} borderRadius={4} />
        <View style={styles.spacer4} />
        <ShimmerOverlay width="75%" height={14} borderRadius={4} />
        <View style={styles.spacer16} />
        <View style={styles.heroActionsSkeleton}>
          <ShimmerOverlay width={120} height={40} borderRadius={20} />
          <View style={styles.spacer8} />
          <ShimmerOverlay width={80} height={40} borderRadius={20} />
        </View>
      </View>
    </View>
  );

  const SectionHeaderSkeleton = () => (
    <View style={styles.sectionHeaderSkeleton}>
      <View style={styles.sectionHeaderLeft}>
        <ShimmerOverlay width={20} height={20} borderRadius={10} />
        <View style={styles.spacer12} />
        <View>
          <ShimmerOverlay width={120} height={20} borderRadius={4} />
          <View style={styles.spacer4} />
          <ShimmerOverlay width={160} height={14} borderRadius={4} />
        </View>
      </View>
      <ShimmerOverlay width={60} height={16} borderRadius={4} />
    </View>
  );

  const FeaturedShowSkeleton = () => (
    <View style={styles.featuredCardSkeleton}>
      <View style={styles.featuredImageSkeleton}>
        <ShimmerOverlay width={180} height={180} borderRadius={16} />
        <View style={styles.featuredPlayButtonSkeleton}>
          <ShimmerOverlay width={32} height={32} borderRadius={16} />
        </View>
        <View style={styles.featuredBadgeSkeleton}>
          <ShimmerOverlay width={60} height={16} borderRadius={8} />
        </View>
      </View>
      <View style={styles.featuredContentSkeleton}>
        <View style={styles.spacer8} />
        <ShimmerOverlay width="90%" height={16} borderRadius={4} />
        <View style={styles.spacer4} />
        <ShimmerOverlay width="70%" height={16} borderRadius={4} />
        <View style={styles.spacer4} />
        <ShimmerOverlay width="60%" height={14} borderRadius={4} />
        <View style={styles.spacer8} />
        <View style={styles.featuredMetaSkeleton}>
          <ShimmerOverlay width={40} height={12} borderRadius={4} />
          <ShimmerOverlay width={60} height={12} borderRadius={4} />
        </View>
      </View>
    </View>
  );

  const EpisodeCardSkeleton = () => (
    <View style={styles.episodeCardSkeleton}>
      <View style={styles.episodeImageSkeleton}>
        <ShimmerOverlay width={140} height={140} borderRadius={12} />
        <View style={styles.episodePlayButtonSkeleton}>
          <ShimmerOverlay width={28} height={28} borderRadius={14} />
        </View>
      </View>
      <View style={styles.episodeContentSkeleton}>
        <View style={styles.spacer8} />
        <ShimmerOverlay width="85%" height={14} borderRadius={4} />
        <View style={styles.spacer4} />
        <ShimmerOverlay width="95%" height={14} borderRadius={4} />
        <View style={styles.spacer4} />
        <ShimmerOverlay width="60%" height={12} borderRadius={4} />
        <View style={styles.spacer8} />
        <View style={styles.episodeMetaSkeleton}>
          <ShimmerOverlay width={35} height={10} borderRadius={4} />
          <ShimmerOverlay width={45} height={10} borderRadius={4} />
        </View>
      </View>
    </View>
  );

  const ChartItemSkeleton = () => (
    <View style={styles.chartItemSkeleton}>
      <View style={styles.chartRankSkeleton}>
        <ShimmerOverlay width={24} height={24} borderRadius={12} />
      </View>
      <View style={styles.chartImageSkeleton}>
        <ShimmerOverlay width={48} height={48} borderRadius={8} />
      </View>
      <View style={styles.chartContentSkeleton}>
        <ShimmerOverlay width="80%" height={16} borderRadius={4} />
        <View style={styles.spacer4} />
        <ShimmerOverlay width="60%" height={14} borderRadius={4} />
        <View style={styles.spacer4} />
        <View style={styles.chartMetaSkeleton}>
          <ShimmerOverlay width={50} height={12} borderRadius={4} />
          <ShimmerOverlay width={40} height={12} borderRadius={4} />
        </View>
      </View>
      <View style={styles.chartActionsSkeleton}>
        <ShimmerOverlay width={16} height={16} borderRadius={8} />
        <View style={styles.spacer4} />
        <ShimmerOverlay width={16} height={16} borderRadius={8} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.transparent}
        translucent
      />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section Skeleton */}
          <HeroSkeleton />

          {/* Featured Shows Section */}
          <View style={styles.sectionSkeleton}>
            <SectionHeaderSkeleton />
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
            >
              <View style={styles.horizontalContainer}>
                {[1, 2, 3].map((item) => (
                  <FeaturedShowSkeleton key={item} />
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Trending Episodes Section */}
          <View style={styles.sectionSkeleton}>
            <SectionHeaderSkeleton />
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
            >
              <View style={styles.horizontalContainer}>
                {[1, 2, 3, 4].map((item) => (
                  <EpisodeCardSkeleton key={item} />
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Fresh Episodes Section */}
          <View style={styles.sectionSkeleton}>
            <SectionHeaderSkeleton />
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
            >
              <View style={styles.horizontalContainer}>
                {[1, 2, 3, 4].map((item) => (
                  <EpisodeCardSkeleton key={`fresh-${item}`} />
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Top Charts Section */}
          <View style={styles.sectionSkeleton}>
            <SectionHeaderSkeleton />
            <View style={styles.chartsContainer}>
              {[1, 2, 3, 4, 5, 6].map((item, index) => (
                <View key={item}>
                  <ChartItemSkeleton />
                  {index < 5 && <View style={styles.chartSeparator} />}
                </View>
              ))}
            </View>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  shimmerContainer: {
    overflow: 'hidden',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shimmerGradient: {
    flex: 1,
    width: SCREEN_WIDTH * 0.5,
  },
  
  // Hero Section
  heroSkeleton: {
    marginHorizontal: 20,
    marginTop: 60,
    marginBottom: 32,
    position: 'relative',
  },
  heroContentSkeleton: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
  },
  heroActionsSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Section Headers
  sectionHeaderSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Sections
  sectionSkeleton: {
    marginBottom: 32,
  },
  horizontalScroll: {
    paddingLeft: 20,
  },
  horizontalContainer: {
    flexDirection: 'row',
    paddingRight: 20,
  },

  // Featured Shows
  featuredCardSkeleton: {
    width: 200,
    marginRight: 16,
  },
  featuredImageSkeleton: {
    position: 'relative',
  },
  featuredPlayButtonSkeleton: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  featuredBadgeSkeleton: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  featuredContentSkeleton: {
    flex: 1,
  },
  featuredMetaSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  // Episode Cards
  episodeCardSkeleton: {
    width: 160,
    marginRight: 12,
  },
  episodeImageSkeleton: {
    position: 'relative',
  },
  episodePlayButtonSkeleton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  episodeContentSkeleton: {
    flex: 1,
  },
  episodeMetaSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  // Chart Items
  chartItemSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  chartRankSkeleton: {
    marginRight: 16,
  },
  chartImageSkeleton: {
    marginRight: 12,
  },
  chartContentSkeleton: {
    flex: 1,
  },
  chartMetaSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartActionsSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartsContainer: {
    backgroundColor: colors.card,
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  chartSeparator: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 20,
  },

  // Spacing
  spacer4: { height: 4 },
  spacer8: { height: 8 },
  spacer12: { height: 12 },
  spacer16: { height: 16 },
  bottomSpacing: { height: 100 },
});

export default SkeletonPreloader;