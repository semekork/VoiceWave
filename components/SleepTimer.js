import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  StyleSheet 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SleepTimer = ({ onPauseAudio }) => {
  // Sleep Timer State
  const [sleepTimerDuration, setSleepTimerDuration] = useState(0);
  const [isSleepTimerModalVisible, setIsSleepTimerModalVisible] = useState(false);
  const sleepTimerInterval = useRef(null);
  const [remainingSleepTime, setRemainingSleepTime] = useState(0);

  // Effect to manage timer cleanup
  useEffect(() => {
    return () => {
      if (sleepTimerInterval.current) {
        clearInterval(sleepTimerInterval.current);
      }
    };
  }, []);

  // Sleep Timer Handlers
  const startSleepTimer = (minutes) => {
    // Clear any existing timer
    if (sleepTimerInterval.current) {
      clearInterval(sleepTimerInterval.current);
    }

    // Convert minutes to seconds
    const totalSeconds = minutes * 60;
    setSleepTimerDuration(minutes);
    setRemainingSleepTime(totalSeconds);

    // Start the countdown
    sleepTimerInterval.current = setInterval(() => {
      setRemainingSleepTime((prevTime) => {
        if (prevTime <= 1) {
          // Timer expired, pause the audio
          if (sleepTimerInterval.current) {
            clearInterval(sleepTimerInterval.current);
          }
          onPauseAudio(); // Pause the audio using the provided callback
          setSleepTimerDuration(0);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // Close the modal
    setIsSleepTimerModalVisible(false);
  };

  const cancelSleepTimer = () => {
    if (sleepTimerInterval.current) {
      clearInterval(sleepTimerInterval.current);
    }
    setSleepTimerDuration(0);
    setRemainingSleepTime(0);
  };

  // Format remaining time for display
  const formatRemainingTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Render sleep timer button
  const renderSleepTimerButton = () => (
    <TouchableOpacity 
      style={styles.speedButton} 
      onPress={() => setIsSleepTimerModalVisible(true)}
    >
      <Ionicons 
        name="moon-outline" 
        size={24} 
        color={sleepTimerDuration > 0 ? '#D32F2F' : '#000'} 
      />
    </TouchableOpacity>
  );

  // Sleep Timer Modal Component
  const renderSleepTimerModal = () => (
    <Modal
      transparent={true}
      visible={isSleepTimerModalVisible}
      animationType="slide"
      onRequestClose={() => setIsSleepTimerModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Set Sleep Timer</Text>
          <View style={styles.sleepTimerOptions}>
            {[15, 30, 45, 60].map((minutes) => (
              <TouchableOpacity
                key={minutes}
                style={styles.sleepTimerButton}
                onPress={() => startSleepTimer(minutes)}
              >
                <Text style={styles.sleepTimerButtonText}>{minutes} Minutes</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setIsSleepTimerModalVisible(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Sleep Timer Display
  const renderSleepTimerDisplay = () => {
    if (sleepTimerDuration === 0) return null;

    return (
      <View style={styles.sleepTimerDisplay}>
        <Ionicons name="moon-outline" size={20} color="#666" />
        <Text style={styles.sleepTimerText}>
          Sleep Timer: {formatRemainingTime(remainingSleepTime)}
        </Text>
        <TouchableOpacity onPress={cancelSleepTimer}>
          <Text style={styles.cancelSleepTimerText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return {
    sleepTimerButton: renderSleepTimerButton(),
    sleepTimerModal: renderSleepTimerModal(),
    sleepTimerDisplay: renderSleepTimerDisplay(),
    startSleepTimer,
    cancelSleepTimer,
    sleepTimerDuration,
    remainingSleepTime
  };
};

const styles = StyleSheet.create({
  speedButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sleepTimerDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#F0F0F0',
  },
  sleepTimerText: {
    marginHorizontal: 10,
    fontSize: 16,
    color: '#666',
  },
  cancelSleepTimerText: {
    color: '#D32F2F',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sleepTimerOptions: {
    width: '100%',
  },
  sleepTimerButton: {
    backgroundColor: '#F0F0F0',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    alignItems: 'center',
  },
  sleepTimerButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButton: {
    marginTop: 15,
    padding: 10,
  },
  cancelButtonText: {
    color: '#D32F2F',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SleepTimer;