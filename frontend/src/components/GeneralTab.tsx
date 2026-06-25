import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import React, {memo, useEffect} from 'react';
import Feather from '@expo/vector-icons/Feather';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {PRIMARY_COLOR} from '../helper/Theme';
import { generalSchema, GeneralFormData } from '../schemas/profileSchemas';

interface ProfileEditGeneralTab {
  user: any;
  imgUrl: string;
  handleSubmitGeneralDetails: (data: GeneralFormData) => void;
  selectImage: () => void;
}
//import fallback_profile from '../assets/avatar.jpg';

const GeneralTab = ({
  user,
  imgUrl,
  handleSubmitGeneralDetails,
  selectImage,
}: ProfileEditGeneralTab) => {
  const { control, handleSubmit, reset } = useForm<GeneralFormData>({
    resolver: zodResolver(generalSchema),
    mode: 'onChange',
    defaultValues: {
      username: user?.user_name || '',
      userHandle: user?.user_handle || '',
      email: user?.email || '',
      about: user?.about || '',
    }
  });

  useEffect(() => {
    reset({
      username: user?.user_name || '',
      userHandle: user?.user_handle || '',
      email: user?.email || '',
      about: user?.about || '',
    });
  }, [user, reset]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Profile Image Section */}
        <View style={styles.profileImageContainer}>
          <Image
            source={{
              uri:
                imgUrl ||
                'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
            }}
            style={[
              styles.profileImage,
              !imgUrl && {borderWidth: 0.5, borderColor: 'black'},
            ]}
          />
          <View style={styles.editIconContainer}>
            <TouchableOpacity style={styles.editIcon} onPress={selectImage}>
              <Feather name="edit-3" color="black" size={25} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Username Input */}
        <View style={styles.input}>
          <Text style={styles.inputLabel}>Username</Text>
          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <>
                <TextInput
                  placeholder="Enter your username"
                  placeholderTextColor="#6b7280"
                  style={[styles.inputControl, error && { borderColor: 'red' }]}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
                {error && <Text style={styles.errorText}>{error.message}</Text>}
              </>
            )}
          />
        </View>

        {/* User Handle Input */}
        <View style={styles.input}>
          <Text style={styles.inputLabel}>User handle</Text>
          <Controller
            control={control}
            name="userHandle"
            render={({ field: { value } }) => (
              <TextInput
                editable={false}
                placeholder="Enter your userhandle"
                placeholderTextColor="#6b7280"
                style={styles.inputControl}
                value={value}
              />
            )}
          />
        </View>

        {/* Email Input */}
        <View style={styles.input}>
          <Text style={styles.inputLabel}>Email</Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { value } }) => (
              <TextInput
                placeholder="Enter your email"
                placeholderTextColor="#6b7280"
                style={styles.inputControl}
                value={value}
                editable={false}
              />
            )}
          />
        </View>

        {/* About Input */}
        <View style={styles.input}>
          <Text style={styles.inputLabel}>About</Text>
          <Controller
            control={control}
            name="about"
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <>
                <TextInput
                  placeholder="Enter something about yourself..."
                  placeholderTextColor="#6b7280"
                  textAlignVertical="top"
                  style={[styles.aboutInput, error && { borderColor: 'red' }]}
                  multiline={true}
                  numberOfLines={4}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
                {error && <Text style={styles.errorText}>{error.message}</Text>}
              </>
            )}
          />
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity onPress={handleSubmit(handleSubmitGeneralDetails)} style={styles.btn}>
        <Text style={styles.btnText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

export default memo(GeneralTab);

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
    marginBottom: 10,
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
    marginVertical: 20,
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
