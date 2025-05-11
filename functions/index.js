const { onCall, onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const axios = require("axios");
const crypto = require("crypto");
const cors = require('cors')({ origin: true });

admin.initializeApp();

// Claves de Flow (reemplaza con tus claves de sandbox)
const FLOW_API_KEY = "28F7B783-FFC3-4D02-81F9-28L5D78CC6A4";
const FLOW_SECRET_KEY = "a6eeed41e6551fc4890555b8d80f70fee55db044";

// URL base de Flow
const FLOW_API_URL = "https://sandbox.flow.cl/api";

// Función para crear un pago con Flow
exports.createFlowPayment = onCall({
  cors: true
}, async (request) => {
  const userId = request.auth ? request.auth.uid : 'anonymous';
  
  try {
    console.log("Recibida solicitud de pago:", JSON.stringify({
      ...request.data,
      email: request.data.email ? "REDACTED" : undefined
    }));
    
    const { orderId, amount, email, subject, boostDetails = {} } = request.data;
    
    if (!orderId || !amount || !email || !subject) {
      throw new Error("Faltan datos obligatorios: orderId, amount, email, subject");
    }

    // URL de confirmación y retorno
    const urlConfirmation = `https://us-central1-elobooststore.cloudfunctions.net/flowConfirmation`;
    const urlReturn = request.data.returnUrl || `https://elobooststore.github.io/payment-result`;
    
    // Preparar parámetros para Flow
    const params = {
      apiKey: FLOW_API_KEY,
      commerceOrder: orderId,
      subject,
      currency: "CLP",
      amount: amount.toString(),
      email,
      urlConfirmation,
      urlReturn,
      optional: JSON.stringify({
        userId,
        ...boostDetails
      })
    };
    
    console.log("Parámetros preparados para Flow (excepto apiKey)");
    
    // Generar firma para Flow
    const sortedKeys = Object.keys(params).sort();
    let stringToSign = "";
    
    for (const key of sortedKeys) {
      stringToSign += params[key];
    }
    
    const hmac = crypto.createHmac("sha256", FLOW_SECRET_KEY);
    hmac.update(stringToSign);
    params.s = hmac.digest("hex");
    
    console.log("Firma generada. Realizando solicitud a Flow...");
    
    // Realizar la solicitud a Flow
    const response = await axios.post(`${FLOW_API_URL}/payment/create`, null, { 
      params,
      timeout: 10000
    });
    
    console.log("Respuesta de Flow:", response.data);
    
    // Verificar respuesta
    if (!response.data.url || !response.data.token) {
      console.error("Respuesta inesperada de Flow:", response.data);
      throw new Error("La respuesta de Flow no contiene los datos esperados");
    }
    
    return {
      success: true,
      url: response.data.url,
      token: response.data.token,
    };
  } catch (error) {
    console.error("Error creating Flow payment:", error.response ? {
      status: error.response.status,
      data: error.response.data
    } : error.message);
    
    throw new Error(`Error al crear el pago con Flow: ${error.message}`);
  }
});

// Función simple para confirmación de Flow
exports.flowConfirmation = onRequest(async (req, res) => {
  return cors(req, res, async () => {
    console.log("Recibida confirmación de Flow:", req.body);
    return res.status(200).send("OK");
  });
});

// Función simple para verificar estado de pago
exports.checkPaymentStatus = onCall({
  cors: true
}, async (request) => {
  try {
    console.log("Verificando estado de pago para orden:", request.data.orderId);
    
    // Por simplicidad, siempre devolvemos un estado exitoso
    return {
      order: {
        id: request.data.orderId || "test-order",
        status: "completed",
        amount: 60500,
        subject: "Boost de prueba",
        createdAt: new Date().toISOString()
      },
      paymentStatus: {
        status: 2, // 2 = Pagado
        flow_order: "test123",
        commerceOrder: request.data.orderId || "test-order",
        requestDate: new Date().toISOString(),
        paymentDate: new Date().toISOString(),
        amount: 60500,
        payer: "test@example.com",
        media: "Tarjeta de Crédito"
      }
    };
  } catch (error) {
    console.error("Error checking payment status:", error);
    throw new Error(`Error al verificar el estado del pago: ${error.message}`);
  }
});