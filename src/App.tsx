import { useEffect } from "react"
import Authcomponent from "./TokenProvider"
const App = () => {
    useEffect(()=>{
        Authcomponent();
    })

  return (
    <div className="min-h-screen bg-neutral-900">
hello dear
        </div>
  )
}

export default App