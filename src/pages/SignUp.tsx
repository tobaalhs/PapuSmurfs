import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import GoogleAuth from "../components/GoogleAuth";
import MicrosoftAuth from "../components/MicrosoftAuth";
import logo from '../assets/images/logo.svg';
import "./SignUp.css";

const SignUp: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError(t('auth.signup.error.passwordMatch'));
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      navigate('/verify-email');
    } catch (error: any) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError(t('auth.signup.error.emailInUse'));
          break;
        case 'auth/invalid-email':
          setError(t('auth.signup.error.invalidEmail'));
          break;
        case 'auth/weak-password':
          setError(t('auth.signup.error.weakPassword'));
          break;
        default:
          setError(t('auth.signup.error.default'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = () => {
    navigate('/register');
  };

  const handleAuthError = (error: Error) => {
    setError(error.message);
  };

  if (user) {
    return null;
  }

  return (
    <div className="signup-container">
      <div className="signup-box">
        <img src={logo} alt="Eloboost.Store" className="auth-logo" />
        <h1>{t('auth.signup.title')}</h1>
        <p className="signup-subtitle">{t('auth.signup.subtitle')}</p>

        {error && <div className="error-message">{error}</div>}

        <GoogleAuth 
          onLoginSuccess={handleAuthSuccess}
          onLoginError={handleAuthError}
        />

        <MicrosoftAuth 
          onLoginSuccess={handleAuthSuccess}
          onLoginError={handleAuthError}
        />

        <div className="divider">
          <span>{t('common.or')}</span>
        </div>

        <form onSubmit={handleSubmit}>
        <div className="form-group">
  <label htmlFor="email">{t('auth.email')}</label>
  <input
    type="email"
    id="email"
    className="email-input" // Clase específica para el input de email
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="example@email.com"
    required
    disabled={isLoading}
  />
</div>
<div className="form-group">
  <label htmlFor="password">{t('auth.signup.password')}</label>
  <input
    type="password"
    id="password"
    className="password-input" // Clase específica para el input de password
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
    disabled={isLoading}
  />
</div>
<div className="form-group">
  <label htmlFor="confirmPassword">{t('auth.signup.confirmPassword')}</label>
  <input
    type="password"
    id="confirmPassword"
    className="confirm-password-input" // Clase específica para el input de confirmPassword
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
    required
    disabled={isLoading}
  />
</div>
          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? t('auth.signup.creating') : t('auth.signup.createAccount')}
          </button>
        </form>

        <div className="login-link">
          <span>{t('auth.signup.haveAccount')}</span>
          <Link to="/login" className="back-to-login">
            {t('auth.signup.signIn')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;