import {Alert, View} from 'react-native';
import React, {useState} from 'react';
import Dropdown from './Dropdown';

const DropDownComponent = ({data}) => {
  const [specializationData, setspecializationData] = useState(data);
  const [specialization, setspecialization] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [visible, setVisible] = useState(false);
  const handleAddSpecialization = (specialization: string) => {
    if (!specialization) {
      Alert.alert('Please eneter specialization before submitting!');
      return null;
    }
    const isAlreadyExist = specializationData.filter(
      specialize =>
        specialize.name.toLowerCase() === specialization.toLocaleLowerCase(),
    );
    console.log(isAlreadyExist);
    if (isAlreadyExist.length > 0) {
      Alert.alert('Entered specialization already present!');
    } else {
      // make a api call to save the specialization
      setspecializationData([
        {id: 14, name: specialization},
        ...specializationData,
      ]);
      setIsModalVisible(false);
      setVisible(true);
      setspecialization('');
    }
  };
  return (
    <View style={{paddingHorizontal: 16}}>
      <Dropdown
        label="Select Item"
        data={specializationData}
        handleAddSpecialization={handleAddSpecialization}
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
        visible={visible}
        setVisible={setVisible}
        setspecialization={setspecialization}
        specialization={specialization}
      />
    </View>
  );
};

export default DropDownComponent;
