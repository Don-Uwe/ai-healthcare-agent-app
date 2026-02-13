import React, {
  FC,
  ReactElement,
  useRef,
  useState,
  Dispatch,
  SetStateAction,
} from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import AddSpecializationModal from './AddSpecializationModal';

interface Props {
  label: string;
  data: Array<{name: string; id: number}>;
  handleAddSpecialization: (specialization) => void;
  isModalVisible: boolean;
  setIsModalVisible: Dispatch<SetStateAction<boolean>>;
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  specialization: string;
  setspecialization: Dispatch<SetStateAction<string>>;
}

const Dropdown: FC<Props> = ({
  label,
  data,
  handleAddSpecialization,
  isModalVisible,
  setIsModalVisible,
  visible,
  setVisible,
  specialization,
  setspecialization,
}) => {
  const DropdownButton = useRef<TouchableOpacity | null>(null);
  const [selected, setSelected] = useState<
    {name: string; id: number} | undefined
  >(undefined);
  const [dropdownTop, setDropdownTop] = useState(0);

  const handleModal = () => {
    setVisible(false);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setVisible(true);
  };

  const toggleDropdown = (): void => {
    visible ? setVisible(false) : openDropdown();
  };

  const openDropdown = (): void => {
    DropdownButton?.current?.measure((_fx, _fy, _w, h, _px, py) => {
      setDropdownTop(py + h);
    });
    setVisible(true);
  };

  const onItemPress = (item: {name: string; id: number}): void => {
    setSelected(item);
    setVisible(false);
  };

  const renderItem = ({
    item,
  }: {
    item: {name: string; id: number};
  }): ReactElement<any, any> => (
    <TouchableOpacity style={styles.item} onPress={() => onItemPress(item)}>
      <Text>{item?.name}</Text>
    </TouchableOpacity>
  );

  const renderDropdown = (): ReactElement<any, any> => {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        style={styles.modal}>
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setVisible(false)}>
          <View style={[styles.dropdown, {top: dropdownTop}]}>
            <FlatList
              showsVerticalScrollIndicator={false}
              data={data}
              renderItem={renderItem}
              keyExtractor={(_item, index) => index.toString()}
              ListFooterComponent={
                <TouchableOpacity onPress={handleModal} style={styles.footer}>
                  <Text>Add more</Text>
                  <Ionicons name="add" size={23} />
                </TouchableOpacity>
              }
            />
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <>
      <TouchableOpacity
        ref={DropdownButton}
        style={styles.button}
        onPress={toggleDropdown}>
        {renderDropdown()}
        <Text style={styles.buttonText}>
          {selected ? selected?.name : label}
        </Text>
        {visible ? (
          <Ionicons style={styles.icon} name="chevron-up" size={25} />
        ) : (
          <Ionicons style={styles.icon} name="chevron-down" size={25} />
        )}
      </TouchableOpacity>
      <AddSpecializationModal
        isModalVisible={isModalVisible}
        handleCloseModal={handleCloseModal}
        handleAddSpecialization={handleAddSpecialization}
        setspecialization={setspecialization}
        specialization={specialization}
      />
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'lightgrey',
    justifyContent: 'space-between',
    height: 50,
    zIndex: 1,
    marginTop: 100,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  buttonText: {
    flex: 1,
    textAlign: 'left',
  },
  icon: {
    marginRight: 10,
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: '#fff',
    width: '90%',
    alignSelf: 'center',
    shadowColor: '#000000',
    shadowRadius: 4,
    shadowOffset: {height: 4, width: 0},
    shadowOpacity: 0.5,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    maxHeight: 300,
  },
  overlay: {
    width: '100%',
    height: '100%',
  },
  item: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  footer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderTopWidth: 0.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modal: {
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
});

export default Dropdown;
