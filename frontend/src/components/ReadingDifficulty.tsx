import React from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import { fp } from '../helper/Metric';

export type ReadingDifficultyType = 'Beginner' | 'Intermediate' | 'Advanced';

// Reusable difficulty retriever using deterministic readability heuristic (Automated Readability Index)
export const getArticleDifficulty = (item?: any): ReadingDifficultyType | null => {
  if (!item) return null;
  
  if (typeof item.difficulty === 'string') {
    const val = item.difficulty.trim();
    const normalized = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
    if (normalized === 'Beginner' || normalized === 'Intermediate' || normalized === 'Advanced') {
      return normalized as ReadingDifficultyType;
    }
  }

  // Derive difficulty from actual article content/body
  const textContent = item.content || item.body || '';
  if (!textContent) return null;

  // Clean HTML tags and collapse whitespace
  const cleanText = textContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  
  // Require at least 100 characters to form a valid readability estimation
  if (cleanText.length < 100) {
    return null;
  }

  const sentences = cleanText.split(/[.!?]+/).filter((s: string) => s.trim().length > 0);
  const words = cleanText.split(/\s+/).filter((w: string) => w.trim().length > 0);
  const characters = cleanText.replace(/[^a-zA-Z0-9]/g, '');

  if (sentences.length === 0 || words.length === 0) {
    return null;
  }

  const avgWordLength = characters.length / words.length;
  const avgSentenceLength = words.length / sentences.length;

  // Automated Readability Index (ARI) score formula
  const score = 4.71 * avgWordLength + 0.5 * avgSentenceLength - 21.43;

  if (score <= 8) {
    return 'Beginner';
  } else if (score <= 13) {
    return 'Intermediate';
  } else {
    return 'Advanced';
  }
};

interface ReadingDifficultyProps {
  difficulty?: ReadingDifficultyType | string | null;
}

export const ReadingDifficulty: React.FC<ReadingDifficultyProps> = ({ difficulty }) => {
  const isDark = useColorScheme() === 'dark';

  if (typeof difficulty !== 'string') {
    return null;
  }

  const trimmed = difficulty.trim();
  if (!trimmed) {
    return null;
  }

  const normalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  
  if (normalized !== 'Beginner' && normalized !== 'Intermediate' && normalized !== 'Advanced') {
    return null;
  }

  let emoji = '🟢';
  let color = '#2E7D32'; // Green
  let bgLight = '#E8F5E9';
  let bgDark = '#1B5E20';

  if (normalized === 'Intermediate') {
    emoji = '🟠';
    color = '#EF6C00'; // Orange
    bgLight = '#FFF3E0';
    bgDark = '#E65100';
  } else if (normalized === 'Advanced') {
    emoji = '🔴';
    color = '#C62828'; // Red
    bgLight = '#FFEBEE';
    bgDark = '#B71C1C';
  }

  const bgColor = isDark ? bgDark : bgLight;
  const textColor = isDark ? '#FFFFFF' : color;
  const borderColor = isDark ? color : 'transparent';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bgColor,
          borderColor: borderColor,
          borderWidth: isDark ? 1 : 0,
        },
      ]}
      accessibilityRole="text"
      accessibilityLabel={`Reading difficulty: ${normalized}`}
    >
      <Text style={[styles.text, { color: textColor }]}>
        {emoji} {normalized}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginVertical: 4,
  },
  text: {
    fontSize: fp(3.4),
    fontWeight: '600',
  },
});

export default ReadingDifficulty;
