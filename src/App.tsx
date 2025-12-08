import { useEffect ,useState} from "react"
import Authcomponent from "./TokenProvider"
import { fetchSavedAlbums ,fetchProfile, createPlaylist} from "./script";
import type { userProfileExample,savedAlbumsExample } from "./types";
const App = () => {
    const [token, setToken]  = useState(localStorage.getItem("access_token"));
    const [profile,setProfile]=useState<userProfileExample>();
    const [albums,setalbums]=useState<savedAlbumsExample>();
    const [chosenalbum,setchosenaIbum]=useState<string[]>([]);
    const [allsongs,setallsongs]=useState<string[]>([]);
    const tooglearray = (id:string) => {
        if ( chosenalbum.includes(id)) {
            setchosenaIbum(chosenalbum.filter((item) => item !== id));
        } else {
            
            setchosenaIbum([...chosenalbum, id]);
        }
    };
    const mergemAll = () => {
        // createPlaylist(localStorage.getItem("access_token")||"",profile?.id||"").then((data)=>{
        //     console.log(data);
        // })
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