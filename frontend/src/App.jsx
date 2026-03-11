import { useState, useEffect } from 'react';

import Signup from "./Signup";
import Upload from "./Upload";

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

export default App;