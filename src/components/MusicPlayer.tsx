import "./MusicPlayer.css";

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  duration_ms: number;
  external_urls?: {
    spotify: string;
  };
  album?: {
    images: { url: string }[];
    name: string;
  };
}

interface MusicPlayerProps {
  currentTrack: Track | null;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export const MusicPlayer = ({
  currentTrack,
  onClose,
  onNext,
  onPrevious,
}: MusicPlayerProps) => {
  const openInSpotify = () => {
    if (currentTrack?.external_urls?.spotify) {
      console.log("Opening track in Spotify Web Player:", currentTrack.name);
      window.open(currentTrack.external_urls.spotify, "_blank");
    } else {
      console.warn("No Spotify URL available for:", currentTrack?.name);
      alert("No se pudo abrir la canción en Spotify.");
    }
  };

  if (!currentTrack) return null;

  return (
    <div className="music-player">
      <div className="player-content">
        <div className="track-info">
          <img
            src={currentTrack.album?.images[0]?.url || "/placeholder-album.png"}
            alt={currentTrack.album?.name || "Album"}
            className="track-image"
          />
          <div className="track-details">
            <h4>{currentTrack.name}</h4>
            <p>
              {currentTrack.artists.map((artist) => artist.name).join(", ")}
            </p>
          </div>
        </div>

        <div className="player-controls">
          <button
            className="control-btn"
            onClick={onPrevious}
            disabled={!onPrevious}
            title="Canción anterior"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>

          <button
            className="play-btn"
            onClick={openInSpotify}
            title="Reproducir en Spotify"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>

          <button
            className="control-btn"
            onClick={onNext}
            disabled={!onNext}
            title="Siguiente canción"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>
        </div>

        <div className="spotify-message">
          <span>🎵 Reproduciendo en Spotify</span>
        </div>

        <button
          className="close-btn"
          onClick={onClose}
          title="Cerrar reproductor"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
      </div>
    </div>
  );
};
