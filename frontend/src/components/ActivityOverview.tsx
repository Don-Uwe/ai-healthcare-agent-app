import {StyleSheet, Dimensions} from 'react-native';
import {useCallback, useEffect, useState} from 'react';

import {
  YStack,
  XStack,
  Text,
  Card,
  ScrollView,
  Image,
  View,
  Separator,
} from 'tamagui';

import {PRIMARY_COLOR} from '../helper/Theme';
//import {LineChart} from 'react-native-gifted-charts';
import {BarChart} from 'react-native-chart-kit';
import moment from 'moment';
import {fp, hp} from '../helper/Metric';
import {useSelector} from 'react-redux';
import {GET_IMAGE} from '../helper/APIUtils';
import {ArticleData, MonthStatus, YearStatus} from '../type';
import Loader from './Loader';

import {useFocusEffect} from '@react-navigation/native';
import {Dropdown} from 'react-native-element-dropdown';
import {useGetAuthorMonthlyReadReport} from '../hooks/useGetMonthlyReadReport';
import {useGetAuthorMonthlyWriteReport} from '../hooks/useGetMonthlyWriteReport';
import {useGetAuthorMostViewedArticles} from '../hooks/useGetMostViewedArticle';
import {useGetTotalLikeViewStatus} from '../hooks/useGetTotalLikeViewStatus';
import {useGetTotalReads} from '../hooks/useGetTotalReads';
import {useGetTotalWrites} from '../hooks/useGetTotalWrites';
import {useGetAuthorYearlyReadReport} from '../hooks/useGetYearlyReadReport';
import {useGetAuthorYearlyWriteReport} from '../hooks/useGetYearlyWriteReport';
import StatisticsCard from './StatisticsCard';

type LineDataItem = {
  label: string;
  value: number;
};

