import { useEffect, useState } from "react";
import Authcomponent from "./TokenProvider";
import { fetchSavedAlbums, fetchProfile } from "./script";
import type { savedAlbumsExample, userProfileExample } from "./types";

const App = () => {
    const [albums, setAlbums] = useState<savedAlbumsExample | null>(null);
    const [profile, setProfile] = useState<userProfileExample | null>(null);

    useEffect(() => {
        const initializeAuth = async () => {
            await Authcomponent();
            const token = localStorage.getItem("access_token");
            if (token) {
                const albumsData = await fetchSavedAlbums(token);
                setAlbums(albumsData);
                const profileData = await fetchProfile(token);
                setProfile(profileData);
            }
        };
        initializeAuth();
    }, []);

    return (<div>
        <h1>Spotify Shuffle All</h1>
        {profile && (<div>
            <h2>Welcome, {profile.display_name}</h2>
            <p>{profile.email}</p>  
        </div>)}
        {albums && (<div>
            <h2>Your Playlists:</h2>
            <ul>
                {albums.items.map((album) => (
                    <li key={album.id}>{album.name}</li>
                ))}
            </ul>
        </div>)}
    </div>);
};

export default App;
