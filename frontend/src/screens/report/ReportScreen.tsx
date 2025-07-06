import React, {useState} from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {ReportReason, ReportScreenProp} from '../../type';
import {useSelector} from 'react-redux';
import axios from 'axios';
import {GET_REPORT_REASONS, SUBMIT_REPORT} from '../../helper/APIUtils';
import Loader from '../../components/Loader';
import {useMutation, useQuery} from '@tanstack/react-query';
import {RadioButton} from 'react-native-paper';
import Snackbar from 'react-native-snackbar';
import {hp, wp} from '../../helper/Metric';
import {PRIMARY_COLOR} from '../../helper/Theme';

export default function ReportScreen({navigation, route}: ReportScreenProp) {
  const {articleId, commentId, authorId, podcastId} = route.params;
  const {user_token, user_id} = useSelector((state: any) => state.user);
  const [selectedReasonId, setSelectedReasonId] = useState<String>('');

  const {data: reasons, isLoading} = useQuery({
    queryKey: ['get-report-reasons'],
    queryFn: async () => {
      try {
        if (user_token === '') {
          Alert.alert('No token found');
          return [];
        }

        const response = await axios.get(GET_REPORT_REASONS, {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        });

        return response.data as ReportReason[];
      } catch (err) {
        console.error('Error fetching Report Reasons:', err);
      }
    },
  });

  //console.log(reasons[0].reason)
  const submitReportMutation = useMutation({
    mutationKey: ['submit-report'],
    mutationFn: async () => {
      if (user_token === '') {
        Alert.alert('No token found');
        return;
      }

      const res = await axios.post(
        SUBMIT_REPORT,
        {
          articleId: podcastId? null: articleId,
          podcastId: podcastId,
          commentId: commentId,
          reportedBy: user_id,
          reasonId: selectedReasonId,
          authorId: authorId,
        },
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        },
      );

      return res.data as any;
    },
    onSuccess: () => {
      Snackbar.show({
        text: 'Report submitted',
        duration: Snackbar.LENGTH_SHORT,
      });

      navigation.navigate('ReportConfirmationScreen');
    },

    onError: error => {
      // console.log('Update View Count Error', error);
      Alert.alert('Internal server error, try again!');
    },
  });

  if (isLoading) {
    return <Loader />;
  }
  return (
    <ScrollView style={{backgroundColor: 'white'}}>
      <View style={styles.container}>
        <Text style={styles.header}>What's going on?</Text>
        <Text style={styles.text}>
          We will check for all Community Guidelines, so don't worry about
          making a perfect choice.
        </Text>

        {reasons?.map((reason, index) => (
          <View key={index} style={styles.optionContainer}>
            <RadioButton
              value={reason.reason}
              status={selectedReasonId === reason._id ? 'checked' : 'unchecked'}
              onPress={() => setSelectedReasonId(reason._id)}
              color="#000" // Custom color for the radio button
            />
            <Text style={styles.optionText}>{reason.reason}</Text>
          </View>
        ))}

        {selectedReasonId !== '' && (
          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => {
              if (selectedReasonId.length === 0) {
                Alert.alert('Please select a reason');
                return;
              } else {
                Alert.alert(
                  'Alert',
                  'Are you sure you want to report on this author?',
                  [
                    {
                      text: 'Cancel',
                      onPress: () => console.log('Cancel Pressed'),
                      style: 'cancel',
                    },
                    {
                      text: 'OK',
                      onPress: () => {
                        submitReportMutation.mutate();
                      },
                    },
                  ],
                  {cancelable: false},
                );
              }
            }}>
            <Text style={styles.btnText}>Submit</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: 18,
  },
  header: {
    fontSize: 18,
    color: 'black',
    fontWeight: '700',
  },
  btnText: {
    fontSize: 18,
    color: 'white',
    fontWeight: '700',
  },

  reportButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(10),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    width: '96%',
  },
  text: {
    fontSize: 16,
    color: '#28282B',
    marginTop: 10,
    fontWeight: '500',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    // elevation: 2,
  },
  optionText: {
    fontSize: 16,
    color: '#333', // Dark text color
    marginLeft: 6, // Space between radio button and text
    fontWeight: '400', // Semi-bold font
  },
});
