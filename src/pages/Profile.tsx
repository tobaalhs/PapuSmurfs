import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from "react-i18next";
import './Profile.css';

const Profile: React.FC = () => {
  const { user, userProfile } = useAuth();
  const { t } = useTranslation();

  if (!user || !userProfile) {
    return null;
  }

  return (
    <div className="profile-container">
      <div className="profile-box">
        <h1>{t('profile.title')}</h1>
        
        <div className="profile-section">
          <h2>{t('profile.accountInfo')}</h2>
          <div className="profile-info">
            <div className="info-group">
              <label>{t('profile.email')}</label>
              <p>{user.email}</p>
            </div>
            <div className="info-group">
              <label>{t('profile.nickname')}</label>
              <p>{userProfile.nickname}</p>
            </div>
            <div className="info-group">
              <label>{t('profile.lolAccount')}</label>
              <p>{userProfile.lolAccount}</p>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2>{t('profile.stats')}</h2>
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-label">{t('profile.boostsCompleted')}</span>
              <span className="stat-value">0</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{t('profile.registrationDate')}</span>
              <span className="stat-value">
                {user.metadata.creationTime ? 
                  new Date(user.metadata.creationTime).toLocaleDateString() : 
                  t('common.notAvailable')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;