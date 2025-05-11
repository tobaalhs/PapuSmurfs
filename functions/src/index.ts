// src/index.ts

import * as admin from 'firebase-admin';

// Inicializa Firebase Admin PRIMERO, antes de cualquier otra importación
admin.initializeApp();

// Ahora importa el resto
import { createPaymentPreference } from './mercadoPago';
import { mercadoPagoWebhook } from './mercadoPagoWebhook';

export {
  createPaymentPreference,
  mercadoPagoWebhook
};