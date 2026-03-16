import { BrowserRouter, Routes, Route } from "react-router-dom"
import { useState, useEffect } from 'react';
import Signup from "./Signup";
import Signin from "./Signin";
import Upload from "./Upload";
import Items from "./Items";
import NavBar from "./NavBar";
import Profile from "./Profile";

import { useAuth } from "./AuthContext";

function App() {
  const { compeer } = useAuth();
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Items />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="upload" element={<Upload />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  )

}

export default App;