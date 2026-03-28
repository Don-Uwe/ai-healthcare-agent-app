import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity, ScrollView} from 'react-native';
import {ReportConfirmationScreenProp} from '../../type';
import {PRIMARY_COLOR} from '../../helper/Theme';
import {hp, wp, fp} from '../../helper/Metric';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function ReportConfirmationScreen({
  navigation,
  route,
}: ReportConfirmationScreenProp) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Success Icon */}
        <View style={styles.successIconContainer}>
          <View style={styles.checkIconWrapper}>
            <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.contentSection}>
          <Text style={styles.mainTitle}>Thanks for helping our community</Text>
          <Text style={styles.mainDescription}>
            Your report helps us protect the community from harmful content and maintain a safe environment for everyone.
          </Text>
        </View>

        {/* Emergency Section */}
        <View style={styles.emergencyCard}>
          <View style={styles.emergencyIconWrapper}>
            <MaterialCommunityIcons name="phone-alert" size={24} color="#D32F2F" />
          </View>
          <View style={styles.emergencyContent}>
            <Text style={styles.emergencyTitle}>Need immediate help?</Text>
            <Text style={styles.emergencyText}>
              If you think someone is in immediate danger, please contact your local law enforcement or emergency services right away.
            </Text>
          </View>
        </View>

        {/* What to Expect Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <MaterialCommunityIcons name="information" size={24} color={PRIMARY_COLOR} />
            <Text style={styles.infoTitle}>What you can expect</Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoBullet}>
              <Ionicons name="shield-checkmark" size={20} color={PRIMARY_COLOR} />
            </View>
            <Text style={styles.infoText}>
              We'll review your report within 24-48 hours based on our Community Guidelines.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoBullet}>
              <Ionicons name="eye-off" size={20} color={PRIMARY_COLOR} />
            </View>
            <Text style={styles.infoText}>
              Your report is confidential. The person you reported won't know it was you.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoBullet}>
              <Ionicons name="ban" size={20} color={PRIMARY_COLOR} />
            </View>
            <Text style={styles.infoText}>
              If we find serious or repeated violations, we may restrict the user's ability to take actions throughout our app.
            </Text>
          </View>
        </View>

        {/* Return Button */}
        <TouchableOpacity
          style={styles.returnButton}
          onPress={() => {
            navigation.navigate('TabNavigation');
          }}>
          <Text style={styles.returnButtonText}>Return to Home</Text>
          <Ionicons name="home" size={20} color="white" style={{marginLeft: 8}} />
        </TouchableOpacity>
      </ScrollView>
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
    paddingHorizontal: wp(5),
    paddingTop: hp(4),
    paddingBottom: hp(3),
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: hp(3),
  },
  checkIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  contentSection: {
    alignItems: 'center',
    marginBottom: hp(3),
  },
  mainTitle: {
    fontSize: fp(6.5),
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: hp(1.5),
    letterSpacing: 0.3,
  },
  mainDescription: {
    fontSize: fp(4),
    fontWeight: '400',
    color: '#666666',
    textAlign: 'center',
    lineHeight: fp(5.5),
    paddingHorizontal: wp(2),
  },
  emergencyCard: {
    flexDirection: 'row',
    backgroundColor: '#FFEBEE',
    borderRadius: 16,
    padding: wp(4),
    marginBottom: hp(3),
    borderWidth: 1,
    borderColor: '#FFCDD2',
    shadowColor: '#D32F2F',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emergencyIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  emergencyContent: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: fp(4.2),
    fontWeight: '700',
    color: '#D32F2F',
    marginBottom: hp(0.5),
    letterSpacing: 0.3,
  },
  emergencyText: {
    fontSize: fp(3.5),
    fontWeight: '400',
    color: '#C62828',
    lineHeight: fp(5),
  },
  infoSection: {
    marginBottom: hp(3),
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  infoTitle: {
    fontSize: fp(5),
    fontWeight: '700',
    color: '#1A1A1A',
    marginLeft: wp(2),
    letterSpacing: 0.3,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: wp(4),
    marginBottom: hp(1.5),
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoBullet: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${PRIMARY_COLOR}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  infoText: {
    flex: 1,
    fontSize: fp(3.8),
    fontWeight: '400',
    color: '#4A4A4A',
    lineHeight: fp(5.2),
  },
  returnButton: {
    backgroundColor: PRIMARY_COLOR,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(1.8),
    borderRadius: 16,
    marginTop: hp(2),
    shadowColor: PRIMARY_COLOR,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  returnButtonText: {
    fontSize: fp(4.5),
    color: 'white',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
