"use strict";
// src/mercadoPago.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentPreference = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios_1 = require("axios");
// IMPORTANTE: NO usar getFirestore aquí
// const db = getFirestore(); ← ELIMINAR ESTA LÍNEA
// Función para crear preferencia de pago
exports.createPaymentPreference = functions.https.onCall(async (data, context) => {
    var _a, _b, _c, _d;
    try {
        // Obtener Firestore DESPUÉS de que sabemos que Firebase está inicializado
        const db = admin.firestore();
        // Resto de tu código...
        const { orderId, items, payer, metadata, userId } = data;
        // Verificar datos necesarios
        if (!orderId || !items || !items.length) {
            throw new functions.https.HttpsError('invalid-argument', 'Se requieren datos de pedido válidos');
        }
        // Configurar la llamada a la API de Mercado Pago
        const url = 'https://api.mercadopago.com/checkout/preferences';
        const body = {
            items,
            payer,
            back_urls: {
                success: `${((_a = functions.config().site) === null || _a === void 0 ? void 0 : _a.url) || 'https://www.eloboost.store'}/payment/success`,
                failure: `${((_b = functions.config().site) === null || _b === void 0 ? void 0 : _b.url) || 'https://www.eloboost.store'}/payment/failure`,
                pending: `${((_c = functions.config().site) === null || _c === void 0 ? void 0 : _c.url) || 'https://www.eloboost.store'}/payment/pending`
            },
            auto_return: 'approved',
            external_reference: orderId,
            metadata
        };
        const response = await axios_1.default.post(url, body, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${((_d = functions.config().mercadopago) === null || _d === void 0 ? void 0 : _d.access_token) || ''}`
            }
        });
        // Determinar el ID de usuario
        let userIdToUse = 'anonymous';
        if (userId) {
            userIdToUse = userId;
        }
        else if (context && context.auth && context.auth.uid) {
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
    }
    catch (error) {
        console.error('Error al crear preferencia de pago:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', `Error al crear preferencia de pago: ${error.message || 'Error desconocido'}`);
    }
});
//# sourceMappingURL=mercadoPago.js.map