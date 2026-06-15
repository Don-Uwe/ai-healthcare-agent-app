import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PlaybackPosition {
  position: number;
  duration: number;
}

const PODCAST_PROGRESS_KEY = '@podcast_positions';

// Get the full position map
export const getAllPlaybackPositions = async (): Promise<Record<string, PlaybackPosition>> => {
  try {
    const data = await AsyncStorage.getItem(PODCAST_PROGRESS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error getting podcast positions:', error);
  }
  return {};
};

// Get the position for a specific track
export const getPlaybackPosition = async (trackId: string): Promise<PlaybackPosition | null> => {
  try {
    const positions = await getAllPlaybackPositions();
    return positions[trackId] || null;
  } catch (error) {
    console.error('Error getting playback position for track', trackId, error);
    return null;
  }
};

// Save position for a specific track
export const savePlaybackPosition = async (trackId: string, position: number, duration: number) => {
  try {
    // If the episode is almost complete (>95%), clear the position instead
    if (duration > 0 && position / duration > 0.95) {
      await clearPlaybackPosition(trackId);
      return;
    }

    // Only save if we actually made some progress (>2 seconds)
    if (position > 2) {
      const positions = await getAllPlaybackPositions();
      positions[trackId] = { position, duration };
      await AsyncStorage.setItem(PODCAST_PROGRESS_KEY, JSON.stringify(positions));
    }
  } catch (error) {
    console.error('Error saving playback position for track', trackId, error);
  }
};

// Clear the position for a specific track
export const clearPlaybackPosition = async (trackId: string) => {
  try {
    const positions = await getAllPlaybackPositions();
    if (positions[trackId]) {
      delete positions[trackId];
      await AsyncStorage.setItem(PODCAST_PROGRESS_KEY, JSON.stringify(positions));
    }
  } catch (error) {
    console.error('Error clearing playback position for track', trackId, error);
  }
};
