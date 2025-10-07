export interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

export interface Artist {
  id: string;
  name: string;
}

export interface Album {
  id: string;
  name: string;
  artists: Artist[];
  images: SpotifyImage[];
  release_date: string;
}

export interface Track {
  id: string;
  name: string;
  artists: Artist[];
  duration_ms: number;
  track_number: number;
}

export interface AlbumTracks {
  items: Track[];
  total: number;
}

export interface SearchResponse {
  albums: {
    items: Album[];
    total: number;
  };
}
