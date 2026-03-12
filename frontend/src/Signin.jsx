import { useState } from 'react';
import styles from "./index.module.css"

export default function Signin() {
  const [user, setUser] = useState({ username: '', email: '', password_input: '' });
  const [emailInput, setEmailInput] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:3000/signin', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: user.username, // Key must match FastAPI field
        email: user.email,
        password_input: user.password_input
      })
    })
    .then(res => res.json())
    .then(data => console.log(data));
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
      <h1 className={styles.centrify}>The American<br></br>Quarter Millennium</h1>
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