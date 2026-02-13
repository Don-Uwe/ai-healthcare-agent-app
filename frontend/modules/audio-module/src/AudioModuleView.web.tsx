import * as React from 'react';

import { AudioModuleViewProps } from './AudioModule.types';

export default function AudioModuleView(props: AudioModuleViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
