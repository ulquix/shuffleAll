import { useEffect, useState } from "react";
import Authcomponent from "./TokenProvider";
import {  fetchProfile } from "./script";


const App = () => {
    const [token] = useState<string | null>(localStorage.getItem("access_token"));
    useEffect(() => {
        Authcomponent()
    }, []);
useEffect(() => {
    if (token)
    fetchProfile(token!).then(profile => {
        console.log("User Profile:", profile);
    });
    }, [token]);
    return (
        <div>
            <h1>Spotify Auth App</h1>
        </div>
    );
};

export default App;
