import { useEffect, useRef, type JSX } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SearchPage from "./pages/SearchPage";
import MyAlbums from "./pages/MyAlbums";
import AlbumTracksPage from "./pages/AlbumTracksPage";
import CustomAlbumDetailPage from "./pages/CustomAlbumDetailPage";
import { getAccessToken } from "./hooks/useAuth";
import { useAuthContext } from "./hooks/useAuthContext";
import { ModalProvider } from "./ModalContext";

const CallbackPage = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const { login } = useAuthContext();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      const fetchToken = async () => {
        if (hasFetched.current) {
          return;
        }
        hasFetched.current = true;
        try {
          const token = await getAccessToken(code);
          if (token) {
            login(token);
            navigate("/search", { replace: true });
          } else {
            throw new Error("Token was not received.");
          }
        } catch (error: unknown) {
          console.error("Error during token fetch:", error);
          navigate("/");
        }
      };
      fetchToken();
    }
  }, [navigate, login]);

  return <div>Cargando...</div>;
};

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { token } = useAuthContext();
  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <ModalProvider>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/callback" element={<CallbackPage />} />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <SearchPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/albums"
          element={
            <ProtectedRoute>
              <MyAlbums />
            </ProtectedRoute>
          }
        />
        <Route
          path="/album/:id"
          element={
            <ProtectedRoute>
              <AlbumTracksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/custom-album/:id"
          element={
            <ProtectedRoute>
              <CustomAlbumDetailPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </ModalProvider>
  );
}

export default App;
