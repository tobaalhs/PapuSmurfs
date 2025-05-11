import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import SignUp from "./pages/SignUp";
import VerifyEmail from "./pages/VerifyEmail";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import BoosterDashboard from "./pages/BoosterDashboard";
import { RankedBoost as LolRankedBoost } from "./pages/lol/RankedBoost";
import { PlacementBoost as LolPlacementBoost } from "./pages/lol/PlacementBoost";
import { RankedBoost as ValorantRankedBoost } from "./pages/valorant/RankedBoost";
import { PlacementBoost as ValorantPlacementBoost } from "./pages/valorant/PlacementBoost";
import BoostCheckout from "./pages/BoostCheckout";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentResult from "./pages/PaymentResult";
import { VerifiedRoute } from "./contexts/AuthContext";
import "./App.css";

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          
          {/* Rutas de League of Legends */}
          <Route path="/lol/ranked" element={<LolRankedBoost />} />
          <Route path="/lol/placement" element={<LolPlacementBoost />} />
          
          {/* Rutas de Valorant */}
          <Route path="/valorant/ranked" element={<ValorantRankedBoost />} />
          <Route path="/valorant/placement" element={<ValorantPlacementBoost />} />
          
          {/* Rutas de pagos */}
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-result" element={<PaymentResult />} /> {/* Nueva ruta para resultados de pago */}
          
          {/* Ruta del checkout - Nota: quitamos ProtectedRoute para permitir pagos anónimos */}
          <Route path="/boost-checkout" element={<BoostCheckout />} />
          
          {/* Rutas protegidas que requieren autenticación */}
          <Route 
            path="/register" 
            element={
              <ProtectedRoute>
                <Register />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <VerifiedRoute>
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              </VerifiedRoute>
            } 
          />

          <Route 
            path="/booster-dashboard" 
            element={
              <VerifiedRoute>
                <ProtectedRoute>
                  <BoosterDashboard />
                </ProtectedRoute>
              </VerifiedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;