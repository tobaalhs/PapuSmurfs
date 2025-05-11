// src/mercadoPago.ts

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';

// IMPORTANTE: NO usar getFirestore aquí
// const db = getFirestore(); ← ELIMINAR ESTA LÍNEA

// Función para crear preferencia de pago
export const createPaymentPreference = functions.https.onCall(
  async (data: any, context: any) => {
    try {
      // Obtener Firestore DESPUÉS de que sabemos que Firebase está inicializado
      const db = admin.firestore();

      // Resto de tu código...
      const { orderId, items, payer, metadata, userId } = data;
      
      // Verificar datos necesarios
      if (!orderId || !items || !items.length) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Se requieren datos de pedido válidos'
        );
      }
      
      // Configurar la llamada a la API de Mercado Pago
      const url = 'https://api.mercadopago.com/checkout/preferences';
      const body = {
        items,
        payer,
        back_urls: {
          success: `${functions.config().site?.url || 'https://www.eloboost.store'}/payment/success`,
          failure: `${functions.config().site?.url || 'https://www.eloboost.store'}/payment/failure`,
          pending: `${functions.config().site?.url || 'https://www.eloboost.store'}/payment/pending`
        },
        auto_return: 'approved',
        external_reference: orderId,
        metadata
      };

      const response = await axios.post(url, body, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${functions.config().mercadopago?.access_token || ''}`
        }
      });

      // Determinar el ID de usuario
      let userIdToUse = 'anonymous';
      
      if (userId) {
        userIdToUse = userId;
      } else if (context && context.auth && context.auth.uid) {
        userIdToUse = context.auth.uid;
      }
      
      // Guardar en Firestore
      await db.collection('payment_preferences').add({
        userId: userIdToUse,
        preferenceId: response.data.id,
        orderId,
        items,
        metadata,
        status: 'created',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Retornar ID de preferencia
      return {
        preferenceId: response.data.id
      };
    } catch (error: any) {
      console.error('Error al crear preferencia de pago:', error);
      
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      
      throw new functions.https.HttpsError(
        'internal',
        `Error al crear preferencia de pago: ${error.message || 'Error desconocido'}`
      );
    }
  }
);