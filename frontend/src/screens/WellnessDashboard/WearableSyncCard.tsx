import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform
} from 'react-native';

export default function WearableSyncCard() {
  const [syncing, setSyncing] = useState(false);
  const [data, setData] = useState<{
    steps: number; heartRate: number; sleep: number
  } | null>(null);

  async function handleSync() {
    setSyncing(true);
    // Dummy data for now — real API baad mein connect karenge
    await new Promise(res => setTimeout(res, 1500));
    setData({ steps: 7842, heartRate: 72, sleep: 6.5 });
    setSyncing(false);
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        {Platform.OS === 'ios' ? '🍎 Apple HealthKit' : '🏃 Google Fit'} Sync
      </Text>

      {data ? (
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{data.steps.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Steps</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{data.heartRate} bpm</Text>
            <Text style={styles.statLabel}>Heart Rate</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{data.sleep}h</Text>
            <Text style={styles.statLabel}>Sleep</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.hint}>Sync karo apna wearable data dekhne ke liye</Text>
      )}

      <TouchableOpacity
        style={[styles.button, syncing && styles.buttonDisabled]}
        onPress={handleSync}
        disabled={syncing}>
        {syncing
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>🔄 Sync Now</Text>
        }
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginBottom: 0,
    borderWidth: 0.5,
    borderColor: '#ddd',
  },
  title: { fontSize: 15, fontWeight: '600', color: '#111', marginBottom: 12 },
  hint: { fontSize: 13, color: '#999', marginBottom: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '600', color: '#111' },
  statLabel: { fontSize: 11, color: '#888', marginTop: 2 },
  button: {
    backgroundColor: '#378ADD',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: '#aac8ef' },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '500' },
});