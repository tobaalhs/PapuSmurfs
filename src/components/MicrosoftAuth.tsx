// MicrosoftAuth.tsx
import { OAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebaseConfig";
import "./MicrosoftAuth.css";

interface MicrosoftAuthProps {
  onLoginSuccess?: () => void;
  onLoginError?: (error: Error) => void;
}

const MicrosoftAuth: React.FC<MicrosoftAuthProps> = ({ onLoginSuccess, onLoginError }) => {
  const provider = new OAuthProvider('microsoft.com');

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      onLoginSuccess?.();
    } catch (error) {
      console.error(error);
      onLoginError?.(error as Error);
    }
  };

  return (
    <button onClick={handleLogin} className="microsoft-auth-button">
      <img
        src="https://www.microsoft.com/favicon.ico"
        alt="Microsoft"
        className="microsoft-icon"
      />
      Sign in with Microsoft
    </button>
  );
};

export default MicrosoftAuth;