import React, { createContext, useContext } from 'react';
import useAudioPlayer from '../hooks/useAudioPlayer';

const AudioPlayerContext = createContext(null);

export const AudioPlayerProvider = ({ children }) => {
  const audioPlayer = useAudioPlayer({
    autoPlay: false,
    defaultVolume: 0.5,
    persistPosition: true
  });

  return (
    <AudioPlayerContext.Provider value={audioPlayer}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useGlobalAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useGlobalAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
};