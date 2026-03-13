// App.js
import React from "react";
import { AuthProvider } from "./AuthContext";
import TestAuth from "./TestAuth";

function TestAuthApp() {
  return (
    <AuthProvider>
      <TestAuth />
    </AuthProvider>
  );
}

export default TestAuthApp;