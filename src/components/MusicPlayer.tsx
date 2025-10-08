import { useState, useEffect, useRef } from "react";
import "./MusicPlayer.css";

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  duration_ms: number;
  preview_url?: string;
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (currentTrack && audioRef.current) {
      if (currentTrack.preview_url) {
        console.log(
          "Loading track:",
          currentTrack.name,
          "URL:",
          currentTrack.preview_url
        );
        audioRef.current.src = currentTrack.preview_url;
        audioRef.current.load();
        // Don't auto-play, let user control playback
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
      } else {
        // No preview available
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        console.warn("No preview URL available for track:", currentTrack.name);
      }
    }
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = async () => {
    if (!currentTrack?.preview_url) {
      console.warn("No preview URL available for:", currentTrack?.name);
      // Open in Spotify Web Player as fallback
      if (currentTrack?.external_urls?.spotify) {
        window.open(currentTrack.external_urls.spotify, "_blank");
      }
      return;
    }

    if (audioRef.current) {
      try {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          // Ensure audio is loaded before playing
          if (audioRef.current.readyState === 0) {
            audioRef.current.load();
            // Wait a bit for loading
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
          await audioRef.current.play();
          setIsPlaying(true);
        }
      } catch (error) {
        console.error("Error playing audio:", error);
        console.error(
          "Track:",
          currentTrack?.name,
          "URL:",
          currentTrack?.preview_url
        );
        setIsPlaying(false);

        // Fallback: Open in Spotify Web Player
        if (currentTrack?.external_urls?.spotify) {
          console.log("Opening in Spotify Web Player as fallback");
          window.open(currentTrack.external_urls.spotify, "_blank");
        } else {
          alert(
            "No se pudo reproducir la canción. Inténtalo de nuevo o usa Spotify."
          );
        }
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (!currentTrack) return null;

  return (
    <div className="music-player">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={() => {
          setIsPlaying(false);
          onNext?.();
        }}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onLoadStart={() => console.log("Audio load started")}
        onCanPlay={() => console.log("Audio can play")}
        onError={(e) => {
          console.error("Audio error:", e);
          setIsPlaying(false);
        }}
        preload="metadata"
        crossOrigin="anonymous"
      />

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
            className={`play-btn ${
              !currentTrack?.preview_url ? "disabled" : ""
            }`}
            onClick={togglePlay}
            disabled={!currentTrack?.preview_url}
            title={
              !currentTrack?.preview_url
                ? "Vista previa no disponible"
                : isPlaying
                ? "Pausar"
                : "Reproducir"
            }
          >
            {!currentTrack?.preview_url ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            ) : isPlaying ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
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

        <div className="progress-section">
          <span className="time">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="progress-bar"
          />
          <span className="time">{formatTime(duration)}</span>
        </div>

        <div className="volume-section">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="volume-icon"
          >
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          </svg>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="volume-slider"
          />
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
