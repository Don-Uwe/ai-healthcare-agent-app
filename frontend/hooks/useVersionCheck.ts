import { useEffect, useState } from 'react';
import VersionCheck from 'react-native-version-check';

export const useVersionCheck = () => {
  const [visible, setVisible] = useState(false);
  const [storeUrl, setStoreUrl] = useState('');

  useEffect(() => {
    (async () => {
      const update = await VersionCheck.needUpdate();

      if (update?.isNeeded) {
        setStoreUrl(update.storeUrl);
        setVisible(true);
      }
    })();
  }, []);

  return { visible, storeUrl };
};
