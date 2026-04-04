import React, { useCallback, useMemo } from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
} from 'react-native';
import {
    BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import Icon from '@expo/vector-icons/MaterialIcons';
import { PRIMARY_COLOR } from '../helper/Theme';

const ActionItem = ({
  icon,
  label,
  onPress,
  iconColor,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  iconColor?: string;
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={styles.actionItem}
    activeOpacity={0.7}>
    <View style={[styles.iconContainer, iconColor && {backgroundColor: `${iconColor}15`}]}>
      <Icon name={icon} size={22} color={iconColor || PRIMARY_COLOR} />
    </View>
    <Text style={styles.label}>{label}</Text>
  </TouchableOpacity>
);

interface Props {
   onShare: ()=> void;
   onReport: ()=> void;
   onDownload: ()=> void;
   onSave: ()=> void;
   downloaded: boolean;
}
// eslint-disable-next-line react/display-name
const PodcastActions = React.forwardRef(
  ({ onShare, onReport, onDownload, onSave, downloaded}: Props, ref: any) => {
    const snapPoints = useMemo(() => ['40%'], []);

    const handleAction = (action: () => void) => {
      console.log('click');
      action();
      //onClear();
      ref?.current?.dismiss();
    };

    const renderBackdrop = useCallback(
    props => (
      <BottomSheetBackdrop
        {...props}
        pressBehavior="close"
        disappearsOnIndex={0}
        appearsOnIndex={1}
      />
    ),
    [],
  );
    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        index={0}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: 'white' }}
      >
        <BottomSheetView style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Podcast Actions</Text>
          <ActionItem
            icon="share"
            label="Share"
            onPress={() => handleAction(onShare)}
            iconColor="#3b82f6"
          />
          <ActionItem
            icon="playlist-add"
            label="Save to Playlist"
            onPress={() => handleAction(onSave)}
            iconColor={PRIMARY_COLOR}
          />
          <ActionItem
            icon="file-download"
            label={downloaded ? 'Remove from downloads' : 'Download'}
            onPress={() => handleAction(onDownload)}
            iconColor="#10b981"
          />
          <ActionItem
            icon="flag"
            label="Report"
            onPress={() => handleAction(onReport)}
            iconColor="#ef4444"
          />
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

export default PodcastActions;

const styles = StyleSheet.create({
  sheetContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    flex: 1,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
});
