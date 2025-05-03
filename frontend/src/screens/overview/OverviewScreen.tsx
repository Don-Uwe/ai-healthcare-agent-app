import React from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import {MaterialTabBar, Tabs} from 'react-native-collapsible-tab-view';
import {
  PRIMARY_COLOR,
  ON_PRIMARY_COLOR,
  BUTTON_COLOR,
} from '../../helper/Theme';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ArticleData, OverviewScreenProps} from '../../type';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {StatusEnum} from '../../helper/Utils';
import {FAB} from 'react-native-paper';
import {hp} from '../../helper/Metric';
import ArticleWorkSpace from './ArticleWorkSpace';

export default function OverviewScreen({
  navigation,
  route,
}: OverviewScreenProps) {
  //const bottomBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();

  const handleClickAction = (item: ArticleData) => {
    if (item?.status === StatusEnum.PUBLISHED) {
      navigation.navigate('ArticleScreen', {
        articleId: Number(item?._id),
        authorId: item?.authorId,
      });
    } else {
      // navigate to review screen
      // check item status
      if (
        item?.status === StatusEnum.AWAITING_USER ||
        item?.status === StatusEnum.UNASSIGNED ||
        item?.status === StatusEnum.DISCARDED
      ) {
        navigation.navigate('ReviewScreen', {
          articleId: Number(item?._id),
          authorId: item?.authorId,
        });
      } else {
        Alert.alert("The article is under reviewed, you can't change it now");
      }
    }
  };
  const renderTabBar = props => {
    return (
      <MaterialTabBar
        {...props}
        indicatorStyle={styles.indicatorStyle}
        style={styles.tabBarStyle}
        activeColor={PRIMARY_COLOR}
        inactiveColor="#9098A3"
        labelStyle={styles.labelStyle}
        contentContainerStyle={styles.contentContainerStyle}
      />
    );
  };
  return (
    <View style={styles.container}>
      <View style={[styles.innerContainer, {paddingTop: insets.top}]}>
        <Tabs.Container
          //renderHeader={renderHeader}
          renderTabBar={renderTabBar}
          containerStyle={styles.tabsContainer}>
          {/* Tab 1 */}

          {/* Tab 2 */}
          <Tabs.Tab name="Articles">
            <ArticleWorkSpace handleClickAction={handleClickAction} />
          </Tabs.Tab>

          <Tabs.Tab name="Improvements">
            <View />
          </Tabs.Tab>

        </Tabs.Container>
      </View>
      <FAB
        style={styles.fab}
        small
        icon={({size, color}) => (
          <Ionicons name="arrow-back" size={size} color={'white'} />
        )}
        onPress={() => {
          navigation.goBack();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0CAFFF',
    // marginTop: hp(5)
  },
  innerContainer: {
    flex: 1,
    backgroundColor: ON_PRIMARY_COLOR,
  },
  tabsContainer: {
    backgroundColor: ON_PRIMARY_COLOR,
    overflow: 'hidden',
  },
  scrollViewContentContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
    backgroundColor: ON_PRIMARY_COLOR,
  },
  flatListContentContainer: {
    paddingHorizontal: 16,
  },

  profileImage: {
    height: 130,
    width: 130,
    borderRadius: 100,
    objectFit: 'cover',
    resizeMode: 'contain',
  },
  indicatorStyle: {
    backgroundColor: 'white',
    //minHeight: 50,
  },
  tabBarStyle: {
    backgroundColor: 'white',
    minHeight: 65,
  },
  labelStyle: {
    fontWeight: '600',
    fontSize: 16,
    color: 'black',
    textTransform: 'capitalize',
  },
  contentContainerStyle: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowOpacity: 0,
    shadowOffset: {width: 0, height: 0},
    shadowColor: 'white',
  },
  message: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    borderRadius: hp(20),
    backgroundColor: BUTTON_COLOR, // Customize color
  },
});
