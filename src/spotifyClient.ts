const BASE_URL = "https://api.spotify.com/v1";

export const spotifyFetch = async <T>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
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
      // El token ha expirado o es inválido.
      // El AuthContext se encargará de redirigir al login.
      // Podríamos llamar a logout() aquí si lo pasamos como parámetro.
      throw new Error("Token de Spotify inválido o expirado.");
    }
    const errorData = await response.json();
    throw new Error(
      `Error de la API de Spotify: ${
        errorData.error.message || response.statusText
      }`
    );
  }

  // Spotify devuelve 204 No Content para algunas peticiones (ej. DELETE)
  if (response.status === 204) {
    // Devolvemos 'null' casteado a T para satisfacer a TypeScript
    return null as T;
  }

  // Si la petición es PUT o DELETE y fue exitosa, no esperamos contenido
  const method = options.method?.toUpperCase();
  if ((method === "PUT" || method === "DELETE") && response.ok) {
    return null as T;
  }

  return response.json();
};
