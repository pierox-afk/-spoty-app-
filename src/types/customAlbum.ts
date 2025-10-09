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
  album?: {
    images: { url: string }[];
    name: string;
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

  async updateAlbumCoverFromMostFrequentArtist(albumId: string, token: string) {
    console.log("Updating album cover for album:", albumId);
    const album = this.getAlbumById(albumId);
    if (!album || album.tracks.length === 0) {
      console.log("No album or no tracks found");
      return;
    }

    console.log("Album tracks:", album.tracks.length);

    // Count tracks per artist
    const artistCount: {
      [artistId: string]: { count: number; artist: Artist };
    } = {};

    album.tracks.forEach((track) => {
      console.log("Processing track:", track.name, "artists:", track.artists);
      track.artists.forEach((artist) => {
        if (!artistCount[artist.id]) {
          artistCount[artist.id] = { count: 0, artist };
        }
        artistCount[artist.id].count++;
      });
    });

    console.log("Artist count:", artistCount);

    // Find artist with most tracks
    let mostFrequentArtist: Artist | null = null;
    let maxCount = 0;

    for (const artistId in artistCount) {
      const { count, artist } = artistCount[artistId];
      console.log("Artist:", artist.name, "count:", count);
      if (count > maxCount) {
        maxCount = count;
        mostFrequentArtist = artist;
      }
    }

    console.log("Most frequent artist:", mostFrequentArtist);

    if (mostFrequentArtist && mostFrequentArtist.id) {
      try {
        console.log("Fetching artist image for:", mostFrequentArtist.name, mostFrequentArtist.id);
        // Fetch artist image from Spotify
        const response = await fetch(
          `https://api.spotify.com/v1/artists/${mostFrequentArtist.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Response status:", response.status);

        if (response.ok) {
          const artistData = await response.json();
          console.log("Artist data:", artistData);
          const imageUrl = artistData.images?.[0]?.url;

          console.log("Image URL:", imageUrl);

          if (imageUrl) {
            this.updateAlbum(albumId, { coverUrl: imageUrl });
            console.log("Album cover updated successfully");
          } else {
            console.log("No image URL found");
          }
        } else {
          console.error("Response not ok:", response.status, response.statusText);
        }
      } catch (error) {
        console.error("Error fetching artist image:", error);
      }
    } else {
      console.log("No most frequent artist found");
    }
  }
}
