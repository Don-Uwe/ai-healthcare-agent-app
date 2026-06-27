import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useGetCharacters } from '../hooks/useGetCharacters';
import { PRIMARY_COLOR } from '../helper/Theme';
import { PersonaLobbyScreenProps, Character } from '../type';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const PersonaLobbyScreen = ({ navigation }: PersonaLobbyScreenProps) => {
  const { isConnected } = useSelector((state: any) => state.network);
  const { data: characters, isLoading, error } = useGetCharacters(isConnected);

  const handleCharacterSelect = (character: Character) => {
    navigation.navigate('ChatbotScreen', { 
      characterId: character.id,
      characterName: character.name,
      characterAvatar: character.avatarUrl
    });
  };

  const renderCharacterCard = ({ item }: { item: Character }) => {
    return (
      <TouchableOpacity
        onPress={() => handleCharacterSelect(item)}
        style={{
          width: width / 2 - 24,
          backgroundColor: '#fff',
          borderRadius: 16,
          padding: 16,
          margin: 8,
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 3,
        }}>
        <Image
          source={{ uri: item.avatarUrl }}
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            marginBottom: 12,
            backgroundColor: '#f3f4f6',
          }}
        />
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: '#111827',
            textAlign: 'center',
            marginBottom: 4,
          }}>
          {item.name}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: '#6b7280',
            textAlign: 'center',
            marginBottom: 12,
          }}
          numberOfLines={2}>
          {item.tagline}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#f0fdf4',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
          }}>
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: '#22c55e',
              marginRight: 4,
            }}
          />
          <Text style={{ fontSize: 10, color: '#166534', fontWeight: '500' }}>
            Available
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 16,
          backgroundColor: PRIMARY_COLOR,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
        }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: 'white', marginBottom: 8 }}>
          Your Personal Health Team
        </Text>
        <Text style={{ fontSize: 14, color: '#e0e7ff' }}>
          Choose an expert to get personalized advice and answers.
        </Text>
      </View>

      <View style={{ flex: 1, padding: 8 }}>
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          </View>
        ) : error ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <Ionicons name="alert-circle-outline" size={48} color="#ef4444" style={{ marginBottom: 16 }} />
            <Text style={{ fontSize: 16, color: '#4b5563', textAlign: 'center' }}>
              Oops! We couldn't load your health team. Please check your connection and try again.
            </Text>
          </View>
        ) : (
          <FlatList
            data={characters}
            keyExtractor={(item) => item.id}
            renderItem={renderCharacterCard}
            numColumns={2}
            contentContainerStyle={{ paddingVertical: 16 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default PersonaLobbyScreen;
