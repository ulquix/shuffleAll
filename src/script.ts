const clientId = "f5380c19e1374deaaa40f63bc4c49c56"; // your client id

const redirectUri = "https://shuffle-all.vercel.app"; // MUST match Spotify Dashboard
const scopes = [
  "user-read-private",
  "user-read-email",
  "playlist-read-private",
  "playlist-read-collaborative",
  "user-library-read"
].join(" ");

const params = new URLSearchParams(window.location.search);
const code = params.get("code");

// -------------------------------------------
// STEP 1: Redirect user to Spotify login (PKCE)
// -------------------------------------------
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

// -------------------------------------------
// PKCE Helpers
// -------------------------------------------
function generateCodeVerifier(length: number) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
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

// -------------------------------------------
// STEP 2: Exchange authorization code for access token
// -------------------------------------------
export async function getAccessToken(clientId: string, code: string): Promise<string> {
  const verifier = localStorage.getItem("verifier");
  if (!verifier) throw new Error("Missing PKCE verifier.");

  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    code_verifier: verifier
  });

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });

  const data = await response.json();
  if (data.error) {
    console.error(data);
    throw new Error("Failed to get access token.");
  }

  return data.access_token;
}

// -------------------------------------------
// API Calls
// -------------------------------------------

// Get saved albums just to confirm token works
async function fetchSavedAlbums(token: string) {
  const response = await fetch("https://api.spotify.com/v1/me/playlists", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.json();
}

async function fetchProfile(token: string) {
  const response = await fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.json();
}

// -------------------------------------------
// UI Handler
// -------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function populateUI(profile: any) {
  console.log("User Profile:", profile);

  const name = document.getElementById("displayName");
  if (name) name.innerText = profile.display_name;

  const avatar = document.getElementById("avatar");
  if (avatar && profile.images.length > 0) {
    const img = new Image(200, 200);
    img.src = profile.images[0].url;
    avatar.appendChild(img);
  }

  const email = document.getElementById("email");
  if (email) email.innerText = profile.email;
}

// -------------------------------------------
// BOOTSTRAP
// -------------------------------------------
(async () => {
  if (!code) {
    redirectToAuthCodeFlow(clientId);
  } else {
    try {
      const token = await getAccessToken(clientId, code);

      const profile = await fetchProfile(token);
      populateUI(profile);

      const albums = await fetchSavedAlbums(token);
      console.log("Saved albums:", albums);
    } catch (err) {
      console.error("Auth error:", err);
    }
  }
})();
