import { getAccessToken, redirectToAuthCodeFlow } from "./script";
import { useEffect } from "react";

const Authcomponent = () => {

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      const token = localStorage.getItem("access_token");
      const expiry = Number(localStorage.getItem("expiry"));
      const refreshToken = localStorage.getItem("refresh_token");
      const now = Date.now();

      if (!token && !code) {
        redirectToAuthCodeFlow(import.meta.env.VITE_SPOTIFY_CLIENT_ID);
        return;
      }

      if (code && !token) {
        await getAccessToken(import.meta.env.VITE_SPOTIFY_CLIENT_ID, code);
        return;
      }

      if (token && expiry && now > expiry) {
        if (!refreshToken) return;

        const payload = {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: refreshToken,
            client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
          }),
        };

        const body = await fetch("https://accounts.spotify.com/api/token", payload);
        const response = await body.json();

        if (response.access_token) {
          localStorage.setItem("access_token", response.access_token);
        }
        if (response.refresh_token) {
          localStorage.setItem("refresh_token", response.refresh_token);
        }

        const expires = Number(response.expires_in) * 1000;
        localStorage.setItem("expiry", (Date.now() + expires).toString());
      }
    };

    run();
  }, []);

  return null;
};

export default Authcomponent;
