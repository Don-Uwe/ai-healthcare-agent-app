/* eslint-disable no-alert */
import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Dropdown} from 'react-native-element-dropdown';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {hp} from '../../helper/Metric';
import AntIcon from 'react-native-vector-icons/AntDesign';
import {PRIMARY_COLOR} from '../../helper/Theme';
import {UserModel} from '../../models/User';
import {AuthApiService} from '../../services/AuthApiService';
import {SignUpScreenFirstProp} from '../../type';
var validator = require('email-validator');

const SignupPageFirst = ({navigation}: SignUpScreenFirstProp) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');

  const [isFocus, setIsFocus] = useState(false);
  const [isSecureEntry, setIsSecureEntry] = useState(true);

  const routes = navigation.getState().routeNames;

  console.log('Routes Signup: ', routes);

  const handleSubmit = () => {
    console.log('Name:', name);
    console.log('Username:', username);
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Role:', role);
    if (!name || !username || !email || !password || !role) {
      alert('Please fill in all fields');
      return;
    } else if (validator.validate(email) === false) {
      alert('Email id is not valid');
      return;
    } else if (password.length < 6) {
      alert('Password must be at least of 6 length');
      return;
    }

    let user = new UserModel();
    user.user_name = name;
    user.user_handle = username;
    user.email = email;
    user.password = password;
    user.isDoctor = false;

    if (role === 'general') {
      registerAsGeneralUser(user);
    } else {
      user.isDoctor = true;
      navigation.navigate('SignUpScreenSecond', {
        user: UserModel,
      });
    }
  };

  // ISSUE 115:

  const registerAsGeneralUser = (user: UserModel) => {
    let api = new AuthApiService();
    /*
    api.register(user).then((response:any)=>{

        // Process the response

    },er=>{

    })
    */
  };
  const data = [
    {label: 'General User', value: 'general'},
    {label: 'Doctor', value: 'doctor'},
  ];

  useEffect(() => {
    return () => {
      const routes = navigation.getState().routeNames;
      console.log('Routes Names Sign Sec', routes);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={{flex: 0, backgroundColor: PRIMARY_COLOR}}
        onPress={() => {
          navigation.navigate('LoginScreen');
        }}>
        <AntIcon name="arrowleft" size={30} color="white" />
      </TouchableOpacity>
      <View style={styles.header}>
        <Text style={styles.title}>He who has health has hope and he</Text>
        <Text style={styles.title}>who has hope has everything.</Text>
        <Text style={styles.subtitle}> ~ Arabian Proverb.</Text>
      </View>

      <View style={styles.footer}>
        <ScrollView>
          <View style={styles.iconContainer}>
            <Icon name="person-add" size={70} color="#0CAFFF" />
          </View>
          <View style={styles.form}>
            <View style={styles.field}>
              <TextInput
                style={styles.input}
                placeholder="Name"
                onChangeText={setName}
                value={name}
              />
              <View style={styles.inputIcon}>
                <Icon name="person" size={20} color="#000" />
              </View>
            </View>

            <View style={styles.field}>
              <TextInput
                style={styles.input}
                placeholder="User Handle"
                onChangeText={setUsername}
                value={username}
              />
              <View style={styles.inputIcon}>
                <Icon name="person" size={20} color="#000" />
              </View>
            </View>

            <View style={styles.field}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                onChangeText={setEmail}
                value={email}
                keyboardType="email-address"
              />
              <View style={styles.inputIcon}>
                <Icon name="email" size={20} color="#000" />
              </View>
            </View>

            <View style={styles.field}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                onChangeText={setPassword}
                value={password}
                secureTextEntry={isSecureEntry}
              />
              <TouchableOpacity
                style={styles.inputIcon}
                onPress={() => setIsSecureEntry(!isSecureEntry)}>
                <AntDesign
                  name={isSecureEntry ? 'eyeo' : 'eye'}
                  size={20}
                  color="#000"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.field}>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                data={data}
                labelField="label"
                valueField="value"
                placeholder={!isFocus ? 'Select your role' : '...'}
                value={role}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                  setRole(item.value);
                  setIsFocus(false);
                }}
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>
                {role === 'general' ? 'Register' : 'Continue'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    width: '100%',
    height: hp(25),
    paddingTop: 20,
    alignItems: 'center',
    backgroundColor: '#0CAFFF',
  },
  footer: {
    flex: 1,
    width: '90%',
    paddingTop: 20,
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
  },
  field: {},
  input: {
    height: 40,
    borderColor: '#0CAFFF',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
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
  dropdown: {
    height: 40,
    borderColor: '#0CAFFF',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    paddingRight: 12,
  },
  placeholderStyle: {
    fontSize: 15,
  },
});

export default SignupPageFirst;
