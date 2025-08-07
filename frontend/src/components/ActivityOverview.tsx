import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import {useCallback, useEffect, useState} from 'react';
import {ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../helper/Theme';
import {Dropdown} from 'react-native-element-dropdown';
//import {LineChart} from 'react-native-gifted-charts';
import {LineChart} from 'react-native-chart-kit';
import {useQuery} from '@tanstack/react-query';
import moment from 'moment';
import {fp} from '../helper/Metric';
import {useSelector} from 'react-redux';
import axios from 'axios';
import {
  GET_IMAGE,
  GET_MONTHLY_READ_REPORT,
  GET_MONTHLY_WRITES_REPORT,
  GET_MOSTLY_VIEWED,
  GET_TOTAL_LIKES_VIEWS,
  GET_TOTAL_READS,
  GET_TOTAL_WRITES,
  GET_YEARLY_READ_REPORT,
  GET_YEARLY_WRITES_REPORT,
} from '../helper/APIUtils';
import {
  ArticleData,
  MonthStatus,
  ReadStatus,
  UserStatus,
  WriteStatus,
  YearStatus,
} from '../type';
import Loader from './Loader';

import {useFocusEffect} from '@react-navigation/native';
import {formatCount} from '../helper/Utils';

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
}
const ActivityOverview = ({
  onArticleViewed,
  userId,
  others,
}: Props) => {
  const [userState, setUserState] = useState<number>(0);
  const {user_token, user_id} = useSelector((state: any) => state.user);
  const [isFocus, setIsFocus] = useState<boolean>(false);
  // const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());
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
    //{label: '2025', value: 2025},
  ];

  // GET MONTHLY READ REPORT
  const {
    data: monthlyReadReport,
    refetch: refetchMonthReadReport,
  } = useQuery({
    queryKey: ['get-month-read-reports'],
    queryFn: async () => {
      try {
        if (selectedMonth === -1) {
          return [];
        }
        if (user_token === '') {
          Alert.alert('No token found');
          return [];
        }
        if (!userId) {
          if (others) {
            // user id not found for others profile
            Alert.alert('No user id found');
            return [];
          }
        }
        if (user_id === '' && !others) {
          // user id not found for own profile
          Alert.alert('No user id found');
          return [];
        }

        let url = others
          ? `${GET_MONTHLY_READ_REPORT}?userId=${userId}&month=${selectedMonth}`
          : `${GET_MONTHLY_READ_REPORT}?userId=${user_id}&month=${selectedMonth}`;
        // console.log('URL', url);
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        });

        return response.data.monthlyReads as MonthStatus[];
      } catch (err) {
        console.error('Error fetching articles reads monthly:', err);
      }
    },
    enabled: !!(user_token && selectedMonth !== -1 && (userId || !others)),
  });

  const {
    data: monthlyWriteReport,
    refetch: refetchMonthWriteReport,
  } = useQuery({
    queryKey: ['get-month-write-reports'],
    queryFn: async () => {
      try {
        if (selectedMonth === -1) {
          return [];
        }
        if (user_token === '') {
          Alert.alert('No token found');
          return [];
        }
        if (!userId) {
          if (others) {
            // user id not found for others profile
            Alert.alert('No user id found');
            return [];
          }
        }
        if (user_id === '' && !others) {
          // user id not found for own profile
          Alert.alert('No user id found');
          return [];
        }

        let url = others
          ? `${GET_MONTHLY_WRITES_REPORT}?userId=${userId}&month=${selectedMonth}`
          : `${GET_MONTHLY_WRITES_REPORT}?userId=${user_id}&month=${selectedMonth}`;
        // console.log('URL', url);
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        });

        return response.data.monthlyWrites as MonthStatus[];
      } catch (err) {
        console.error('Error fetching articles writes monthly:', err);
      }
    },
    enabled: !!(user_token && selectedMonth !== -1 && (userId || !others)),
  });

  // GET YEARLY READ REPORT
  const {
    data: yearlyReadReport,
    refetch: refetchYearlyReadReport,
  } = useQuery({
    queryKey: ['get-yearly-read-reports'],
    queryFn: async () => {
      try {
        if (selectedYear === -1) {
          return [];
        }
        if (user_token === '') {
          Alert.alert('No token found');
          return [];
        }
        if (!userId) {
          if (others) {
            // user id not found for others profile
            Alert.alert('No user id found');
            return [];
          }
        }
        if (user_id === '' && !others) {
          // user id not found for own profile
          Alert.alert('No user id found');
          return [];
        }

        let url = others
          ? `${GET_YEARLY_READ_REPORT}?userId=${userId}&year=${selectedYear}`
          : `${GET_YEARLY_READ_REPORT}?userId=${user_id}&year=${selectedYear}`;
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        });

        return response.data.yearlyReads as YearStatus[];
      } catch (err) {
        console.error('Error fetching articles reads yearly:', err);
      }
    },
    enabled: !!(user_token && selectedYear !== -1 && (userId || !others)),
  });

  // GET YEARLY WRITE REPORT

  const {
    data: yearlyWriteReport,
    refetch: refetchYearlyWriteReport,
  } = useQuery({
    queryKey: ['get-yearly-write-reports'],
    queryFn: async () => {
      try {
        if (selectedYear === -1) {
          return [];
        }
        if (user_token === '') {
          Alert.alert('No token found');
          return [];
        }
        if (!userId) {
          if (others) {
            // user id not found for others profile
            Alert.alert('No user id found');
            return [];
          }
        }
        if (user_id === '' && !others) {
          // user id not found for own profile
          Alert.alert('No user id found');
          return [];
        }

        let url = others
          ? `${GET_YEARLY_WRITES_REPORT}?userId=${userId}&year=${selectedYear}`
          : `${GET_YEARLY_WRITES_REPORT}?userId=${user_id}&year=${selectedYear}`;

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        });

        return response.data.yearlyWrites as YearStatus[];
      } catch (err) {
        console.error('Error fetching articles reads yearly:', err);
      }
    },

    enabled: !!(user_token && selectedYear !== -1 && (userId || !others)),
  });

  // GET MOST VIEWED ARTICLE
  const {
    data: article,
    isLoading: isArticleLoading,
  } = useQuery({
    queryKey: ['get-most-viewed-articles'],
    queryFn: async () => {
      try {
        if (user_token === '') {
          Alert.alert('No token found');
          return '';
        }
        if (!userId) {
          if (others) {
            // user id not found for others profile
            Alert.alert('No user id found');
            return '';
          }
        }
        if (user_id === '' && !others) {
          // user id not found for own profile
          Alert.alert('No user id found');
          return '';
        }

        let url = others
          ? `${GET_MOSTLY_VIEWED}${userId}`
          : `${GET_MOSTLY_VIEWED}${user_id}`;

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        });

        return response.data as ArticleData[];
      } catch (err) {
        console.error('Error fetching articles:', err);
      }
    },
  });

  // GET USER STATUS FOR LIKE AND VIEW COUNT

  const {
    isLoading: likeViewStatDataLoading,
  } = useQuery({
    queryKey: ['get-like-view-status'],
    queryFn: async () => {
      try {
        if (user_token === '') {
          Alert.alert('No token found');
          return '';
        }
        if (!userId) {
          if (others) {
            // user id not found for others profile
            Alert.alert('No user id found');
            return '';
          }
        }
        if (user_id === '' && !others) {
          // user id not found for own profile
          Alert.alert('No user id found');
          return '';
        }

        let url = others
          ? `${GET_TOTAL_LIKES_VIEWS}${userId}`
          : `${GET_TOTAL_LIKES_VIEWS}${user_id}`;

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        });
        // console.log('Like View Data', response.data);

        return response.data as UserStatus;
      } catch (err) {
        console.error('Error fetching articles:', err);
      }
    },
  });

  // GET TOTAL READ STATUS

  const {
    isLoading: readStatDataLoading,
  } = useQuery({
    queryKey: ['get-read-status'],
    queryFn: async () => {
      try {
        if (user_token === '') {
          Alert.alert('No token found');
          return '';
        }
        if (!userId) {
          if (others) {
            // user id not found for others profile
            Alert.alert('No user id found');
            return '';
          }
        }
        if (user_id === '' && !others) {
          // user id not found for own profile
          Alert.alert('No user id found');
          return '';
        }

        let url = others
          ? `${GET_TOTAL_READS}${userId}`
          : `${GET_TOTAL_READS}${user_id}`;

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        });
        //console.log('READ Data', response.data);

        return response.data as ReadStatus;
      } catch (err) {
        console.error('Error fetching articles:', err);
      }
    },
  });

  // GET TOTAL WRITE STATUS

  const {
    isLoading: writeStatDataLoading,
  } = useQuery({
    queryKey: ['get-write-status'],
    queryFn: async () => {
      try {
        if (user_token === '') {
          Alert.alert('No token found');
          return '';
        }
        if (!userId) {
          if (others) {
            // user id not found for others profile
            Alert.alert('No user id found');
            return '';
          }
        }
        if (user_id === '' && !others) {
          // user id not found for own profile
          Alert.alert('No user id found');
          return '';
        }

        let url = others
          ? `${GET_TOTAL_WRITES}${userId}`
          : `${GET_TOTAL_WRITES}${user_id}`;

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        });
        // console.log('Write Data', response.data);

        return response.data as WriteStatus;
      } catch (err) {
        console.error('Error fetching articles:', err);
      }
    },
  });


  useFocusEffect(
    useCallback(() => {
      if (userState === 0) {
        refetchMonthReadReport();
      } else {
        refetchMonthWriteReport();
      }
    }, [userState, refetchMonthReadReport, refetchMonthWriteReport]),
  );
  useEffect(() => {
    if (userState === 0) {
      refetchMonthReadReport();
    } else {
      refetchMonthWriteReport();
    }
  }, [refetchMonthReadReport, refetchMonthWriteReport, selectedMonth, userState]);

  useEffect(() => {
    // This will run when selectedMonth changes
    if (userState === 0) {
      refetchYearlyReadReport();
    } else {
      refetchYearlyWriteReport();
    }
  }, [refetchYearlyReadReport, refetchYearlyWriteReport, selectedYear, userState]);

  if (
    isArticleLoading ||
    likeViewStatDataLoading ||
    writeStatDataLoading ||
    readStatDataLoading
  ) {
    <Loader />;
  }

  const processData = data => {
   if (!Array.isArray(data) || data.length === 0) {
    return [0,0,0,0,0,0,0,0,0,0,0,0];
  }

    /*
    console.log('data', data.map(item => ({
      value: item.value, // Ensure the value is an integer
      label: item.date.substring(8),
    })));
    
    return data.map(item => ({
      value: item.value, // Ensure the value is an integer
      label: item.date.substring(8),
    }));
    */

    return data.map(item =>
      Number.isFinite(Number(item.value)) ? Math.round(Number(item.value)) : 0,
    );
  };

  const processLabels = data => {
    if (!data) {
      return [];
    }

    return data.map(item => item.date?.substring(8) ?? '-');
  };

 // const screenWidth = Dimensions.get('window').width;


  return (
    <ScrollView
      style={{
        flex: 1,
        marginBottom: 120,
        backgroundColor: ON_PRIMARY_COLOR,
      }}>
      <View style={styles.rowContainer}>
        <Dropdown
          style={styles.dropdown}
          //placeholderStyle={styles.placeholderStyle}
          itemTextStyle={{
            fontSize: 17,
            fontWeight: '700',
          }}
          data={[
            {label: 'Read', value: 0},
            {label: 'Write', value: 1},
          ]}
          labelField="label"
          valueField="value"
          //placeholder={!isFocus ? 'Select your role' : '...'}
          value={userState}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={item => {
            setUserState(item.value);
            setIsFocus(false);
          }}
          placeholder={undefined}
        />

        <Text style={styles.btnText}>
          {moment(new Date()).format('DD MMM, YYYY')}
        </Text>
      </View>

      <View style={styles.rowContainer}>
        {/**
         *
         *  <Dropdown
          style={{
            ...styles.button,
            backgroundColor: selectedDay === -1 ? '#c1c1c1' : PRIMARY_COLOR,
          }}
          //placeholderStyle={styles.placeholderStyle}
          data={dailyDrops}
          labelField="label"
          valueField="value"
          //placeholder={!isFocus ? 'Select your role' : '...'}
          value={selectedDay}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={item => {
            setSelectedDay(item.value);
            setSelectedMonth(-1);
            setSelectedYear(-1);
            setIsFocus(false);
          }}
          placeholder={'Daily'}
        />
         */}

        <Dropdown
          style={{
            ...styles.button,
            backgroundColor: selectedMonth === -1 ? '#c1c1c1' : PRIMARY_COLOR,
          }}
          //placeholderStyle={styles.placeholderStyle}

          data={monthlyDrops}
          labelField="label"
          valueField="value"
          //placeholder={!isFocus ? 'Select your role' : '...'}
          itemTextStyle={{
            fontSize: 14,
          }}
          value={selectedMonth}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={item => {
            setSelectedMonth(item.value);
            // setSelectedDay(-1);
            setSelectedYear(-1);
            setIsFocus(false);
            //if (userState === 0) {
            // refetchMonthReadReport();
            //} else {
            refetchMonthWriteReport();
            // }
          }}
          placeholder={'Monthly'}
        />
        <Dropdown
          style={{
            ...styles.button,
            backgroundColor: selectedYear === -1 ? '#c1c1c1' : PRIMARY_COLOR,
          }}
          //placeholderStyle={styles.placeholderStyle}
          //placeholderStyle={styles.placeholderStyle}
          data={yearlyDrops}
          labelField="label"
          valueField="value"
          //placeholder={!isFocus ? 'Select your role' : '...'}
          value={selectedYear}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={item => {
            setSelectedYear(item.value);
            // setSelectedDay(-1);
            setSelectedMonth(-1);
            setIsFocus(false);

            // if (userState === 0) {
            //  refetchYearlyReadReport();
            // } else {
            // refetchYearlyWriteReport();
            // }
          }}
          placeholder={'Yearly'}
        />
      </View>

      {/**
       *   {selectedDay !== -1 && (
        <View style={{marginTop: 10}}>
          <LineChart data={chartData} areaChart />
        </View>
      )}
       */}

      {selectedMonth !== -1 && (
        <ScrollView horizontal>
          <LineChart
            data={{
              labels:
                userState === 0
                  ? processLabels(monthlyReadReport)
                  : processLabels(monthlyWriteReport),

              datasets: [
                {
                  data:
                    userState === 0
                      ? processData(monthlyReadReport)
                      : processData(monthlyWriteReport),
                  strokeWidth: 1,
                  color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                },
              ],
            }}
            width={Math.max(
              (userState === 0
                ? monthlyReadReport? monthlyReadReport?.length : 0
                : monthlyWriteReport? monthlyWriteReport?.length : 0) * 40,
              300,
            )} // Fallback width
            height={350}
            chartConfig={{
              backgroundGradientFrom: ON_PRIMARY_COLOR,
              backgroundGradientTo: ON_PRIMARY_COLOR,
              color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
              labelColor: () => '#999',
              formatYLabel: y => parseInt(y).toString(),
              propsForDots: {
                r: '3',
                strokeWidth: '2',
                stroke: PRIMARY_COLOR,
              },
            }}
            bezier
            withInnerLines={false}
            style={{
              marginVertical: 2,
              borderRadius: 12,
            }}
          />
        </ScrollView>
      )}

      {selectedYear !== -1 && (
        <ScrollView horizontal>
          <LineChart
            data={{
              labels:
                userState === 0
                  ? processLabels(yearlyReadReport)
                  : processLabels(yearlyWriteReport),

              datasets: [
                {
                  data:
                    userState === 0
                      ? processData(yearlyReadReport)
                      : processData(yearlyWriteReport),
                  strokeWidth: 1,
                  color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                },
              ],
            }}
            width={Math.max(
              (userState === 0
                ? yearlyReadReport? yearlyReadReport?.length : 0
                : yearlyWriteReport? yearlyWriteReport?.length : 0) * 40,
              300,
            )} // Fallback width
            height={350}
            chartConfig={{
              backgroundGradientFrom: ON_PRIMARY_COLOR,
              backgroundGradientTo: ON_PRIMARY_COLOR,
              color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
              labelColor: () => '#999',
              formatYLabel: y => parseInt(y).toString(),
              propsForDots: {
                r: '3',
                strokeWidth: '2',
                stroke: PRIMARY_COLOR,
              },
            }}
            bezier
            withInnerLines={false}
            style={{
              marginVertical: 2,
              borderRadius: 12,
            }}
          />
        </ScrollView>
      )}

      {
        /**
         * <View style={{marginTop: 10}}>
          <LineChart
            data={
              userState === 0
                ? yearlyReadReport?.map(item => ({
                    value: item.value,
                    label: moment(item.month).format('MMM'),
                  }))
                : yearlyWriteReport?.map(item => ({
                    value: item.value,
                    label: moment(item.month).format('MMM'),
                  }))
            }
            // isAnimated={true}
            // animationDuration={500}
            minYValue={0}
            // minXValue={0}
            areaChart
          />
        </View>
         */
      }

      {/**
         *
         * <Image
        source={{
          uri: 'https://i.ibb.co/T2WNVJZ/Whats-App-Image-2024-07-14-at-12-46-02-AM-1.jpg',
        }}
        style={{width: '95%', height: 600, resizeMode: 'contain'}}
      />
         */}

      <View
        style={{
          height: 0.8,
          width: '96%',
          margin: 10,
          backgroundColor: '#c1c1c1',
        }}
      />

      {/**
       * 
       *  <View style={styles.box}>
          <Text style={styles.titleText}> Total Reads</Text>

          <Text style={styles.valueText}>{readStat?.progress}%</Text>

          <Progress.Bar
            progress={readStat?.progress ? readStat?.progress : 0}
            width={140}
            borderColor={PRIMARY_COLOR}
            borderWidth={1}
            color={
              readStat?.progress
                ? readStat?.progress < 0.4
                  ? colorList[0]
                  : readStat?.progress < 0.8
                  ? colorList[1]
                  : colorList[2]
                : 'black'
            }
            borderRadius={4}
            style={{marginTop: 2}}
          />
        </View>
       *    <View style={styles.box}>
          <Text style={styles.titleText}> Total Writes</Text>

          <Text style={styles.valueText}>{writeStat?.progress}%</Text>

          <Progress.Bar
            progress={writeStat?.progress ? writeStat?.progress : 0}
            width={140}
            borderColor={PRIMARY_COLOR}
            borderWidth={1}
            color={
              writeStat?.progress
                ? writeStat?.progress < 0.4
                  ? colorList[0]
                  : writeStat?.progress < 0.8
                  ? colorList[1]
                  : colorList[2]
                : 'black'
            }
            borderRadius={4}
            style={{marginTop: 4}}
          />
        </View>

        <View style={styles.box}>
          <Text style={styles.titleText}> Total Likes</Text>
          <Text style={{...styles.valueText, marginStart: 8}}>
            {likeViewStat?.likeProgress}%
          </Text>

          <Progress.Bar
            progress={
              likeViewStat?.likeProgress ? likeViewStat?.likeProgress : 0
            }
            width={140}
            borderColor={PRIMARY_COLOR}
            borderWidth={1}
            color={
              likeViewStat?.likeProgress
                ? likeViewStat?.likeProgress < 0.4
                  ? colorList[0]
                  : likeViewStat?.likeProgress < 0.8
                  ? colorList[1]
                  : colorList[2]
                : 'black'
            }
            borderRadius={4}
            style={{marginTop: 4}}
          />
        </View>

        <View style={styles.box}>
          <Text style={styles.titleText}> Total Views</Text>

          <Text style={{...styles.valueText, marginStart: 1}}>
            {likeViewStat?.viewProgress}%
          </Text>

          <Progress.Bar
            progress={
              likeViewStat?.viewProgress ? likeViewStat.viewProgress : 0
            }
            width={140}
            borderColor={PRIMARY_COLOR}
            borderWidth={1}
            color={
              likeViewStat?.viewProgress
                ? likeViewStat?.viewProgress < 0.4
                  ? colorList[0]
                  : likeViewStat?.viewProgress < 0.8
                  ? colorList[1]
                  : colorList[2]
                : 'black'
            }
            borderRadius={4}
            style={{marginTop: 4}}
          />
        </View>
      </View>

      <View
        style={{
          height: 0.8,
          width: '96%',
          margin: 10,
          backgroundColor: '#c1c1c1',
        }}
      />
       */}

      {others && (
        <>
          <Text
            style={{
              ...styles.btnText,
              marginVertical: 10,
              fontWeight: '700',
              fontSize: 17,
              marginStart: 10,
            }}>
            Most viewed articles
          </Text>
          {article &&
            article.map((item, index) => {
              return (
                <Pressable
                  key={index}
                  onPress={() => {
                    onArticleViewed({
                      articleId: Number(item._id),
                      authorId: item.authorId ?? '',
                      recordId: item.pb_recordId,
                    });
                  }}>
                  <View style={styles.cardContainer}>
                    {item?.imageUtils[0] && item?.imageUtils[0].length !== 0 ? (
                      <Image
                        source={{
                          uri: item?.imageUtils[0].startsWith('http')
                            ? item?.imageUtils[0]
                            : `${GET_IMAGE}/${item?.imageUtils[0]}`,
                        }}
                        style={styles.image}
                      />
                    ) : (
                      <Image
                        source={require('../assets/article_default.jpg')}
                        style={styles.image}
                      />
                    )}

                    <View style={styles.textContainer}>
                      <Text style={styles.footerText}>
                        {item?.tags.map(tag => tag.name).join(' | ')}
                      </Text>
                      <Text style={styles.title}>{item?.title}</Text>

                      <Text style={{...styles.footerText, marginBottom: 3}}>
                        {item?.viewUsers
                          ? item?.viewUsers.length > 1
                            ? `${formatCount(item?.viewUsers.length)} views`
                            : `${item?.viewUsers.length} view`
                          : '0 view'}
                      </Text>
                      <Text style={styles.footerText}>
                        Last updated: {''}
                        {moment(new Date(item?.lastUpdated)).format(
                          'DD/MM/YYYY',
                        )}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    flex: 0,
    width: '100%',
    flexDirection: 'row',
    padding: 6,
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  colContainer: {
    flex: 0,
    width: '100%',
    flexDirection: 'column',
    padding: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  box: {
    width: '95%',
    // height: 120,
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 4,
    //borderWidth: 1,
    padding: 3,
    borderColor: 'black',
    borderRadius: 8,
    //flexDirection: 'column',
  },

  titleText: {
    fontSize: 16,
    color: 'black',
    marginVertical: 4,
    fontWeight: '600',
  },

  valueText: {
    fontSize: 17,
    color: PRIMARY_COLOR,
    marginVertical: 4,
    fontWeight: '700',
  },

  dropdown: {
    height: 30,
    width: '35%',
    borderColor: '#c1c1c1',
    borderWidth: 0.4,
    borderRadius: 5,
    paddingHorizontal: 6,
    marginVertical: 3,
    paddingRight: 2,
    marginStart: 4,
  },

  button: {
    width: '40%',
    padding: 6,
    borderRadius: 8,
    margin: 2,
    marginTop: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#c1c1c1',
    borderColor: 'black',
  },
  btnText: {
    fontSize: 16,
    color: 'black',
  },
  cardContainer: {
    flex: 0,
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
