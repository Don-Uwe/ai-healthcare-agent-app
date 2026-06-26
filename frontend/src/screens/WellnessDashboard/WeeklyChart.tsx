import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

const weekData = [
  { value: 4200, label: 'Mon', frontColor: '#4CAF50' },
  { value: 7800, label: 'Tue', frontColor: '#4CAF50' },
  { value: 5500, label: 'Wed', frontColor: '#4CAF50' },
  { value: 9100, label: 'Thu', frontColor: '#4CAF50' },
  { value: 6300, label: 'Fri', frontColor: '#4CAF50' },
  { value: 8200, label: 'Sat', frontColor: '#378ADD' }, // today highlight
  { value: 0,    label: 'Sun', frontColor: '#ccc' },    // future
];

export default function WeeklyChart() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>📊 Weekly Steps</Text>
      <BarChart
        data={weekData}
        barWidth={32}
        spacing={12}
        roundedTop
        hideRules
        xAxisThickness={0}
        yAxisThickness={0}
        yAxisTextStyle={{ color: '#999', fontSize: 11 }}
        noOfSections={4}
        maxValue={10000}
      />
      <View style={styles.legend}>
        <View style={styles.dot} />
        <Text style={styles.legendText}>Goal: 10,000 steps</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    borderWidth: 0.5,
    borderColor: '#ddd',
  },
  title: { fontSize: 15, fontWeight: '600', marginBottom: 16, color: '#111' },
  legend: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#378ADD', marginRight: 6 },
  legendText: { fontSize: 12, color: '#666' },
});