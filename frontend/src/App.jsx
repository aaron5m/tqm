import { BrowserRouter, Routes, Route } from "react-router-dom"
import Profile from "./vnfm/_vnfm_Profile";
import Signup from "./vnfm/_vnfm_Signup";
import Signin from "./vnfm/_vnfm_Signin";
import Upload from "./vnfm/_vnfm_Upload";
import Items from "./vnfm/_vnfm_Items";
import Navbar from "./vnfm/vnfm_Navbar";

import { useAuth } from "./AuthContext";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
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