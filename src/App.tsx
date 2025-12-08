import { useEffect, useState } from "react";
import Authcomponent from "./TokenProvider";
import {
  fetchSavedAlbums,
  fetchProfile,
  createPlaylist,
  fetchAlbumTracks,
  addToQueueBulk,
} from "./script";
import type { userProfileExample, savedAlbumsExample } from "./types";

const App = () => {
  const [token] = useState(localStorage.getItem("access_token"));
  const [profile, setProfile] = useState<userProfileExample>();
  const [albums, setalbums] = useState<savedAlbumsExample>();
  const [chosenalbum, setchosenaIbum] = useState<string[]>([]);
  // const [allsongs,setallsongs]=useState<string[]>([]);

  const tooglearray = (id: string) => {
    if (chosenalbum.includes(id)) {
      setchosenaIbum(chosenalbum.filter((item) => item !== id));
    } else {
      setchosenaIbum([...chosenalbum, id]);
    }
  };

  const mergeAll = async (type: string) => {
    const accessToken = localStorage.getItem("access_token") || "";

    // Fetch all album tracks concurrently
    const allTrackUris = (
      await Promise.all(
        chosenalbum.map(async (albumId) => {
          const tracksData = await fetchAlbumTracks(accessToken, albumId);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return tracksData.items.map((item: any) => item.track.uri);
        })
      )
    ).flat();

    // Shuffle
    for (let i = allTrackUris.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allTrackUris[i], allTrackUris[j]] = [allTrackUris[j], allTrackUris[i]];
    }
    if (type === "queue" && profile?.product !== "free") {
      await addToQueueBulk(accessToken, allTrackUris);
      alert("All selected albums have been added to your queue!");
      return;
    }
    // Add in chunks of 100
    const playlist = await createPlaylist(accessToken, profile?.id || "");

    for (let i = 0; i < allTrackUris.length; i += 100) {
      const chunk = allTrackUris.slice(i, i + 100);

      await fetch(
        `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ uris: chunk }),
        }
      );
    }

    alert("All selected albums have been merged into a new playlist!");
  };

  useEffect(() => {
    Authcomponent();
  }, []);

  useEffect(() => {
    if (!token) return;

    const load = async () => {
      const albumsData = await fetchSavedAlbums(token);
      setalbums(albumsData);

      const profileData = await fetchProfile(token);
      setProfile(profileData);
    };

    load();
  }, [token]);

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-200 font-sans selection:bg-green-500 selection:text-white pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {profile && (
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 mb-10 flex flex-col md:flex-row items-center gap-6 border border-neutral-700 shadow-xl">
            <div className="relative group">
              <img
                src={profile.images[0]?.url}
                className="h-32 w-32 rounded-full object-cover border-4 border-neutral-700 shadow-lg group-hover:scale-105 transition-transform duration-300"
                alt="Profile"
              />
              <div className="absolute bottom-1 right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-neutral-800"></div>
            </div>
            <div className="text-center md:text-left space-y-2">
              <h1 className="text-4xl font-bold text-white tracking-tight">
                {profile.display_name}
              </h1>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="px-3 py-1 bg-neutral-700 rounded-full text-xs font-medium uppercase tracking-wider text-neutral-300">
                  {profile.product} Plan
                </span>
                <span className="px-3 py-1 bg-neutral-700 rounded-full text-xs font-medium tracking-wider text-neutral-300">
                  {profile.country}
                </span>
              </div>
              <p className="text-neutral-400 text-sm">{profile.email}</p>
            </div>
          </div>
        )}

        {albums && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Your Library</h2>
              <span className="text-neutral-400 text-sm">
                Select albums to merge
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {albums.items.map((album) => {
                const isSelected = chosenalbum.includes(album.id);
                return (
                  <div
                    key={album.id}
                    onClick={() => tooglearray(album.id)}
                    className={`
                      group relative cursor-pointer rounded-lg p-4 transition-all duration-300 ease-in-out
                      ${
                        isSelected
                          ? "bg-neutral-800 ring-2 ring-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)]"
                          : "bg-neutral-800/40 hover:bg-neutral-800 hover:shadow-lg"
                      }
                    `}
                  >
                    <div className="relative aspect-square mb-4 overflow-hidden rounded-md shadow-md">
                      <img
                        src={album.images?.[0]?.url}
                        alt={album.name}
                        className={`
                          h-full w-full object-cover transition-transform duration-500
                          ${isSelected ? "scale-105 opacity-80" : "group-hover:scale-105"}
                        `}
                      />
                      {/* Checkmark overlay when selected */}
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                          <svg className="w-12 h-12 text-green-500 drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <h3 className={`font-semibold text-sm truncate ${isSelected ? 'text-green-400' : 'text-neutral-200'}`}>
                      {album.name}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1">{album.tracks.total} songs</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Bar (Only shows when items are selected) */}
      <div className={`
        fixed bottom-0 left-0 right-0 p-4 bg-neutral-900/90 border-t border-neutral-800 backdrop-blur-md transition-transform duration-300 z-50
        ${chosenalbum.length > 0 ? "translate-y-0" : "translate-y-full"}
      `}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-black font-bold text-sm">
              {chosenalbum.length}
            </span>
            <span className="text-white font-medium">Albums selected</span>
            {/* Optional: Debug view for IDs if really needed, simplified */}
             <span className="text-xs text-neutral-500 hidden lg:inline-block ml-2 truncate max-w-xs">
                ID: {chosenalbum[chosenalbum.length-1]}...
             </span>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
             <button
              onClick={() => mergeAll("queue")}
              className="flex-1 sm:flex-none px-6 py-3 rounded-full disabled:cursor-not-allowed bg-neutral-800 hover:bg-neutral-700 text-white font-bold transition-colors border border-neutral-600"
            disabled={profile?.product === "free"}
            >
              Add to Queue (Premium Only)
            </button>
            <button
              onClick={() => mergeAll("whatever")}
              className="flex-1 sm:flex-none px-8 py-3 rounded-full bg-green-500 hover:bg-green-400 text-black font-bold shadow-lg shadow-green-500/20 transition-all transform hover:scale-105"
            >
              Merge Playlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;