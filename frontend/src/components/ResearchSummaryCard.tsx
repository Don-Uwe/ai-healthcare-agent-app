import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { ArticleSummary } from '../services/SummaryService';

interface Props {
  summary: ArticleSummary | null;
  loading: boolean;
}

const ResearchSummaryCard: React.FC<Props> = ({ summary, loading }) => {
  const [expanded, setExpanded] = useState(false);
  const isDark = useColorScheme() === 'dark';

  const cardBg = isDark ? '#1E2A38' : '#EAF4FB';
  const border = isDark ? '#2E4057' : '#B0D4F1';
  const textColor = isDark ? '#E0E0E0' : '#1A1A2E';
  const accent = '#3A86FF';
  const mutedText = isDark ? '#888888' : '#999999';

  // Show spinner while API is loading
  if (loading) {
    return (
      <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
        <Text style={[styles.headerTitle, { color: accent }]}>
          📋 Generating AI Summary...
        </Text>
        <ActivityIndicator color={accent} size="small" style={{ marginTop: 10 }} />
        <Text style={[styles.loadingNote, { color: mutedText }]}>
          This may take a few seconds
        </Text>
      </View>
    );
  }

  // Show nothing if summary failed or not available
  if (!summary) return null;

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
      {/* Header row (tap to expand/collapse) */}
      <TouchableOpacity
        onPress={() => setExpanded(prev => !prev)}
        style={styles.header}
        accessibilityRole="button"
        accessibilityLabel="Toggle AI research summary"
        activeOpacity={0.7}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: accent }]}>
            📋 Research Summary
          </Text>
          <Text style={[styles.aiTag, { color: mutedText }]}>
            ✨ AI-generated  ·  Not medical advice
          </Text>
        </View>
        <Text style={{ color: accent, fontSize: 16, marginLeft: 8 }}>
          {expanded ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>

      {/* Simplified explanation — always visible */}
      <Text style={[styles.bodyText, { color: textColor }]}>
        {summary.simplifiedExplanation}
      </Text>

      {/* Expandable section */}
      {expanded && (
        <View>
          {/* Key Findings */}
          <Text style={[styles.sectionTitle, { color: accent }]}>
            🔬 Key Findings
          </Text>
          {summary.keyFindings.map((item, i) => (
            <Text key={i} style={[styles.bullet, { color: textColor }]}>
              • {item}
            </Text>
          ))}

          {/* Beginner Takeaways */}
          <Text style={[styles.sectionTitle, { color: accent }]}>
            💡 Beginner Takeaways
          </Text>
          {summary.beginnerTakeaways.map((item, i) => (
            <Text key={i} style={[styles.bullet, { color: textColor }]}>
              ✓ {item}
            </Text>
          ))}

          {/* Why It Matters */}
          <Text style={[styles.sectionTitle, { color: accent }]}>
            ❤️ Why This Matters
          </Text>
          <Text style={[styles.bodyText, { color: textColor }]}>
            {summary.whyItMatters}
          </Text>
        </View>
      )}
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  aiTag: {
    fontSize: 10,
    marginTop: 3,
    fontStyle: 'italic',
  },
  loadingNote: {
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 6,
  },
  bullet: {
    fontSize: 13,
    lineHeight: 20,
    paddingLeft: 8,
    marginBottom: 4,
  },
});

export default ResearchSummaryCard;
