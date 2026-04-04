import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {useSelector} from 'react-redux';
import {PRIMARY_COLOR} from '../helper/Theme';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Feather from '@expo/vector-icons/Feather';
import {PlayList} from '../type';
import Snackbar from 'react-native-snackbar';
import NoInternet from './NoInternet';
import {useGetPlaylists} from '../hooks/useGetPlaylists';
import {useUpdatePodcastPlaylist} from '../hooks/useUpdatePodcastPlaylist';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  //podcast_ids: string[];
  visible: boolean;
  dismiss: () => void;
}
export default function CreatePlaylist({visible, dismiss}: Props) {
  const {user_token} = useSelector((state: any) => state.user);
  // const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const {addedPodcastId} = useSelector((state: any) => state.data);
  const {isConnected} = useSelector((state: any) => state.network);
  const [addedPlaylistIds, setAddedPlaylistIds] = useState<string[]>([]);
  const [removePlaylistIds, setRemovePlaylistIds] = useState<string[]>([]);

  const {data: playlists} = useGetPlaylists();
  const {mutate: updatePlaylist, isPending: updatePlaylistPending} =
    useUpdatePodcastPlaylist();

  const onCheck = (id: string) => {
    // add the playlist id addedPlaylist
    console.log('on check');
    if (!addedPlaylistIds.includes(id)) {
      setAddedPlaylistIds(prev => [...prev, id]);
    }
    // Remove the playlist id from remove playlist
    if (removePlaylistIds.includes(id)) {
      setRemovePlaylistIds(prev => prev.filter(it => it !== id));
    }
  };
  const onClear = (id: string) => {
    // Add the playlist id to remove playlist id
    console.log('on clear');
    if (!removePlaylistIds.includes(id)) {
      setRemovePlaylistIds(prev => [...prev, id]);
    }
    // Remove it from added playlist id
    if (addedPlaylistIds.includes(id)) {
      setAddedPlaylistIds(prev => prev.filter(it => it !== id));
    }
  };

  /*
  // Add Playlist Mutation
  const addPlaylistMutation = useMutation({
    mutationKey: ['add-playlist-mutation'],
    mutationFn: async () => {
      const res = await axios.post(
        ADD_TO_PLAYLIST,
        {
          podcast_id: addedPodcastId,
          playlist_id: selectedPlaylistId,
        },
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        },
      );

      return res.data.data as PlayList;
    },
    onSuccess: async () => {
      Alert.alert('Podcast id added to playlist');
      Snackbar.show({
        text: 'Podcast id added to playlist',
        duration: Snackbar.LENGTH_SHORT,
      });
    },
    onError: err => {
      console.log(err);
      Alert.alert(err.message);
      //setInputValue('');
      setSelectedPlaylistId('');
    },
  });
  // Create Playlist Mutation
  const createPlaylistMutation = useMutation({
    mutationKey: ['create-playlist'],
    mutationFn: async () => {
      const res = await axios.post(
        CREATE_PLAYLIST,
        {
          name: inputValue,
          podcast_ids: [addedPodcastId],
        },
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        },
      );

      return res.data.data as PlayList;
    },
    onSuccess: async _data => {
      Alert.alert('Podcast id added to playlist');
      Snackbar.show({
        text: 'Podcast added',
        duration: Snackbar.LENGTH_SHORT,
      });
      dismiss();
    },
    onError: err => {
      console.log(err);
      Alert.alert(err.message);
      //setInputValue('');
      setSelectedPlaylistId('');
      dismiss();
    },
  });

  const createPlaylist = () => {
    console.log('podcast id', podcast_ids);
    if (!inputValue || inputValue === '') {
      Alert.alert('Playlist name cannot be empty');
      return;
    }
    createPlaylistMutation.mutate();
  };

  const addToPlaylist = () => {
    console.log('podcast id', podcast_ids);
    if (!selectedPlaylistId || selectedPlaylistId === '') {
      Alert.alert('No playlist selected yet');
      return;
    }
    addPlaylistMutation.mutate();
  };
  */

  const clear = () => {
    setAddedPlaylistIds([]);
    setRemovePlaylistIds([]);
    setInputValue('');
  };

  const RenderItem = ({item}: {item: PlayList}) => {
    return (
      <View style={styles.itemContainer}>
        {!removePlaylistIds.includes(item._id) &&
        (addedPlaylistIds.includes(item._id) ||
          item.podcasts.includes(addedPodcastId)) ? (
          <TouchableOpacity onPress={() => onClear(item._id)}>
            <FontAwesome name="check-square" size={26} color="#5F9EA0" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => onCheck(item._id)}>
            <Feather name="square" size={26} color="#7393B3" />
          </TouchableOpacity>
        )}

        <View style={styles.itemTextContainer}>
          <Text style={styles.itemTitle}>{item.title}</Text>
        </View>

        <Entypo name="lock" size={22} color="#7393B3" />
      </View>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      style={styles.modal}
      visible={visible}
      onDismiss={() => {
        clear();
        dismiss();
      }}>
      <View style={styles.overlay} />

      {isConnected ? (
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerSubTitle}>Save to Playlist</Text>
            <TouchableOpacity
              onPress={() => {
                clear();
                dismiss();
              }}>
              <Feather name="x" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          {playlists && playlists.length > 0 ? (
            <>
              <Text style={styles.sectionLabel}>Your Playlists</Text>
              {playlists.map(item => (
                <RenderItem key={item._id} item={item} />
              ))}
            </>
          ) : (
            <View style={styles.noPlaylistsContainer}>
              <MaterialCommunityIcons
                name="playlist-music-outline"
                size={40}
                color="#d1d5db"
              />
              <Text style={styles.noPlaylistsText}>No playlists yet</Text>
            </View>
          )}

          <Text style={styles.sectionLabel}>Create New Playlist</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter playlist name"
            placeholderTextColor="#9ca3af"
            value={inputValue}
            onChangeText={setInputValue}
          />
          {/**
           *  <TouchableOpacity style={styles.addButton} onPress={createPlaylist}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
           */}
          {(addedPlaylistIds.length > 0 ||
            removePlaylistIds.length > 0 ||
            inputValue !== '') && (
            <>
              {updatePlaylistPending ? (
                <ActivityIndicator size="small" color={PRIMARY_COLOR} />
              ) : (
                <TouchableOpacity
                  style={{
                    ...styles.addButton,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 10,
                  }}
                  onPress={() => {
                    updatePlaylist(
                      {
                        addPlaylistIds: addedPlaylistIds,
                        removePlaylistIds: removePlaylistIds,
                        playlist_name: inputValue,
                        podcast_id: addedPodcastId,
                      },
                      {
                        onSuccess: () => {
                          Snackbar.show({
                            text: 'Podcast added',
                            duration: Snackbar.LENGTH_SHORT,
                          });
                          dismiss();
                        },
                        onError: err => {
                          Snackbar.show({
                            text: err.message,
                            duration: Snackbar.LENGTH_SHORT,
                          });
                          clear();
                        },
                      },
                    );
                  }}>
                  <Text style={styles.addButtonText}>Save</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      ) : (
        <View style={styles.modalContent}>
          <NoInternet
            onRetry={() => {
              dismiss();
            }}
          />
        </View>
      )}
    </Modal>
  );
}
const styles = StyleSheet.create({
  modal: {
    position: 'relative',
    width: '100%',
    height: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  overlay: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    flex: 1,
    width: '92%',
    maxHeight: '70%',
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    position: 'absolute',
    top: Dimensions.get('window').height / 4,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerSubTitle: {
    fontSize: 20,
    color: '#1a1a1a',
    fontWeight: '700',
  },
  sectionLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  noPlaylistsContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  noPlaylistsText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    fontWeight: '500',
  },
  headerCloseText: {
    fontSize: 16,
    color: '#313131',
    fontWeight: '400',
  },
  createNewBtnStyle: {
    marginTop: 20,
    alignItems: 'center',
  },

  createNewInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
  },

  textInput: {
    borderColor: '#e5e7eb',
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1a1a1a',
    backgroundColor: '#f9fafb',
  },

  addButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  addButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  itemTextContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },

  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
});
