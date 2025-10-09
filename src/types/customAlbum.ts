export interface CustomAlbum {
  id: string;
  name: string;
  tracks: Track[];
  createdAt: string;
  coverUrl?: string;
  description?: string;
}

export interface Track {
  id: string;
  name: string;
  artists: Artist[];
  duration_ms: number;
  track_number: number;
  preview_url?: string;
  external_urls?: {
    spotify: string;
  };
}

export interface CustomTrack extends Track {
  addedAt?: string;
}

export interface Artist {
  id: string;
  name: string;
}

export class CustomAlbumManager {
  private static instance: CustomAlbumManager;
  private albums: CustomAlbum[] = [];

  private constructor() {
    this.loadFromStorage();
  }

  static getInstance(): CustomAlbumManager {
    if (!CustomAlbumManager.instance) {
      CustomAlbumManager.instance = new CustomAlbumManager();
    }
    return CustomAlbumManager.instance;
  }

  private loadFromStorage() {
    const stored = localStorage.getItem("customAlbums");
    if (stored) {
      this.albums = JSON.parse(stored);
    }
  }

  private saveToStorage() {
    localStorage.setItem("customAlbums", JSON.stringify(this.albums));
  }

  getAlbums(): CustomAlbum[] {
    return this.albums;
  }

  getAlbumById(id: string): CustomAlbum | undefined {
    return this.albums.find((album) => album.id === id);
  }

  createAlbum(
    name: string,
    description?: string,
    coverUrl?: string
  ): CustomAlbum {
    const album: CustomAlbum = {
      id: Date.now().toString(),
      name,
      tracks: [],
      createdAt: new Date().toISOString(),
      description,
      coverUrl,
    };
    this.albums.push(album);
    this.saveToStorage();
    return album;
  }

  updateAlbum(id: string, updates: Partial<CustomAlbum>) {
    const index = this.albums.findIndex((album) => album.id === id);
    if (index !== -1) {
      this.albums[index] = { ...this.albums[index], ...updates };
      this.saveToStorage();
    }
  }

  deleteAlbum(id: string) {
    this.albums = this.albums.filter((album) => album.id !== id);
    this.saveToStorage();
  }

  addTrackToAlbum(albumId: string, track: Omit<CustomTrack, "addedAt">) {
    const album = this.getAlbumById(albumId);
    if (album) {
      const customTrack: CustomTrack = {
        ...track,
        addedAt: new Date().toISOString(),
      };
      album.tracks.push(customTrack);
      this.saveToStorage();
    }
  }

  removeTrackFromAlbum(albumId: string, trackId: string) {
    const album = this.getAlbumById(albumId);
    if (album) {
      album.tracks = album.tracks.filter((track) => track.id !== trackId);
      this.saveToStorage();
    }
  }
}
