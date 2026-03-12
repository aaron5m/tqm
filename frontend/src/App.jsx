import { BrowserRouter, Routes, Route } from "react-router-dom"
import { useState, useEffect } from 'react';

import Signup from "./Signup";
import Signin from "./Signin";
import Upload from "./Upload";
import Items from "./Items";


function App() {
  const [compeer, setCompeer] = useState(null);
  useEffect(() => {
    fetch("http://localhost:3000/authorize", { credentials: "include" })
      .then(res => res.json())
      .then(data => setCompeer(data.loggedIn ? data.username : null));
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Items />} />
        <Route
          path="/upload"
          element={ (compeer) ? <Upload /> : <Signin /> }
        />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;