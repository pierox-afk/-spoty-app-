import type { Album } from "../types/spotify";
import { AlbumCard } from "./AlbumCard";
import "./AlbumGrid.css";

interface AlbumGridProps {
  albums: Album[];
  savedAlbumIds?: Set<string>;
  onToggleSave?: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export const AlbumGrid = ({
  albums,
  savedAlbumIds,
  onToggleSave,
}: AlbumGridProps) => {
  return (
    <div className="album-grid">
      {albums.map((album) => (
        <AlbumCard
          key={album.id}
          album={album}
          isInitiallySaved={savedAlbumIds?.has(album.id)}
          onToggleSave={onToggleSave}
        />
      ))}
    </div>
  );
};
