import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface RegistrationGuardProps {
  children: React.ReactNode;
}

const RegistrationGuard: React.FC<RegistrationGuardProps> = ({ children }) => {
  const { user, userProfile, loading } = useAuth();
  const location = useLocation();

  // No bloquear rutas de autenticación
  if (location.pathname === '/login' || location.pathname === '/register') {
    return <>{children}</>;
  }

  if (loading) {
    return <div>Cargando...</div>;
  }

  // Si el usuario está autenticado pero no tiene perfil o no ha completado el registro
  if (user && (!userProfile || !userProfile.registrationCompleted)) {
    return <Navigate to="/register" />;
  }

  return <>{children}</>;
};

export default RegistrationGuard;