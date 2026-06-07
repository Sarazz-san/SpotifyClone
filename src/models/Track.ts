import type {ImageSourcePropType} from 'react-native';

export type Track = {
  id: string;
  title: string;
  artist: string;
  album: string;
  durationMs: number;
  cover: ImageSourcePropType;
  audioUrl: string;
  genre?: string;
  userId?: string;
  type: 'music' | 'podcast';
};
