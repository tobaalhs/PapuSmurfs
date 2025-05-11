import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebaseConfig';
import './PaymentResult.css';

interface PaymentStatusProps {
  status: 'loading' | 'success' | 'pending' | 'error';
  orderId?: string;
  onGoHome: () => void;
}

// Componente para mostrar el estado del pago
const PaymentStatus: React.FC<PaymentStatusProps> = ({ status, orderId, onGoHome }) => {
  const { t } = useTranslation();
  
  if (status === 'loading') {
    return (
      <div className="payment-status loading">
        <div className="spinner"></div>
        <h2>{t('payment.verifying') || 'Verificando el estado de tu pago...'}</h2>
        <p>{t('payment.wait') || 'Este proceso puede tardar unos segundos.'}</p>
      </div>
    );
  }
  
  if (status === 'success') {
    return (
      <div className="payment-status success">
        <div className="status-icon">✓</div>
        <h2>{t('payment.success') || '¡Pago Exitoso!'}</h2>
        <p>{t('payment.successMessage') || 'Tu boost ha sido registrado correctamente. Nuestro equipo comenzará a trabajar en él pronto.'}</p>
        {orderId && <p className="order-id">{t('payment.orderId') || 'Orden'}: {orderId}</p>}
        <button onClick={onGoHome} className="action-button">
          {t('payment.goHome') || 'Volver al inicio'}
        </button>
      </div>
    );
  }
  
  if (status === 'pending') {
    return (
      <div className="payment-status pending">
        <div className="status-icon">⏱</div>
        <h2>{t('payment.pending') || 'Pago en Proceso'}</h2>
        <p>{t('payment.pendingMessage') || 'Tu pago está siendo procesado. Te notificaremos cuando se complete.'}</p>
        {orderId && <p className="order-id">{t('payment.orderId') || 'Orden'}: {orderId}</p>}
        <button onClick={onGoHome} className="action-button">
          {t('payment.goHome') || 'Volver al inicio'}
        </button>
      </div>
    );
  }
  
  // Error por defecto
  return (
    <div className="payment-status error">
      <div className="status-icon">✗</div>
      <h2>{t('payment.error') || 'Error en el Pago'}</h2>
      <p>{t('payment.errorMessage') || 'Hubo un problema al procesar tu pago. Por favor, intenta nuevamente o contacta a soporte.'}</p>
      {orderId && <p className="order-id">{t('payment.orderId') || 'Orden'}: {orderId}</p>}
      <button onClick={onGoHome} className="action-button">
        {t('payment.goHome') || 'Volver al inicio'}
      </button>
    </div>
  );
};

const PaymentResult: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'pending' | 'error'>('loading');
  const [orderId, setOrderId] = useState<string | undefined>(undefined);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  
  useEffect(() => {
    // Intentar obtener el token y orderId de los parámetros de la URL o localStorage
    const queryParams = new URLSearchParams(location.search);
    const tokenFromUrl = queryParams.get('token');
    
    // Obtener orderId de localStorage
    const orderIdFromStorage = localStorage.getItem('currentOrderId');
    
    if (orderIdFromStorage) {
      setOrderId(orderIdFromStorage);
      checkPaymentStatus(orderIdFromStorage);
    } else if (tokenFromUrl) {
      // Si tenemos un token en la URL pero no orderId, intentamos encontrar la orden asociada
      // Esto requeriría una función adicional en Firebase para buscar por token
      console.log("Token encontrado en URL pero no hay orderId en localStorage");
      setStatus('pending'); // Asumimos pending si no podemos verificar exactamente
    } else {
      setStatus('error');
      console.error("No se encontró orderId ni token para verificar el pago");
    }
  }, [location]);
  
  const checkPaymentStatus = async (orderIdToCheck: string) => {
    try {
      console.log(`Verificando estado del pago para orden: ${orderIdToCheck}`);
      
      const checkPaymentStatusFn = httpsCallable(functions, 'checkPaymentStatus');
      const result = await checkPaymentStatusFn({ orderId: orderIdToCheck });
      
      console.log("Resultado de verificación:", result.data);
      
      const data = result.data as any;
      
      if (data.order) {
        setOrderDetails(data.order);
        
        // Determinar el estado según la respuesta
        if (data.paymentStatus && data.paymentStatus.status === 2) {
          setStatus('success');
        } else if (data.order.status === 'error' || 
                  (data.paymentStatus && [3, 4].includes(data.paymentStatus.status))) {
          setStatus('error');
        } else {
          setStatus('pending');
        }
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Error al verificar el estado del pago:', error);
      setStatus('error');
    }
  };
  
  const handleGoHome = () => {
    // Limpiar datos del localStorage
    localStorage.removeItem('currentOrderId');
    
    // Redirigir al inicio o a una página específica según el estado
    if (status === 'success') {
      navigate('/'); // Página principal después de un pago exitoso
    } else if (status === 'pending') {
      navigate('/'); // Página principal para pagos pendientes
    } else {
      navigate('/lol/ranked'); // Volver al configurador de boost para pagos fallidos
    }
  };
  
  return (
    <div className="payment-result-container">
      <div className="payment-result-content">
        <PaymentStatus 
          status={status} 
          orderId={orderId} 
          onGoHome={handleGoHome} 
        />
      </div>
    </div>
  );
};

export default PaymentResult;