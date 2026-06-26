import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import {PRIMARY_COLOR} from '../helper/Theme';
import {hp, wp} from '../helper/Metric';
import Ionicon from '@expo/vector-icons/Ionicons';
import {useGetTrustedUsers} from '../hooks/useGetTrustedUsers';
import {GET_STORAGE_DATA} from '../helper/APIUtils';
import {TrustedUser} from '../type';
import LoadingSpinner from './LoadingSpinner';

const DEFAULT_AVATAR =
  'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500';

const getProfileImageUri = (profileImage?: string) => {
  if (!profileImage?.trim()) {
    return DEFAULT_AVATAR;
  }
  return profileImage.startsWith('http')
    ? profileImage
    : `${GET_STORAGE_DATA}/${profileImage}`;
};

export default function TrustedUsersModal({
  visible,
  articleId,
  onClose,
}: {
  visible: boolean;
  articleId: number;
  onClose: () => void;
}) {
  const {
    data: trustedUsers,
    isLoading,
    isError,
  } = useGetTrustedUsers(articleId, visible);

  const renderItem = ({item}: {item: TrustedUser}) => (
    <View style={styles.userRow}>
      <Image
        source={{uri: getProfileImageUri(item.Profile_image)}}
        style={styles.avatar}
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.user_name}</Text>
        <Text style={styles.userHandle}>@{item.user_handle}</Text>
      </View>
    </View>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onDismiss={onClose}
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.modalTitle}>🛡️ Trusted Readers</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicon name="close" size={28} color="white" />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.centered}>
              <LoadingSpinner size={32} />
            </View>
          ) : isError ? (
            <View style={styles.centered}>
              <Text style={styles.emptyText}>
                Couldn't load trusted readers. Please try again.
              </Text>
            </View>
          ) : !trustedUsers || trustedUsers.length === 0 ? (
            <View style={styles.centered}>
              <Text style={styles.emptyText}>
                No one has trusted this article yet.
              </Text>
            </View>
          ) : (
            <FlatList
              data={trustedUsers}
              keyExtractor={(item, index) => item._id || String(index)}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginHorizontal: 4,
    width: '95%',
    height: hp(55),
    justifyContent: 'flex-start',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: PRIMARY_COLOR,
    padding: wp(3),
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginVertical: 3,
    color: 'white',
  },
  listContent: {
    paddingVertical: 8,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5E5',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  userInfo: {
    flexShrink: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: 'black',
  },
  userHandle: {
    fontSize: 13,
    color: '#6C6C6D',
    marginTop: 2,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#6C6C6D',
    textAlign: 'center',
  },
});
