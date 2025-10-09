import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "../components/Header";
import { Spinner } from "../components/Spinner";
import { Message } from "../components/Message";
import { CustomAlbumManager } from "../types/customAlbum";
import type { CustomAlbum, CustomTrack } from "../types/customAlbum";

export default function CustomAlbumDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [album, setAlbum] = useState<CustomAlbum | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<CustomTrack | null>(null);

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

  const playTrack = (track: CustomTrack) => {
    setCurrentTrack(track);
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

        <ul className="track-list">
          {album.tracks.map((track) => (
            <li key={track.id} className="track-item">
              <div className="track-info">
                <span className="track-number">{track.track_number}.</span>
                <span className="track-name">{track.name}</span>
              </div>
              <div className="track-controls">
                <span className="track-duration">
                  {formatDuration(track.duration_ms)}
                </span>
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
