import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "../components/Header";
import { Spinner } from "../components/Spinner";
import { Message } from "../components/Message";
import { CustomAlbumManager } from "../types/customAlbum";
import { useAuthContext } from "../AuthContext";
import { spotifyFetch } from "../spotifyClient";
import { useDebounce } from "../hooks/useDebounce";
import type { CustomAlbum, CustomTrack } from "../types/customAlbum";
import type { Track } from "../spotify";

import "../components/Page.css";
import "./CustomAlbumDetailPage.css";

export default function CustomAlbumDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuthContext();
  const [album, setAlbum] = useState<CustomAlbum | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<CustomTrack | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const debouncedQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (!id) return;

    const manager = CustomAlbumManager.getInstance();
    const foundAlbum = manager.getAlbumById(id);
    if (foundAlbum) {
      setAlbum(foundAlbum);
    } else {
      setError("Álbum no encontrado.");
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    const searchTracks = async () => {
      if (!debouncedQuery || !token) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const endpoint = `/search?q=${encodeURIComponent(
          debouncedQuery
        )}&type=track&limit=10`;
        const data = await spotifyFetch<{ tracks: { items: Track[] } }>(
          endpoint,
          token
        );
        setSearchResults(data.tracks.items);
      } catch (error) {
        console.error("Error searching tracks:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    searchTracks();
  }, [debouncedQuery, token]);

  const playTrack = (track: CustomTrack) => {
    setCurrentTrack(track);
  };

  const addTrackToAlbum = (track: Track) => {
    if (!album || !id) return;

    const manager = CustomAlbumManager.getInstance();
    const customTrack: CustomTrack = {
      id: track.id,
      name: track.name,
      artists: track.artists,
      duration_ms: track.duration_ms,
      track_number: album.tracks.length + 1,
      preview_url: undefined, // Spotify tracks don't have preview URLs in search results
    };

    manager.addTrackToAlbum(id, customTrack);
    // Force re-render by updating album state
    const updatedAlbum = manager.getAlbumById(id);
    if (updatedAlbum) {
      setAlbum({ ...updatedAlbum });
    }
  };

  const removeTrackFromAlbum = (trackId: string) => {
    if (!album || !id) return;

    const manager = CustomAlbumManager.getInstance();
    manager.removeTrackFromAlbum(id, trackId);
    // Force re-render by updating album state
    const updatedAlbum = manager.getAlbumById(id);
    if (updatedAlbum) {
      setAlbum({ ...updatedAlbum });
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, "0")}`;
  };

  if (loading) return <Spinner />;
  if (error) return <Message type="error" text={error} />;
  if (!album) return <Message text="Álbum no encontrado." />;

  return (
    <div className="page-container">
      <Header />
      <main>
        <div className="album-details-header">
          <img
            src={album.coverUrl || "/default-album.png"}
            alt={album.name}
            className="album-details-image"
          />
          <div className="album-details-info">
            <h1>{album.name}</h1>
            <p>{album.description || "Álbum personalizado"}</p>
            <p>
              Creado: {new Date(album.createdAt).toLocaleDateString()} •{" "}
              {album.tracks.length} canciones
            </p>
            <Link to="/albums" className="back-to-albums-link">
              &larr; Volver a mis álbumes
            </Link>
          </div>
        </div>

        {/* Search and Add Tracks Section */}
        <div className="add-tracks-section">
          <h2>Agregar canciones</h2>
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar canciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          {isSearching && <Spinner />}

          {searchResults.length > 0 && (
            <div className="search-results">
              <h3>Resultados de búsqueda</h3>
              <ul className="search-track-list">
                {searchResults.map((track) => (
                  <li key={track.id} className="search-track-item">
                    <div className="track-info">
                      <span className="track-name">{track.name}</span>
                      <span className="track-artist">
                        {track.artists.map((artist) => artist.name).join(", ")}
                      </span>
                    </div>
                    <button
                      onClick={() => addTrackToAlbum(track)}
                      className="add-track-btn"
                      disabled={album?.tracks.some((t) => t.id === track.id)}
                    >
                      {album?.tracks.some((t) => t.id === track.id)
                        ? "✓ Agregada"
                        : "+ Agregar"}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <ul className="track-list">
          {album.tracks.map((track) => (
            <li key={track.id} className="track-item">
              <div className="track-info">
                <span className="track-number">{track.track_number}.</span>
                <span className="track-name">{track.name}</span>
                <span className="track-artist">
                  {track.artists.map((artist) => artist.name).join(", ")}
                </span>
              </div>
              <div className="track-controls">
                <span className="track-duration">
                  {formatDuration(track.duration_ms)}
                </span>
                <button
                  onClick={() => removeTrackFromAlbum(track.id)}
                  className="remove-track-btn"
                >
                  ✕
                </button>
                {track.preview_url && (
                  <button
                    onClick={() => playTrack(track)}
                    className="play-button"
                  >
                    &#9654;
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>

        {currentTrack && (
          <div className="audio-player-container">
            <audio
              src={currentTrack.preview_url!}
              autoPlay
              controls
              onEnded={() => setCurrentTrack(null)}
            >
              Tu navegador no soporta el elemento de audio.
            </audio>
          </div>
        )}
      </main>
    </div>
  );
}
