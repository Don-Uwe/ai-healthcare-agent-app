import React, { useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { RenderSuggestionProp } from '../../type';
import { useDispatch } from 'react-redux';
import { setSuggestionAccepted } from '../../store/dataSlice';
import AutoHeightWebView from '@brown-bear/react-native-autoheight-webview';
// ✅ Re-introduced original project helpers for security sanitization and link safety
import { createHTMLStructure, handleExternalClick } from '../../helper/Utils';

export default function RenderSuggestion({
  navigation,
  route,
}: RenderSuggestionProp) {
  const { htmlContent, readability_score, reading_time } = route.params;
  const dispatch = useDispatch();

  const handleAccept = () => {
    dispatch(setSuggestionAccepted({ selection: true }));
    navigation.goBack();
  };

  const handleCancel = () => {
    dispatch(setSuggestionAccepted({ selection: false }));
    navigation.goBack();
  };

  // ✅ Wraps the content through the project's sanitization utility to prevent XSS flaws
  const formattedHtml = createHTMLStructure('', htmlContent || '<p>No suggestions available.</p>', [], '', '');

  return (
    <View style={styles.container}>
      {/* 📊 Display Readability Metrics */}
      <View style={styles.metricsContainer}>
        <Text style={styles.scoreTitle}>Readability Score</Text>
        <Text style={[
          styles.scoreNumber,
          { color: readability_score >= 60 ? '#059669' : '#dc2626' }
        ]}>
          {readability_score ?? '--'}/100
        </Text>
        <Text style={styles.readingTime}>⏱ {reading_time ?? 'Calculating...'}</Text>
      </View>

      {/* 🌐 Render Highlighted Complex Sentences Safely */}
      <AutoHeightWebView
        style={styles.webView}
        customStyle={`
          * { font-family: -apple-system, Roboto, sans-serif; font-size: 16px; line-height: 1.5; color: #1e293b; }
          .complex-sentence { background-color: #fef08a; padding: 2px; border-radius: 4px; border-bottom: 2px solid #ca8a04; }
        `}
        source={{ html: formattedHtml }}
        scalesPageToFit={false}
        viewportContent={'width=device-width, user-scalable=no'}
        // ✅ Re-added link interceptor so external links safely launch default system browser
        onShouldStartLoadWithRequest={handleExternalClick}
      />

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelText}>Dismiss</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
          <Text style={styles.acceptText}>Apply Suggestions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', padding: 16 },
  metricsContainer: { 
    padding: 16, 
    backgroundColor: '#f8fafc', 
    borderRadius: 12, 
    marginBottom: 16,
    alignItems: 'center' 
  },
  scoreTitle: { fontSize: 14, color: '#64748b', fontWeight: '600' },
  scoreNumber: { fontSize: 36, fontWeight: 'bold', marginVertical: 4 },
  readingTime: { fontSize: 14, color: '#475569' },
  webView: { width: '100%', flex: 1, marginBottom: 16 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cancelButton: { padding: 14, borderRadius: 8, backgroundColor: '#f1f5f9', flex: 0.48, alignItems: 'center' },
  cancelText: { color: '#475569', fontWeight: '600' },
  acceptButton: { padding: 14, borderRadius: 8, backgroundColor: '#0f172a', flex: 0.48, alignItems: 'center' },
  acceptText: { color: '#ffffff', fontWeight: '600' }
});
