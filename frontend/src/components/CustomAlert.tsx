import { AlertDialog, Button, XStack, YStack } from "tamagui";
import { useDispatch, useSelector } from "react-redux";
import { hideAlert } from "../store/alertSlice";

export function CustomAlertDialog() {
  const dispatch = useDispatch();
  const { visible, title, message, onConfirm, onCancel } = useSelector(
    (state: any) => state.alert
  );

  const close = () => dispatch(hideAlert());

  return (
    <AlertDialog open={visible} onOpenChange={close}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          animation="bouncy"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
          backgroundColor="rgba(0,0,0,0.4)"
        />

        <AlertDialog.Content
          bordered
          elevate
          animation="bouncy"
          borderRadius={12}
          padded
          width={300}
          
        >
          <YStack space="$3">
            <AlertDialog.Title fontSize={18} fontWeight="600">
              {title}
            </AlertDialog.Title>

            <AlertDialog.Description opacity={0.8}>
              {message}
            </AlertDialog.Description>

            <XStack space="$2" justifyContent="flex-end" marginTop="$2" marginBottom="$4" >
              {onCancel && (
                <AlertDialog.Cancel asChild>
                  <Button
                    theme="gray"
                    onPress={() => {
                      close();
                      onCancel?.();
                    }}
                  >
                    Cancel
                  </Button>
                </AlertDialog.Cancel>
              )}

              <AlertDialog.Action asChild>
                <Button
                  onPress={() => {
                    close();
                    onConfirm?.();
                  }}
                >
                  OK
                </Button>
              </AlertDialog.Action>
            </XStack>
          </YStack>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog>
  );
}
