import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import GoogleAuth from "../components/GoogleAuth";
import MicrosoftAuth from "../components/MicrosoftAuth";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import logo from '../assets/images/logo.svg';
import "./Login.css";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useState(new URLSearchParams(window.location.search));
  const redirectPath = searchParams.get('redirect');

  // Redirigir si el usuario ya está autenticado
  useEffect(() => {
    if (user) {
      if (redirectPath === 'boost-checkout') {
        navigate('/boost-checkout');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate, redirectPath]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (redirectPath === 'boost-checkout') {
        navigate('/boost-checkout');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      // Manejar diferentes tipos de errores
      switch (error.code) {
        case 'auth/invalid-email':
          setError(t('auth.error.invalidEmail'));
          break;
        case 'auth/user-disabled':
          setError(t('auth.error.userDisabled'));
          break;
        case 'auth/user-not-found':
          setError(t('auth.error.userNotFound'));
          break;
        case 'auth/wrong-password':
          setError(t('auth.error.wrongPassword'));
          break;
        default:
          setError(t('auth.error.default'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    if (redirectPath === 'boost-checkout') {
      navigate('/boost-checkout');
    } else {
      navigate('/');
    }
  };

  const handleLoginError = (error: Error) => {
    setError(error.message);
  };

  // Si el usuario está autenticado, no renderizar nada
  if (user) {
    return null;
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={logo} alt="Eloboost.Store" className="auth-logo" />
        <h1>{t('auth.welcomeTitle')}</h1>
        <p className="login-subtitle">{t('auth.welcomeSubtitle')}</p>

        {error && <div className="error-message">{error}</div>}

        <GoogleAuth 
          onLoginSuccess={handleLoginSuccess}
          onLoginError={handleLoginError}
        />

        <MicrosoftAuth 
          onLoginSuccess={handleLoginSuccess}
          onLoginError={handleLoginError}
        />

        <div className="divider">
          <span>{t('common.or')}</span>
        </div>

        <form onSubmit={handleEmailLogin}>
          <div className="form-group">
            <label htmlFor="email">{t('auth.email')}</label>
            <input
              type="email"
              id="email"
              className="email-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">{t('auth.password')}</label>
            <input
              type="password"
              id="password"
              className="password-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Link to="/forgot-password" className="forgot-password">
            {t('auth.forgotPassword')}
          </Link>
          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? t('common.loading') : t('auth.login')}
          </button>
        </form>

        <div className="create-account">
          <span>{t('auth.noAccount')}</span>
          <Link to="/signup" className="create-account-link">
            {t('auth.createAccount')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;