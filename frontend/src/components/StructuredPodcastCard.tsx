import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../type';

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
});

export default StructuredPodcastCard;
