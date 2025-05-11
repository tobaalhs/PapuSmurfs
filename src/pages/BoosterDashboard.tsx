// pages/BoosterDashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useTranslation } from "react-i18next";
import { db } from '../firebaseConfig';
import './BoosterDashboard.css';

interface Boost {
  id: string;
  userId: string;
  currentRank: string;
  desiredRank: string;
  status: 'available' | 'in_progress' | 'completed';
  createdAt: Date;
  price: number;
}

const BoosterDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, userProfile } = useAuth();
  const [activeBoosts, setActiveBoosts] = useState<Boost[]>([]);
  const [availableBoosts, setAvailableBoosts] = useState<Boost[]>([]);
  const [completedBoosts, setCompletedBoosts] = useState<Boost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Redirigir si el usuario no es booster
    if (userProfile && userProfile.role !== 'booster') {
      navigate('/');
      return;
    }

    const fetchBoosts = async () => {
      if (!user) return;

      try {
        // Obtener boosts disponibles
        const availableQuery = query(
          collection(db, 'boosts'),
          where('status', '==', 'available')
        );

        // Obtener boosts activos del booster
        const activeQuery = query(
          collection(db, 'boosts'),
          where('boosterId', '==', user.uid),
          where('status', '==', 'in_progress')
        );

        // Obtener boosts completados del booster
        const completedQuery = query(
          collection(db, 'boosts'),
          where('boosterId', '==', user.uid),
          where('status', '==', 'completed')
        );

        const [availableSnap, activeSnap, completedSnap] = await Promise.all([
          getDocs(availableQuery),
          getDocs(activeQuery),
          getDocs(completedQuery)
        ]);

        setAvailableBoosts(availableSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Boost)));

        setActiveBoosts(activeSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Boost)));

        setCompletedBoosts(completedSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Boost)));

      } catch (error) {
        console.error('Error fetching boosts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoosts();
  }, [user, userProfile, navigate]);

  if (isLoading) {
    return (
      <div className="booster-dashboard loading">
        <div className="loader">Loading...</div>
      </div>
    );
  }

  return (
    <div className="booster-dashboard">
      <div className="dashboard-header">
        <h1>{t('boosterdashboard.title')}</h1>
        <div className="stats-summary">
          <div className="stat-card">
            <h3>{t('boosterdashboard.activeBoosts')}</h3>
            <p>{activeBoosts.length}</p>
          </div>
          <div className="stat-card">
            <h3>{t('boosterdashboard.availableBoosts')}</h3>
            <p>{availableBoosts.length}</p>
          </div>
          <div className="stat-card">
            <h3>{t('boosterdashboard.completedBoosts')}</h3>
            <p>{completedBoosts.length}</p>
          </div>
        </div>
      </div>

      <div className="boost-section">
        <h2>{t('boosterdashboard.activeBoosts')}</h2>
        <div className="boosts-grid">
          {activeBoosts.map(boost => (
            <div key={boost.id} className="boost-card">
              <div className="boost-header">
                <h3>Boost Order #{boost.id.slice(0, 8)}</h3>
                <span className="boost-price">${boost.price}</span>
              </div>
              <div className="boost-details">
                <p>From: {boost.currentRank}</p>
                <p>To: {boost.desiredRank}</p>
                <p className="boost-date">Started: {new Date(boost.createdAt).toLocaleDateString()}</p>
              </div>
              <button className="boost-action-button">
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="boost-section">
        <h2>{t('boosterdashboard.availableBoosts')}</h2>
        <div className="boosts-grid">
          {availableBoosts.map(boost => (
            <div key={boost.id} className="boost-card">
              <div className="boost-header">
                <h3>Boost Order #{boost.id.slice(0, 8)}</h3>
                <span className="boost-price">${boost.price}</span>
              </div>
              <div className="boost-details">
                <p>From: {boost.currentRank}</p>
                <p>To: {boost.desiredRank}</p>
                <p className="boost-date">Posted: {new Date(boost.createdAt).toLocaleDateString()}</p>
              </div>
              <button className="boost-action-button primary">
                Take Order
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="boost-section">
        <h2>{t('boosterdashboard.completedBoosts')}</h2>
        <div className="boosts-grid">
          {completedBoosts.map(boost => (
            <div key={boost.id} className="boost-card completed">
              <div className="boost-header">
                <h3>Boost Order #{boost.id.slice(0, 8)}</h3>
                <span className="boost-price">${boost.price}</span>
              </div>
              <div className="boost-details">
                <p>From: {boost.currentRank}</p>
                <p>To: {boost.desiredRank}</p>
                <p className="boost-date">Completed: {new Date(boost.createdAt).toLocaleDateString()}</p>
              </div>
              <button className="boost-action-button secondary">
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BoosterDashboard;