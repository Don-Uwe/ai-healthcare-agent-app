import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import {PRIMARY_COLOR} from '../helper/Theme';
import {ProfileEditProfessionalTab} from '../type';

const ProfessionalTab = ({
  specialization,
  qualification,
  years_of_experience,
}: ProfileEditProfessionalTab) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Specialization Input */}
        <View style={styles.input}>
          <Text style={styles.inputLabel}>Specialization</Text>
          <TextInput
            placeholder="Enter your specialization"
            placeholderTextColor="#6b7280"
            style={styles.inputControl}
            value={specialization}
          />
        </View>

        {/* Qualification Input */}
        <View style={styles.input}>
          <Text style={styles.inputLabel}>Qualification</Text>
          <TextInput
            placeholder="Enter your qualification"
            placeholderTextColor="#6b7280"
            style={styles.inputControl}
            value={qualification}
          />
        </View>

        {/* Years of Experience Input */}
        <View style={styles.input}>
          <Text style={styles.inputLabel}>Years of Experience</Text>
          <TextInput
            placeholder="Enter your years of experience"
            placeholderTextColor="#6b7280"
            style={styles.inputControl}
            keyboardType="decimal-pad"
            value={years_of_experience}
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

export default ProfessionalTab;

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
