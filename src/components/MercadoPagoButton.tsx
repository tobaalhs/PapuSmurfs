// src/components/MercadoPagoButton.tsx

import React, { useEffect, useState } from 'react';
import { Wallet } from '@mercadopago/sdk-react';
import { useMercadoPago } from '../contexts/MercadoPagoContext';

interface MercadoPagoButtonProps {
  onPaymentSuccess?: () => void;
  onPaymentError?: (error: any) => void;
}

const MercadoPagoButton: React.FC<MercadoPagoButtonProps> = ({
  onPaymentSuccess,
  onPaymentError
}) => {
  const { isInitialized, preferenceId } = useMercadoPago();
  const [error, setError] = useState<string | null>(null);

  if (!isInitialized) {
    return <p>Cargando sistema de pagos...</p>;
  }

  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
      </div>
    );
  }

  if (!preferenceId) {
    return <p>Preparando opciones de pago...</p>;
  }

  return (
    <div className="mercadopago-button-container">
      <Wallet 
        initialization={{ preferenceId }}
        onError={(error) => {
          console.error('Error en checkout:', error);
          setError('Error al procesar el pago. Por favor, intenta de nuevo.');
          if (onPaymentError) {
            onPaymentError(error);
          }
        }}
      />
    </div>
  );
};

export default MercadoPagoButton;