import { useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from 'react';
import styles from "./index.module.css"

export default function Signin() {
  const { compeer, checkAuth } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState({ username: '', email: '', password_input: '' });

  const from = location.state?.from || "/"; // default to home
  useEffect(() => {
    if (compeer) {
      navigate(from, { replace: true }); // redirect if already signed in
    }
  }, [compeer, navigate, from]);

  const submit = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:3000/signin', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: user.username, 
        email: user.email,
        password_input: user.password_input
      })
    });
    if (res.ok) {
      await checkAuth();
      navigate(from);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
      <h1 className={styles.centrify}>The Quarter <br></br> Millennium</h1>
        <form className={styles.form} onSubmit={submit}>
          <input 
            className={styles.input}
            placeholder="Username" 
            onChange={e => setUser({...user, username: e.target.value})} 
          />
          <input 
            className={styles.input}
            type="password" 
            placeholder="Password" 
            onChange={e => setUser({...user, password_input: e.target.value})} 
          />
          <button className={styles.button} type="submit">Sign In</button>
          <p>
            <a href="signup">Or Sign Up Now</a>
          </p>
        </form>
      </div>
    </div>
  );
}