import { BrowserRouter, Routes, Route } from "react-router-dom"
import { useState, useEffect } from 'react';

import Signup from "./Signup";
import Signin from "./Signin";
import Upload from "./Upload";
import Items from "./Items";

import { useAuth } from "./AuthContext";

function App() {
  const compeer = useAuth();
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