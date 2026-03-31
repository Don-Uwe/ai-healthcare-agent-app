import React, {useState} from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {ReportScreenProp} from '../../type';
import {useSelector} from 'react-redux';
import Loader from '../../components/Loader';
import {RadioButton} from 'react-native-paper';
import Snackbar from 'react-native-snackbar';
import {hp, wp, fp} from '../../helper/Metric';
import {PRIMARY_COLOR} from '../../helper/Theme';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useGetReasons} from '@/src/hooks/useGetReportReasons';
import {useSubmitReport} from '@/src/hooks/useSubmitReport';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function ReportScreen({navigation, route}: ReportScreenProp) {
  const {articleId, commentId, authorId, podcastId} = route.params;
  const {user_token, user_id} = useSelector((state: any) => state.user);
  const {isConnected} = useSelector((state: any) => state.network);
  const [selectedReasonId, setSelectedReasonId] = useState<string>('');

  const {data: reasons, isLoading} = useGetReasons(isConnected);
  const {mutate: submitReport, isPending: submitReportPending} =
    useSubmitReport();


  if (isLoading || submitReportPending) {
    return <Loader />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="shield-alert" size={48} color={PRIMARY_COLOR} />
          </View>
          <Text style={styles.header}>What's going on?</Text>
          <Text style={styles.subHeader}>
            Help us understand the issue. We'll review this report based on our Community Guidelines.
          </Text>
        </View>

        {/* Reasons Section */}
        <View style={styles.reasonsSection}>
          <Text style={styles.sectionTitle}>Select a reason</Text>

          {reasons?.map((reason, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionCard,
                selectedReasonId === reason._id && styles.optionCardSelected,
              ]}
              onPress={() => setSelectedReasonId(reason._id)}
              activeOpacity={0.7}>
              <View style={styles.optionContent}>
                <RadioButton
                  value={reason.reason}
                  status={selectedReasonId === reason._id ? 'checked' : 'unchecked'}
                  onPress={() => setSelectedReasonId(reason._id)}
                  color={PRIMARY_COLOR}
                />
                <Text
                  style={[
                    styles.optionText,
                    selectedReasonId === reason._id && styles.optionTextSelected,
                  ]}>
                  {reason.reason}
                </Text>
              </View>
              {selectedReasonId === reason._id && (
                <Ionicons name="checkmark-circle" size={24} color={PRIMARY_COLOR} />
              )}
            </TouchableOpacity>
          ))}

        </View>

        {/* Offline Warning */}
        {!isConnected && (
          <View style={styles.warningCard}>
            <Ionicons name="warning" size={24} color="#F57F17" />
            <Text style={styles.warningText}>
              Please connect to the internet to submit a report
            </Text>
          </View>
        )}

        {/* Info Section */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color="#666" />
          <Text style={styles.infoText}>
            Your report is anonymous. We won't share your identity with the person you're reporting.
          </Text>
        </View>
      </ScrollView>

      {/* Submit Button */}
      {selectedReasonId !== '' && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              !isConnected && styles.submitButtonDisabled,
            ]}
            disabled={!isConnected}
            onPress={() => {
              if (selectedReasonId.length === 0) {
                Alert.alert('Please select a reason');
                return;
              }

              Alert.alert(
                'Confirm Report',
                'Are you sure you want to report this content? This action cannot be undone.',
                [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                  {
                    text: 'Report',
                    style: 'destructive',
                    onPress: () => {
                        submitReport(
                          {
                            articleId: podcastId ? null : Number(articleId),
                            podcastId: podcastId,
                            commentId: commentId,
                            reportedBy: user_id,
                            reasonId: selectedReasonId,
                            authorId: authorId,
                          },
                          {
                            onSuccess: () => {
                              Snackbar.show({
                                text: 'Report submitted successfully',
                                duration: Snackbar.LENGTH_SHORT,
                              });
                              navigation.navigate('ReportConfirmationScreen');
                            },
                            onError: error => {
                              Alert.alert('Error', 'Something went wrong. Please try again.');
                            },
                          },
                        );
                      },
                    },
                  ],
                  {cancelable: true},
                );
            }}>
            <Text style={styles.submitButtonText}>Submit Report</Text>
            <Ionicons name="arrow-forward" size={20} color="white" style={{marginLeft: 8}} />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(3),
  },
  headerSection: {
    alignItems: 'center',
    paddingVertical: hp(3),
    paddingHorizontal: wp(2),
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${PRIMARY_COLOR}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  header: {
    fontSize: fp(6.5),
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: hp(1),
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  subHeader: {
    fontSize: fp(4),
    fontWeight: '400',
    color: '#666666',
    textAlign: 'center',
    lineHeight: fp(5.5),
    paddingHorizontal: wp(2),
  },
  reasonsSection: {
    marginTop: hp(2),
  },
  sectionTitle: {
    fontSize: fp(4.5),
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: hp(1.5),
    letterSpacing: 0.3,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(4),
    marginBottom: hp(1.2),
    borderWidth: 2,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  optionCardSelected: {
    borderColor: PRIMARY_COLOR,
    backgroundColor: `${PRIMARY_COLOR}08`,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionText: {
    fontSize: fp(4),
    color: '#4A4A4A',
    marginLeft: wp(2),
    fontWeight: '500',
    flex: 1,
    lineHeight: fp(5.5),
  },
  optionTextSelected: {
    color: '#1A1A1A',
    fontWeight: '600',
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9C4',
    borderRadius: 12,
    padding: wp(4),
    marginTop: hp(2),
    borderWidth: 1,
    borderColor: '#FFF59D',
  },
  warningText: {
    fontSize: fp(3.8),
    color: '#F57F17',
    fontWeight: '600',
    marginLeft: wp(3),
    flex: 1,
    lineHeight: fp(5),
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: wp(4),
    marginTop: hp(2),
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  infoText: {
    fontSize: fp(3.5),
    color: '#1976D2',
    marginLeft: wp(3),
    flex: 1,
    lineHeight: fp(5),
    fontWeight: '500',
  },
  buttonContainer: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButton: {
    backgroundColor: PRIMARY_COLOR,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(1.8),
    borderRadius: 16,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontSize: fp(4.5),
    color: 'white',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
