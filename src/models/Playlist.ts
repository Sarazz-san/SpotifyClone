import type {ImageSourcePropType} from 'react-native';

export type Playlist = {
  id: string;
  title: string;
  subtitle: string;
  cover: ImageSourcePropType;
  trackIds: string[];
  category: 'playlist' | 'album' | 'podcast' | 'artist';
  pinned?: boolean;
};
