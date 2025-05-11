import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from "react-i18next";
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import './RegisterForm.css';

const RegisterForm: React.FC = () => {
  const [nickname, setNickname] = useState('');
  const [lolAccount, setLolAccount] = useState('');
  const [role, setRole] = useState<'client' | 'booster'>('client'); // Nuevo estado
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, updateUserProfile } = useAuth();
  const { t } = useTranslation();

  const MAX_NICKNAME_LENGTH = 15;

  const validateLolAccount = (account: string) => {
    const regex = /^.+#.+$/;
    return regex.test(account);
  };

  const checkNicknameExists = async (nickname: string) => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('nickname', '==', nickname));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validación de nickname vacío
      if (!nickname.trim()) {
        setError(t('auth.error.required'));
        return;
      }

      // Validación de longitud máxima
      if (nickname.length > MAX_NICKNAME_LENGTH) {
        setError(t('auth.error.nicknameTooLong', { max: MAX_NICKNAME_LENGTH }));
        return;
      }

      // Validación de caracteres permitidos
      if (!/^[a-zA-Z0-9_]+$/.test(nickname)) {
        setError(t('auth.error.nicknameInvalidChars'));
        return;
      }

      // Verificar si el nickname ya existe
      const nicknameExists = await checkNicknameExists(nickname);
      if (nicknameExists) {
        setError(t('auth.error.nicknameTaken'));
        return;
      }

      // Validación de cuenta de LoL
      if (!validateLolAccount(lolAccount)) {
        setError(t('auth.error.lolFormat'));
        return;
      }

      await updateUserProfile({
        nickname,
        lolAccount,
        registrationCompleted: true,
        role: 'client'
      });
      
      navigate('/');
    } catch (err) {
      console.error('Error durante el registro:', err);
      setError(t('auth.error.generic'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h1>{t('auth.register')}</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nickname">
              {t('auth.nickname')} 
              <span className="char-count">
                ({nickname.length}/{MAX_NICKNAME_LENGTH})
              </span>
            </label>
            <input
              type="text"
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={t('auth.nickname')}
              maxLength={MAX_NICKNAME_LENGTH}
              disabled={isLoading}
            />
            <small className="input-hint">
              {t('auth.nicknameHint')}
            </small>
          </div>
          <div className="form-group">
            <label htmlFor="lolAccount">{t('auth.lolAccount')}</label>
            <input
              type="text"
              id="lolAccount"
              value={lolAccount}
              onChange={(e) => setLolAccount(e.target.value)}
              placeholder="Nick#tag"
              disabled={isLoading}
            />
          </div>
          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? t('common.loading') : t('auth.submit')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;