interface Props {
  onArticleViewed: ({
    articleId,
    authorId,
    recordId,
  }: {
    articleId: number;
    authorId: string;
    recordId: string;
  }) => void;
  userId?: string;
  others: boolean;
  articlePosted: number;
  user_handle?: string;
}
const ActivityOverview = ({
  onArticleViewed,
  userId,
  others,
  user_handle,
}: Props) => {
  const [userState, setUserState] = useState<number>(0);
  const {user_token, user_id} = useSelector((state: any) => state.user);
  const [, setIsFocus] = useState<boolean>(false);
  // const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());
  const {isConnected} = useSelector((state: any) => state.network);
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth(),
  );
  const [selectedYear, setSelectedYear] = useState<number>(-1);

  const monthlyDrops = [
    {label: 'Monthly', value: -1},
    {label: 'January', value: 0},
    {label: 'February', value: 1},
    {label: 'March', value: 2},
    {label: 'April', value: 3},
    {label: 'May', value: 4},
    {label: 'June', value: 5},
    {label: 'July', value: 6},
    {label: 'August', value: 7},
    {label: 'September', value: 8},
    {label: 'October', value: 9},
    {label: 'November', value: 10},
    {label: 'December', value: 11},
  ];

  const yearlyDrops = [
    {label: 'Yearly', value: -1},
    {label: '2024', value: 2024},
    {label: '2025', value: 2025},
    {label: '2026', value: 2026},
  ];

  // GET MONTHLY READ REPORT
  const {data: monthlyReadReport, refetch: refetchMonthReadReport} =
    useGetAuthorMonthlyReadReport({
      user_id: user_id,
      selectedMonth: selectedMonth,
      userId: userId,
      others: others,
      isConnected: isConnected,
    });

  const {data: monthlyWriteReport, refetch: refetchMonthWriteReport} =
    useGetAuthorMonthlyWriteReport({
      user_id: user_id,
      selectedMonth: selectedMonth,
      userId: userId,
      others: others,
      isConnected: isConnected,
    });

  // GET YEARLY READ REPORT
  const {data: yearlyReadReport, refetch: refetchYearlyReadReport} =
    useGetAuthorYearlyReadReport({
      user_id,
      userId,
      selectedYear,
      others,
      isConnected,
    });

  // GET YEARLY WRITE REPORT

  const {data: yearlyWriteReport, refetch: refetchYearlyWriteReport} =
    useGetAuthorYearlyWriteReport({
      user_id,
      selectedYear,
      userId,
      others,
      isConnected,
    });

  // GET MOST VIEWED ARTICLE
  const {data: article, isLoading: isArticleLoading} =
    useGetAuthorMostViewedArticles({
      user_id: user_id,
      userId: userId,
      others: others,
      isConnected: isConnected,
    });

  // GET USER STATUS FOR LIKE AND VIEW COUNT

  const {data: likeViewStatData, isLoading: likeViewStatDataLoading, refetch: likeViewStatusRefetch} = useGetTotalLikeViewStatus({
    user_id: user_id,
    userId: userId,
    others: others,
    isConnected: isConnected,
  });

 


  // GET TOTAL READ STATUS

  const {data: readStatData, isLoading: readStatDataLoading} = useGetTotalReads({
    user_id: user_id,
    userId: userId,
    others: others,
    isConnected: isConnected,
  });

  // GET TOTAL WRITE STATUS

  const {data: writeStatData, isLoading: writeStatDataLoading} = useGetTotalWrites({
    user_id: user_id,
    userId: userId,
    others: others,
    isConnected: isConnected,
  });

  useFocusEffect(
    useCallback(() => {
      if (userState === 0) {
        refetchMonthReadReport();
      } else {
        refetchMonthWriteReport();
      }
      likeViewStatusRefetch();
    }, [userState, likeViewStatusRefetch, refetchMonthReadReport, refetchMonthWriteReport]),
  );
  useEffect(() => {
    if (userState === 0) {
      refetchMonthReadReport();
    } else {
      refetchMonthWriteReport();
    }
  }, [
    refetchMonthReadReport,
    refetchMonthWriteReport,
    selectedMonth,
    userState,
  ]);

  useEffect(() => {
    // This will run when selectedMonth changes
    if (userState === 0) {
      refetchYearlyReadReport();
    } else {
      refetchYearlyWriteReport();
    }
  }, [
    refetchYearlyReadReport,
    refetchYearlyWriteReport,
    selectedYear,
    userState,
  ]);

  if (
    isArticleLoading ||
    likeViewStatDataLoading ||
    writeStatDataLoading ||
    readStatDataLoading
  ) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 40}}>
        <Loader />
      </View>
    );
  }

  // const processData = data => {
  //   if (!Array.isArray(data) || data.length === 0) {
  //     return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  //   }

  //   /*
  //   console.log('data', data.map(item => ({
  //     value: item.value, // Ensure the value is an integer
  //     label: item.date.substring(8),
  //   })));

  //   return data.map(item => ({
  //     value: item.value, // Ensure the value is an integer
  //     label: item.date.substring(8),
  //   }));
  //   */

  //   return data.map(item =>
  //     Number.isFinite(Number(item.value)) ? Number(item.value) : 0,
  //   );
  // };

  // const processLabels = data => {
  //   if (!data) {
  //     return [];
  //   }

  //   //console.log("Label data", data)

  //   return data.map(item => item.date?.substring(8) ?? '-');
  // };

  const getTrendMessage = () => {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    // If month selected
    if (selectedMonth !== -1) {
      const monthName = monthNames[selectedMonth];
      const year = moment().year(); // current year
      return `${user_handle}'s ${
        userState === 0 ? 'Reading' : 'Writing'
      } activity for ${monthName} ${year}`;
    }

    // If year selected
    if (selectedYear !== -1) {
      return `${user_handle}'s ${
        userState === 0 ? 'Reading' : 'Writing'
      } activity for the year ${selectedYear}`;
    }

    return '';
  };

  const screenWidth = Dimensions.get('window').width;

  const dayToWeekData = (data: MonthStatus[]): LineDataItem[] => {
    if (!Array.isArray(data) || data.length === 0) return [];

    // Sort (safe guard)
    const sorted = [...data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    const weeks: LineDataItem[] = [];
    let currentWeek: MonthStatus[] = [];
    let weekIndex = 1;

    const getWeekDay = (date: string) => new Date(date).getDay(); // 0 = Sun

    sorted.forEach((item, index) => {
      currentWeek.push(item);

      const isSaturday = getWeekDay(item.date) === 6;
      const isLastDay = index === sorted.length - 1;

      if (isSaturday || isLastDay) {
        const weekSum = currentWeek.reduce(
          (sum, d) => sum + Number(d.value || 0),
          0,
        );

        //const startDay = currentWeek[0].date.slice(8);
        //const endDay = currentWeek[currentWeek.length - 1].date.slice(8);

        weeks.push({
          label: `W${weekIndex}`,
          value: weekSum,
        });

        weekIndex++;
        currentWeek = [];
      }
    });

    return weeks;
  };

  const MONTH_LABELS = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const groupYearlyData = (data: YearStatus[]) => {
    const map = new Map<number, number>();

    data.forEach(item => {
      const monthNumber = Number(item.month.split('-')[1]); // "01" -> 1
      map.set(monthNumber, item.value || 0);
    });

    const normalized = MONTH_LABELS.map((label, index) => ({
      label,
      value: map.get(index + 1) ?? 0,
    }));

    return [
      normalized.slice(0, 3), // Q1
      normalized.slice(3, 6), // Q2
      normalized.slice(6, 9), // Q3
      normalized.slice(9, 12), // Q4
    ];
  };

  const YearlyChartSection = () => {
    const yearlyData =
      userState === 0 ? (yearlyReadReport ?? []) : (yearlyWriteReport ?? []);
    console.log('Raw yearly Data:', yearlyData);
    const groupedData = groupYearlyData(yearlyData);
    console.log('Grouped yearly Data:', groupedData);

    const CHART_HORIZONTAL_PADDING = 32;
    const chartWidth = screenWidth - CHART_HORIZONTAL_PADDING - 16;

    const QUARTER_LABELS = ['Jan – Mar', 'Apr – Jun', 'Jul – Sep', 'Oct – Dec'];

    return (
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 2,
          paddingBottom: 32,
          // backgroundColor: '#fff',
        }}
        showsVerticalScrollIndicator={false}>
        <Card
          padding={16}
          borderRadius={16}
          backgroundColor="#fff"
          overflow="hidden"
          bordered
          borderWidth={0.6}>
          <Text
            fontSize={15}
            color="$gray700"
            textAlign="center"
            fontWeight={'700'}
            marginBottom={12}>
            {getTrendMessage()}
          </Text>
          {groupedData.map((group, index) => {
            const isLast = index === groupedData.length - 1;

            return (
              <View key={index}>
                {/* Quarter Title */}
                <Text
                  fontSize={15}
                  fontWeight="600"
                  color="#000"
                  marginBottom={8}>
                  {QUARTER_LABELS[index]}
                </Text>

                {/* Chart */}
                <View>
                  <BarChart
                    yAxisLabel=""
                    yAxisSuffix=""
                    width={chartWidth}
                    height={170}
                    fromZero
                    withInnerLines={false}
                    style={{
                      marginLeft: -8,
                      backgroundColor: '#fff',
                    }}
                    chartConfig={{
                      backgroundGradientFrom: '#fff',
                      backgroundGradientTo: '#fff',
                      decimalPlaces: 1,
                      formatYLabel: y => Number(y).toFixed(1),
                      color: () => PRIMARY_COLOR,
                      labelColor: () => '#9CA3AF',
                      barPercentage: 0.5,
                      propsForBackgroundLines: {strokeWidth: 0},
                    }}
                    data={{
                      labels: group.map(i => i.label),
                      datasets: [{data: group.map(i => i.value)}],
                    }}
                  />
                </View>

                {/* Separator only between groups */}
                {!isLast && <Separator marginVertical={20} opacity={0.6} />}
              </View>
            );
          })}
        </Card>
      </ScrollView>
    );
  };

  const WeeklyChartSection = () => {
    const rawMonthlyData =
      userState === 0 ? (monthlyReadReport ?? []) : (monthlyWriteReport ?? []);

    console.log('Raw Monthly Data:', rawMonthlyData);

    const weeklyData = dayToWeekData(rawMonthlyData);

    console.log('Weekly Data:', weeklyData);

    const labels = weeklyData.map(w => w.label);
    const values = weeklyData.map(w => w.value);

    return (
      <Card
        padding={18}
        borderRadius={16}
        backgroundColor="#fff"
        overflow="hidden"
        bordered
        borderWidth={0.6}>
        <Text
          fontSize={15}
          color="$gray700"
          fontWeight={'700'}
          textAlign="center"
          marginBottom={12}>
          {getTrendMessage()}
        </Text>

        <BarChart
          yAxisLabel=""
          yAxisSuffix=""
          data={{labels, datasets: [{data: values}]}}
          width={screenWidth - 64}
          height={220}
          fromZero
          withInnerLines={false}
          showValuesOnTopOfBars={false}
          style={{marginLeft: -8}}
          chartConfig={{
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 1,
            formatYLabel: y => Number(y).toFixed(1),
            color: () => PRIMARY_COLOR,
            labelColor: () => '#9CA3AF',
            barPercentage: 0.45,
            propsForBackgroundLines: {strokeWidth: 0},
          }}
        />
      </Card>
    );
  };

  const BarChartSection = () => {
    return (
      <View background="$background" paddingHorizontal="$4" marginTop="$6">
        <Text fontSize={19} fontWeight="700" marginBottom="$3">
          {userState === 0 ? 'Reading Trend' : 'Writing Trend'}
        </Text>
        {selectedMonth !== -1 ? <WeeklyChartSection /> : <YearlyChartSection />}
      </View>
    );
  };

 return (
  <YStack flex={1} backgroundColor="$background">
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: 120,
        flexGrow: 1,
      }}>
      
      <View>
        {/* Statistics */}
        <YStack paddingHorizontal="$2" marginTop="$3" alignItems="center">
          <StatisticsCard
            totalLikes={likeViewStatData?.totalLikes || 0}
            totalViews={likeViewStatData?.totalViews || 0}
            totalArticles={readStatData?.totalReads || 0}
            totalPodcasts={writeStatData?.totalWrites || 0}
            improvements={0}
          />
        </YStack>


        <YStack paddingHorizontal="$2" marginTop="$4" gap="$3">
          
          {/* Toggle */}
          <XStack
            paddingHorizontal="$1"
            marginTop="$2"
            gap="$3"
            justifyContent="space-between">
            
            <XStack
              flex={1}
              backgroundColor="$background"
              borderRadius="$4"
              borderWidth={1}
              borderColor="#c1c1c1"
              overflow="hidden">

              {/* READ */}
              <YStack
                flex={1}
                paddingVertical="$3"
                justifyContent="center"
                alignItems="center"
                backgroundColor={userState === 0 ? PRIMARY_COLOR : 'transparent'}
                onPress={() => setUserState(0)}>
                <Text
                  fontSize={16}
                  fontWeight="700"
                  color={userState === 0 ? 'white' : 'black'}>
                  Read
                </Text>
              </YStack>

              {/* WRITE */}
              <YStack
                flex={1}
                paddingVertical="$3"
                justifyContent="center"
                alignItems="center"
                backgroundColor={userState === 1 ? PRIMARY_COLOR : 'transparent'}
                onPress={() => setUserState(1)}>
                <Text
                  fontSize={16}
                  fontWeight="700"
                  color={userState === 1 ? 'white' : 'black'}>
                  Write
                </Text>
              </YStack>
            </XStack>
          </XStack>

          {/* ===== DROPDOWNS ===== */}
          <View style={styles.rowContainer}>
            
            {/* MONTH */}
            <View style={{flex: 1, marginRight: 5}}>
              <Dropdown
                style={{
                  ...styles.button,
                  backgroundColor:
                    selectedMonth === -1 ? '#EFEFEF' : PRIMARY_COLOR,
                }}
                data={monthlyDrops}
                labelField="label"
                valueField="value"
                value={selectedMonth}
                onChange={item => {
                  setSelectedMonth(item.value);
                  setSelectedYear(-1);

                  if (userState === 0) {
                    refetchMonthReadReport();
                  } else {
                    refetchMonthWriteReport();
                  }
                }}
                placeholder={'Monthly'}
              />
            </View>

            {/* YEAR */}
            <View style={{flex: 1, marginLeft: 5}}>
              <Dropdown
                style={{
                  ...styles.button,
                  backgroundColor:
                    selectedYear === -1 ? '#EFEFEF' : PRIMARY_COLOR,
                }}
                data={yearlyDrops}
                labelField="label"
                valueField="value"
                value={selectedYear}
                onChange={item => {
                  setSelectedYear(item.value);
                  setSelectedMonth(-1);
                }}
                placeholder={'Yearly'}
              />
            </View>
          </View>
        </YStack>
      </View>

      {/* ===== CHART ===== */}
      {(selectedMonth !== -1 || selectedYear !== -1) && (
        <View>
          <BarChartSection />
        </View>
      )}

      {/* ===== MOST VIEWED ===== */}
      {others && (
        <YStack paddingHorizontal="$4" marginTop="$6">
          <Text fontSize={19} fontWeight="800" marginBottom="$3">
            Most Viewed Articles
          </Text>

          {article?.map((item: ArticleData, index: number) => (
            <Card
              key={index}
              elevate
              bordered
              borderWidth={0.6}
              borderRadius="$10"
              pressStyle={{scale: 0.98}}
              onPress={() =>
                onArticleViewed({
                  articleId: Number(item._id),
                  authorId: item.authorId.toString() ?? '',
                  recordId: item.pb_recordId,
                })
              }>
              <XStack>
                <Image
                  source={{
                    uri: item?.imageUtils[0]?.startsWith('http')
                      ? item?.imageUtils[0]
                      : `${GET_IMAGE}/${item?.imageUtils[0]}`,
                  }}
                  width={130}
                  height={130}
                  borderRadius={8}
                />

                <YStack flex={1} padding="$3">
                  <Text fontSize={12} color="$gray10">
                    {item?.tags.map(t => t.name).join(' | ')}
                  </Text>

                  <Text fontSize={17} fontWeight="700" marginTop="$1">
                    {item?.title}
                  </Text>

                  <Text fontSize={13} color="$gray10">
                    {item?.viewUsers?.length ?? 0} views
                  </Text>

                  <Text fontSize={12} color="$gray8" marginTop="$1">
                    Updated: {moment(item.lastUpdated).format('DD/MM/YYYY')}
                  </Text>
                </YStack>
              </XStack>
            </Card>
          ))}
        </YStack>
      )}
    </ScrollView>
  </YStack>
);
};

