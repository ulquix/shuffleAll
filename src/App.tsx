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

// --- COMPONENTS ---

// 1. The Landing Page Component (New)
const LandingPage = ({ onLogin }: { onLogin: () => void }) => {
    useEffect(() => {   
        if(window.location.search.includes("code"))
        onLogin();
    }, []);
  return (
    <div className="min-h-screen bg-neutral-900 text-white font-sans selection:bg-green-500 selection:text-black overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-green-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
        <div className="text-2xl font-bold tracking-tighter flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-black">
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" />
            </svg>
          </div>
          AlbumFlow
        </div>
        <button
          onClick={onLogin}
          className="text-sm font-semibold text-neutral-300 hover:text-white transition-colors"
        >
          Login
        </button>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-linear-to-br from-white via-neutral-200 to-neutral-500 text-transparent bg-clip-text">
          Master Your <br /> Music Library.
        </h1>
        <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          Stop shuffling one album at a time. Select your favorites, merge them
          into mega-playlists, or blast them directly to your queue.
        </p>

        <button
          onClick={onLogin}
          className="group relative inline-flex items-center gap-3 px-8 py-4 bg-green-500 text-black font-bold rounded-full text-lg transition-all hover:scale-105 hover:bg-green-400 shadow-[0_0_40px_-10px_rgba(34,197,94,0.6)]"
        >
          Connect with Spotify
          <svg
            className="w-5 h-5 transition-transform group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </button>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-32 text-left">
          <FeatureCard
            icon={
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            }
            title="Bulk Queue"
            desc="Add 10+ albums to your queue instantly. No more right-clicking every single track."
          />
          <FeatureCard
            icon={
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            }
            title="Merge & Mix"
            desc="Combine your favorite albums into one permanent playlist saved to your library."
          />
          <FeatureCard
            icon={
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            }
            title="Smart Shuffle"
            desc="We randomize the tracks before adding them, ensuring a fresh listening experience every time."
          />
        </div>
      </main>
      
      <footer className="relative z-10 border-t border-neutral-800 py-8 text-center text-neutral-500 text-sm">
        <p>© {new Date().getFullYear()} AlbumFlow. Not affiliated with Spotify.</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) => (
  <div className="p-6 rounded-2xl bg-neutral-800/30 border border-neutral-700/50 hover:bg-neutral-800/50 transition-colors">
    <div className="w-12 h-12 bg-neutral-700 rounded-lg flex items-center justify-center text-green-500 mb-4">
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {icon}
      </svg>
    </div>
    <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
    <p className="text-neutral-400 leading-relaxed">{desc}</p>
  </div>
);


// 2. The Main Application (Logic from previous steps)
const App = () => {
  const [token] = useState(localStorage.getItem("access_token"));
  const [profile, setProfile] = useState<userProfileExample>();
  const [albums, setalbums] = useState<savedAlbumsExample>();
  const [chosenalbum, setchosenaIbum] = useState<string[]>([]);

  const handleLogin = () => {
    Authcomponent();
  };

  const tooglearray = (id: string) => {
    if (chosenalbum.includes(id)) {
      setchosenaIbum(chosenalbum.filter((item) => item !== id));
    } else {
      setchosenaIbum([...chosenalbum, id]);
    }
  };

  const mergeAll = async (type: string) => {
    const accessToken = localStorage.getItem("access_token") || "";

    const allTrackUris = (
      await Promise.all(
        chosenalbum.map(async (albumId) => {
          const tracksData = await fetchAlbumTracks(accessToken, albumId);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return tracksData.items.map((item: any) => item.track.uri);
        })
      )
    ).flat();

    for (let i = allTrackUris.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allTrackUris[i], allTrackUris[j]] = [allTrackUris[j], allTrackUris[i]];
    }

    if (type === "queue" && profile?.product !== "free") {
      await addToQueueBulk(accessToken, allTrackUris);
      alert("All selected albums have been added to your queue!");
      return;
    }

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
    // Only fetch data if we actually have a token
    if (!token) return;

    const load = async () => {
      const albumsData = await fetchSavedAlbums(token);
      setalbums(albumsData);
      const profileData = await fetchProfile(token);
      setProfile(profileData);
    };
    load();
  }, [token]);

  // --- RENDER CONDITION ---
  
  // If no token, show Landing Page
  if (!token) {
    return <LandingPage onLogin={handleLogin} />;
  }

  // If token exists, show the Dashboard (Main App)
  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-200 font-sans selection:bg-green-500 selection:text-white pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header / Nav for Logged In State */}
        <div className="flex justify-between items-center mb-8">
            <div className="text-xl font-bold text-white flex items-center gap-2">
                 <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-black">
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" />
            </svg>
          </div>
          AlbumFlow
        </div>
            <button onClick={() => {localStorage.clear(); window.location.reload()}} className="text-sm text-neutral-400 hover:text-white">Logout</button>
        </div>

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
                    <p className="text-xs text-neutral-400 mt-1">Album</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

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
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
             <button
              onClick={() => mergeAll("queue")}
              className="flex-1 sm:flex-none px-6 py-3 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white font-bold transition-colors border border-neutral-600"
            >
              Add to Queue
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