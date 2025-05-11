import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import './RankedBoost.css';

export const RankedBoost: React.FC = () => {
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
    <div className="valorant-ranked-boost-container">
      <div className="valorant-ranked-boost-header">
        <h1>Valorant Ranked Boost</h1>
        <p>Reach your desired rank with our professional Valorant players</p>
      </div>

      <div className="valorant-ranked-boost-content">
        {/* Aquí irá el formulario de selección de rangos de Valorant */}
      </div>
    </div>
  );
};

export default RankedBoost;