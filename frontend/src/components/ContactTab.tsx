import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import {PRIMARY_COLOR} from '../helper/Theme';
import {ProfileEditContactTab} from '../type';

const ContactTab = ({phone_number, contact_email}: ProfileEditContactTab) => {
  return (
    <View style={styles.container}>
      {/* Content Container */}
      <View style={styles.content}>
        {/* Phone Number Input */}
        <View style={styles.input}>
          <Text style={styles.inputLabel}>Phone Number</Text>
          <TextInput
            clearButtonMode="while-editing"
            placeholder="Enter your contact phone number"
            placeholderTextColor="#6b7280"
            style={styles.inputControl}
            value={phone_number}
            keyboardType="number-pad"
          />
        </View>

        {/* Contact Email Input */}
        <View style={styles.input}>
          <Text style={styles.inputLabel}>Contact Email</Text>
          <TextInput
            clearButtonMode="while-editing"
            placeholder="Enter your contact email"
            placeholderTextColor="#6b7280"
            style={styles.inputControl}
            value={contact_email}
            keyboardType="email-address"
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

export default ContactTab;

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
