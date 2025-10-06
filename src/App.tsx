// src/App.tsx
import { useEffect, useRef, type JSX } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SearchPage from "./pages/SearchPage"; // Importa la nueva página
import MyAlbums from "./pages/MyAlbums";
import { getAccessToken } from "./hooks/useAuth";
import { useAuthContext } from "./AuthContext";

// Componente para la página de callback
const CallbackPage = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const { login } = useAuthContext();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      const fetchToken = async () => {
        // Evita que el efecto se ejecute dos veces en StrictMode
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
        } catch (error) {
          console.error("Error during token fetch:", error);
          navigate("/"); // Si algo falla, vuelve al login
        }
      };
      fetchToken();
    }
  }, [navigate, login]);

  return <div>Cargando...</div>;
};

// Componente para proteger rutas
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { token } = useAuthContext();
  if (!token) {
    // Si no hay token, redirigimos a la página de login.
    // 'replace' evita que el usuario pueda volver atrás a una ruta protegida.
    return <Navigate to="/" replace />;
  }

  // Si hay token, mostramos el contenido protegido.
  return children;
};

function App() {
  return (
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
      {/* Añade aquí más rutas protegidas */}
    </Routes>
  );
}

export default App;
