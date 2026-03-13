import React from "react";
import { useAuth } from "./AuthContext";

export default function TestAuth() {
  const compeer = useAuth();
  const isAuthenticated = !!compeer;

  return (
    <div>
      <h2>Auth Test</h2>
      <p>User: {compeer || "none"}</p>
      <p>Authenticated? {isAuthenticated ? "Yes" : "No"}</p>
    </div>
  );
}