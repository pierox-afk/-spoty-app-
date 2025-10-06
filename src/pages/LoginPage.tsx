import { Navigate } from "react-router-dom";
import { useAuthContext } from "../AuthContext";
import { redirectToSpotifyAuth } from "../hooks/useAuth";
import logo from "../img/Shape (1).png";
import "./LoginPage.css";

export default function LoginPage() {
  const { token } = useAuthContext();

  const handleLogin = () => {
    redirectToSpotifyAuth();
  };

  if (token) {
    return <Navigate to="/search" replace />;
  }

  return (
    <div className="login-page">
      <header className="login-header">
        <img src={logo} alt="Logo de Spoty" className="login-logo" />
      </header>
      <div className="login-container">
        <div className="login-icon-container">
          <svg
            viewBox="4 -2.5 18 24"
            className="login-arrow-icon"
            stroke="none"
          >
            <path
              fill="currentColor"
              d="M6.4 18L5 16.6L14.6 7H6V5h12v12h-2V8.4L6.4 18Z"
              stroke="currentColor"
              strokeWidth="1"
            />
          </svg>
        </div>
        <div className="login-content">
          <h1>
            Disfruta de la <span className="highlight">mejor música</span>
          </h1>
          <p>Accede a tu cuenta para guardar tus álbumes favoritos.</p>
          <button onClick={handleLogin} className="login-button">
            Log in con Spotify
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              className="login-button-icon"
            >
              <path
                fill="currentColor"
                d="M0 10 L15 10 L15 5 L20 10 L15 15 L15 10 Z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
