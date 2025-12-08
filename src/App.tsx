import { useEffect, useState } from "react";
import Authcomponent from "./TokenProvider";
import { fetchSavedAlbums, fetchProfile } from "./script";
import type { savedAlbumsExample, userProfileExample } from "./types";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("access_token"));
  const [profile, setProfile] = useState<userProfileExample>();
  const [albums, setAlbums] = useState<savedAlbumsExample>();
  const [chosenalbum, setChosenAlbum] = useState<string[]>([]);

  const toggleArray = (id: string) => {
    setChosenAlbum(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  useEffect(() => {
    const run = async () => {
      await Authcomponent();
      setToken(localStorage.getItem("access_token"));
    };
    run();
  }, []);

  useEffect(() => {
    if (!token) return;

    const load = async () => {
      const albumsData = await fetchSavedAlbums(token);
      setAlbums(albumsData);

      const profileData = await fetchProfile(token);
      setProfile(profileData);
    };

    load();
  }, [token]);

  return (
    <div className="min-h-screen bg-neutral-900 text-teal-50">

      {profile && (
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">
            Welcome, {profile.display_name}!
          </h1>
          <p>Email: {profile.email}</p>
          <p>Country: {profile.country}</p>
          <p>Product: {profile.product}</p>

          {profile.images?.[0]?.url && (
            <img src={profile.images[0].url} width={300} height={300} />
          )}
        </div>
      )}

      {albums && (
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Your Saved Albums:</h2>
          <ul>
            {albums.items.map(album => (
              <li key={album.id} className="mb-2">
                <p className="font-semibold">{album.name}</p>
                
                <img
                  src={album.images[0].url}
                  width={100}
                  height={100}
                  onClick={() => toggleArray(album.id)}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {chosenalbum.length > 1 && (
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Chosen Album IDs:</h2>
          <ul>
            {chosenalbum.map(id => (
              <li key={id}>
                <p>{id}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button onClick={() => {}}>do it baby</button>
    </div>
  );
};

export default App;
