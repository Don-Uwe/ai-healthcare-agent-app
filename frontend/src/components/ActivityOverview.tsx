import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {PRIMARY_COLOR} from '../helper/Theme';
import * as Progress from 'react-native-progress';
import {Dropdown} from 'react-native-element-dropdown';
import {LineChart} from 'react-native-gifted-charts';
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

interface Props {
  onArticleViewed: ({
    articleId,
    authorId,
  }: {
    articleId: number;
    authorId: string;
  }) => void;
  userId?: string;
  others: boolean;
  articlePosted: number;
}
const ActivityOverview = ({
  onArticleViewed,
  userId,
  others,
  articlePosted,
}: Props) => {
  const [userState, setUserState] = useState<number>(0);
  const {user_token, user_id} = useSelector((state: any) => state.user);
  const [isFocus, setIsFocus] = useState<boolean>(false);
  // const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth(),
  );
  const [selectedYear, setSelectedYear] = useState<number>(-1);

  const dailyDrops = [
    {label: 'Daily', value: -1},
    {label: 'Sunday', value: 0},
    {label: 'Monday', value: 1},
    {label: 'Tuesday', value: 2},
    {label: 'Wednesday', value: 3},
    {label: 'Thursday', value: 4},
    {label: 'Friday', value: 5},
    {label: 'Saturday', value: 6},
  ];

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
    isLoading: isMonthReadReportLoading,
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
        console.log('URL', url);
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

  // GET MONTHLY WRITE REPORT

  //let url = others
  // ? `${GET_MONTHLY_WRITES_REPORT}${userId}?month=${selectedMonth}`
  // : `${GET_MONTHLY_WRITES_REPORT}${user_id}?month=${selectedMonth}`;
  //console.log('URL', url);
  // console.log('USER TOKEN', user_token)

  const {
    data: monthlyWriteReport,
    isLoading: isMonthWriteReportLoading,
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
        console.log('URL', url);
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
    isLoading: isYearlyReadReportLoading,
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
    isLoading: isYearlyWriteReportLoading,
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
    refetch: refetchArticles,
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
    data: likeViewStat,
    isLoading: likeViewStatDataLoading,
    refetch: refetchLikeViewStat,
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
        console.log('Like View Data', response.data);

        return response.data as UserStatus;
      } catch (err) {
        console.error('Error fetching articles:', err);
      }
    },
  });

  // GET TOTAL READ STATUS

  const {
    data: readStat,
    isLoading: readStatDataLoading,
    refetch: refetchLikeReadStat,
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
        console.log('READ Data', response.data);

        return response.data as ReadStatus;
      } catch (err) {
        console.error('Error fetching articles:', err);
      }
    },
  });

  // GET TOTAL WRITE STATUS

  const {
    data: writeStat,
    isLoading: writeStatDataLoading,
    refetch: refetchWriteStat,
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
        console.log('Write Data', response.data);

        return response.data as WriteStatus;
      } catch (err) {
        console.error('Error fetching articles:', err);
      }
    },
  });

  const colorList = ['black', 'green', PRIMARY_COLOR];

  useEffect(() => {
    if (userState === 0) {
      refetchMonthReadReport();
    } else {
      refetchMonthWriteReport();
    }
  }, [selectedMonth, userState]);

  useEffect(() => {
    // This will run when selectedMonth changes
    if (userState === 0) {
      refetchYearlyReadReport();
    } else {
      refetchYearlyWriteReport();
    }
  }, [selectedYear, userState]);

  if (
    isArticleLoading ||
    likeViewStatDataLoading ||
    writeStatDataLoading ||
    readStatDataLoading
  ) {
    <Loader />;
  }

  return (
    <ScrollView
      style={{
        flex: 1,
        marginBottom: 120,
        backgroundColor: 'white',
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
          placeholder={null}
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
        <View style={{marginTop: 10}}>
          <LineChart
            data={
              userState === 0
                ? monthlyReadReport?.map(item => ({
                    value: item.value,
                    label: item.date.substring(8),
                  }))
                : monthlyWriteReport?.map(item => ({
                    value: item.value,
                    label: item.date.substring(8),
                  }))
            }
            minYValue={0}
            minXValue={0}
            // yAxisLabel="Reads"
            // xAxisLabel="Date"
            // isAnimated={true}
            // animationDuration={500}
            //tooltipTextStyle={{color: 'white'}}
            //tooltipBackgroundColor="#2980b9"
            // tooltipStyle={{borderRadius: 5}}
            areaChart
          />
        </View>
      )}
      {selectedYear !== -1 && (
        <View style={{marginTop: 10}}>
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
            minXValue={0}
            areaChart
          />
        </View>
      )}

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

      <View style={styles.colContainer}>
        <View style={styles.box}>
          <Text style={styles.titleText}> Total Reads</Text>
        
            <Text style={styles.valueText}>{readStat?.totalReads}</Text>
         

          <Progress.Bar
            progress={readStat?.progress ? readStat?.progress : 0}
            width={140}
            color={
              readStat?.progress
                ? readStat?.progress < 0.4
                  ? colorList[0]
                  : readStat?.progress < 0.8
                  ? colorList[1]
                  : colorList[2]
                : 'black'
            }
            borderRadius={0}
            style={{marginTop: 2}}
          />
        </View>

        <View style={styles.box}>
          <Text style={styles.titleText}> Total Writes</Text>

            <Text style={styles.valueText}>{articlePosted}</Text>
          

          <Progress.Bar
            progress={writeStat?.progress ? writeStat?.progress : 0}
            width={140}
            color={
              writeStat?.progress
                ? writeStat?.progress < 0.4
                  ? colorList[0]
                  : writeStat?.progress < 0.8
                  ? colorList[1]
                  : colorList[2]
                : 'black'
            }
            borderRadius={0}
            style={{marginTop: 4}}
          />
        </View>

        <View style={styles.box}>
          <Text style={styles.titleText}> Total Likes</Text>

         
            <Text style={{...styles.valueText, marginStart: 8,}}>{likeViewStat?.totalLikes}</Text>
        

          <Progress.Bar
            progress={
              likeViewStat?.likeProgress ? likeViewStat?.likeProgress : 0
            }
            width={140}
            color={
              likeViewStat?.likeProgress
                ? likeViewStat?.likeProgress < 0.4
                  ? colorList[0]
                  : likeViewStat?.likeProgress < 0.8
                  ? colorList[1]
                  : colorList[2]
                : 'black'
            }
            borderRadius={0}
            style={{marginTop: 4}}
          />
        </View>

        <View style={styles.box}>
          <Text style={styles.titleText}> Total Views</Text>

        
            <Text style={{...styles.valueText, marginStart:4}}>{likeViewStat?.totalViews}</Text>
      

          <Progress.Bar
            progress={
              likeViewStat?.viewProgress ? likeViewStat.viewProgress : 0
            }
            width={140}
            color={
              likeViewStat?.viewProgress
                ? likeViewStat?.viewProgress < 0.4
                  ? colorList[0]
                  : likeViewStat?.viewProgress < 0.8
                  ? colorList[1]
                  : colorList[2]
                : 'black'
            }
            borderRadius={0}
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
                  authorId: item.authorId,
                });
              }}>
              <View style={styles.cardContainer}>
                {/* image */}

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
                  {/* title */}
                  <Text style={styles.footerText}>
                    {item?.tags.map(tag => tag.name).join(' | ')}
                  </Text>
                  <Text style={styles.title}>{item?.title}</Text>
                  {/* description */}
                  {/**  <Text style={styles.description}>{item?.description}</Text> */}
                  {/* displaying the categories, author name, and last updated date */}

                  <Text style={{...styles.footerText, marginBottom: 3}}>
                    {item?.viewUsers
                      ? item?.viewUsers.length > 1
                        ? `${item?.viewUsers.length} views`
                        : `${item?.viewUsers.length} view`
                      : '0 view'}
                  </Text>
                  <Text style={styles.footerText}>
                    Last updated: {''}
                    {moment(new Date(item?.lastUpdated)).format('DD/MM/YYYY')}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}
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
    fontSize: 20,
    color: '#c1c1c1',
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
