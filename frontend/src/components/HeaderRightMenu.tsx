import {useNavigation} from '@react-navigation/native';
import {useCallback, useRef, useState} from 'react';
import {StackNavigationProp} from '@react-navigation/stack';
import {useDispatch, useSelector} from 'react-redux';
import Snackbar from 'react-native-snackbar';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {setPodcasts} from '../store/dataSlice';
import {RootStackParamList, Category, CategoryType} from '../type';
import FilterModal from './FilterModal';
import {
  XStack,
  YStack,
  Button,
  Popover,
  Separator,
  Text,
} from 'tamagui';
import {Feather, FontAwesome, MaterialCommunityIcons} from '@expo/vector-icons';
import {ON_PRIMARY_COLOR} from '../helper/Theme';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFilterPodcasts} from '../hooks/useFilterPodcasts';

interface Props {
  onClick: () => void;
}

const HeaderRightMenu = ({onClick}: Props) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sortingType, setSortingType] = useState<string>('');
  const [selectCategoryList, setSelectedCategoryList] = useState<Category[]>(
    [],
  );

  const {categories} = useSelector((state: any) => state.data);
  const {user_token} = useSelector((state: any) => state.user);
  const {isConnected} = useSelector((state: any) => state.network);
  const dispatch = useDispatch();

  const {mutate: filterPodcast, isPending: filterPodcastPending} =
    useFilterPodcasts();

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
    setMenuOpen(false);
  }, []);


  const handleCategorySelection = (category: CategoryType) => {
    setSelectedCategoryList(prevList =>
      prevList.some((p: Category) => p.id === category.id)
        ? prevList.filter(item => item.id !== category.id)
        : [...prevList, category as Category],
    );
  };

  const handleFilterReset = () => {
    setSelectedCategoryList([]);
    setSortingType('');
  };

  return (
    <SafeAreaView>
      <XStack alignItems="center" space="$3" marginRight="$3">
        <Button
          size="$5"
          circular
          backgroundColor={ON_PRIMARY_COLOR}
          icon={<Feather name="search" size={20} color="#333" />}
          onPress={onClick}
          pressStyle={{opacity: 0.7}}
        />

        {/* ⋮ Menu Button */}
        <Popover open={menuOpen} onOpenChange={setMenuOpen}>
          <Popover.Trigger asChild>
            <Button
              size="$5"
              circular
              backgroundColor={ON_PRIMARY_COLOR}
              icon={
                <MaterialCommunityIcons
                  name="dots-vertical"
                  size={20}
                  color="#333"
                />
              }
              pressStyle={{opacity: 0.7}}
            />
          </Popover.Trigger>

          <Popover.Content
            backgroundColor={ON_PRIMARY_COLOR}
            borderRadius="$4"
            elevation="$3"
            padding="$1"
            width={150}
            shadowColor="rgba(0,0,0,0.15)">
            <YStack>
              {/* Menu Row: Profile */}
              <XStack
                alignItems="flex-start"
                justifyContent="space-between"
                paddingVertical="$2"
                paddingHorizontal="$2"
                borderRadius="$4"
                hoverStyle={{backgroundColor: 'rgba(0,0,0,0.05)'}}
                pressStyle={{opacity: 0.8}}
                onPress={() => {
                  setMenuOpen(false);
                  navigation.navigate('PodcastProfile');
                }}>
                <Text fontSize={15} color="#333">
                  Profile
                </Text>
                <FontAwesome name="user" size={17} color="#555" />
              </XStack>

              {/* Menu Row: Downloads */}
              <XStack
                alignItems="flex-start"
                justifyContent="space-between"
                paddingVertical="$2"
                paddingHorizontal="$1"
                borderRadius="$4"
                hoverStyle={{backgroundColor: 'rgba(0,0,0,0.05)'}}
                pressStyle={{opacity: 0.8}}
                onPress={() => {
                  setMenuOpen(false);
                  navigation.navigate('OfflinePodcastList');
                }}>
                <Text fontSize={15} color="#333">
                  Downloads
                </Text>
                <Feather name="download" size={17} color="#555" />
              </XStack>

              <Separator marginVertical="$1" />

              {/* Menu Row: Filter */}
              <XStack
                alignItems="center"
                justifyContent="space-between"
                paddingVertical="$3"
                paddingHorizontal="$3"
                borderRadius="$4"
                hoverStyle={{backgroundColor: 'rgba(0,0,0,0.05)'}}
                pressStyle={{opacity: 0.8}}
                onPress={handlePresentModalPress}>
                <Text fontSize={15} color="#333">
                  Filter
                </Text>
                <Feather name="filter" size={17} color="#555" />
              </XStack>
            </YStack>
          </Popover.Content>
        </Popover>

        <FilterModal
          bottomSheetModalRef={bottomSheetModalRef}
          categories={categories}
          handleCategorySelection={handleCategorySelection}
          selectCategoryList={selectCategoryList}
          handleFilterReset={handleFilterReset}
          handleFilterApply={() => {
            if (isConnected) {
              if (selectCategoryList.length > 0 && isConnected) {
                
                filterPodcast(
                  {
                    selectedCategoryList: selectCategoryList,
                    sortingType: sortingType,
                  },
                  {
                    onSuccess: data => {
                      dispatch(setPodcasts(data));
                    },
                    onError: () => {
                      Snackbar.show({
                        text: 'You are offline',
                        duration: Snackbar.LENGTH_SHORT,
                      });
                    },
                  },
                );
              } else {
                Snackbar.show({
                  text: 'Please check your internet connection!',
                  duration: Snackbar.LENGTH_SHORT,
                });
              }
            } else {
              Snackbar.show({
                text: 'You are offline',
                duration: Snackbar.LENGTH_SHORT,
              });
            }
          }}
          setSortingType={setSortingType}
          sortingType={sortingType}
        />
      </XStack>
    </SafeAreaView>
  );
};

export default HeaderRightMenu;
