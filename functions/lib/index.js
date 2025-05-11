"use strict";
// src/index.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.mercadoPagoWebhook = exports.createPaymentPreference = void 0;
const admin = require("firebase-admin");
// Inicializa Firebase Admin PRIMERO, antes de cualquier otra importación
admin.initializeApp();
// Ahora importa el resto
const mercadoPago_1 = require("./mercadoPago");
Object.defineProperty(exports, "createPaymentPreference", { enumerable: true, get: function () { return mercadoPago_1.createPaymentPreference; } });
const mercadoPagoWebhook_1 = require("./mercadoPagoWebhook");
Object.defineProperty(exports, "mercadoPagoWebhook", { enumerable: true, get: function () { return mercadoPagoWebhook_1.mercadoPagoWebhook; } });
//# sourceMappingURL=index.js.map