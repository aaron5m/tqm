import { AuthProvider } from "./AuthContext";
import App from "./App";

function Root() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

export default Root;