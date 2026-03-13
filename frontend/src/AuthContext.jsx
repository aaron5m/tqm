import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [compeer, setCompeer] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function checkAuth() {
      fetch("http://localhost:3000/authorize", { credentials: "include" })
      .then(res => res.json())
      .then(data => setCompeer(data.loggedIn ? data.username : null))
      .then(() => setLoading(false));
    }
    checkAuth();
  }, []);
  return (
    <AuthContext.Provider value={compeer}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  return useContext(AuthContext);
}