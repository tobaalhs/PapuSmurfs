import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import './PlacementBoost.css';

export const PlacementBoost: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleOrderSubmit = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Aquí iría la lógica para procesar el pedido
  };

  return (
    <div className="valorant-placement-boost-container">
      <div className="valorant-placement-boost-header">
        <h1>Valorant Placement Matches</h1>
        <p>Get the perfect start to your competitive journey with our professional players</p>
      </div>

      <div className="valorant-placement-boost-content">
        {/* Aquí irá el formulario de selección de opciones para las placements */}
      </div>
    </div>
  );
};

export default PlacementBoost;