import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import {fp, hp} from '../helper/Metric';
import {PRIMARY_COLOR, BUTTON_COLOR} from '../helper/Theme';
import {formatDateShortYear} from '../helper/dateUtils';
import {StatusEnum} from '../helper/Utils';

/**
 * OverviewItem
 *
 * A compact, single-row card used inside the Overview screen's tab lists
 * (Articles, Revisions, Podcasts). Designed for high-density lists where
 * ReviewCard's full layout would be too heavy.
 *
 * Shows: status badge · title · last-updated date · a "View →" affordance.
 */

interface OverviewItemProps {
  title: string;
  status: string;
  lastUpdated: string;
  onPress: () => void;
}

const statusColor = (status: string): string => {
  switch (status) {
    case StatusEnum.PUBLISHED:
      return '#22C55E'; // green-500
    case StatusEnum.DISCARDED:
      return '#EF4444'; // red-500
    case StatusEnum.AWAITING_USER:
    case StatusEnum.UNASSIGNED:
      return BUTTON_COLOR;
    default:
      return '#6B7280'; // gray-500
  }
};

const OverviewItem: React.FC<OverviewItemProps> = ({
  title,
  status,
  lastUpdated,
  onPress,
}) => {
  const color = statusColor(status);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${title}, status ${status}`}>
      {/* Status stripe */}
      <View style={[styles.stripe, {backgroundColor: color}]} />

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>

        <View style={styles.footer}>
          {/* Status badge */}
          <View style={[styles.badge, {borderColor: color}]}>
            <Text style={[styles.badgeText, {color}]}>
              {status.toUpperCase()}
            </Text>
          </View>

          <View style={styles.right}>
            <Text style={styles.date}>{formatDateShortYear(lastUpdated)}</Text>

            <View style={styles.viewButton}>
              <Text style={styles.viewText}>View</Text>
              <AntDesign
                name="arrowright"
                size={13}
                color={PRIMARY_COLOR}
                style={styles.arrow}
              />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default OverviewItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginVertical: hp(0.8),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  stripe: {
    width: 4,
    alignSelf: 'stretch',
  },
  content: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  title: {
    fontSize: fp(4.2),
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 10,
    lineHeight: fp(5.5),
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: fp(2.8),
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  date: {
    fontSize: fp(3.1),
    color: '#9CA3AF',
    fontWeight: '500',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF5FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  viewText: {
    fontSize: fp(3.3),
    color: PRIMARY_COLOR,
    fontWeight: '700',
    marginRight: 2,
  },
  arrow: {
    marginTop: 1,
  },
});
