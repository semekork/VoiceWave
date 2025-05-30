import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Image,
  ScrollView,
  Animated
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useGlobalAudioPlayer } from '../../context/AudioPlayerContext';
import { categories,featuredShows, topCharts } from '../../data/podcastData';

const SCREEN_WIDTH = Dimensions.get('window').width;



export default function BrowseScreen({ navigation }) {
  const scrollY = useRef(new Animated.Value(0)).current;
  const { addToQueue, currentPodcast } = useGlobalAudioPlayer();

  // Animated header opacity
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const handleCategoryPress = (category) => {
    navigation.navigate('CategoryScreen', { category });
  };

  const handleShowPress = (show) => {
    navigation.navigate('PodcastDetailScreen', { podcast: show });
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity 
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(item)}
      activeOpacity={0.8}
    >
      <Image source={item.image} style={styles.categoryImage} />
      <LinearGradient
        colors={[...item.gradient, 'rgba(0,0,0,0.3)']}
        style={styles.categoryOverlay}
      >
        <Text style={styles.categoryTitle}>{item.title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderFeaturedShow = ({ item }) => (
    <TouchableOpacity 
      style={styles.featuredCard}
      onPress={() => handleShowPress(item)}
      activeOpacity={0.8}
    >
      <Image source={item.image} style={styles.featuredImage} />
      <View style={styles.featuredContent}>
        {item.badge && (
          <View style={[styles.badge, item.badge === 'EXCLUSIVE' && styles.exclusiveBadge]}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}
        {item.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW EPISODES</Text>
          </View>
        )}
        <Text style={styles.featuredTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.featuredSubtitle} numberOfLines={1}>{item.subtitle}</Text>
        <Text style={styles.featuredDescription} numberOfLines={3}>{item.description}</Text>
        <Text style={styles.featuredCategory}>{item.category}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderTopChart = ({ item }) => (
    <TouchableOpacity 
      style={styles.chartItem}
      onPress={() => handleShowPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.chartRank}>
        <Text style={styles.chartRankText}>{item.rank}</Text>
      </View>
      <Image source={item.image} style={styles.chartImage} />
      <View style={styles.chartContent}>
        <Text style={styles.chartTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.chartSubtitle} numberOfLines={1}>{item.subtitle}</Text>
        <Text style={styles.chartCategory}>{item.category}</Text>
      </View>
      <TouchableOpacity style={styles.moreButton} activeOpacity={0.6}>
        <Ionicons name="ellipsis-horizontal" size={20} color="#8E8E93" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Animated Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <BlurView intensity={100} style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Browse</Text>
          </View>
        </BlurView>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Main Header */}
        <View style={styles.mainHeader}>
          <Text style={styles.mainTitle}>Browse</Text>
        </View>

        {/* Featured Shows */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Shows</Text>
          <FlatList
            data={featuredShows}
            renderItem={renderFeaturedShow}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
            snapToInterval={SCREEN_WIDTH - 80}
            decelerationRate="fast"
          />
        </View>

        {/* Top Shows */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Shows</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {topCharts.map((item) => (
            <View key={item.id}>
              {renderTopChart({ item })}
            </View>
          ))}
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse by Category</Text>
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.categoriesGrid}
            columnWrapperStyle={styles.categoriesRow}
          />
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    height: 88,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  headerBlur: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 12,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  mainHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  mainTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.5,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000000',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '400',
  },
  featuredList: {
    paddingHorizontal: 20,
  },
  featuredCard: {
    width: SCREEN_WIDTH - 80,
    marginRight: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featuredImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    resizeMode: 'cover',
  },
  featuredContent: {
    padding: 16,
  },
  badge: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  exclusiveBadge: {
    backgroundColor: '#5856D6',
  },
  badgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  newBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  newBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
    lineHeight: 24,
  },
  featuredSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 8,
    fontWeight: '400',
  },
  featuredDescription: {
    fontSize: 14,
    color: '#3C3C43',
    lineHeight: 20,
    marginBottom: 8,
  },
  featuredCategory: {
    fontSize: 12,
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  chartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  chartRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chartRankText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  chartImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 12,
  },
  chartContent: {
    flex: 1,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 2,
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  chartCategory: {
    fontSize: 12,
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  moreButton: {
    padding: 8,
  },
  categoriesGrid: {
    paddingHorizontal: 20,
  },
  categoriesRow: {
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bottomSpacing: {
    height: 100,
  },
});