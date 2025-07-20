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
} from 'react-native';
import {useMutation, useQuery} from '@tanstack/react-query';
import {useSelector} from 'react-redux';
import {PRIMARY_COLOR} from '../helper/Theme';
import axios from 'axios';
import {
  ADD_TO_PLAYLIST,
  CREATE_PLAYLIST,
  GET_PLAYLIST,
} from '../helper/APIUtils';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import {PlayList} from '../type';
import Snackbar from 'react-native-snackbar';

interface Props {
  podcast_ids: string[];
  visible: boolean;
  dismiss: () => void;
}
export default function CreatePlaylist({podcast_ids, visible, dismiss}: Props) {
  const {user_token} = useSelector((state: any) => state.user);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('');
  const [creatingNew, setCreatingNew] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');
  const {addPlaylistId} = useSelector((state:any)=> state.data);

  const onCheck = (id: string) => {
    setSelectedPlaylistId(id);
  };

  const {data: playlists, isLoading} = useQuery({
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
  // Add Playlist Mutation
  const addPlaylistMutation = useMutation({
    mutationKey: ['add-playlist-mutation'],
    mutationFn: async () => {
      const res = await axios.post(
        ADD_TO_PLAYLIST,
        {
          podcast_id: addPlaylistId,
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
    onSuccess: async data => {
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
          podcast_ids: [addPlaylistId]
        },
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        },
      );

      return res.data.data as PlayList;
    },
    onSuccess: async data => {
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
    console.log('podcast id',podcast_ids);
    if (!inputValue || inputValue === '') {
      Alert.alert('Playlist name cannot be empty');
      return;
    }
    createPlaylistMutation.mutate();
  };

  const addToPlaylist = ()=>{
    console.log('podcast id',podcast_ids);
    if(!selectedPlaylistId || selectedPlaylistId === '' ){
      Alert.alert('No playlist selected yet');
      return;
    }
    addPlaylistMutation.mutate();
  };

  const RenderItem = ({item}) => {
    return (
      <View style={styles.itemContainer}>
        <TouchableOpacity onPress={() => onCheck(item._id)}>
          {item._id === selectedPlaylistId ? (
            <FontAwesome name="check-square" size={26} color="green" />
          ) : (
            <Feather name="square" size={26} color="black" />
          )}
        </TouchableOpacity>

        <View style={styles.itemTextContainer}>
          <Text style={styles.itemTitle}>{item.title}</Text>
        </View>

        <Entypo name="lock" size={22} color="gray" />
      </View>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      style={styles.modal}
      visible={visible}
      onDismiss={dismiss}>
      <View style={styles.overlay} />

      <View style={styles.modalContent}>
        <View style={styles.header}>
          <Text style={styles.headerSubTitle}>Save to</Text>
          <TouchableOpacity onPress={dismiss}>
            <Text style={styles.headerCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
        {playlists &&
          playlists.map(item => <RenderItem key={item._id} item={item} />)}

        {selectedPlaylistId !== '' && (
          <TouchableOpacity onPress={addToPlaylist}>
            <Text>Save</Text>
          </TouchableOpacity>
        )}

        <View style={styles.createNewInputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Enter playlist name"
            value={inputValue}
            onChangeText={setInputValue}
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={createPlaylist}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
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
  },
  overlay: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    flex: 1,
    width: '85%',
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    position: 'absolute',
    top: Dimensions.get('window').height / 2.5,
    padding: 10,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 6,
  },
  headerSubTitle: {
    fontSize: 18,
    color: '#000000',
    fontWeight: '600',
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
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
