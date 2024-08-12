import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import React from 'react';
import Feather from 'react-native-vector-icons/Feather';
import {PRIMARY_COLOR} from '../helper/Theme';
import {ProfileEditGeneralTab} from '../type';

const GeneralTab = ({
  username,
  userhandle,
  email,
  about,
  imgUrl,
}: ProfileEditGeneralTab) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Profile Image Section */}
        <View style={styles.profileImageContainer}>
          <Image
            source={{
              uri: imgUrl,
            }}
            style={styles.profileImage}
          />
          <View style={styles.editIconContainer}>
            <TouchableOpacity style={styles.editIcon}>
              <Feather name="edit-3" color="black" size={25} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Username Input */}
        <View style={styles.input}>
          <Text style={styles.inputLabel}>Username</Text>
          <TextInput
            placeholder="Enter your username"
            placeholderTextColor="#6b7280"
            style={styles.inputControl}
            value={username}
          />
        </View>

        {/* User Handle Input */}
        <View style={styles.input}>
          <Text style={styles.inputLabel}>User handle</Text>
          <TextInput
            placeholder="Enter your userhandle"
            placeholderTextColor="#6b7280"
            style={styles.inputControl}
            value={userhandle}
          />
        </View>

        {/* Email Input */}
        <View style={styles.input}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            placeholder="Enter your email"
            placeholderTextColor="#6b7280"
            style={styles.inputControl}
            value={email}
          />
        </View>

        {/* About Input */}
        <View style={styles.input}>
          <Text style={styles.inputLabel}>About</Text>
          <TextInput
            placeholder="Enter something about yourself..."
            placeholderTextColor="#6b7280"
            textAlignVertical="top"
            style={styles.aboutInput}
            multiline={true}
            numberOfLines={4}
            value={about}
          />
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        onPress={() => {
          // handle onPress
        }}
        style={styles.btn}>
        <Text style={styles.btnText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

export default GeneralTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    height: '100%',
    flexDirection: 'column',
  },
  content: {
    width: '100%',
    flexDirection: 'column',
    gap: 15,
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    height: 130,
    width: 130,
    borderRadius: 100,
  },
  editIconContainer: {
    position: 'absolute',
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 100,
    bottom: 0,
    right: 0,
    overflow: 'hidden',
  },
  editIcon: {
    backgroundColor: '#F2F2F2',
    borderRadius: 100,
    padding: 5,
  },
  input: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
  },
  inputControl: {
    height: 50,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: '500',
    color: '#222',
    borderWidth: 1,
    borderColor: '#C9D3DB',
    borderStyle: 'solid',
  },
  aboutInput: {
    height: 150,
    // justifyContent: 'flex-start',
    // alignItems: 'flex-start',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: '500',
    color: '#222',
    borderWidth: 1,
    borderColor: '#C9D3DB',
    borderStyle: 'solid',
  },
  btn: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: PRIMARY_COLOR,
    marginTop: 20,
  },
  btnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});
