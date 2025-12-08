import {  getAccessToken, redirectToAuthCodeFlow } from './script';

const Authcomponent = async() => {
    const params = new URLSearchParams(window.location.search);
const code = params.get("code");
            const token = localStorage.getItem("access_token");
            const expiry = Number(localStorage.getItem("expiry"));
            const refreshToken = localStorage.getItem("refresh_token")!;
            const now = Date.now(); 
            if(!token && !code){
              console.log("no token and no code, redirecting to auth flow");
                redirectToAuthCodeFlow(import.meta.env.VITE_SPOTIFY_CLIENT_ID);
            }
           else if(code && !token ){
            console.log("no token but code exists, getting access token");
              await getAccessToken(import.meta.env.VITE_SPOTIFY_CLIENT_ID, code)
            }
    
           else if(token && expiry && now > expiry){
            console.log("token expired, refreshing token");
                  const url = "https://accounts.spotify.com/api/token";
    
        const payload = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID
          }),
        }
        const body = await fetch(url, payload);
        const response = await body.json();
    
        localStorage.setItem('access_token', response.access_token);
        if (response.refresh_token) {
          localStorage.setItem('refresh_token', response.refresh_token);
           const expiry = Number(response.expires_in) * 1000;
  const totalexpiry = Date.now() + expiry;
  localStorage.setItem("expiry", totalexpiry.toString());
        }
            }
            else{
              console.log("token valid, no action needed");
             
            }
        }
  


export default Authcomponent