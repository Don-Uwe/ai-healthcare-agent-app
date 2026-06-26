import React from 'react';
import {
  ScrollView, Text, StyleSheet, SafeAreaView, View
} from 'react-native';
import WearableSyncCard from './WearableSyncCard';
import ManualLogCard from './ManualLogCard';
import WeeklyChart from './WeeklyChart';

export default function WellnessDashboardScreen() {
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.heading}>🌿 Wellness Dashboard</Text>
          <Text style={styles.date}>{today}</Text>
        </View>

        {/* Wearable Sync */}
        <WearableSyncCard />

        {/* Manual Log */}
        <ManualLogCard />

        {/* Weekly Chart */}
        <WeeklyChart />

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  heading: { fontSize: 22, fontWeight: '700', color: '#111' },
  date: { fontSize: 13, color: '#888', marginTop: 2 },
});