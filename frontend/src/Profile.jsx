import { useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from 'react';
import styles from "./index.module.css"

export default function Profile() {
  const { compeer, nodeUrl } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const from = location.state?.from || "/"; // redirect away if not signed in
  useEffect(() => {
    if (!compeer) {
      navigate(from, { replace: true });
    }
  }, [compeer, navigate, from]);

  const submit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${nodeUrl}/signout`, {
      method: "POST",
      credentials: "include",
    });
    window.location.reload();
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
      <h1 className={styles.centrify}>The Quarter<br></br>Millennium</h1>
        <form className={styles.form} onSubmit={submit}>
          <div>{compeer}</div>
          <button className={styles.button} type="submit">Sign Out</button>
        </form>
      </div>
    </div>
  );
}