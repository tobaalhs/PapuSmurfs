import { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { User, sendEmailVerification } from 'firebase/auth'; // Importar sendEmailVerification
import './VerifyEmail.css';

const VerifyEmail: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) return;

    const checkEmailVerified = async () => {
      await user.reload();
      if (user.emailVerified) {
        navigate('/');
      }
    };

    const interval = setInterval(checkEmailVerified, 30000);
    return () => clearInterval(interval);
  }, [user, navigate]);

  const handleResendEmail = async () => {
    if (!user) return;
    
    setIsSending(true);
    try {
      await sendEmailVerification(user); // Usar la función importada
      setMessage(t('auth.verification.emailSent'));
    } catch (error) {
      setMessage(t('auth.verification.error'));
    } finally {
      setIsSending(false);
    }
  };

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.emailVerified) {
    return <Navigate to="/" />;
  }

  return (
    <div className="verify-container">
      <div className="verify-box">
        <h1>{t('auth.verification.verifyTitle')}</h1>
        <p className="verify-desc">{t('auth.verification.verifyDesc')}</p>
        <p className="verify-action">{t('auth.verification.reloadInstruction')}</p>
        
        <button 
          onClick={handleResendEmail}
          disabled={isSending}
          className="resend-button"
        >
          {isSending ? t('common.sending') : t('auth.verification.resend')}
        </button>
        
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
};

export default VerifyEmail;