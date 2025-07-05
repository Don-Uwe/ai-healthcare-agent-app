import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Menu, Divider } from 'react-native-paper';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { RootStackParamList } from '../type';
import { StackNavigationProp } from '@react-navigation/stack';
import { ON_PRIMARY_COLOR } from '../helper/Theme';

const HeaderRightMenu = () => {
  const [visible, setVisible] = useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => {}} style={styles.iconWrapper}>
        <AntDesign name="search1" color="#333" size={24} />
      </TouchableOpacity>

      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <TouchableOpacity onPress={openMenu} style={styles.iconWrapper}>
            <MaterialCommunityIcons name="dots-vertical" color="#333" size={24} />
          </TouchableOpacity>
        }
        contentStyle={styles.menuContent}
      >
        <Menu.Item
          onPress={() => {
            closeMenu();
            // navigation.navigate('Profile');
          }}
          title="Profile"
          leadingIcon={() => <FontAwesome name="user" size={18} color="#555" />}
          titleStyle={styles.menuItem}
        />

        <Menu.Item
          onPress={() => {
            closeMenu();
            navigation.navigate('OfflinePodcastList');
          }}
          title="Downloads"
          leadingIcon={() => <Feather name="download" size={18} color="#555" />}
          titleStyle={styles.menuItem}
        />

        <Divider />

        <Menu.Item
          onPress={() => {
            closeMenu();
            // navigation.navigate('Filter');
          }}
          title="Filter"
          leadingIcon={() => <Feather name="filter" size={18} color="#555" />}
          titleStyle={styles.menuItem}
        />
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    gap: 12,
  },
  iconWrapper: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: ON_PRIMARY_COLOR,
  },
  menuContent: {
    backgroundColor: ON_PRIMARY_COLOR,
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuItem: {
    fontSize: 15,
    color: '#333',
  },
});

export default HeaderRightMenu;
