import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { NavigationProp, useNavigation, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../type';
import { getPlaybackPosition, PlaybackPosition } from '../helper/PlaybackManager';

interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  topic: string;
}

interface StructuredPodcastCardProps {
  relatedEpisodes: PodcastEpisode[];
}

const StructuredPodcastCard: React.FC<StructuredPodcastCardProps> = ({
  relatedEpisodes,
}: StructuredPodcastCardProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const cardBg = isDark ? '#1A2A1A' : '#F0FAF0';
  const textColor = isDark ? '#E0E0E0' : '#1A1A2E';
  const accentColor = '#2DC653';
  const borderColor = isDark ? '#2A402A' : '#A8DDB5';
  const episodeBg = isDark ? '#253525' : '#FFFFFF';

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [progresses, setProgresses] = React.useState<Record<string, PlaybackPosition>>({});

  useFocusEffect(
    React.useCallback(() => {
      let isMounted = true;
      const fetchProgresses = async () => {
        if (!relatedEpisodes) return;
        const results: Record<string, PlaybackPosition> = {};
        for (const ep of relatedEpisodes) {
          const pos = await getPlaybackPosition(ep.id);
          if (pos) {
            results[ep.id] = pos;
          }
        }
        if (isMounted) {
          setProgresses(results);
        }
      };
      fetchProgresses();
      return () => {
        isMounted = false;
      };
    }, [relatedEpisodes])
  );

  if (!relatedEpisodes || relatedEpisodes.length === 0) return null;

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}> 
      <Text style={[styles.headerTitle, { color: accentColor }]}>🎙️ Related Podcast Episodes</Text>
      <Text style={[styles.subtitle, { color: textColor }]}>Deepen your understanding with expert audio</Text>

      {relatedEpisodes.map((episode: PodcastEpisode) => (
        <TouchableOpacity
          key={episode.id}
          style={[styles.episodeRow, { backgroundColor: episodeBg }]}
          onPress={() =>
            navigation.navigate('PodcastDetail', { trackId: episode.id })
          }
          accessibilityRole="button"
          accessibilityLabel={`Listen to ${episode.title}`}
        >
          <View style={styles.episodeIcon}>
            <Text style={{ fontSize: 20 }}>▶️</Text>
          </View>
          <View style={styles.episodeInfo}>
            <Text style={[styles.episodeTitle, { color: textColor }]}>{episode.title}</Text>
            <Text style={[styles.episodeDesc, { color: textColor, opacity: 0.7 }]}>
              {episode.description}
            </Text>
            <Text style={[styles.episodeMeta, { color: accentColor }]}>🕐 {episode.durationMinutes} min · {episode.topic}</Text>
            {progresses[episode.id] && progresses[episode.id].duration > 0 && (
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${(progresses[episode.id].position / progresses[episode.id].duration) * 100}%`, backgroundColor: accentColor }]} />
              </View>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginVertical: 12,
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 12,
    opacity: 0.8,
  },
  episodeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    elevation: 1,
  },
  episodeIcon: {
    marginRight: 12,
    paddingTop: 2,
  },
  episodeInfo: {
    flex: 1,
  },
  episodeTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 3,
  },
  episodeDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 4,
  },
  episodeMeta: {
    fontSize: 11,
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
    borderRadius: 2,
    marginTop: 8,
    width: '100%',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
});

export default StructuredPodcastCard;
