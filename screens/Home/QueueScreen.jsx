import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { useGlobalAudioPlayer } from '../../context/AudioPlayerContext';

export default function QueueScreen({ navigation }) {
  const {
    queue,
    queueIndex,
    isQueueLooping,
    isShuffle,
    toggleShuffle,
    toggleQueueLooping,
    removeFromQueue,
    setQueueAndPlay,
    clearQueue,
    isPlaying,
    playPause,
    currentPodcast,
    formatTime,
    duration,
    position
  } = useGlobalAudioPlayer();

  const [reorderedQueue, setReorderedQueue] = useState([]);
  const [progressBarWidth, setProgressBarWidth] = useState(new Animated.Value(0));

  // Update local state when queue changes
  useEffect(() => {
    setReorderedQueue([...queue]);
  }, [queue]);

  // Animate the progress bar
  useEffect(() => {
    if (duration > 0) {
      const progress = position / duration;
      Animated.timing(progressBarWidth, {
        toValue: progress,
        duration: 100,
        useNativeDriver: false,
      }).start();
    }
  }, [position, duration]);

  const handleDragEnd = ({ data }) => {
    setReorderedQueue(data);
    // Update the actual queue with the new order
    // and maintain the currently playing item
    const currentItemId = queue[queueIndex]?.id;
    const newIndex = data.findIndex(item => item.id === currentItemId);
    
    setQueueAndPlay(data, newIndex >= 0 ? newIndex : 0);
  };

  const handleRemoveItem = (index) => {
    Alert.alert(
      "Remove Item",
      "Are you sure you want to remove this podcast from the queue?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive",
          onPress: () => removeFromQueue(index)
        }
      ]
    );
  };

  const handlePlayItem = (index) => {
    if (index === queueIndex && isPlaying) {
      playPause(); // Pause if already playing this item
    } else {
      setQueueAndPlay(queue, index); // Start playing the selected item
    }
  };

  const handleClearQueue = () => {
    Alert.alert(
      "Clear Queue",
      "Are you sure you want to clear the entire queue?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear", 
          style: "destructive",
          onPress: () => clearQueue()
        }
      ]
    );
  };

  const renderQueueItem = ({ item, index, drag, isActive }) => {
    const isCurrentlyPlaying = index === queueIndex;
    
    return (
      <TouchableOpacity
        style={[
          styles.queueItem,
          isActive && styles.activeItem,
          isCurrentlyPlaying && styles.currentlyPlayingItem
        ]}
        onLongPress={drag}
        onPress={() => handlePlayItem(index)}
        activeOpacity={0.7}
      >
        <View style={styles.dragHandle}>
          <Feather name="menu" size={20} color="#888" />
        </View>
        
        <Image source={item.podcastImage} style={styles.queueItemImage} />
        
        <View style={styles.queueItemInfo}>
          <Text style={styles.queueItemTitle} numberOfLines={1}>
            {item.podcastTitle}
          </Text>
          <Text style={styles.queueItemSubtitle} numberOfLines={1}>
            {item.podcastSubtitle}
          </Text>
          
          {isCurrentlyPlaying && (
            <View style={styles.progressBarContainer}>
              <Animated.View 
                style={[
                  styles.progressBar,
                  { width: progressBarWidth.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  })}
                ]}
              />
            </View>
          )}
        </View>
        
        {isCurrentlyPlaying ? (
          <TouchableOpacity 
            style={styles.playingIndicator}
            onPress={() => playPause()}
          >
            <Ionicons 
              name={isPlaying ? "pause-circle" : "play-circle"} 
              size={32} 
              color="#D32F2F" 
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.itemIndex}>
            <Text style={styles.itemIndexText}>{index + 1}</Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => handleRemoveItem(index)}
        >
          <Ionicons name="close-circle" size={22} color="#888" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Queue</Text>
        <TouchableOpacity 
          style={styles.clearButton} 
          onPress={handleClearQueue}
          disabled={queue.length === 0}
        >
          <Text style={[styles.clearButtonText, queue.length === 0 && styles.disabledText]}>
            Clear
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.queueControls}>
        <TouchableOpacity 
          style={[styles.queueControlButton, isShuffle && styles.activeControlButton]} 
          onPress={toggleShuffle}
        >
          <Ionicons 
            name="shuffle" 
            size={22} 
            color={isShuffle ? "#D32F2F" : "#000"} 
          />
          <Text style={[styles.controlText, isShuffle && styles.activeControlText]}>Shuffle</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.queueControlButton, isQueueLooping && styles.activeControlButton]} 
          onPress={toggleQueueLooping}
        >
          <Ionicons 
            name="repeat" 
            size={22} 
            color={isQueueLooping ? "#D32F2F" : "#000"} 
          />
          <Text style={[styles.controlText, isQueueLooping && styles.activeControlText]}>Loop</Text>
        </TouchableOpacity>
      </View>

      {queue.length > 0 ? (
        <View style={styles.queueContainer}>
          <Text style={styles.queueInfoText}>
            {queue.length} {queue.length === 1 ? 'podcast' : 'podcasts'} in queue • Drag to reorder
          </Text>
          
          <DraggableFlatList
            data={reorderedQueue}
            renderItem={renderQueueItem}
            keyExtractor={(item, index) => `queue-item-${item.id || index}`}
            onDragEnd={handleDragEnd}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        </View>
      ) : (
        <View style={styles.emptyQueueContainer}>
          <Ionicons name="list" size={60} color="#DDD" />
          <Text style={styles.emptyQueueText}>Your queue is empty</Text>
          <Text style={styles.emptyQueueSubtext}>
            Add podcasts to your queue to listen to them in sequence
          </Text>
          <TouchableOpacity 
            style={styles.browseButton}
            onPress={() => navigation.navigate("BrowseScreen")}
          >
            <Text style={styles.browseButtonText}>Browse Podcasts</Text>
          </TouchableOpacity>
        </View>
      )}

      {currentPodcast && (
        <TouchableOpacity 
          style={styles.nowPlayingBar}
          onPress={() => navigation.navigate("PlayerScreen", currentPodcast)}
        >
          <View style={styles.nowPlayingInfo}>
            <Image source={currentPodcast.podcastImage} style={styles.nowPlayingImage} />
            <View style={styles.nowPlayingTextContainer}>
              <Text style={styles.nowPlayingTitle} numberOfLines={1}>
                {currentPodcast.podcastTitle}
              </Text>
              <Text style={styles.nowPlayingSubtitle} numberOfLines={1}>
                {currentPodcast.podcastSubtitle}
              </Text>
            </View>
          </View>
          
          <View style={styles.nowPlayingControls}>
            <TouchableOpacity 
              style={styles.miniControlButton} 
              onPress={() => navigation.navigate("PlayerScreen", currentPodcast)}
            >
              <Ionicons name="arrow-up" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.playPauseButton} onPress={playPause}>
              <Ionicons name={isPlaying ? "pause" : "play"} size={32} color="#000" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    color: '#D32F2F',
    fontWeight: '600',
  },
  disabledText: {
    color: '#BBBBBB',
  },
  queueControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  queueControlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeControlButton: {
    backgroundColor: '#F8E7E7',
  },
  controlText: {
    marginLeft: 6,
    fontWeight: '500',
  },
  activeControlText: {
    color: '#D32F2F',
  },
  queueContainer: {
    flex: 1,
  },
  queueInfoText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    paddingVertical: 10,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  activeItem: {
    shadowOpacity: 0.2,
    elevation: 4,
    transform: [{ scale: 1.02 }],
  },
  currentlyPlayingItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#D32F2F',
  },
  dragHandle: {
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  queueItemImage: {
    width: 45,
    height: 45,
    borderRadius: 8,
    marginRight: 12,
  },
  queueItemInfo: {
    flex: 1,
  },
  queueItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  queueItemSubtitle: {
    fontSize: 13,
    color: '#888',
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: '#EEEEEE',
    marginTop: 6,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#D32F2F',
  },
  playingIndicator: {
    marginRight: 10,
    padding: 4,
  },
  itemIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EEEEEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  itemIndexText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  removeButton: {
    padding: 8,
  },
  emptyQueueContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyQueueText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyQueueSubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#D32F2F',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 10,
  },
  browseButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  nowPlayingBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: -2 },
    elevation: 5,
  },
  nowPlayingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  nowPlayingImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  nowPlayingTextContainer: {
    flex: 1,
  },
  nowPlayingTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  nowPlayingSubtitle: {
    fontSize: 13,
    color: '#888',
  },
  nowPlayingControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniControlButton: {
    padding: 8,
    marginRight: 12,
  },
  playPauseButton: {
    padding: 4,
  },
});