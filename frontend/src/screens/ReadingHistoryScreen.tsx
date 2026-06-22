import React, {useCallback, useState} from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import Ionicon from '@expo/vector-icons/Ionicons';
import {RootStackParamList} from '../type';
import {PRIMARY_COLOR, ON_PRIMARY_COLOR} from '../helper/Theme';
import {
  ReadingHistoryItem,
  getReadingHistory,
  clearReadingHistory,
} from '../services/ReadingHistoryService';

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = StackScreenProps<RootStackParamList, 'ReadingHistoryScreen'>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyHistory = () => (
  <View style={styles.emptyContainer}>
    <Ionicon name="time-outline" size={64} color="#c0c0c0" />
    <Text style={styles.emptyTitle}>No reading history yet</Text>
    <Text style={styles.emptySubtitle}>
      Articles you open will appear here.
    </Text>
  </View>
);

// ─── Row Item ─────────────────────────────────────────────────────────────────

type RowProps = {
  item: ReadingHistoryItem;
  onPress: (item: ReadingHistoryItem) => void;
};

const HistoryRow = React.memo(({item, onPress}: RowProps) => (
  <TouchableOpacity
    style={styles.row}
    onPress={() => onPress(item)}
    activeOpacity={0.7}>
    {item.coverImage ? (
      <Image source={{uri: item.coverImage}} style={styles.thumbnail} />
    ) : (
      <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
        <Ionicon name="document-text-outline" size={28} color="#aaa" />
      </View>
    )}
    <View style={styles.rowContent}>
      <Text style={styles.rowTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.rowMeta} numberOfLines={1}>
        {item.authorName}
        {item.category ? ` · ${item.category}` : ''}
      </Text>
      <Text style={styles.rowTime}>{timeAgo(item.viewedAt)}</Text>
    </View>
    <Ionicon name="chevron-forward" size={20} color="#c0c0c0" />
  </TouchableOpacity>
));
HistoryRow.displayName = 'HistoryRow';
// ─── Screen ───────────────────────────────────────────────────────────────────

const ReadingHistoryScreen = ({navigation}: Props) => {
  const [history, setHistory] = useState<ReadingHistoryItem[]>([]);

  // Reload each time screen is focused so it reflects newly viewed articles
  useFocusEffect(
    useCallback(() => {
      setHistory(getReadingHistory());
    }, []),
  );

  const handleClear = () => {
    Alert.alert(
      'Clear History',
      'This will permanently remove all reading history. Continue?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            clearReadingHistory();
            setHistory([]);
          },
        },
      ],
    );
  };

  const handleRowPress = (item: ReadingHistoryItem) => {
    // ArticleScreen expects articleId as number
    navigation.navigate('ArticleScreen', {
      articleId: Number(item.articleId),
    });
  };

  const renderItem = useCallback(
    ({item}: {item: ReadingHistoryItem}) => (
      <HistoryRow item={item} onPress={handleRowPress} />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const keyExtractor = useCallback(
    (item: ReadingHistoryItem) => item.articleId,
    [],
  );

  return (
    <SafeAreaView style={styles.container}>
      {history.length > 0 && (
        <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
          <Ionicon name="trash-outline" size={18} color="#EF4444" />
          <Text style={styles.clearText}>Clear History</Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={[
          styles.listContent,
          history.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={<EmptyHistory />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default ReadingHistoryScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ON_PRIMARY_COLOR,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  clearText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  thumbnailPlaceholder: {
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowContent: {
    flex: 1,
    gap: 3,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    lineHeight: 20,
  },
  rowMeta: {
    fontSize: 13,
    color: '#6b7280',
  },
  rowTime: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  // Empty
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});