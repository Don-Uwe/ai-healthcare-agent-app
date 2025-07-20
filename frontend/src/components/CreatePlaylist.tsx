import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useMutation, useQuery} from '@tanstack/react-query';
import {useSelector} from 'react-redux';
import {PRIMARY_COLOR} from '../helper/Theme';
import axios from 'axios';
import {
  GET_PLAYLIST,
  UPDATE_PODCAST_PLAYLIST,
} from '../helper/APIUtils';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import {PlayList} from '../type';
import Snackbar from 'react-native-snackbar';
import NoInternet from './NoInternet';

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
   const {isConnected} = useSelector((state:any)=> state.data);
  const [addedPlaylistIds, setAddedPlaylistIds] = useState<string[]>([]);
  const [removePlaylistIds, setRemovePlaylistIds] = useState<string[]>([]);
 

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

  const {data: playlists} = useQuery({
    queryKey: ['get-my-playlists'],
    queryFn: async () => {
      const res = await axios.get(GET_PLAYLIST, {
        headers: {
          Authorization: `Bearer ${user_token}`,
        },
      });
      return res.data as PlayList[];
    },
  });

  //console.log('podcast_ids', podcast_ids);
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

  const updatePlaylistMutation = useMutation({
    mutationKey: ['update-podcast-playlist'],
    mutationFn: async () => {
      const res = await axios.post(
        UPDATE_PODCAST_PLAYLIST,
        {
          addPlaylistIds: addedPlaylistIds,
          removePlaylistIds: removePlaylistIds,
          playlist_name: inputValue,
          podcast_id: addedPodcastId,
        },
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        },
      );
      return res.data as any;
    },
    onSuccess: () => {
      Snackbar.show({
        text: 'Podcast added',
        duration: Snackbar.LENGTH_SHORT,
      });
      dismiss();
    },
    onError: err => {
      Alert.alert(err.message);
      //setInputValue('');
      clear();
    },
  });

  const updatePlaylist = () => {
    updatePlaylistMutation.mutate();
  };

  const clear = () => {
    setAddedPlaylistIds([]);
    setRemovePlaylistIds([]);
    setInputValue('');
  };

  const RenderItem = ({item}: {item: PlayList}) => {
    return (
      <View style={styles.itemContainer}>
        {!removePlaylistIds.includes(item._id) && (addedPlaylistIds.includes(item._id) ||
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

      <View style={styles.modalContent}>
       

       {
        !isConnected ? (
          <View>
             <View style={styles.header}>
          <Text style={styles.headerSubTitle}>Save to</Text>
          <TouchableOpacity
            onPress={() => {
              clear();
              dismiss();
            }}>
            <Text style={styles.headerCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
        {playlists &&
          playlists.map(item => <RenderItem key={item._id} item={item} />)}


          <TextInput
            style={styles.textInput}
            placeholder="Enter new playlist name"
            value={inputValue}
            onChangeText={setInputValue}
          />
          {/**
           *  <TouchableOpacity style={styles.addButton} onPress={createPlaylist}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
           */}
  {(addedPlaylistIds.length > 0 || removePlaylistIds.length > 0 || inputValue !== '') && (
  <>
    {updatePlaylistMutation.isPending ? (
      <ActivityIndicator size="small" color={PRIMARY_COLOR} />
    ) : (
      <TouchableOpacity
        style={{
          ...styles.addButton,
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 10,
        }}
        onPress={updatePlaylist}>
        <Text style={styles.addButtonText}>Save</Text>
      </TouchableOpacity>
    )}
  </>
)}
          </View>
        ):(
          <View style={styles.modalContent}>
            <NoInternet onRetry={()=>{}}/>
          </View>
        )
       }
       
      </View>
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
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    flex: 1,
    width: '95%',
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    position: 'absolute',
    top: Dimensions.get('window').height / 3.2,
    padding: 10,
    paddingHorizontal: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 6,
  },
  headerSubTitle: {
    fontSize: 18,
    color: '#313131',
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
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 16,
  },

  addButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
  },

  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 0.5},
    //shadowOpacity: 0.1,
    // shadowRadius: 2,
    //elevation: 1,
  },

  itemTextContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },

  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
});
