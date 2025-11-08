import { useNavigation } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import Snackbar from 'react-native-snackbar';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { FILTER_PODCAST } from '../helper/APIUtils';
import { setPodcasts } from '../store/dataSlice';
import { RootStackParamList, Category, CategoryType, PodcastData } from '../type';
import FilterModal from './FilterModal';
import { XStack, YStack, Button, Popover, Separator, Text, useTheme } from 'tamagui';
import { Feather, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { ON_PRIMARY_COLOR } from '../helper/Theme';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  onClick: () => void;
}

const HeaderRightMenu = ({ onClick }: Props) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sortingType, setSortingType] = useState<string>('');
  const [selectCategoryList, setSelectedCategoryList] = useState<Category[]>([]);

  const { categories } = useSelector((state: any) => state.data);
  const { user_token } = useSelector((state: any) => state.user);
  const { isConnected } = useSelector((state: any) => state.network);
  const dispatch = useDispatch();
  const theme = useTheme();

  const menuItemProps = {
    ai: 'center',
    jc: 'space-between', 
    py: '$2.5',
    px: '$3',
    br: '$4',
   // hoverStyle: { bg: theme.gray12.val },
    pressStyle: { opacity: 0.8 },
    animation: 'quick',
  };
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
    setMenuOpen(false);
  }, []);

  const updateFilterMutation = useMutation({
    mutationKey: ['apply-filter-on-podcast'],
    mutationFn: async () => {
      const res = await axios.post(
        FILTER_PODCAST,
        {
          tags: selectCategoryList.map((item) => item._id),
          sortType: sortingType === 'oldest' ? 0 : -1,
        },
        {
          headers: { Authorization: `Bearer ${user_token}` },
        }
      );
      return res.data as PodcastData[];
    },
    onSuccess: (data) => {
      dispatch(setPodcasts(data));
    },
    onError: () => {
      Snackbar.show({
        text: 'You are offline',
        duration: Snackbar.LENGTH_SHORT,
      });
    },
  });

  const handleCategorySelection = (category: CategoryType) => {
    setSelectedCategoryList((prevList) =>
      prevList.some((p: Category) => p.id === category.id)
        ? prevList.filter((item) => item.id !== category.id)
        : [...prevList, category]
    );
  };

  const handleFilterReset = () => {
    setSelectedCategoryList([]);
    setSortingType('');
  };

  return (

    <SafeAreaView>
    <XStack ai="center" space="$3" mr="$3">

      <Button
        size="$4"
        circular
        bg={ON_PRIMARY_COLOR}
        icon={<Feather name="search" size={20} color="#333" />}
        onPress={onClick}
        pressStyle={{ opacity: 0.7 }}
      />

      {/* ⋮ Menu Button */}
      <Popover open={menuOpen} onOpenChange={setMenuOpen}>
        <Popover.Trigger asChild>
          <Button
            size="$4"
            circular
            bg={ON_PRIMARY_COLOR}
            icon={<MaterialCommunityIcons name="dots-vertical" size={20} color="#333" />}
            pressStyle={{ opacity: 0.7 }}
          />
        </Popover.Trigger>

        <Popover.Content
          bg={ON_PRIMARY_COLOR}
          borderRadius="$4"
          elevation="$3"
          p="$1"
          width={150}
          shadowColor="rgba(0,0,0,0.15)"
        >
          <YStack>
            {/* Menu Row: Profile */}
            <XStack
              alignItems="flex-start"
              justifyContent="space-between"
              py="$2"
              px="$2"
              br="$4"
              hoverStyle={{ bg: 'rgba(0,0,0,0.05)' }}
              pressStyle={{ opacity: 0.8 }}
              onPress={() => {
                setMenuOpen(false);
                // navigation.navigate('Profile');
              }}
            >
              <Text fontSize={15} color="#333">
                Profile
              </Text>
              <FontAwesome name="user" size={17} color="#555" />
            </XStack>

            {/* Menu Row: Downloads */}
            <XStack
              alignItems="flex-start"
              justifyContent="space-between"
              py="$2"
              px="$1"
              br="$4"
              hoverStyle={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
              pressStyle={{ opacity: 0.8 }}
              onPress={() => {
                setMenuOpen(false);
                navigation.navigate('OfflinePodcastList');
              }}
            >
              <Text fontSize={15} color="#333">
                Downloads
              </Text>
              <Feather name="download" size={17} color="#555" />
            </XStack>

            <Separator my="$1" />

            {/* Menu Row: Filter */}
            <XStack
              ai="center"
              jc="space-between"
              py="$3"
              px="$3"
              br="$4"
              hoverStyle={{ bg: 'rgba(0,0,0,0.05)' }}
              pressStyle={{ opacity: 0.8 }}
              onPress={handlePresentModalPress}
            >
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
            if (selectCategoryList.length > 0) {
              updateFilterMutation.mutate();
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
