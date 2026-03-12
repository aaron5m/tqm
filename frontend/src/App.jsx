import { BrowserRouter, Routes, Route } from "react-router-dom"
import { useState, useEffect } from 'react';

import Signup from "./Signup";
import Signin from "./Signin";
import Upload from "./Upload";
import Items from "./Items";


function App() {

  let isSignedIn = false;
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Items />} />
        <Route
          path="/upload"
          element={isSignedIn ? <Upload /> : <Signin />}
        />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  )
}

/*
function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3000/auth/status", { credentials: "include" })
      .then(res => res.json())
      .then(data => setUser(data.loggedIn ? data.username : null));
  }, []);

  if (!user) {
    return <Signup />;
  }

  return <Upload />;
}
*/

export default App;