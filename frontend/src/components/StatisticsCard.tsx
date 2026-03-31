import React from 'react';
import {StyleSheet, View, Text, useColorScheme} from 'react-native';
import {Card, XStack, YStack} from 'tamagui';
import {PRIMARY_COLOR} from '../helper/Theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';


interface StatisticsCardProps {
  totalLikes: number;
  totalViews: number;
  totalArticles: number;
  totalPodcasts?: number;
  improvements?: number;
}

const StatisticsCard = ({
  totalLikes,
  totalViews,
  totalArticles,
  totalPodcasts = 0,
  improvements = 0,
}:StatisticsCardProps) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const StatItem = ({
    icon,
    label,
    value,
    color,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    color: string;
  }) => (
    <YStack
      alignItems="center"
      justifyContent="center"
      flex={1}
      paddingVertical="$2">
      <View style={[styles.iconContainer, {backgroundColor: color + '15'}]}>
        {icon}
      </View>
      <Text style={[styles.statValue, {color: PRIMARY_COLOR}]}>{value}</Text>
      <Text style={[styles.statLabel, {color: isDarkMode ? '#ccc' : '#666'}]}>
        {label}
      </Text>
    </YStack>
  );

  return (
    <Card
      elevate
      bordered
      borderWidth={0.6}
      borderRadius={16}
      padding="$4"
      width={"90%"}
      marginHorizontal="$4"
      marginVertical="$1"
      backgroundColor={isDarkMode ? '#1a1a2e' : '#ffffff'}>
      <Text style={[styles.sectionTitle, {color: isDarkMode ? '#fff' : '#000'}]}>
        Statistics Overview
      </Text>

      <XStack justifyContent="space-between" marginTop="$3">
        <StatItem
          icon={<FontAwesome name="heart" size={24} color="#E91E63" />}
          label="Total Likes"
          value={totalLikes}
          color="#E91E63"
        />
        <StatItem
          icon={<FontAwesome name="eye" size={24} color="#2196F3" />}
          label="Total Views"
          value={totalViews}
          color="#2196F3"
        />
        <StatItem
          icon={<MaterialIcons name="article" size={24} color="#FF9800" />}
          label="Articles"
          value={`${totalArticles + improvements}`}
          color="#FF9800"
        />
      </XStack>
    </Card>
  );
};

export default StatisticsCard;

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 8,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
});
