import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebaseConfig';
import { useMercadoPago } from '../contexts/MercadoPagoContext';
import './BoostCheckout.css';
import { Wallet } from '@mercadopago/sdk-react';

interface BoostData {
  fromRank: string;
  toRank: string;
  nickname: string;
  server: string;
  queueType: string;
  currentLP: string;
  lpPerWin: string;
  selectedLane: string;
  flash: string;
  selectedChampions: string[];
  offlineMode: boolean;
  duoBoost: boolean;
  priorityBoost: boolean;
  priceCLP: string;
  priceUSD: string;
  displayCurrency: 'USD' | 'CLP';
}

const BoostCheckout: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isInitialized, preferenceId, setPreferenceId } = useMercadoPago();
  const [boostData, setBoostData] = useState<BoostData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // Determinar si estamos en desarrollo local
  const isDevelopment = window.location.hostname === 'localhost';

  useEffect(() => {
    // Recuperar datos del pedido
    const savedData = localStorage.getItem('pendingBoostOrder');
    if (!savedData) {
      navigate('/ranked-boost'); // Si no hay datos, volver al formulario
      return;
    }

    try {
      const data = JSON.parse(savedData);
      setBoostData(data);
      
      // Generar un ID único para la orden
      const uniqueId = `order-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      setOrderId(uniqueId);
      
      if (isDevelopment) {
        setDebugInfo('🔥 Modo de desarrollo detectado - Usando emuladores de Firebase');
      }
    } catch (error) {
      console.error('Error parsing boost data:', error);
      navigate('/ranked-boost');
    }
  }, [navigate]);

  // Limpiar el preferenceId al cargar la página
  useEffect(() => {
    setPreferenceId('');
  }, [setPreferenceId]);

  const handleCreatePreference = async () => {
    if (!boostData || !orderId) return;
  
    setIsProcessing(true);
    setError(null);
    
    try {
      console.log("1. Iniciando proceso de pago con Mercado Pago");
      
      // Preparar datos para la función
      const paymentData = {
        orderId,
        items: [{
          title: `Eloboost: ${boostData.fromRank} a ${boostData.toRank}`,
          quantity: 1,
          unit_price: parseInt(boostData.priceCLP.replace(/\D/g, '')),
          currency_id: 'CLP',
          description: `Server: ${boostData.server}, Queue: ${boostData.queueType}, Nickname: ${boostData.nickname}`
        }],
        payer: {
          email: user?.email || 'anonymous@eloboost.store',
          name: user?.displayName || 'Anonymous',
        },
        metadata: {
          boostDetails: {
            fromRank: boostData.fromRank,
            toRank: boostData.toRank,
            server: boostData.server,
            queueType: boostData.queueType,
            nickname: boostData.nickname,
            offlineMode: boostData.offlineMode,
            duoBoost: boostData.duoBoost,
            priorityBoost: boostData.priorityBoost
          }
        },
        userId: user?.uid || 'anonymous'
      };
      
      console.log("2. Datos de pago preparados", paymentData);
      
      // Llamar a la función de Firebase
      const createPaymentPreferenceFn = httpsCallable(functions, 'createPaymentPreference');
      const result = await createPaymentPreferenceFn(paymentData);
      
      console.log("3. Respuesta recibida:", result.data);
      
      const data = result.data as any;
      
      // Guardar el ID de orden en localStorage para referencia futura
      localStorage.setItem('currentOrderId', orderId);
      
      if (data && data.preferenceId) {
        console.log(`4. PreferenceID recibido: ${data.preferenceId}`);
        
        // Establecer el ID de preferencia para renderizar el botón de Mercado Pago
        setPreferenceId(data.preferenceId);
      } else {
        throw new Error('No se recibió un ID de preferencia válido');
      }
    } catch (error: any) {
      console.error('Error al crear preferencia en Mercado Pago:', error);
      setError(`Error al procesar el pago: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!boostData) return <div className="loading">Cargando...</div>;

  return (
    <div className="boost-checkout-container">
      <div className="checkout-content">
        <h1>{t('checkout.title') || 'Finalizar Pedido'}</h1>
        
        {/* Información de debug en desarrollo */}
        {isDevelopment && debugInfo && (
          <div className="debug-info">
            <h3>Información de Depuración:</h3>
            <p>{debugInfo}</p>
          </div>
        )}
        
        {/* Mensaje de error si existe */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {/* Resumen del pedido */}
        <div className="order-summary-checkout">
          <h2>{t('checkout.orderSummary') || 'Resumen del Pedido'}</h2>
          <div className="summary-details">
            <div className="summary-row">
              <span>{t('checkout.from') || 'Desde'}:</span>
              <span>{boostData.fromRank}</span>
            </div>
            <div className="summary-row">
              <span>{t('checkout.to') || 'Hasta'}:</span>
              <span>{boostData.toRank}</span>
            </div>
            <div className="summary-row">
              <span>{t('checkout.server') || 'Servidor'}:</span>
              <span>{boostData.server}</span>
            </div>
            <div className="summary-row">
              <span>{t('checkout.queue') || 'Cola'}:</span>
              <span>{boostData.queueType === 'soloq' ? 'SoloQ' : 'FlexQ'}</span>
            </div>
            <div className="summary-row">
              <span>{t('checkout.nickname') || 'Nickname'}:</span>
              <span>{boostData.nickname}</span>
            </div>
            <div className="summary-row">
              <span>{t('checkout.offlineMode') || 'Modo Offline'}:</span>
              <span>{boostData.offlineMode ? (t('checkout.yes') || 'Sí') : (t('checkout.no') || 'No')}</span>
            </div>
            <div className="summary-row">
              <span>{t('checkout.duoBoost') || 'Duo Boost'}:</span>
              <span>{boostData.duoBoost ? (t('checkout.yes') || 'Sí') : (t('checkout.no') || 'No')}</span>
            </div>
            <div className="summary-row">
              <span>{t('checkout.priorityBoost') || 'Boost Prioritario'}:</span>
              <span>{boostData.priorityBoost ? (t('checkout.yes') || 'Sí') : (t('checkout.no') || 'No')}</span>
            </div>
            {boostData.selectedLane !== 'none' && (
              <div className="summary-row">
                <span>{t('checkout.selectedLane') || 'Línea seleccionada'}:</span>
                <span>{t(`checkout.${boostData.selectedLane}`) || boostData.selectedLane}</span>
              </div>
            )}
            {boostData.selectedChampions.length > 0 && (
              <div className="summary-row champions-row">
                <span>{t('checkout.selectedChampions') || 'Campeones seleccionados'}:</span>
                <div className="champions-list">
                  {boostData.selectedChampions.map(champ => (
                    <div key={champ} className="champion-item">{champ.replace(/_/g, " ")}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="price-summary">
            <div className="price-row">
              <span>{t('checkout.priceInCLP') || 'Precio en CLP'}:</span>
              <span>{boostData.priceCLP} CLP</span>
            </div>
          </div>
        </div>

        {/* Sección de pago con Mercado Pago */}
        <div className="payment-section">
          <h2>{t('checkout.paymentMethods') || 'Métodos de Pago'}</h2>
          
          {!preferenceId ? (
            <div className="mercadopago-container">
              <div className="payment-method mercadopago selected">
                <div className="payment-method-name">
                  Mercado Pago
                </div>
                <div className="payment-method-info">
                  CLP {boostData.priceCLP}
                </div>
                <div className="payment-method-description">
                  Pago seguro con tarjetas, transferencias y más
                </div>
              </div>
              
              <div className="total-price">
                <span>{t('checkout.total') || 'Total'}:</span>
                <span className="price">
                  {boostData.priceCLP} CLP
                </span>
              </div>
      
              <button 
                className={`checkout-btn ${isProcessing ? 'disabled' : ''}`}
                disabled={isProcessing}
                onClick={handleCreatePreference}
              >
                {isProcessing 
                  ? 'Procesando...' 
                  : (t('checkout.continueToPayment') || 'Continuar al Pago')}
              </button>
            </div>
          ) : (
            <div className="mercadopago-button-container">
              {isInitialized ? (
                <div className="wallet-container">
                  <h3>Selecciona tu método de pago:</h3>
                  
                  {/* Componente Wallet de Mercado Pago */}
                  <Wallet 
                    initialization={{ preferenceId }}
                    onReady={() => console.log("Wallet listo")}
                    onError={(error) => {
                      console.error("Error en Wallet:", error);
                      setError(`Error al cargar las opciones de pago: ${error}`);
                    }}
                  />
                </div>
              ) : (
                <div className="loading-mp">
                  Cargando opciones de pago...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Botón para volver */}
        <button 
          className="back-button"
          onClick={() => navigate('/ranked-boost')}
          disabled={isProcessing}
        >
          {t('checkout.backToBoost') || 'Volver al configurador'}
        </button>
        
        {/* Información adicional para desarrollo */}
        {isDevelopment && (
          <div className="dev-controls">
            <h3>Controles de desarrollo</h3>
            <button 
              onClick={() => {
                navigate('/payment/success?collection_id=12345&preference_id=test_pref&payment_id=test_pay&status=approved');
              }}
              className="dev-button success"
            >
              Simular pago exitoso
            </button>
            <button 
              onClick={() => {
                navigate('/payment/pending?collection_id=12345&preference_id=test_pref&payment_id=test_pay&status=pending');
              }}
              className="dev-button pending"
            >
              Simular pago pendiente
            </button>
            <button 
              onClick={() => {
                navigate('/payment/failure?collection_id=12345&preference_id=test_pref&payment_id=test_pay&status=rejected');
              }}
              className="dev-button error"
            >
              Simular pago fallido
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoostCheckout;