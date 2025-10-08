import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthContext } from "../AuthContext";
import { spotifyFetch } from "../spotifyClient";
import type { Track, AlbumTracks, Album } from "../spotify";
import { useModal } from "../hooks/useModal";
import { Header } from "../components/Header";
import { Spinner } from "../components/Spinner";
import { Message } from "../components/Message";
import { MusicPlayer } from "../components/MusicPlayer";
import "../components/Page.css";
import "./AlbumTracksPage.css";

export default function AlbumTracksPage() {
  const { id } = useParams<{ id: string }>();
  const { token, logout } = useAuthContext();
  const { showModal } = useModal();
  const navigate = useNavigate();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [album, setAlbum] = useState<Album | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);

  useEffect(() => {
    const fetchAlbumAndTracks = async () => {
      if (!id || !token) return;

      setIsLoading(true);
      setError(null);

      try {
        // Fetch album details
        const albumData = await spotifyFetch<Album>(
          `/albums/${id}`,
          token,
          {},
          () =>
            showModal(
              "Acceso Denegado",
              "Tu email no está autorizado para usar esta aplicación."
            )
        );
        setAlbum(albumData);

        // Fetch tracks
        const tracksData = await spotifyFetch<AlbumTracks>(
          `/albums/${id}/tracks`,
          token,
          {},
          () =>
            showModal(
              "Acceso Denegado",
              "Tu email no está autorizado para usar esta aplicación."
            )
        );
        setTracks(tracksData.items);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
          if (err.message.includes("expirado")) {
            logout();
          }
        } else {
          setError("Error desconocido");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlbumAndTracks();
  }, [id, token, logout, showModal]);

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const playTrack = (track: Track, index: number) => {
    const trackWithAlbum = { ...track, album };
    setCurrentTrack(trackWithAlbum);
    setCurrentTrackIndex(index);
    // The MusicPlayer component will handle the actual playback
  };

  const playNext = () => {
    if (currentTrackIndex < tracks.length - 1) {
      const nextIndex = currentTrackIndex + 1;
      const nextTrack = { ...tracks[nextIndex], album };
      setCurrentTrack(nextTrack);
      setCurrentTrackIndex(nextIndex);
    }
  };

  const playPrevious = () => {
    if (currentTrackIndex > 0) {
      const prevIndex = currentTrackIndex - 1;
      const prevTrack = { ...tracks[prevIndex], album };
      setCurrentTrack(prevTrack);
      setCurrentTrackIndex(prevIndex);
    }
  };

  const closePlayer = () => {
    setCurrentTrack(null);
    setCurrentTrackIndex(-1);
  };

  const renderContent = () => {
    if (isLoading) return <Spinner />;
    if (error) return <Message type="error" text={`Error: ${error}`} />;
    if (!album) return <Message text="Álbum no encontrado." />;

    return (
      <div className="album-tracks-container">
        <div className="album-header">
          <img
            src={
              album.images[0]?.url ||
              "https://via.placeholder.com/300?text=No+Image"
            }
            alt={album.name}
            className="album-cover"
          />
          <div className="album-info">
            <h1>{album.name}</h1>
            <p>Por {album.artists.map((artist) => artist.name).join(", ")}</p>
            <p>Publicado: {album.release_date}</p>
          </div>
        </div>
        <div className="tracks-list">
          <h2>Canciones</h2>
          <ul>
            {tracks.map((track, index) => (
              <li
                key={track.id}
                className={`track-item ${
                  currentTrack?.id === track.id ? "playing" : ""
                }`}
              >
                <button
                  className="play-track-btn"
                  onClick={() => playTrack(track, index)}
                  aria-label={`Reproducir ${track.name}`}
                >
                  {currentTrack?.id === track.id ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
                <span className="track-number">{track.track_number}.</span>
                <span className="track-name">{track.name}</span>
                <span className="track-artists">
                  {track.artists.map((artist) => artist.name).join(", ")}
                </span>
                <span className="track-duration">
                  {formatDuration(track.duration_ms)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="page-container">
      <Header />
      <main>
        <section className="album-tracks-section">
          <button onClick={() => navigate(-1)} className="back-button">
            ← Volver
          </button>
          {renderContent()}
        </section>
      </main>
      <MusicPlayer
        currentTrack={currentTrack}
        onClose={closePlayer}
        onNext={currentTrackIndex < tracks.length - 1 ? playNext : undefined}
        onPrevious={currentTrackIndex > 0 ? playPrevious : undefined}
      />
    </div>
  );
}