const styles = StyleSheet.create({
  rowContainer: {
    width: '100%',
    flexDirection: 'row',
    padding: 2,
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  colContainer: {
    width: '100%',
    flexDirection: 'column',
    padding: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  box: {
    width: '95%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 4,
    padding: 3,
    borderColor: 'black',
    borderRadius: 8,
  },

  button: {
    flex: 1, // ✅ IMPORTANT (instead of width: '45%')
    height: hp(6),
    padding: 8,
    borderRadius: 8,
    margin: 2,
    marginTop: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#c1c1c1',
  },

  dropdown: {
    flex: 1, // ✅ FIX
    height: 40,
    borderColor: '#c1c1c1',
    borderWidth: 0.4,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 3,
  },

  cardContainer: {
    width: '100%',
    maxHeight: 150,
    backgroundColor: '#E6E6E6',
    flexDirection: 'row',
    marginVertical: 14,
    overflow: 'hidden',
    elevation: 4,
    borderRadius: 12,
  },

  image: {
    flex: 0.6,
    resizeMode: 'cover',
  },

  textContainer: {
    flex: 0.9,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 13,
  },

  title: {
    fontSize: fp(4.5),
    fontWeight: 'bold',
    color: '#121a26',
    marginBottom: 4,
    fontFamily: 'Lobster-Regular',
  },

  footerText: {
    fontSize: fp(3.3),
    fontWeight: '600',
    color: '#121a26',
    marginBottom: 3,
  },
});

export default ActivityOverview;
