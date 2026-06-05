declare module 'react-native-video' {
  import type {ComponentType} from 'react';
  import type {ViewStyle} from 'react-native';

  export type OnLoadData = {
    duration: number;
  };

  export type OnProgressData = {
    currentTime: number;
  };

  export type VideoRef = {
    seek: (time: number) => void;
  };

  type VideoProps = {
    audioOnly?: boolean;
    ignoreSilentSwitch?: 'ignore' | 'obey';
    onAudioBecomingNoisy?: () => void;
    onEnd?: () => void;
    onError?: (error: unknown) => void;
    onLoad?: (data: OnLoadData) => void;
    onProgress?: (data: OnProgressData) => void;
    paused?: boolean;
    playWhenInactive?: boolean;
    playInBackground?: boolean;
    progressUpdateInterval?: number;
    ref?: React.Ref<VideoRef>;
    source: {uri: string};
    style?: ViewStyle;
  };

  const Video: ComponentType<VideoProps>;
  export default Video;
}
