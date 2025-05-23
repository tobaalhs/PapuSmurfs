// /src/pages/PaymentSuccess.tsx

import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const PaymentSuccess: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const paymentId = queryParams.get('payment_id');
  const status = queryParams.get('status');
  
  useEffect(() => {
    // Puedes registrar el pago exitoso en tu analytics
    console.log(`Pago exitoso: ${paymentId}, estado: ${status}`);
    
    // También podrías actualizar el estado de la UI global o mostrar notificaciones
  }, [paymentId, status]);

  return (
    <div className="payment-success-page">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h1>¡Pago Realizado con Éxito!</h1>
        <p>Tu pago ha sido procesado correctamente.</p>
        <p className="payment-info">
          ID de Pago: {paymentId || 'No disponible'}
        </p>
        <p className="payment-info">
          Estado: {status || 'Aprobado'}
        </p>
        <div className="action-buttons">
          <Link to="/" className="button primary">
            Volver al Inicio
          </Link>
          <Link to="/account/orders" className="button secondary">
            Ver Mis Pedidos
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;