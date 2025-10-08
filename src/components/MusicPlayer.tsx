import { useState, useEffect, useRef } from "react";
import "./MusicPlayer.css";

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  duration_ms: number;
  preview_url?: string;
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
    if (currentTrack?.preview_url && audioRef.current) {
      audioRef.current.src = currentTrack.preview_url;
      audioRef.current.load();
      setIsPlaying(true);
      audioRef.current.play().catch(() => {
        // Preview might not be available
        setIsPlaying(false);
      });
    }
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {
          // Preview might not be available
        });
      }
      setIsPlaying(!isPlaying);
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
          >
            ⏮️
          </button>

          <button className="play-btn" onClick={togglePlay}>
            {isPlaying ? "⏸️" : "▶️"}
          </button>

          <button className="control-btn" onClick={onNext} disabled={!onNext}>
            ⏭️
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
          <span className="volume-icon">🔊</span>
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

        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
};
