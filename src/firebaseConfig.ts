import { initializeApp, FirebaseOptions } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator, Functions } from "firebase/functions";

// Extender la interfaz Window
declare global {
  interface Window {
    firebaseFunctions: Functions;
  }
}

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyAD1pvqdSMINxW0-6_1f9CZK9K95_koam0",
  authDomain: "elobooststore.firebaseapp.com",
  projectId: "elobooststore",
  storageBucket: "elobooststore.appspot.com",
  messagingSenderId: "658754041291",
  appId: "1:658754041291:web:4af61b8d835b96b10cb24e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const provider = new GoogleAuthProvider();
export const microsoftProvider = new OAuthProvider('microsoft.com');

// Conectar a los emuladores si estamos en localhost
// Conectar a los emuladores solo en desarrollo
if (window.location.hostname === "localhost") {
  console.log("🔥 Usando emuladores de Firebase en desarrollo local");
  
  // Conectar al emulador de Functions
  connectFunctionsEmulator(functions, "localhost", 5001);
  
  // Conectar al emulador de Firestore
  connectFirestoreEmulator(db, "localhost", 8080);
} else {
  console.log("🚀 Conectando a servicios de Firebase en producción");
}

// Exponer functions para pruebas en consola
window.firebaseFunctions = functions;

export default app;