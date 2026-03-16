import { useAuth } from "./AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./index.module.css";

export default function Navbar() {
  const { compeer } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await fetch("http://localhost:3000/signout", {
      method: "POST",
      credentials: "include",
    });
    window.location.reload();
  };

  return (
    <nav style={{
      width: "100%",
      padding: "0.5rem 0.5rem",
      boxSizing: "border-box",  
      backgroundColor: "navy",
      color: "#fff",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",

      zIndex: 10
    }}>
      <div onClick={() => navigate("/")} style={{ 
        fontWeight: "bold", 
        cursor: "pointer"
      }}>The Quarter Millennium</div>
      <div className={styles.littleBlock}>
        {compeer ? (
          <>
            <span onClick={() => navigate("/profile")} style={{ 
                marginRight: "0.5rem",
                cursor: "pointer" 
            }}>{compeer}</span>
          </>
        ) : ( 
          ""
        )}
        <button onClick={() => navigate("/upload")} style={{
                padding: "0.5rem 0.5rem",
                margin: "0.5rem",
                cursor: "pointer"
        }}>Upload</button>
        {compeer ? (
          ""
        ) : (
          <>
            <button onClick={() => navigate("/signin", { state: { from: location.pathname } })} style={{
                padding: "0.5rem 0.5rem",
                cursor: "pointer"
            }}>Sign In / Sign Up</button>
          </>
        )}
      </div>
    </nav>
  );
}