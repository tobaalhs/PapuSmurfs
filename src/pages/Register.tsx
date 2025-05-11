import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RegisterForm from '../components/RegisterForm';

const Register: React.FC = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Si el usuario no está autenticado, redirigir al login
    if (!user) {
      navigate('/login');
      return;
    }

    // Si el usuario ya completó su registro, redirigir a home
    if (userProfile?.registrationCompleted) {
      navigate('/');
    }
  }, [user, userProfile, navigate]);

  // Si el usuario ya completó su registro o no está autenticado, no mostrar el formulario
  if (!user || userProfile?.registrationCompleted) {
    return null;
  }

  return <RegisterForm />;
};

export default Register;