import { useAuth } from "../AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import stylesNavbar from "./vnfm_Navbar.module.css";
import * as global from "../constants/globals.js";

export default function Navbar() {
  const { compeer, nodeUrl } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className={stylesNavbar.navbar}>
      <div onClick={() => navigate("/")} className={stylesNavbar.team}>
        {global.TEAM_NAME}
      </div>
      <div className={stylesNavbar.littleBlock}>
        {compeer && (
          <span onClick={() => navigate("/profile")} className={stylesNavbar.username}>
            {compeer}
          </span>
        )}
        <button
          onClick={() => navigate("/upload")}
          className={stylesNavbar.button}
        >
          Upload
        </button>
        {!compeer && (
          <button
            onClick={() =>
              navigate("/signin", { state: { from: location.pathname } })
            }
            className={stylesNavbar.button}
          >
            Sign In / Sign Up
          </button>
        )}
      </div>
    </nav>
  );
}