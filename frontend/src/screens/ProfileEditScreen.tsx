import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import React, {useState} from 'react';
import {PRIMARY_COLOR} from '../helper/Theme';
import {hp} from '../helper/Metric';
import GeneralTab from '../components/GeneralTab';
import ContactTab from '../components/ContactTab';
import ProfessionalTab from '../components/ProfessionalTab';
import PasswordTab from '../components/PasswordTab';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const ProfileEditScreen = () => {
  // Get safe area insets for handling notches and status bars on device
  const insets = useSafeAreaInsets();

  // Define the tabs available in the profile edit screen
  const tabs: string[] = ['General', 'Professional', 'Contact', 'Password'];

  // State to keep track of the currently selected tab
  const [currentTab, setcurrentTab] = useState<string>(tabs[0]);

  // Boolean to check if the user is a doctor
  const isDoctor = true;

  // Function to handle tab selection
  const handleTab = (tab: string) => {
    setcurrentTab(tab);
  };

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <ScrollView
        style={styles.container}
        contentInsetAdjustmentBehavior="always"
        contentContainerStyle={[
          styles.contentContainer,
          {paddingBottom: insets.bottom},
        ]}>
        {/* Horizontal scroll view for the tabs */}
        <ScrollView
          horizontal={true}
          style={styles.horizontalScroll}
          contentContainerStyle={styles.horizontalScrollContent}
          showsHorizontalScrollIndicator={false}>
          {tabs.map((tab: string) => {
            if (isDoctor || tab !== 'Professional') {
              return (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.tabButton,
                    currentTab === tab && styles.activeTabButton,
                  ]}
                  onPress={() => {
                    handleTab(tab);
                  }}>
                  <Text
                    style={[
                      styles.tabText,
                      currentTab === tab && styles.activeTabText,
                    ]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            }
          })}
        </ScrollView>

        {/* Content of the selected tab */}
        <View style={styles.tabContent}>
          {currentTab === 'General' && (
            <GeneralTab
              username="joe"
              userhandle="userhandle"
              email="abc@gmail.com"
              about="hello i m joe doe"
              imgUrl="https://miro.medium.com/v2/resize:fit:1400/0*0fClPmIScV5pTLoE.jpg"
            />
          )}
          {currentTab === 'Professional' && (
            <ProfessionalTab
              specialization="Cardiology"
              qualification="MD"
              years_of_experience="10"
            />
          )}
          {currentTab === 'Contact' && (
            <ContactTab
              phone_number="1234567890"
              contact_email="abc@gmail.com"
            />
          )}
          {currentTab === 'Password' && <PasswordTab />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 16,
  },
  contentContainer: {
    paddingBottom: 0, // Will be adjusted dynamically based on insets
  },
  horizontalScroll: {
    marginTop: 10,
  },
  horizontalScrollContent: {
    columnGap: 2, // Space between tabs
  },
  tabButton: {
    paddingHorizontal: 18,
    borderRadius: 100,
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  activeTabButton: {
    backgroundColor: PRIMARY_COLOR, // Highlight the active tab
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500', // Font weight '500' for normal tabs
    color: '#B1B2B2',
  },
  activeTabText: {
    fontWeight: 'bold', // Bold font for active tab text
    color: 'white',
  },
  tabContent: {
    marginTop: 25,
    minHeight: Dimensions.get('window').height - hp(25), // Ensure content takes full screen height
  },
});

export default ProfileEditScreen;
