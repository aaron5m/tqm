import { useState } from 'react';
import styles from './Signup.module.css';

export default function Signup() {
  const [user, setUser] = useState({ username: '', email: '', password_input: '' });
  const [emailInput, setEmailInput] = useState("");
  const [error, setError] = useState("");

  function validateEmailInput(e) {
    const val = e.target.value;
    console.log("whatever");
    setEmailInput(val);
    setError(/\S+@\S+\.\S+/.test(val) ? "" : "Invalid email");
  }

  const submit = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:8000/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: user.username, // Key must match FastAPI field
        email: user.email,
        password_input: user.password_input
      })
    });
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
            type="email" 
            value={emailInput}
            placeholder="Email" 
            onChange={ (e) => {
                validateEmailInput(e);
                setUser({...user, email: e.target.value})
              }
            }
            required
          />
          {error && <p style={{ color: "red" }}>{error}</p>}
          <input 
            className={styles.input}
            type="password" 
            placeholder="Password" 
            onChange={e => setUser({...user, password_input: e.target.value})} 
          />
          <button className={styles.button} type="submit">Sign Up</button>
        </form>
      </div>
    </div>
  );
}