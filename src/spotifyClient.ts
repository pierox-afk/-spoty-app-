const BASE_URL = "https://api.spotify.com/v1";

export const spotifyFetch = async <T>(
  endpoint: string,
  token: string,
  options: RequestInit = {},
  onUnauthorized?: () => void
): Promise<T> => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Token de Spotify inválido o expirado.");
    }
    if (response.status === 403) {
      onUnauthorized?.();
      throw new Error("Usuario no autorizado para usar esta aplicación.");
    }
    const errorData = await response.json();
    throw new Error(
      `Error de la API de Spotify: ${
        errorData.error.message || response.statusText
      }`
    );
  }

  if (response.status === 204) {
    return null as T;
  }

  const method = options.method?.toUpperCase();
  if ((method === "PUT" || method === "DELETE") && response.ok) {
    return null as T;
  }

  return response.json();
};
