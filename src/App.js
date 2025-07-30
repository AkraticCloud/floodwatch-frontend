import React, {useState} from "react";
import MapLandingPage from "./MapLandingPage";
import UserAuth from "./UserAuth";

function App() {
  const [username, setUsername] = useState("")
  const [token, setToken] = useState("")

  const handleLoginSuccess = (user, token) => {
    console.log("handleLoginSuccess called with:", user,token)
    setUsername(user)
    setToken(token)
  }

  const handleLogout = () => {
    setUsername("")
    setToken("")
    console.log("Logged Out")
  }

  return (
    <div className = "App">
      <MapLandingPage username={username} />
      <UserAuth username={username} token={token} onLoginSuccess={handleLoginSuccess} onLogout={handleLogout}/>
    </div>
  );
}

export default App;