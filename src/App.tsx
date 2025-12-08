import { useEffect ,useState} from "react"
import Authcomponent from "./TokenProvider"
import { fetchSavedAlbums ,fetchProfile,createPlaylist,fetchAlbumTracks} from "./script";
import type { userProfileExample,savedAlbumsExample } from "./types";
const App = () => {
    const [token]  = useState(localStorage.getItem("access_token"));
    const [profile,setProfile]=useState<userProfileExample>();
    const [albums,setalbums]=useState<savedAlbumsExample>();
    const [chosenalbum,setchosenaIbum]=useState<string[]>([]);
    // const [allsongs,setallsongs]=useState<string[]>([]);
    const tooglearray = (id:string) => {
        if ( chosenalbum.includes(id)) {
            setchosenaIbum(chosenalbum.filter((item) => item !== id));
        } else {
            
            setchosenaIbum([...chosenalbum, id]);
        }
    };
    const mergemAll = async() => {
      const playlist = await createPlaylist(localStorage.getItem("access_token")||"",profile?.id||"")
      const temp:string[] = [];
      chosenalbum.forEach( async(albumId)=>{
        const tracksData = await fetchAlbumTracks(localStorage.getItem("access_token")||"", albumId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const trackUris = tracksData.items.map((item:any) => item.track.uri);
        temp.push(...trackUris);
      });
      // Shuffle the collected track URIs
      for (let i = temp.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [temp[i], temp[j]] = [temp[j], temp[i]];
      }
      // Spotify API allows adding a maximum of 100 tracks at a time
      const chunkSize = 100;
      for (let i = 0; i < temp.length; i += chunkSize) {
        const trackUris = temp.slice(i, i + chunkSize);
        const url = `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`;
        const payload = {
          method:'POST',
          headers:{
            'Authorization':`Bearer ${localStorage.getItem("access_token")}`,
            'Content-Type' : 'application/json'
          },
            body : JSON.stringify({
            uris: trackUris
          })
        }
        await fetch(url, payload);
      }
    
      alert("All selected playlists have been merged into a new playlist!");    
    }
    useEffect(()=>{
        Authcomponent();
    },[])
useEffect(()=>{
    if (!token) return;

  const load = async () => {
    const albumsData = await fetchSavedAlbums(token);
    setalbums(albumsData);

    const profileData = await fetchProfile(token);
    setProfile(profileData);
  };

  load();
},[token])
  return (
    <div className="min-h-screen bg-neutral-900 text-teal-50">
{profile &&
    <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Welcome, {profile.display_name}!</h1>
        <p className="mb-2">Email: {profile.email}</p>
        <p className="mb-2">Country: {profile.country}</p>
        <p className="mb-2">Product: {profile.product}</p>
        <img src={profile.images[0].url} height={300} width={300} alt="" />
    </div>
}
{albums &&
    <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Your Playlists:</h2>
        <ul>    
            {albums.items.map((album)=>(
                <li key={album.id} className="mb-2">
                    <p className="font-semibold">{album.name}</p>
                    <p className="text-sm text-gray-400">By {album.owner.display_name}</p>
                    <img src={album.images[0].url} height={100} width={100} alt="" onClick={()=>tooglearray(album.id)}/>
                </li>
            ))}
        </ul>
    </div>
}
{chosenalbum.length>1 &&
    <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Chosen Playlists IDs:</h2>      
        <ul>    
            {chosenalbum.filter(id=>id!=="").map((id)=>(
                <li key={id} className="mb-2">
                    <p className="font-semibold">{id}</p>
                </li>
            ))}
        </ul>
    </div>
}
<button onClick={mergemAll}>do it baby</button>
        </div>
  )
}

export default App