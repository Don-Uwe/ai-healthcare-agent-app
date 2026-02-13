import React, {useEffect, useState} from 'react';
import {YStack, XStack, Text, Button} from 'tamagui';
import {Sheet} from '@tamagui/sheet';
import AntDesign from '@expo/vector-icons/AntDesign';
import {ScrollView} from 'react-native';

interface ArticleFloatingMenuProp {
  visible: boolean;
  items: Item[];
  onDismiss: () => void;
}

interface Item {
  name: string;
  articleId: string;
  action: () => void;
  icon: string;
}

export default function ArticleFloatingMenuSheet({
  visible,
  items,
  onDismiss,
}: ArticleFloatingMenuProp) {
  const [open, setOpen] = useState(visible);

  // keep open state in sync with visible prop
  useEffect(() => {
    setOpen(visible);
  }, [visible]);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) onDismiss();
  };

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={handleOpenChange}
      dismissOnSnapToBottom
      snapPoints={[65, 30, 10]} 
      dismissOnOverlayPress={true}
    //  dismissOnSnapToBottom={false}
      //dismissOnOverlayPress={false}
     // animation="medium"
      zIndex={1000}>
      {/* <Sheet.Overlay backgroundColor="rgba(0,0,0,0.05)" /> */}
      <Sheet.Handle />
      <Sheet.Frame padding="$4" backgroundColor="white" height="100%" >
        <ScrollView
          contentContainerStyle={{paddingBottom: 20}}
          keyboardShouldPersistTaps="handled"
          >
          <YStack gap="$3">
            {items.map((item, index) => (
              <Button
                key={`${item.name}-${item.articleId}-${index}`}
                size="$5"
                height={'21%'}
                onPress={()=>{
                  console.log('action click');
                  item.action();
                }}
                justifyContent="flex-start"
                backgroundColor="$gray2"
                borderRadius="$4"
                elevation={1}
                paddingVertical="$3"
                paddingHorizontal="$3"
                pressStyle={{backgroundColor: '$gray4'}}>
                <XStack alignItems="center" gap="$3">
                  <AntDesign name={item.icon} size={20} color="black" />
                  <Text fontSize={16} fontWeight="600" color="black">
                    {item.name}
                  </Text>
                </XStack>
              </Button>
            ))}
          </YStack>
        </ScrollView>
      </Sheet.Frame>
    </Sheet>
  );
}
