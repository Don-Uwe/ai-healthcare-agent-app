import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Menu, Divider } from 'react-native-paper';
import { View, TouchableOpacity } from "react-native";
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { RootStackParamList } from "../type";
import { StackNavigationProp } from "@react-navigation/stack";

const HeaderRightMenu = ()=>{

  const [visible, setVisible] = useState<boolean>(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

   return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
        gap: 10,
      }}
    >
      <TouchableOpacity>
        <AntDesign name="search1" color={'black'} size={27} />
      </TouchableOpacity>

      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <TouchableOpacity onPress={openMenu}>
            <MaterialCommunityIcons
              name="dots-vertical"
              color={'black'}
              size={27}
            />
          </TouchableOpacity>
        }
      >
        <Menu.Item onPress={() => {
          closeMenu();
         // navigation.navigate('Profile'); 
        }} title="Profile" />

        <Menu.Item onPress={() => {
          closeMenu();
          navigation.navigate('OfflinePodcastList');
        }} title="Downloads" />

        <Divider />

        <Menu.Item onPress={() => {
          closeMenu();
         // navigation.navigate('Filter');
        }} title="Filter" />
      </Menu>
    </View>
  );

}

export default HeaderRightMenu;