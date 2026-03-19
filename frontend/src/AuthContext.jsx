import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [compeer, setCompeer] = useState(null);
  const [loading, setLoading] = useState(true);
  const vitePassUrl = process.env.VITE_PASS_URL ? process.env.VITE_PASS_URL : "http://localhost";
  const nodeUrl = process.env.VITE_PASS_URL ? `${vitePassUrl}/api` : `${vitePassUrl}:3000/api`;
  const fastapiUrl = process.env.VITE_PASS_URL ? `${vitePassUrl}/pyapi` : `${vitePassUrl}:8000/pyapi`;
  console.log(process.env.VITE_PASS_URL, vitePassUrl, nodeUrl, fastapiUrl);

  const checkAuth = async () => {
    setLoading(true);
    const res = await fetch(`${nodeUrl}/authorize`, {
      method: "POST",
      credentials: "include",
    });
    const data = await res.json();
    setCompeer(data.loggedIn ? data.username : null);
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ compeer, checkAuth, nodeUrl, fastapiUrl }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  return useContext(AuthContext);
}