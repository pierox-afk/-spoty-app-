import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Album } from "../spotify";
import { useAuthContext } from "../AuthContext";
import { spotifyFetch } from "../spotifyClient";
import "./AlbumCard.css";

interface AlbumCardProps {
  album: Album;
  isInitiallySaved?: boolean;
  onToggleSave?: React.Dispatch<React.SetStateAction<Set<string>>>;
}

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/300?text=No+Image";

export const AlbumCard = ({
  album,
  isInitiallySaved = false,
  onToggleSave,
}: AlbumCardProps) => {
  const imageUrl = album.images[0]?.url || PLACEHOLDER_IMAGE;
  const { token } = useAuthContext();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(isInitiallySaved);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsSaved(isInitiallySaved);
  }, [isInitiallySaved]);

  const handleToggleSave = async () => {
    if (!token || isSaving) return;

    setIsSaving(true);
    const endpoint = `/me/albums?ids=${album.id}`;
    const method = isSaved ? "DELETE" : "PUT";

    try {
      await spotifyFetch(endpoint, token, { method });
      setIsSaved(!isSaved);
      if (onToggleSave) {
        onToggleSave((prevIds) => {
          const newIds = new Set(prevIds);
          if (isSaved) {
            newIds.delete(album.id);
          } else {
            newIds.add(album.id);
          }
          return newIds;
        });
      }
    } catch (error) {
      console.error("Error al guardar el álbum:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="album-card">
      <div className="album-card-image-container">
        <img src={imageUrl} alt={album.name} className="album-card-image" />
      </div>
      <div className="album-info">
        <h3 className="album-card-name">{album.name}</h3>
        <p className="album-card-date">Publicado: {album.release_date}</p>
      </div>
      <div className="album-buttons">
        <button
          className="view-btn"
          onClick={() => navigate(`/album/${album.id}`)}
          aria-label="Ver canciones del álbum"
        >
          Ver canciones
        </button>
        <button
          className="add-btn"
          onClick={handleToggleSave}
          disabled={isSaving}
          aria-label={isSaved ? "Quitar álbum" : "Añadir álbum"}
        >
          {isSaving && "..."}
          {!isSaving && (isSaved ? "✓ Added" : "+ Add album")}
        </button>
      </div>
    </div>
  );
};
