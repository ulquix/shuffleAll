const redirectUri = import.meta.env.VITE_REDIRECTED_URL; // MUST match Spotify Dashboard
const scopes = [
  "user-read-private",
  "user-read-email",
  "playlist-read-private",
  "playlist-read-collaborative",
  "user-library-read",
  "playlist-modify-public",
  "playlist-modify-private",
].join(" ");

export async function redirectToAuthCodeFlow(clientId: string) {
  const verifier = generateCodeVerifier(128);
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem("verifier", verifier);

  const authUrl = new URL("https://accounts.spotify.com/authorize");
  authUrl.searchParams.append("client_id", clientId);
  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append("redirect_uri", redirectUri);
  authUrl.searchParams.append("scope", scopes);
  authUrl.searchParams.append("code_challenge_method", "S256");
  authUrl.searchParams.append("code_challenge", challenge);

  window.location.href = authUrl.toString();
}

function generateCodeVerifier(length: number) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let output = "";
  for (let i = 0; i < length; i++) {
    output += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return output;
}

async function generateCodeChallenge(verifier: string) {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function getAccessToken(
  clientId: string,
  code: string
): Promise<string> {
  const verifier = localStorage.getItem("verifier");
  if (!verifier) throw new Error("Missing PKCE verifier.");

  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    code_verifier: verifier,
  });

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = await response.json();
  if (data.error) {
    console.error(data);
    throw new Error("Failed to get access token.");
  }
  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("refresh_token", data.refresh_token);
  const expiry = Number(data.expires_in) * 1000;
  const totalexpiry = Date.now() + expiry;
  localStorage.setItem("expiry", totalexpiry.toString());
  return data.access_token;
}

export async function fetchSavedAlbums(token: string) {
  const response = await fetch("https://api.spotify.com/v1/me/playlists", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
}

export async function fetchProfile(token: string) {
  const response = await fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
}
export async function fetchAlbumTracks(token: string, albumId: string) {
  const response = await fetch(
    `https://api.spotify.com/v1/playlists/${albumId}/tracks`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.json();
}
export async function createPlaylist(token: string, userId: string) {
  const url = `https://api.spotify.com/v1/users/${userId}/playlists`;
  const payload = {
    method:'POST',
    headers:{
      'Authorization':`Bearer ${token}`,
      'Content-Type' : 'application/json'
    },
    data : JSON.stringify({
      name: "Shuffled All Playlist",
      description: "A playlist with all your songs shuffled together",
      public: true
    })
  }
  const response = await fetch(url, payload);
  return response.json();

  
}