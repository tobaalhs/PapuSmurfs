"use strict";
// src/mercadoPagoWebhook.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.mercadoPagoWebhook = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios_1 = require("axios");
// NO inicializar Firestore aquí fuera de la función
// const db = getFirestore(); ← ELIMINAR ESTA LÍNEA
exports.mercadoPagoWebhook = functions.https.onRequest(async (req, res) => {
    var _a;
    try {
        // Obtener Firestore DENTRO de la función
        const db = admin.firestore();
        const { type, data } = req.body;
        // Guardamos todos los webhooks para depuración
        await db.collection('webhooks_raw').add({
            body: req.body,
            headers: req.headers,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        // Solo nos interesan las notificaciones de pago
        if (type !== 'payment' || !data.id) {
            res.status(200).send('Notificación recibida, pero no es un pago');
            return;
        }
        // Obtenemos los detalles del pago de Mercado Pago
        const paymentId = data.id;
        // Obtener la configuración de acceso token
        const accessToken = (_a = functions.config().mercadopago) === null || _a === void 0 ? void 0 : _a.access_token;
        if (!accessToken) {
            console.error('No se ha configurado el token de acceso de Mercado Pago');
            res.status(500).send('Error en la configuración del webhook');
            return;
        }
        const response = await axios_1.default.get(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        const paymentData = response.data;
        const preferenceId = paymentData.preference_id;
        const externalReference = paymentData.external_reference || '';
        console.log(`Webhook: Pago ${paymentId} con estado ${paymentData.status} para preferencia ${preferenceId}`);
        // Actualizar el estado del pago en Firestore
        const paymentRef = db.collection('payments').doc(paymentId.toString());
        await paymentRef.set({
            paymentId,
            preferenceId,
            externalReference,
            status: paymentData.status,
            statusDetail: paymentData.status_detail,
            transactionAmount: paymentData.transaction_amount,
            paymentMethodId: paymentData.payment_method_id,
            paymentTypeId: paymentData.payment_type_id,
            payerEmail: paymentData.payer.email,
            metadata: paymentData.metadata || {},
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            createdAt: new Date(paymentData.date_created)
        }, { merge: true });
        // Actualizar la preferencia asociada
        const preferencesQuery = await db
            .collection('payment_preferences')
            .where('preferenceId', '==', preferenceId)
            .limit(1)
            .get();
        if (!preferencesQuery.empty) {
            const preferenceDoc = preferencesQuery.docs[0];
            await preferenceDoc.ref.update({
                status: paymentData.status,
                paymentId,
                paymentStatus: paymentData.status,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            // También actualizamos la orden relacionada si existe
            if (externalReference) {
                const ordersQuery = await db
                    .collection('boost_orders')
                    .where('orderId', '==', externalReference)
                    .limit(1)
                    .get();
                if (!ordersQuery.empty) {
                    const orderDoc = ordersQuery.docs[0];
                    await orderDoc.ref.update({
                        paymentStatus: paymentData.status,
                        paymentId,
                        updatedAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                }
            }
        }
        // Si el pago es aprobado, actualizamos el estado del boost
        if (paymentData.status === 'approved') {
            console.log(`Activando boost para orden ${externalReference}`);
            // Si la orden existe y está aprobada, la marcamos como lista para asignar
            if (externalReference) {
                const ordersQuery = await db
                    .collection('boost_orders')
                    .where('orderId', '==', externalReference)
                    .limit(1)
                    .get();
                if (!ordersQuery.empty) {
                    const orderDoc = ordersQuery.docs[0];
                    await orderDoc.ref.update({
                        status: 'ready_to_assign', // O el estado que uses para los boosts listos para asignar
                        paymentStatus: 'approved',
                        paymentDate: admin.firestore.FieldValue.serverTimestamp()
                    });
                    // Opcional: Notificar a los boosters de que hay un nuevo boost disponible
                    // Esto podría ser otra función
                }
            }
        }
        res.status(200).send('Webhook procesado correctamente');
        return;
    }
    catch (error) {
        console.error('Error procesando webhook:', error);
        // Intentamos guardar el error en Firestore para depuración
        try {
            const db = admin.firestore();
            await db.collection('webhook_errors').add({
                error: error.message,
                stack: error.stack,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
        }
        catch (dbError) {
            console.error('Error adicional al guardar el error en Firestore:', dbError);
        }
        res.status(500).send('Error interno procesando webhook');
        return;
    }
});
//# sourceMappingURL=mercadoPagoWebhook.js.map