import { useState, useEffect, useRef, useCallback } from "react";
import { useAuthContext } from "../AuthContext";
import { spotifyFetch } from "../spotifyClient";
import { Spinner } from "../components/Spinner";
import { Message } from "../components/Message";
import type { Album } from "../spotify";
import { Header } from "../components/Header";

import "../components/Page.css";

export default function MyAlbums() {
  const { token, logout } = useAuthContext();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [draggedAlbum, setDraggedAlbum] = useState<Album | null>(null);

  const selectNextAlbum = () => {
    if (!selectedAlbum || albums.length === 0) return;
    const currentIndex = albums.findIndex((a) => a.id === selectedAlbum.id);
    const nextIndex = (currentIndex + 1) % albums.length;
    setSelectedAlbum(albums[nextIndex]);
  };

  const selectPrevAlbum = () => {
    if (!selectedAlbum || albums.length === 0) return;
    const currentIndex = albums.findIndex((a) => a.id === selectedAlbum.id);
    const prevIndex = (currentIndex - 1 + albums.length) % albums.length;
    setSelectedAlbum(albums[prevIndex]);
  };

  useEffect(() => {
    const fetchSavedAlbums = async () => {
      if (!token) return;

      try {
        const endpoint = "/me/albums?limit=50";
        const data = await spotifyFetch<{ items: { album: Album }[] }>(
          endpoint,
          token
        );
        const savedAlbums = data.items.map((item) => item.album);
        setAlbums(savedAlbums);
      } catch (err: any) {
        setError(err.message);
        if (err.message.includes("expirado")) {
          logout();
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedAlbums();
  }, [token, logout]);

  const groupByArtist = (albums: Album[]) => {
    const grouped: { [key: string]: Album[] } = {};
    albums.forEach((album) => {
      const artistName = album.artists[0]?.name || "Unknown";
      if (!grouped[artistName]) {
        grouped[artistName] = [];
      }
      grouped[artistName].push(album);
    });
    return grouped;
  };

  const handleRemoveAlbum = async (albumId: string) => {
    if (!token) return;

    try {
      await spotifyFetch(`/me/albums?ids=${albumId}`, token, {
        method: "DELETE",
      });
      const newAlbums = albums.filter((album) => album.id !== albumId);
      setAlbums(newAlbums);

      if (selectedAlbum?.id === albumId) {
        if (newAlbums.length > 0) {
          const currentIndex = albums.findIndex((a) => a.id === albumId);
          const nextIndex = Math.min(currentIndex, newAlbums.length - 1);
          setSelectedAlbum(newAlbums[nextIndex]);
        } else {
          setSelectedAlbum(null);
        }
      }
    } catch (err: any) {
      setError("Error removing album");
    }
  };

  const handleDragStart = (e: React.DragEvent, album: Album) => {
    setDraggedAlbum(album);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetAlbum: Album) => {
    e.preventDefault();
    if (!draggedAlbum || draggedAlbum.id === targetAlbum.id) return;

    const draggedArtist = draggedAlbum.artists[0]?.name || "Unknown";
    const targetArtist = targetAlbum.artists[0]?.name || "Unknown";

    if (draggedArtist !== targetArtist) return; // Only reorder within same artist

    const newAlbums = [...albums];
    const draggedIndex = newAlbums.findIndex((a) => a.id === draggedAlbum.id);
    const targetIndex = newAlbums.findIndex((a) => a.id === targetAlbum.id);

    newAlbums.splice(draggedIndex, 1);
    newAlbums.splice(targetIndex, 0, draggedAlbum);

    setAlbums(newAlbums);
    setDraggedAlbum(null);
  };

  const sliderSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sliderSectionRef.current &&
        !sliderSectionRef.current.contains(event.target as Node)
      ) {
        setSelectedAlbum(null);
      }
    };

    if (selectedAlbum) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedAlbum]);

  const sliderRef = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const slider = sliderRef.current;
    if (!slider) return;

    isDown.current = true;
    slider.classList.add("active-drag");
    startX.current = e.pageX - slider.offsetLeft;
    scrollLeft.current = slider.scrollLeft;
  }, []);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!selectedAlbum?.id || !slider) return;

    const onMouseUp = () => {
      isDown.current = false;
      if (slider) {
        slider.classList.remove("active-drag");
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown.current || !slider) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX.current) * 2;
      slider.scrollLeft = scrollLeft.current - walk;
    };

    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mousemove", onMouseMove);

    return () => {
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, [selectedAlbum?.id]);

  useEffect(() => {
    if (selectedAlbum?.id) {
      const selectedAlbumElement = document.getElementById(selectedAlbum.id);
      selectedAlbumElement?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
      });
    }
  }, [selectedAlbum?.id]);

  if (isLoading) return <Spinner />;
  if (error) return <Message type="error" text={`Error: ${error}`} />;

  const groupedAlbums = groupByArtist(albums);

  return (
    <div className="page-container">
      <Header />
      <main>
        <section className="albums-header">
          <h1>
            Mis <span className="highlight">álbumes</span> guardados
          </h1>
          <p>
            Disfruta de tu música a un solo click y descubre qué discos has
            guardado dentro de 'mis álbumes'.
          </p>
        </section>

        {selectedAlbum ? (
          <section className="selected-album-section" ref={sliderSectionRef}>
            <div className="selected-header">
              <button
                className="view-btn back-btn"
                onClick={() => setSelectedAlbum(null)}
              >
                &larr; Volver a la lista
              </button>
            </div>
            <div
              className="selected-album-slider"
              ref={sliderRef}
              onMouseDown={onMouseDown}
            >
              {albums.map((album) => (
                <div
                  key={album.id}
                  id={album.id}
                  className={`selected-slider-item ${
                    album.id === selectedAlbum.id ? "selected" : ""
                  }`}
                  onClick={() => setSelectedAlbum(album)}
                >
                  <img
                    src={album.images[0]?.url || ""}
                    alt={album.name}
                    className="selected-slider-image"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.opacity = "0.3";
                    }}
                  />
                  {album.id === selectedAlbum.id && (
                    <div className="selected-slider-info">
                      <div className="info-left">
                        <h4>{album.name}</h4>
                        <p>Publicado: {album.release_date}</p>
                      </div>
                      {album.id === selectedAlbum.id && (
                        <button
                          className="remove-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveAlbum(album.id);
                          }}
                        >
                          - Remove album
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="albums-section">
            {Object.entries(groupedAlbums).map(([artist, artistAlbums]) => (
              <div key={artist} className="artist-group">
                <h2>{artist}</h2>
                <div className="albums-grid">
                  {artistAlbums.map((album) => (
                    <div
                      key={album.id}
                      className="album-card"
                      draggable
                      onDragStart={(e) => handleDragStart(e, album)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, album)}
                      onClick={() => setSelectedAlbum(album)}
                    >
                      <img
                        src={album.images[0]?.url || ""}
                        alt={album.name}
                        className="album-image"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.opacity = "0.3";
                        }}
                      />
                      <div className="album-info">
                        <h3>{album.name}</h3>
                        <p>Publicado: {album.release_date}</p>
                      </div>
                      <button
                        className="remove-album-btn"
                        style={{ marginTop: "auto" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveAlbum(album.id);
                        }}
                      >
                        - Remove album
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
