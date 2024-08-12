import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {hp} from '../../helper/Metric';
import {PRIMARY_COLOR} from '../../helper/Theme';
import AntIcon from 'react-native-vector-icons/AntDesign';
import {ContactDetail, UserModel} from '../../models/User';
import {AuthApiService} from '../../services/AuthApiService';
import {SignUpScreenSecondProp} from '../../type';

const SignupPageSecond = ({navigation, route}: SignUpScreenSecondProp) => {
  const user: UserModel = route.params;

  const [specialization, setSpecialization] = useState('');
  const [education, setEducation] = useState('');
  const [experience, setExperience] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [phone, setPhone] = useState('');

  const routes = navigation.getState().routeNames;
  console.log('Routes Names Sign Sec', routes);

  const handleSubmit = () => {
    // Handle signup logic here
    console.log('Specialization:', specialization);
    console.log('Education:', education);
    console.log('Experience:', experience);
    console.log('Business Email:', businessEmail);
    console.log('Phone Number:', phone);

    if (
      !specialization ||
      !education ||
      !experience ||
      !businessEmail ||
      !phone
    ) {
      alert('Please fill in all fields');
      return;
    } else {
      // ISSUE 115:
      // Add Extra all details
      user.specialization = specialization;
      let contactDetails = new ContactDetail();
      contactDetails.phone_no = phone;
      /**
       *
       *  add education, experience, businessEmail, phoneNumber in contactDetails
       *
       *
       */

      registerAsDoctor(user);
    }
    // navigation.navigate('LoginScreen');
  };

  // ISSUE 115:

  const registerAsDoctor = (user: UserModel) => {
    let api = new AuthApiService();
    /*
    api.register(user).then((response:any)=>{

        // Process the response
        if(success)
              navigation.navigate('LoginScreen');

    },er=>{

    })
    */
  };

  useEffect(() => {
    return () => {
      const routes = navigation.getState().routeNames;
      console.log('Routes Names Sign Sec', routes);
    };
  }, []);

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
        style={{flex: 0, backgroundColor: PRIMARY_COLOR}}
        onPress={() => {
          navigation.navigate('LoginScreen');
        }}>
        <AntIcon name="arrowleft" size={35} color="white" />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>...let me congratulate on the</Text>
        <Text style={styles.title}>choice of calling which offers a</Text>
        <Text style={styles.title}>combination of intellectual and</Text>
        <Text style={styles.title}>moral interest found in no other</Text>
        <Text style={styles.title}>profession</Text>
        <Text style={styles.subtitle}> ~ Sir William Olser.</Text>
      </View>
      <View style={styles.footer}>
        <View style={styles.form}>
          <View style={styles.field}>
            <TextInput
              style={styles.input}
              placeholder="What is your Specialization ?"
              onChangeText={setSpecialization}
              value={specialization}
            />
            <View style={styles.inputIcon}>
              <Icon name="business" size={20} color="#000" />
            </View>
          </View>

          <View style={styles.field}>
            <TextInput
              style={styles.input}
              placeholder="Educational Qualification"
              onChangeText={setEducation}
              value={education}
            />
            <View style={styles.inputIcon}>
              <Icon name="school" size={20} color="#000" />
            </View>
          </View>

          <View style={styles.field}>
            <TextInput
              style={styles.input}
              placeholder="Years of Experience"
              onChangeText={setExperience}
              value={experience}
            />
            <View style={styles.inputIcon}>
              <Icon name="numbers" size={20} color="#000" />
            </View>
          </View>

          <View style={styles.field}>
            <TextInput
              style={styles.input}
              placeholder="Professional Email"
              onChangeText={setBusinessEmail}
              value={businessEmail}
            />
            <View style={styles.inputIcon}>
              <Icon name="email" size={20} color="#000" />
            </View>
          </View>

          <View style={styles.field}>
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              onChangeText={setPhone}
              value={phone}
            />
            <View style={styles.inputIcon}>
              <Icon name="phone" size={20} color="#000" />
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    width: '100%',
    height: hp(36),
    paddingTop: 0,
    alignItems: 'center',
    backgroundColor: '#0CAFFF',
  },
  footer: {
    flex: 1,
    width: '90%',
    alignSelf: 'center',
    backgroundColor: 'white',
    marginTop: -50,
    borderRadius: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginTop: 10,
  },
  iconContainer: {
    alignSelf: 'center',
    marginTop: 20,
  },
  form: {
    padding: 20,
    marginTop: 60,
  },
  field: {},
  input: {
    height: 40,
    borderColor: '#0CAFFF',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    fontSize: 15,
  },
  inputIcon: {
    position: 'absolute',
    right: 14,
    top: 12,
  },
  button: {
    backgroundColor: '#0CAFFF',
    padding: 10,
    borderRadius: 40,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20,
    width: '60%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },
});

export default SignupPageSecond;
