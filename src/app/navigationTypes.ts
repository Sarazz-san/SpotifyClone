export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Player: undefined;
  Recents: undefined;
  ArtistPicker: undefined;
  PlaylistDetail: {playlistId: string};
  LikedSongs: undefined;
  Genre: {genreName: string};
  Category: {categoryId: string; categoryName: string};
  ArtistDetail: {artistName: string; artistImage: string};
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Library: undefined;
  Premium: undefined;
  Create: undefined;
  Admin: undefined;
};
