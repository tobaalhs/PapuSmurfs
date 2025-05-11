import { initMercadoPago } from '@mercadopago/sdk-react';

export const initializeMercadoPago = (publicKey: string): void => {
  initMercadoPago(publicKey);
};