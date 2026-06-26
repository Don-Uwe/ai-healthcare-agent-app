import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet
} from 'react-native';

export default function ManualLogCard() {
  const [water, setWater] = useState(0);
  const [calories, setCalories] = useState(0);
  const [mood, setMood] = useState('');

  const moods = ['😔', '😐', '🙂', '😄', '🤩'];
  const waterGoal = 2500;
  const calGoal = 2000;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Today's Log</Text>

      {/* Water */}
      <View style={styles.card}>
        <Text style={styles.label}>💧 Water Intake</Text>
        <Text style={styles.value}>{water} / {waterGoal} ml</Text>
        <View style={styles.progressOuter}>
          <View style={[styles.progressInner, {
            width: `${Math.min((water / waterGoal) * 100, 100)}%`,
            backgroundColor: '#378ADD'
          }]} />
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setWater(w => Math.min(w + 250, waterGoal))}>
          <Text style={styles.buttonText}>+ Add 250 ml</Text>
        </TouchableOpacity>
      </View>

      {/* Calories */}
      <View style={styles.card}>
        <Text style={styles.label}>🔥 Calories</Text>
        <Text style={styles.value}>{calories} / {calGoal} kcal</Text>
        <View style={styles.progressOuter}>
          <View style={[styles.progressInner, {
            width: `${Math.min((calories / calGoal) * 100, 100)}%`,
            backgroundColor: '#BA7517'
          }]} />
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setCalories(c => Math.min(c + 300, calGoal))}>
          <Text style={styles.buttonText}>+ Log Meal (300 kcal)</Text>
        </TouchableOpacity>
      </View>

      {/* Mood */}
      <View style={styles.card}>
        <Text style={styles.label}>😊 Mood</Text>
        <View style={styles.moodRow}>
          {moods.map((m) => (
            <TouchableOpacity key={m} onPress={() => setMood(m)}>
              <Text style={[
                styles.moodEmoji,
                mood === m && styles.moodSelected
              ]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {mood ? <Text style={styles.moodText}>Selected: {mood}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#111' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: '#ddd',
  },
  label: { fontSize: 13, color: '#666', marginBottom: 4 },
  value: { fontSize: 20, fontWeight: '500', color: '#111', marginBottom: 8 },
  progressOuter: {
    height: 6, backgroundColor: '#eee',
    borderRadius: 99, overflow: 'hidden', marginBottom: 12
  },
  progressInner: { height: 6, borderRadius: 99 },
  button: {
    borderWidth: 0.5, borderColor: '#ccc',
    borderRadius: 8, padding: 10, alignItems: 'center'
  },
  buttonText: { fontSize: 13, color: '#333' },
  moodRow: { flexDirection: 'row', gap: 12, marginVertical: 8 },
  moodEmoji: { fontSize: 28, opacity: 0.4 },
  moodSelected: { opacity: 1, transform: [{ scale: 1.2 }] },
  moodText: { fontSize: 13, color: '#666', marginTop: 4 },
});