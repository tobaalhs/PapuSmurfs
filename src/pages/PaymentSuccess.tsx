// src/pages/PaymentSuccess.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import './PaymentSuccess.css'; // Crea este archivo para estilos

const PaymentSuccess: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'pending' | 'error'>('pending');
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        // Obtener el ID de orden guardado
        const orderId = localStorage.getItem('currentOrderId');
        if (!orderId) {
          setPaymentStatus('error');
          setIsLoading(false);
          return;
        }

        // Esperar un momento para que el webhook de Flow tenga tiempo de procesar el pago
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Verificar el estado del pago
        const checkStatus = httpsCallable(functions, 'checkPaymentStatus');
        const result = await checkStatus({ orderId });
        
        const data = result.data as any;
        
        // Verificar estado según la respuesta
        if (data.order.status === 'completed' || 
            (data.paymentStatus && data.paymentStatus.status === 2)) {
          setPaymentStatus('success');
          // Limpiar datos de la orden
          localStorage.removeItem('currentOrderId');
          localStorage.removeItem('pendingBoostOrder');
        } else {
          setPaymentStatus('pending');
        }
      } catch (error) {
        console.error('Error verificando pago:', error);
        setPaymentStatus('error');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      checkPaymentStatus();
    } else {
      // Si el usuario no está autenticado, redirigir al login
      navigate('/login?redirect=payment-success');
    }
  }, [user, navigate, location]);

  return (
    <div className="payment-success-container">
      {isLoading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <h2>Verificando estado del pago...</h2>
          <p>Por favor, espera mientras confirmamos tu transacción.</p>
        </div>
      )}

      {!isLoading && paymentStatus === 'success' && (
        <div className="success-state">
          <div className="status-icon success">✓</div>
          <h1>¡Pago Exitoso!</h1>
          <p>Tu pedido ha sido procesado correctamente.</p>
          <p>Nuestro equipo comenzará a trabajar en tu boost pronto.</p>
          <button 
            className="action-button"
            onClick={() => navigate('/profile')}
          >
            Ver mis pedidos
          </button>
        </div>
      )}

      {!isLoading && paymentStatus === 'pending' && (
        <div className="pending-state">
          <div className="status-icon pending">⌛</div>
          <h1>Pago en Proceso</h1>
          <p>Tu pago está siendo procesado.</p>
          <p>Esto puede tomar unos minutos.</p>
          <button 
            className="action-button refresh"
            onClick={() => window.location.reload()}
          >
            Verificar estado
          </button>
        </div>
      )}

      {!isLoading && paymentStatus === 'error' && (
        <div className="error-state">
          <div className="status-icon error">✗</div>
          <h1>Error en el Pago</h1>
          <p>Hubo un problema al procesar tu pago.</p>
          <p>Por favor, intenta nuevamente o contacta con soporte.</p>
          <button 
            className="action-button"
            onClick={() => navigate('/lol/ranked')}
          >
            Volver a intentar
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentSuccess;