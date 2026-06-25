import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect} from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {PRIMARY_COLOR} from '../helper/Theme';
import { profSchema, ProfFormData } from '../schemas/profileSchemas';

export interface ProfileEditProfessionalTab {
  user: any;
  handleSubmitProfessionalDetails: (data: ProfFormData) => void;
}

const ProfessionalTab = ({
  user,
  handleSubmitProfessionalDetails,
}: ProfileEditProfessionalTab) => {
  const { control, handleSubmit, reset } = useForm<ProfFormData>({
    resolver: zodResolver(profSchema),
    mode: 'onChange',
    defaultValues: {
      specialization: user?.specialization || '',
      qualification: user?.qualification || '',
      experience: user?.Years_of_experience ? user.Years_of_experience.toString() : '',
    }
  });

  useEffect(() => {
    reset({
      specialization: user?.specialization || '',
      qualification: user?.qualification || '',
      experience: user?.Years_of_experience ? user.Years_of_experience.toString() : '',
    });
  }, [user, reset]);
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Specialization Input */}
        <View style={styles.input}>
          <Text style={styles.inputLabel}>Specialization</Text>
          <Controller
            control={control}
            name="specialization"
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <>
                <TextInput
                  placeholder="Enter your specialization"
                  placeholderTextColor="#6b7280"
                  style={[styles.inputControl, error && { borderColor: 'red' }]}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="words"
                />
                {error && <Text style={styles.errorText}>{error.message}</Text>}
              </>
            )}
          />
        </View>

        {/* Qualification Input */}
        <View style={styles.input}>
          <Text style={styles.inputLabel}>Qualification</Text>
          <Controller
            control={control}
            name="qualification"
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <>
                <TextInput
                  placeholder="Enter your qualification"
                  placeholderTextColor="#6b7280"
                  style={[styles.inputControl, error && { borderColor: 'red' }]}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="words"
                />
                {error && <Text style={styles.errorText}>{error.message}</Text>}
              </>
            )}
          />
        </View>

        {/* Years of Experience Input */}
        <View style={styles.input}>
          <Text style={styles.inputLabel}>Years of Experience</Text>
          <Controller
            control={control}
            name="experience"
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <>
                <TextInput
                  placeholder="Enter your years of experience"
                  placeholderTextColor="#6b7280"
                  style={[styles.inputControl, error && { borderColor: 'red' }]}
                  keyboardType="decimal-pad"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  maxLength={2}
                />
                {error && <Text style={styles.errorText}>{error.message}</Text>}
              </>
            )}
          />
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        onPress={handleSubmit(handleSubmitProfessionalDetails)}
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
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
});
