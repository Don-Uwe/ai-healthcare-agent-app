import { useNavigation } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import { Menu, Divider } from 'react-native-paper';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Category, CategoryType, PodcastData, RootStackParamList } from '../type';
import { StackNavigationProp } from '@react-navigation/stack';
import { ON_PRIMARY_COLOR } from '../helper/Theme';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import FilterModal from './FilterModal';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { FILTER_PODCAST } from '../helper/APIUtils';
import { setPodcasts, setSelectedTags } from '../store/dataSlice';
import Snackbar from 'react-native-snackbar';

interface Props {
 onClick: ()=> void;
}
const HeaderRightMenu = ({onClick}:Props) => {
  const [visible, setVisible] = useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);
  const {categories} = useSelector((state:any)=> state.data);
  const {user_token} = useSelector((state:any)=> state.user);
  const {isConnected} = useSelector((state: any)=> state.network);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [sortingType, setSortingType] = useState<string>('');
  const dispatch = useDispatch();
  const [selectCategoryList, setSelectedCategoryList] = useState<Category[]>([]);


  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const updateFilterMutation = useMutation({
    mutationKey:['apply-filter-on-podcast'],
    mutationFn: async ()=>{

     // console.log('Send data', {
      //  tags: selectCategoryList.map(item=> item._id),
      //  sortType: sortingType === 'oldest' ? 0 : -1,
      //});

     // console.log('URL', FILTER_PODCAST);
      //console.log('Token', user_token);
      
      const res = await axios.post(FILTER_PODCAST, {
        tags: selectCategoryList.map(item=> item._id),
        sortType: sortingType === 'oldest' ? 0 : -1,
      },
      {
        headers:{
          Authorization :`Bearer ${user_token}`,
        },
      });

      return res.data as PodcastData[];
    },
    onSuccess: (data)=>{
       dispatch(setPodcasts(data));
    },
    onError:(err)=>{
      console.log('err', err);
      Snackbar.show({
        text:'You are in offline',
        duration: Snackbar.LENGTH_SHORT,
      });
    },
  });

   const handleCategorySelection = (category: CategoryType) => {
    // Update Redux State
    setSelectedCategoryList(prevList => {
      const updatedList = prevList.some(p=> p.id === category.id)
        ? prevList.filter(item => item.id !== category.id)
        : [...prevList, category];
      return updatedList;
    });
  };

   const handleFilterReset = () => {
      // Update Redux State Variables
      setSelectedCategoryList([]);
      setSortingType('');
      //dispatch(
       // setSelectedTags({
       //   selectedTags: categories.map(category => category.name),
       // }),
      //);
    };
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onClick} style={styles.iconWrapper}>
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
            handlePresentModalPress();
          }}
          title="Filter"
          leadingIcon={() => <Feather name="filter" size={18} color="#555" />}
          titleStyle={styles.menuItem}
        />
      </Menu>

           <FilterModal
              bottomSheetModalRef={bottomSheetModalRef}
              categories={categories} // will fetch from redux
              handleCategorySelection={handleCategorySelection}
              selectCategoryList={selectCategoryList}
              handleFilterReset={handleFilterReset}
              handleFilterApply={()=>{
                if(isConnected){
                  if(selectCategoryList.length > 0){
                     updateFilterMutation.mutate();
                  }

                }else{
                  // filter existing podcasts (later), at the time of paginatiom
                  Snackbar.show({
                    text: 'You are offline',
                    duration: Snackbar.LENGTH_SHORT,
                  });
                }
              }}
              setSortingType={setSortingType}
              sortingType={sortingType}
            />
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
