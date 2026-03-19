import { useEffect } from "react";
import { useAuth } from "../AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from 'react';
import styles from "./_vnfm.module.css";
import * as global from "../constants/globals.js";

export default function Signup() {
  const { compeer, nodeUrl } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState({ username: '', email: '', password_input: '' });
  const [emailInput, setEmailInput] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // redirect if already signed in
  const from = location.state?.from || "/"; 
  useEffect(() => {
    if (compeer) {
      navigate(from, { replace: true });
    }
  }, [compeer, navigate, from]);

  // UX validation username
  const [typingUsernameTimeout, setTypingUsernameTimeout] = useState(null);
  const [usernameValid, setUsernameValid] = useState(false);
  const onUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    setUsernameValid(false); // reset validation while typing
    if (typingUsernameTimeout) clearTimeout(typingUsernameTimeout);
    const timeout = setTimeout(() => {
      setUsernameValid(/^[a-zA-Z0-9]{8,}$/.test(value))
      setUsername(value);
    }, 300);
    setTypingUsernameTimeout(timeout);
  }

  // UX validation Email
  const [typingEmailTimeout, setTypingEmailTimeout] = useState(null);
  const [emailValid, setEmailValid] = useState(false);
  const onEmailChange = (e) => {
    const value = e.target.value;
    setEmailInput(value);
    setEmailValid(false); // reset validation while typing
    if (typingEmailTimeout) clearTimeout(typingEmailTimeout);
    // set a new timeout to check after user stops typing
    const timeout = setTimeout(() => {
      setEmailValid(/\S+@\S+\.\S+/.test(value));
      setEmailInput(value);
    }, 300); // 500ms after last keystroke
    setTypingEmailTimeout(timeout);
  };

  // UX validation password
  const [typingPasswordTimeout, setTypingPasswordTimeout] = useState(null);
  const [passwordValid, setPasswordValid] = useState(false);
  const onPasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordValid(false); // reset validation while typing
    if (typingPasswordTimeout) clearTimeout(typingPasswordTimeout);
    const timeout = setTimeout(() => {
      setPasswordValid( value.length >= 8 )
      setPassword(value);
    }, 300);
    setTypingPasswordTimeout(timeout);
  }

  // UX submit button
  const allValid = usernameValid && emailValid && passwordValid;

  // submit form
  const submit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${nodeUrl}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        username: user.username, 
        email: user.email,
        password_input: user.password_input
      })
    });

    if (res.ok) navigate("/signin");
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
      <h1 className={styles.centrify}>{global.TEAM_NAME}</h1>
        <form className={styles.form} onSubmit={submit}>
          <input 
            className={styles.input}
            value={username}
            placeholder="Username" 
            onChange={ (e) => { 
                onUsernameChange(e);
                setUser({...user, username: e.target.value})
              }
            }
            style={{color: (usernameValid) ? "green" : "red"}}
            required
          />
          <input 
            className={styles.input}
            type="email" 
            value={emailInput}
            placeholder="Email" 
            onChange={ (e) => {
                onEmailChange(e);
                setUser({...user, email: e.target.value})
              }
            }
            style={{color: (emailValid) ? "green" : "red"}}
            required
          />
          <input 
            className={styles.input}
            type="password" 
            value={password}
            placeholder="Password" 
            onChange={ (e) => {
                onPasswordChange(e);
                setUser({...user, password_input: e.target.value})
              }
            } 
          />
          <button 
            disabled={!allValid}
            className={`${styles.button} ${!allValid ? styles.inactive : ""}`}
            type="submit"
          >Submit</button>
        </form>
      </div>
    </div>
  );
}