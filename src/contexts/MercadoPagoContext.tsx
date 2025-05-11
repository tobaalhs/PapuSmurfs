import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { initMercadoPago } from '@mercadopago/sdk-react';

interface MercadoPagoContextType {
  isInitialized: boolean;
  preferenceId: string;
  setPreferenceId: (id: string) => void;
  clearPreferenceId: () => void;
}

const MercadoPagoContext = createContext<MercadoPagoContextType | undefined>(undefined);

export const MercadoPagoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [preferenceId, setPreferenceId] = useState<string>('');

  useEffect(() => {
    const publicKey = process.env.REACT_APP_MERCADO_PAGO_PUBLIC_KEY;
    
    if (publicKey) {
      try {
        initMercadoPago(publicKey);
        setIsInitialized(true);
        console.log('MercadoPago inicializado correctamente');
      } catch (error) {
        console.error('Error al inicializar MercadoPago:', error);
      }
    } else {
      console.error('Public Key de MercadoPago no encontrada');
    }
  }, []);

  const clearPreferenceId = () => {
    setPreferenceId('');
  };

  return (
    <MercadoPagoContext.Provider 
      value={{ 
        isInitialized, 
        preferenceId, 
        setPreferenceId,
        clearPreferenceId
      }}
    >
      {children}
    </MercadoPagoContext.Provider>
  );
};

export const useMercadoPago = (): MercadoPagoContextType => {
  const context = useContext(MercadoPagoContext);
  if (context === undefined) {
    throw new Error('useMercadoPago debe ser usado dentro de un MercadoPagoProvider');
  }
  return context;
};