import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, Image, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import useGreeting from '../../hooks/useGreeting';
import { BlurView } from 'expo-blur';

// Mock data for podcasts
const recommendedPodcasts = [
  {
    id: '1',
    title: 'Why start a business now',
    host: 'Design for Business with Stefan & Milos',
    image: require('../../assets/splash-icon.png'),
    color: '#c3c75a',
    duration: '11m',
  },
  {
    id: '2',
    title: 'You Need to Learn',
    host: 'with Michelle Obama',
    image: require('../../assets/splash-icon.png'),
    color: '#f7941d',
    duration: '11m',
  },
];

const topShows = [
  {
    id: '1',
    title: 'Konnected Minds',
    host: 'Derrick Abaitey',
    image: require('../../assets/splash-icon.png'),
  },
  {
    id: '2',
    title: 'The Sound of Accra',
    host: 'Adrain Daniels',
    image: require('../../assets/splash-icon.png'),
  },
];

const selfImprovement = [
  {
    id: '1',
    title: 'The Daily Motivation',
    host: 'Lewis Howes',
    image: require('../../assets/splash-icon.png'),
  },
  {
    id: '2',
    title: 'Self Care Club',
    host: 'Lauren Mishcon',
    image: require('../../assets/splash-icon.png'),
  },
];

export default function HomeScreen() {
  const { greeting } = useGreeting('');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
        {/* Header */}
        <BlurView intensity={70} tint='light' style={styles.header}>
          <View>
              <Text style={styles.heading}>{greeting}</Text>
          </View>
          <TouchableOpacity>
            <Image 
              source={require('../../assets/splash-icon.png')} 
              style={styles.avatar} 
            />
          </TouchableOpacity>
        </BlurView>

        <ScrollView showsVerticalScrollIndicator={false}>
        {/* Recommended For You Section */}
        <Text style={styles.sectionTitle}>Recommended For You</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recommendedScrollView}>
          {recommendedPodcasts.map((podcast) => (
            <View key={podcast.id} style={[styles.recommendedCard, { backgroundColor: podcast.color }]}>
              <Image source={podcast.image} style={styles.recommendedImage} />
              <View style={styles.recommendedContent}>
                <Text style={styles.recommendedTitle}>{podcast.title}</Text>
                <Text style={styles.recommendedHost}>{podcast.host}</Text>
                <View style={styles.playContainer}>
                  <View style={styles.playButton}>
                    <Ionicons name="play" size={18} color="#000" />
                    <Text style={styles.duration}>{podcast.duration}</Text>
                  </View>
                  <TouchableOpacity>
                    <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Top Shows Section */}
        <Text style={styles.sectionTitle}>Top Shows</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.topShowsScrollView}>
          {topShows.map((show) => (
            <View key={show.id} style={styles.showCard}>
              <Image source={show.image} style={styles.showImage} />
              <Text style={styles.showTitle} numberOfLines={1}>{show.title}</Text>
              <Text style={styles.showHost} numberOfLines={1}>{show.host}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Self-Improvement Section */}
        <Text style={styles.sectionTitle}>Self-Improvement</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selfImprovementScrollView}>
          {selfImprovement.map((show) => (
            <View key={show.id} style={styles.showCard}>
              <Image source={show.image} style={styles.showImage} />
              <Text style={styles.showTitle} numberOfLines={1}>{show.title}</Text>
              <Text style={styles.showHost} numberOfLines={1}>{show.host}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Bottom spacing */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  recommendedScrollView: {
    paddingLeft: 16,
  },
  recommendedCard: {
    width: 300,
    height: 200,
    borderRadius: 12,
    marginRight: 16,
    overflow: 'hidden',
  },
  recommendedImage: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginTop: 12,
    borderRadius: 8,
  },
  recommendedContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  recommendedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  recommendedHost: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  playContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  duration: {
    marginLeft: 4,
    fontWeight: '500',
  },
  topShowsScrollView: {
    paddingLeft: 16,
  },
  showCard: {
    width: 150,
    marginRight: 16,
  },
  showImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  showTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  showHost: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  selfImprovementScrollView: {
    paddingLeft: 16,
  },
  bottomPadding: {
    height: 50,
  },
});