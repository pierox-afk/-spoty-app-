import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthContext } from "../AuthContext";
import { spotifyFetch } from "../spotifyClient";
import type { Track, AlbumTracks, Album } from "../spotify";
import { useModal } from "../ModalContext";
import { Header } from "../components/Header";
import { Spinner } from "../components/Spinner";
import { Message } from "../components/Message";
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
            {tracks.map((track) => (
              <li key={track.id} className="track-item">
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
    </div>
  );
}
