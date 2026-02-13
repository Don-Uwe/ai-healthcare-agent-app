import { Modal, View, Text, Pressable, Linking } from 'react-native';

export default function UpdateModal({ visible, storeUrl }: any) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <View
          style={{
            width: '80%',
            backgroundColor: '#fff',
            padding: 20,
            borderRadius: 12,
            alignItems: 'center'
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '600' }}>
            Update Available 🚀
          </Text>

          <Text style={{ marginVertical: 12, textAlign: 'center' }}>
            Please update the app to continue using all features.
          </Text>

          <Pressable
            onPress={() => Linking.openURL(storeUrl)}
            style={{
              backgroundColor: '#000',
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 8
            }}
          >
            <Text style={{ color: '#fff' }}>Update Now</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
