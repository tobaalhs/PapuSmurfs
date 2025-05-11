import { signInWithPopup, Auth, AuthProvider } from "firebase/auth";
import { auth, provider } from "../firebaseConfig";
import "./GoogleAuth.css";

interface GoogleAuthProps {
  onLoginSuccess?: () => void;
  onLoginError?: (error: Error) => void;
}

const GoogleAuth: React.FC<GoogleAuthProps> = ({ onLoginSuccess, onLoginError }) => {
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      onLoginSuccess?.();
      // Podrías acceder a más información del usuario si lo necesitas:
      // const user = result.user;
    } catch (error) {
      console.error(error);
      onLoginError?.(error as Error);
    }
  };

  return (
    <button onClick={handleLogin} className="google-auth-button">
      <img
        src="https://www.google.com/favicon.ico"
        alt="Google"
        className="google-icon"
      />
      Sign in with Google
    </button>
  );
};

export default GoogleAuth;