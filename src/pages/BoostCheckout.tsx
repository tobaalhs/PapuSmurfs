import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebaseConfig';
import './BoostCheckout.css';

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
  const [boostData, setBoostData] = useState<BoostData | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'flow' | 'paypal' | null>(null);
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

  const handlePaymentMethodSelect = (method: 'flow' | 'paypal') => {
    setSelectedPaymentMethod(method);
    setError(null); // Limpiar errores previos
  };

  const getDisplayPrice = () => {
    if (!boostData) return '0';
    return selectedPaymentMethod === 'flow' ? boostData.priceCLP : boostData.priceUSD;
  };

  const getCurrency = () => {
    return selectedPaymentMethod === 'flow' ? 'CLP' : 'USD';
  };

  const createFlowPayment = async () => {
    if (!boostData || !orderId) return;
  
    setIsProcessing(true);
    setError(null);
    
    try {
      console.log("1. Iniciando proceso de pago con Flow");
      
      // Preparar datos para la función
      const paymentData = {
        orderId,
        amount: parseInt(boostData.priceCLP.replace(/\D/g, '')),
        email: user?.email || 'test@example.com',
        subject: `Eloboost: ${boostData.fromRank} a ${boostData.toRank}`,
        boostDetails: {
          fromRank: boostData.fromRank,
          toRank: boostData.toRank,
          server: boostData.server,
          queueType: boostData.queueType,
          nickname: boostData.nickname,
          offlineMode: boostData.offlineMode,
          duoBoost: boostData.duoBoost,
          priorityBoost: boostData.priorityBoost
        },
        returnUrl: `${window.location.origin}/payment-result`
      };
      
      console.log("2. Datos de pago preparados");
      
      // Llamar a la función de Firebase
      const createFlowPaymentFn = httpsCallable(functions, 'createFlowPayment');
      const result = await createFlowPaymentFn(paymentData);
      
      console.log("3. Respuesta recibida:", result.data);
      
      const data = result.data as any;
      
      // Guardar el ID de orden en localStorage
      localStorage.setItem('currentOrderId', orderId);
      
      if (data && data.url) {
        console.log(`4. Redirigiendo a: ${data.url}`);
        
        // Redirigir al usuario a la página de pago de Flow
        window.location.href = data.url;
      } else {
        throw new Error('No se recibió una URL de redirección válida');
      }
    } catch (error: any) {
      console.error('Error al crear pago Flow:', error);
      setError(`Error al procesar el pago: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayPalPayment = async () => {
    // Implementación futura para PayPal
    alert('PayPal estará disponible próximamente');
  };

  const handlePayment = () => {
    if (selectedPaymentMethod === 'flow') {
      createFlowPayment();
    } else if (selectedPaymentMethod === 'paypal') {
      handlePayPalPayment();
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
            <div className="price-row">
              <span>{t('checkout.priceInUSD') || 'Precio en USD'}:</span>
              <span>{boostData.priceUSD} USD</span>
            </div>
          </div>
        </div>

        {/* Sección de pago */}
        <div className="payment-section">
          <h2>{t('checkout.paymentMethods') || 'Métodos de Pago'}</h2>
          <div className="payment-methods">
            <button 
              className={`payment-method flow ${selectedPaymentMethod === 'flow' ? 'selected' : ''}`}
              onClick={() => handlePaymentMethodSelect('flow')}
              disabled={isProcessing}
            >
              <div className="payment-method-name">
                Tarjeta de Crédito/Débito
              </div>
              <div className="payment-method-info">CLP {boostData.priceCLP}</div>
              <div className="payment-method-description">
                Pago seguro con Flow
              </div>
            </button>
            
            <button 
              className={`payment-method paypal ${selectedPaymentMethod === 'paypal' ? 'selected' : ''}`}
              onClick={() => handlePaymentMethodSelect('paypal')}
              disabled={true} // Deshabilitamos PayPal por ahora
            >
              <div className="payment-method-name">PayPal</div>
              <div className="payment-method-info">USD {boostData.priceUSD}</div>
              <div className="payment-method-badge coming-soon">Próximamente</div>
            </button>
          </div>
        </div>

        <div className="total-price">
          <span>{t('checkout.total') || 'Total'}:</span>
          <span className="price">
            {getDisplayPrice()} {getCurrency()}
          </span>
        </div>

        <button 
          className={`checkout-btn ${!selectedPaymentMethod || isProcessing ? 'disabled' : ''}`}
          disabled={!selectedPaymentMethod || isProcessing}
          onClick={handlePayment}
        >
          {isProcessing 
            ? 'Procesando...' 
            : (t('checkout.processPayment') || 'Procesar Pago')}
        </button>

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
                localStorage.setItem('flowSimulated', 'true');
                navigate('/payment-result?token=TEST_SUCCESS_TOKEN&status=success');
              }}
              className="dev-button success"
            >
              Simular pago exitoso
            </button>
            <button 
              onClick={() => {
                localStorage.setItem('flowSimulated', 'true');
                navigate('/payment-result?token=TEST_PENDING_TOKEN&status=pending');
              }}
              className="dev-button pending"
            >
              Simular pago pendiente
            </button>
            <button 
              onClick={() => {
                localStorage.setItem('flowSimulated', 'true');
                navigate('/payment-result?token=TEST_ERROR_TOKEN&status=error');
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