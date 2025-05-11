// pages/lol/RankedBoost.tsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { calculatePrice, convertCLPtoUSD, RANK_ORDER } from '../../utils/priceCalculator';
import ironRank from '../../assets/ranks/iron.svg';
import bronzeRank from '../../assets/ranks/bronze.svg';
import silverRank from '../../assets/ranks/silver.svg';
import goldRank from '../../assets/ranks/gold.svg';
import platinumRank from '../../assets/ranks/platinum.svg';
import emeraldRank from '../../assets/ranks/emerald.svg';
import diamondRank from '../../assets/ranks/diamond.svg';
import masterRank from '../../assets/ranks/master.svg';
import grandmasterRank from '../../assets/ranks/grandmaster.svg';
import challengerRank from '../../assets/ranks/challenger.svg';
import lasRegionSvg from '../../assets/images/las.svg';
import lanRegionSvg from '../../assets/images/lan.svg';
import naRegionSvg from '../../assets/images/na.svg';
import brRegionSvg from '../../assets/images/br.svg';
import './RankedBoost.css';
import Swal, { SweetAlertIcon, SweetAlertResult } from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import i18n from 'i18next';

export const RankedBoost: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Estados para el slider y rangos
  const [fromValue, setFromValue] = useState(26); // Valor inicial: Plata IV
  const [toValue, setToValue] = useState(78); // Valor inicial: Diamante IV
  const [isDragging, setIsDragging] = useState(false);
  const [currentThumb, setCurrentThumb] = useState<'from' | 'to' | null>(null);
  
  // Estados para las opciones
  const [server, setServer] = useState('LAS');
  const [queueType, setQueueType] = useState('soloq');
  const [currentLP, setCurrentLP] = useState('0-29');
  const [lpPerWin, setLpPerWin] = useState('20-25');
  const [selectedLane, setSelectedLane] = useState('none');
  const [flash, setFlash] = useState('flash-d');
  const [nickname, setNickname] = useState('');
  const [selectedChampions, setSelectedChampions] = useState<Set<string>>(new Set());
  const [isChampionDropdownOpen, setIsChampionDropdownOpen] = useState(false);
  const [priceCLP, setPriceCLP] = useState('0');  // Precio en CLP
  const [priceUSD, setPriceUSD] = useState('0');  // Precio en USD
  const [offlineMode, setOfflineMode] = useState(false);
  const [duoBoost, setDuoBoost] = useState(false);
  const [priorityBoost, setPriorityBoost] = useState(false);
  const [displayCurrency, setDisplayCurrency] = useState<'CLP' | 'USD'>('USD');
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  

  interface LanguageMapping {
    [key: string]: string;
  }

  const SPANISH_SPEAKING_COUNTRIES = [
    'CL', // Chile
    'AR', // Argentina
    'PY', // Paraguay
    'PE', // Peru
    'UY', // Uruguay
    'GT', // Guatemala
    'MX', // Mexico
    'SV', // El Salvador
    'CO', // Colombia
    'VE', // Venezuela
    'EC', // Ecuador
    'BO', // Bolivia
    'CR', // Costa Rica
    'DO', // República Dominicana
    'HN', // Honduras
    'NI', // Nicaragua
    'PA', // Panamá
    'PR', // Puerto Rico
  ];
  
  const LANGUAGE_BY_COUNTRY: LanguageMapping = {
    'BR': 'pt', // Brasil -> Portugués
    'US': 'en', // Estados Unidos -> Inglés
    // Todos los países hispanos se manejarán por defecto
  };

  const rankImages: { [key: string]: string } = {
    iron: ironRank,
    bronze: bronzeRank,
    silver: silverRank,
    gold: goldRank,
    platinum: platinumRank,
    emerald: emeraldRank,
    diamond: diamondRank,
    master: masterRank,
    grandmaster: grandmasterRank,
    challenger: challengerRank
  };

  const champions = [
    'Aatrox', 'Ahri', 'Akali', 'Akshan', 'Alistar', 'Ambessa', 'Amumu', 'Anivia', 'Annie', 'Aphelios', 'Ashe', 'Aurelion_Sol', 'Aurora',
    'Azir', 'Bard', 'Bel\'Veth', 'Blitzcrank', 'Brand', 'Braum', 'Briar', 'Caitlyn', 'Camille', 'Cassiopeia', 'Cho\'Gath', 
    'Corki', 'Darius', 'Diana', 'Draven', 'Dr._Mundo', 'Ekko', 'Elise', 'Evelynn', 'Ezreal', 'Fiddlesticks', 'Fiora', 
    'Fizz', 'Galio', 'Gangplank', 'Garen', 'Gnar', 'Gragas', 'Graves', 'Gwen', 'Hecarim', 'Heimerdinger', 'Hwei', 'Illaoi', 
    'Irelia', 'Ivern', 'Janna', 'Jarvan_IV', 'Jax', 'Jayce', 'Jhin', 'Jinx', 'K\'Sante', 'Kai\'Sa', 'Kalista', 'Karma', 
    'Karthus', 'Kassadin', 'Katarina', 'Kayle', 'Kayn', 'Kennen', 'Kha\'Zix', 'Kindred', 'Kled', 'Kog\'Maw', 'LeBlanc', 
    'Lee_Sin', 'Leona', 'Lillia', 'Lissandra', 'Lucian', 'Lulu', 'Lux', 'Malphite', 'Malzahar', 'Maokai', 'Master_Yi', 
    'Milio', 'Miss_Fortune', 'Mordekaiser', 'Morgana', 'Naafiri', 'Nami', 'Nasus', 'Nautilus', 'Neeko', 'Nidalee', 
    'Nilah', 'Nocturne', 'Nunu', 'Olaf', 'Orianna', 'Ornn', 'Pantheon', 'Poppy', 'Pyke', 'Qiyana', 'Quinn', 'Rakan', 
    'Rammus', 'Rek\'Sai', 'Rell', 'Renata_Glasc', 'Renekton', 'Rengar', 'Riven', 'Rumble', 'Ryze', 'Samira', 'Sejuani', 
    'Senna', 'Seraphine', 'Sett', 'Shaco', 'Shen', 'Shyvana', 'Singed', 'Sion', 'Sivir', 'Skarner', 'Sona', 'Soraka', 
    'Swain', 'Sylas', 'Syndra', 'Tahm_Kench', 'Taliyah', 'Talon', 'Taric', 'Teemo', 'Thresh', 'Tristana', 'Trundle', 
    'Tryndamere', 'Twisted_Fate', 'Twitch', 'Udyr', 'Urgot', 'Varus', 'Vayne', 'Veigar', 'Vel\'Koz', 'Vex', 'Vi', 'Viego', 
    'Viktor', 'Vladimir', 'Volibear', 'Warwick', 'Wukong', 'Xayah', 'Xerath', 'Xin_Zhao', 'Yasuo', 'Yone', 'Yorick', 
    'Yuumi', 'Zac', 'Zed', 'Zeri', 'Ziggs', 'Zilean', 'Zoe', 'Zyra'
];

const availableChampions = champions.filter(champ => !selectedChampions.has(champ));

const toggleDropdown = () => {
  console.log("Dropdown toggled", isChampionDropdownOpen);
  setIsChampionDropdownOpen(!isChampionDropdownOpen);
};


// Función para agregar un campeón
const addChampion = (championId: string) => {
  if (selectedLane === 'none') return; // No hacer nada si no eligieron línea

  setSelectedChampions((prev) => new Set(prev).add(championId));
};


// Función para eliminar un campeón
const removeChampion = (championId: string) => {
  setSelectedChampions((prev) => {
    const newSet = new Set(prev);
    newSet.delete(championId);
    return newSet;
  });
};

const handleLaneChange = (lane: string) => {
  setSelectedLane(lane);

  // Si la línea seleccionada es "none", borrar campeones
  if (lane === 'none') {
    setSelectedChampions(new Set());
  }
};



  // Referencias
  const sliderRef = useRef<HTMLDivElement>(null);

  // Array de rangos
  const ranks = [
    // Hierro
    { name: 'Hierro IV', rankType: 'iron', minValue: 0 },
    { name: 'Hierro III', rankType: 'iron', minValue: 3.25 },
    { name: 'Hierro II', rankType: 'iron', minValue: 6.5 },
    { name: 'Hierro I', rankType: 'iron', minValue: 9.75 },

    // Bronce
    { name: 'Bronce IV', rankType: 'bronze', minValue: 13 },
    { name: 'Bronce III', rankType: 'bronze', minValue: 16.25 },
    { name: 'Bronce II', rankType: 'bronze', minValue: 19.5 },
    { name: 'Bronce I', rankType: 'bronze', minValue: 22.75 },

    // Plata
    { name: 'Plata IV', rankType: 'silver', minValue: 26 },
    { name: 'Plata III', rankType: 'silver', minValue: 29.25 },
    { name: 'Plata II', rankType: 'silver', minValue: 32.5 },
    { name: 'Plata I', rankType: 'silver', minValue: 35.75 },

    // Oro
    { name: 'Oro IV', rankType: 'gold', minValue: 39 },
    { name: 'Oro III', rankType: 'gold', minValue: 42.25 },
    { name: 'Oro II', rankType: 'gold', minValue: 45.5 },
    { name: 'Oro I', rankType: 'gold', minValue: 48.75 },

    // Platino
    { name: 'Platino IV', rankType: 'platinum', minValue: 52 },
    { name: 'Platino III', rankType: 'platinum', minValue: 55.25 },
    { name: 'Platino II', rankType: 'platinum', minValue: 58.5 },
    { name: 'Platino I', rankType: 'platinum', minValue: 61.75 },

    // Esmeralda
    { name: 'Esmeralda IV', rankType: 'emerald', minValue: 65 },
    { name: 'Esmeralda III', rankType: 'emerald', minValue: 68.25 },
    { name: 'Esmeralda II', rankType: 'emerald', minValue: 71.5 },
    { name: 'Esmeralda I', rankType: 'emerald', minValue: 74.75 },

    // Diamante
    { name: 'Diamante IV', rankType: 'diamond', minValue: 78 },
    { name: 'Diamante III', rankType: 'diamond', minValue: 81.25 },
    { name: 'Diamante II', rankType: 'diamond', minValue: 84.5 },
    { name: 'Diamante I', rankType: 'diamond', minValue: 87.75 },

    // Master+
    { name: 'Master', rankType: 'master', minValue: 91 },
    { name: 'Grandmaster', rankType: 'grandmaster', minValue: 94 },
    { name: 'Challenger', rankType: 'challenger', minValue: 97, maxValue: 100 }
  ];

  // Función para obtener el rango según el valor
  const getRankByValue = (value: number) => {
    return ranks.reduce((prev, curr) => {
      if (value >= curr.minValue) {
        return curr;
      }
      return prev;
    }, ranks[0]);
  };

  // Funciones del slider
  const getValueFromPosition = (clientX: number) => {
    if (!sliderRef.current) return 0;
    const rect = sliderRef.current.getBoundingClientRect();
    const position = clientX - rect.left;
    let value = (position / rect.width) * 100;
    return Math.max(0, Math.min(100, value));
  };

  const getClosestRankValue = (value: number) => {
    if (value >= 97) return 100;
    
    const challengerStartValue = 97;
    if (Math.abs(value - challengerStartValue) <= 1.5) {
      for (let i = ranks.length - 2; i >= 0; i--) {
        if (value > ranks[i].minValue) {
          return ranks[i].minValue;
        }
      }
    }
    
    let closestValue = ranks[0].minValue;
    let minDiff = Math.abs(value - ranks[0].minValue);
    
    for (const rank of ranks) {
      const diff = Math.abs(value - rank.minValue);
      if (diff < minDiff) {
        minDiff = diff;
        closestValue = rank.minValue;
      }
    }
    
    return closestValue;
  };

  // Handlers del slider
  const handleMouseDown = (e: React.MouseEvent, thumb: 'from' | 'to') => {
    setIsDragging(true);
    setCurrentThumb(thumb);
  };

  const validateNickname = (nick: string): boolean => {
    return nick.includes('#');
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !currentThumb) return;
    
    let value = getValueFromPosition(e.clientX);
    value = getClosestRankValue(value);

    if (currentThumb === 'from' && value <= (toValue - 3)) {
      setFromValue(value);
    } else if (currentThumb === 'to' && value >= (fromValue + 3)) {
      setToValue(value);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setCurrentThumb(null);
  };

  const showAlert = (title: string, text: string, icon: SweetAlertIcon) => {
    return Swal.fire({
      title,
      text,
      icon,
      confirmButtonText: 'Ok',
      confirmButtonColor: '#FFD700',
      background: '#1F2937',
      color: '#fff',
      customClass: {
        popup: 'swal-custom-popup',
        title: 'swal-custom-title',
        htmlContainer: 'swal-custom-content', // cambiado de 'content' a 'htmlContainer'
        confirmButton: 'swal-custom-confirm'
      }
    });
  };

  // Efectos
  useEffect(() => {
    if (user) {
      const savedBoostData = localStorage.getItem('pendingBoostOrder');
      if (savedBoostData) {
        try {
          const data = JSON.parse(savedBoostData);
          
          // Restaurar todos los estados
          const fromRank = ranks.find(r => r.name === data.fromRank);
          const toRank = ranks.find(r => r.name === data.toRank);
          
          if (fromRank) setFromValue(fromRank.minValue);
          if (toRank) setToValue(toRank.minValue);
          
          setNickname(data.nickname);
          setServer(data.server);
          setQueueType(data.queueType);
          setCurrentLP(data.currentLP);
          setLpPerWin(data.lpPerWin);
          setSelectedLane(data.selectedLane);
          setFlash(data.flash);
          setSelectedChampions(new Set(data.selectedChampions));
          setOfflineMode(data.offlineMode);
          setDuoBoost(data.duoBoost);
          setPriorityBoost(data.priorityBoost);
          setDisplayCurrency(data.displayCurrency || 'USD');
  
          // Limpiar los datos guardados
          localStorage.removeItem('pendingBoostOrder');
        } catch (error) {
          console.error('Error restoring boost data:', error);
          localStorage.removeItem('pendingBoostOrder');
        }
      }
    }
  }, [user]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, currentThumb, fromValue, toValue]);

  useEffect(() => {
    const detectUserCountryAndLanguage = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        // Establecer la moneda
        if (data.country_code === 'CL') {
          setDisplayCurrency('CLP');
        } else {
          setDisplayCurrency('USD');
        }
  
        // Establecer el idioma
        let detectedLanguage = 'en'; // Por defecto inglés
  
        if (SPANISH_SPEAKING_COUNTRIES.includes(data.country_code)) {
          detectedLanguage = 'es';
        } else if (LANGUAGE_BY_COUNTRY[data.country_code]) {
          detectedLanguage = LANGUAGE_BY_COUNTRY[data.country_code];
        }
  
        // Cambiar el idioma usando i18n
        i18n.changeLanguage(detectedLanguage);
  
      } catch (error) {
        console.error('Error detecting country:', error);
        setDisplayCurrency('USD');
        i18n.changeLanguage('en'); // Por defecto inglés
      }
    };
  
    detectUserCountryAndLanguage();
  }, []);

  const toggleCurrencyDropdown = () => {
    setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen);
  };

  // Efecto para actualizar el precio
  useEffect(() => {
    const fromRank = getRankByValue(fromValue);
    const toRank = getRankByValue(toValue);
    const clpPrice = calculatePrice(
      fromRank.name,
      toRank.name,
      currentLP as any,
      selectedLane,
      queueType,
      server as any,
      lpPerWin as any,
      selectedChampions.size >= 5,
      offlineMode,
      duoBoost,
      priorityBoost
    );
    
    setPriceCLP(clpPrice.toString());
    setPriceUSD(convertCLPtoUSD(clpPrice));
  }, [
    fromValue, 
    toValue, 
    currentLP, 
    selectedLane, 
    queueType, 
    server, 
    lpPerWin, 
    selectedChampions.size,
    duoBoost,
    priorityBoost,
    offlineMode
  ]);

  const saveBoostData = () => {
    const boostData = {
      fromRank: getRankByValue(fromValue).name,
      toRank: getRankByValue(toValue).name,
      nickname,
      server,
      queueType,
      currentLP,
      lpPerWin,
      selectedLane,
      flash,
      selectedChampions: Array.from(selectedChampions),
      offlineMode,
      duoBoost,
      priorityBoost,
      priceCLP,
      priceUSD,
      displayCurrency
    };
    
    localStorage.setItem('pendingBoostOrder', JSON.stringify(boostData));
  };

  // Handler para el botón de confirmar boost
  const handleConfirmBoost = () => {
    if (!nickname.trim()) {
      showAlert('Error', 'Por favor, ingresa tu nick de LoL', 'error');
      return;
    }
  
    if (!validateNickname(nickname)) {
      showAlert('Error', 'El nick debe incluir el símbolo #. Ejemplo: Hide on bush#KR1', 'error');
      return;
    }
  
    // Check if there are between 1 and 4 champions selected
    if (selectedChampions.size > 0 && selectedChampions.size < 5) {
      showAlert('Error', 'Es necesario seleccionar mínimo 5 campeones', 'error');
      return;
    }

    if (!user) {
      saveBoostData();
      navigate('/login?redirect=boost-checkout');
      return;
    }
  
    // Si está autenticado, guardamos los datos y vamos al checkout
    saveBoostData();
    navigate('/boost-checkout');
  };

  return (
    <div className="ranked-boost-container">
      <div className="hero-titles">
      {/*<h1>{t('lol.rankedboost.title')}</h1>*/}
      </div>
  
      <div className="main-content">
  <div className="content-left">
    <div className="top-selectors">
      <div className="rank-selector-container">
        <div className="ranks-display">
          <div className="rank-display from">
            <div className="rank-label">{t('lol.rankedboost.currentRank')}</div>
            <img 
              src={rankImages[getRankByValue(fromValue).rankType]}
              alt="Rango Actual" 
              className="rank-image"
            />
            <div className="rank-text">{t(`lol.rankedboost.${getRankByValue(fromValue).name}`)}</div>
          </div>
          <div className="rank-arrow">
  <svg width="50" height="24" viewBox="0 0 50 24">
    <path 
      d="M2 12h46M38 2l10 10-10 10" 
      stroke="#FFD700" 
      strokeWidth="3" 
      fill="none" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
</div>
          <div className="rank-display to">
            <div className="rank-label">{t('lol.rankedboost.desiredRank')}</div>
            <img 
              src={rankImages[getRankByValue(toValue).rankType]}
              alt="Rango Objetivo" 
              className="rank-image"
            />
            <div className="rank-text">{t(`lol.rankedboost.${getRankByValue(toValue).name}`)}</div>
          </div>
        </div>

        <div className="slider-wrapper">
          <div className="slider" ref={sliderRef}>
            <div className="slider-track" />
            <div 
              className="slider-range" 
              style={{
                left: `${fromValue}%`,
                width: `${toValue - fromValue}%`
              }}
            />
            <div
              className="slider-thumb"
              style={{ left: `${fromValue}%` }}
              onMouseDown={(e) => handleMouseDown(e, 'from')}
            >
              {'<'}
            </div>
            <div
              className="slider-thumb"
              style={{ left: `${toValue}%` }}
              onMouseDown={(e) => handleMouseDown(e, 'to')}
            >
              {'>'}
            </div>
          </div>
        </div>
      </div>

      <div className="basic-options-container">
  {/* Selector de Servidor */}
  <div className="option-section">
  <div className="option-title">
    {t('lol.rankedboost.server')}
    <span className="info-icon">?
      <span className="info-tooltip server-info-tooltip">{t('lol.rankedboost.infoServer')}</span>
    </span>
  </div>
    <div className="server-options">
      {[
        { id: 'LAS', image: lasRegionSvg },
        { id: 'LAN', image: lanRegionSvg },
        { id: 'NA', image: naRegionSvg },
        { id: 'BR', image: brRegionSvg }
      ].map(serverOption => (
        <button
          key={serverOption.id}
          className={`server-button ${server === serverOption.id ? 'active' : ''}`}
          onClick={() => setServer(serverOption.id)}
        >
          <img 
            src={serverOption.image} 
            alt={`Región ${serverOption.id}`}
            className="server-image"
          />
          <span className="server-name">{serverOption.id}</span>
        </button>
      ))}
    </div>
  </div>

  {/* Cola de Emparejamiento - Diseño mejorado */}
<div className="option-section">
  <div className="option-title">
    {t('lol.rankedboost.queue')}
    <span className="info-icon">?
      <span className="info-tooltip">{t('lol.rankedboost.infoQueue')}</span>
    </span>
  </div>
  <div className="switch-container">
    <div className="switch-group">
      <div 
        className={`switch-option ${queueType === 'soloq' ? 'active' : 'inactive'}`}
        onClick={() => setQueueType('soloq')}
      >
        SoloQ
      </div>
      <div 
        className={`switch-option ${queueType === 'flexq' ? 'active' : 'inactive'}`}
        onClick={() => setQueueType('flexq')}
      >
        FlexQ
      </div>
      <div 
        className={`switch-slider ${queueType === 'flexq' ? 'right' : ''}`}
      ></div>
    </div>
  </div>
</div>

  {/* Offline Mode - Diseño mejorado */}
<div className="option-section">
  <div className="switch-title-row">
    <div className="option-title">
      {t('lol.rankedboost.offlineMode')}
      <span className="info-icon">?
        <span className="info-tooltip">{t('lol.rankedboost.infoOfflineMode')}</span>
      </span>
    </div>
    <span className="price-tag free">{t('lol.rankedboost.free')}</span>
  </div>
  <div className="switch-container">
    <div className="switch-group">
      <div 
        className={`switch-option ${!offlineMode ? 'active' : 'inactive'}`}
        onClick={() => setOfflineMode(false)}
      >
        {t('lol.rankedboost.no')}
      </div>
      <div 
        className={`switch-option ${offlineMode ? 'active' : 'inactive'}`}
        onClick={() => setOfflineMode(true)}
      >
        {t('lol.rankedboost.yes')}
      </div>
      <div 
        className={`switch-slider ${offlineMode ? 'right' : ''}`}
      ></div>
    </div>
  </div>
</div>

</div>
    </div>
  
          <div className="options-grid">
  
            {/* LPs actuales */}
            <div className="option-box">
              <div className="option-title">
              {t('lol.rankedboost.currentLP')}
                <span className="info-icon">?
                  <span className="info-tooltip">{t('lol.rankedboost.infoCurrentLP')}</span>
                </span>
              </div>
              <div className="range-options">
                {['0-29', '30-59', '60-99'].map(lpRange => (
                  <label key={lpRange} className="range-option">
                    <input
                      type="radio"
                      name="lp-range"
                      value={lpRange}
                      checked={currentLP === lpRange}
                      onChange={(e) => setCurrentLP(e.target.value)}
                    />
                    <span className="range-button">{lpRange} LP</span>
                  </label>
                ))}
              </div>
            </div>
  
            {/* LPs ganados por victoria */}
            <div className="option-box">
              <div className="option-title">
              {t('lol.rankedboost.LPwonbyvictory')}
                <span className="info-icon">?
                  <span className="info-tooltip">{t('lol.rankedboost.infoLPwonbyvictory')}</span>
                </span>
              </div>
              <div className="range-options">
                {['1-19', '20-25', '26+'].map(gain => (
                  <label key={gain} className="range-option">
                    <input
                      type="radio"
                      name="lp-gain"
                      value={gain}
                      checked={lpPerWin === gain}
                      onChange={(e) => setLpPerWin(e.target.value)}
                    />
                    <span className="range-button">{gain}</span>
                  </label>
                ))}
              </div>
            </div>
  
            {/* Flash Key - Diseño mejorado */}
<div className="option-box">
  <div className="switch-title-row">
    <div className="option-title">
      {t('lol.rankedboost.flashkeybind')}
      <span className="info-icon">?
        <span className="info-tooltip">{t('lol.rankedboost.infoFlashkeybind')}</span>
      </span>
    </div>
    <span className="price-tag free">{t('lol.rankedboost.free')}</span>
  </div>
  <div className="switch-container">
    <div className="switch-group">
      <div 
        className={`switch-option ${flash === 'flash-d' ? 'active' : 'inactive'}`}
        onClick={() => setFlash('flash-d')}
      >
        D
      </div>
      <div 
        className={`switch-option ${flash === 'flash-f' ? 'active' : 'inactive'}`}
        onClick={() => setFlash('flash-f')}
      >
        F
      </div>
      <div 
        className={`switch-slider ${flash === 'flash-f' ? 'right' : ''}`}
      ></div>
    </div>
  </div>
</div>
  
            {/* Línea preferida */}
<div className="option-box">
  <div className="option-title">
    {t('lol.rankedboost.choosealane')}
    <span className="info-icon">?
      <span className="info-tooltip">{t('lol.rankedboost.infoChoosealane')}</span>
    </span>
    <span className="price-tag extra">
      {selectedLane === 'support' ? 
        (queueType === 'soloq' ? '+25%' : '+15%') : 
        '+10%'}
    </span>
  </div>
  <div className="range-options">
    <label className="range-option">
    <input
  type="radio"
  name="lane-choice"
  value="none"
  checked={selectedLane === 'none'}
  onChange={(e) => handleLaneChange(e.target.value)}
/>

      <span className="range-button">{t('lol.rankedboost.donotchoose')}</span>
    </label>
    {['top', 'jungle', 'mid', 'adc', 'support'].map(lane => (
      <label key={lane} className="range-option">
        <input
          type="radio"
          name="lane-choice"
          value={lane}
          checked={selectedLane === lane}
          onChange={(e) => setSelectedLane(e.target.value)}
        />
        <span className="range-button">{t(`lol.rankedboost.${lane}`)}</span>
      </label>
    ))}
  </div>
</div>

{/* Campeones específicos */}
<div className="option-box champion-selector">
  {selectedLane === 'none' && (
    <div className="disabled-overlay">
      <span>{t('lol.rankedboost.selectLaneFirst')}</span>
    </div>
  )}
  
  <div className="option-title">
    {t('lol.rankedboost.chooseChamps')}
    <span className="info-icon">?
      <span className="info-tooltip">{t('lol.rankedboost.infoChooseChamps')}</span>
    </span>
    <span className="price-tag extra">+25%</span>
  </div>

  <div className="champion-search">
    <div className="search-input-container" onClick={() => {
      if (selectedLane !== 'none') {
        toggleDropdown();
      }
    }}>
      <input
        type="text"
        id="championSearch"
        placeholder={t('lol.rankedboost.selectChampion')}
        className="champion-search-input"
        readOnly
        disabled={selectedLane === 'none'}
      />
      <span className={`dropdown-arrow2 ${isChampionDropdownOpen ? 'active' : ''}`}>
        ▼
      </span>
      
    </div>
    <div className="pool-champ-text">Pool Champ</div>

    {isChampionDropdownOpen && selectedLane !== 'none' && (
      <div className="champion-dropdown" style={{ display: isChampionDropdownOpen ? 'block' : 'none' }}>
        {availableChampions.map((champ) => (
          <div
            key={champ}
            className="champion-option"
            onClick={() => addChampion(champ)}
          >
            <img
              src={`https://wiki.leagueoflegends.com/en-us/images/${champ}_OriginalSquare.png?62007`}
              alt={champ}
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZiIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTJweCI+PzwvdGV4dD48L3N2Zz4=';
              }}
            />
            <span>{champ.replace(/%27/g, "'").replace(/_/g, " ")}</span>
          </div>
        ))}
      </div>
    )}
  </div>

  <div className="selected-champions">
    {Array.from(selectedChampions).map((champ) => (
      <div key={champ} className="selected-champion">
        <img
          src={`https://wiki.leagueoflegends.com/en-us/images/${champ}_OriginalSquare.png?62007`}
          alt={champ}
          onError={(e) => {
            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZiIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTJweCI+PzwvdGV4dD48L3N2Zz4=';
          }}
        />
        <span className="remove-champion" onClick={() => removeChampion(champ)}>×</span>
      </div>
    ))}
  </div>
</div>


{/* Contenedor para DuoBoost y Priority Boost */}
<div className="option-box2">
  <div className="boost-options-container">
    {/* DuoBoost Option */}
    <div className="boost-option-box">
      <div className="switch-title-row">
        <div className="option-title">
          {t('lol.rankedboost.duoboost')}
          <span className="info-icon">?
            <span className="info-tooltip">{t('lol.rankedboost.infoduoboost')}</span>
          </span>
        </div>
        <span className="price-tag extra">+20%</span>
      </div>
      <div className="switch-container">
        <div className="switch-group">
          <div 
            className={`switch-option ${!duoBoost ? 'active' : 'inactive'}`}
            onClick={() => setDuoBoost(false)}
          >
            {t('lol.rankedboost.no')}
          </div>
          <div 
            className={`switch-option ${duoBoost ? 'active' : 'inactive'}`}
            onClick={() => setDuoBoost(true)}
          >
            {t('lol.rankedboost.yes')}
          </div>
          <div 
            className={`switch-slider ${duoBoost ? 'right' : ''}`}
          ></div>
        </div>
      </div>
    </div>

    {/* Priority Boost Option */}
    <div className="boost-option-box">
      <div className="switch-title-row">
        <div className="option-title">
          Boost Priority
          <span className="info-icon">?
            <span className="info-tooltip">Priority boost ensures your order gets immediate attention and faster completion</span>
          </span>
        </div>
        <span className="price-tag extra">+15%</span>
      </div>
      <div className="switch-container">
        <div className="switch-group">
          <div 
            className={`switch-option ${!priorityBoost ? 'active' : 'inactive'}`}
            onClick={() => setPriorityBoost(false)}
          >
            Normal
          </div>
          <div 
            className={`switch-option ${priorityBoost ? 'active' : 'inactive'}`}
            onClick={() => setPriorityBoost(true)}
          >
            Priority
          </div>
          <div 
            className={`switch-slider ${priorityBoost ? 'right' : ''}`}
          ></div>
        </div>
      </div>
    </div>
  </div>
</div>
          </div>
        </div>
  
        <div className="content-right">
  <div className="order-summary">
    <h2 className="summary-header">{t('lol.rankedboost.orderSummary')}</h2>
    <div className="nick-input-container">
      <label className="nick-label">{t('lol.rankedboost.lolNickname')}</label>
      <input
        type="text"
        className="lol-nick-input"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="Hide on bush#KR1"
        maxLength={16}
      />
    </div>

    <div className="summary-content">
  <div className="summary-item">
    <span>{t('lol.rankedboost.currentLPSummary')}:</span>
    <span>{t(`lol.rankedboost.${getRankByValue(fromValue).name}`)}</span>
  </div>
  <div className="summary-item">
    <span>{t('lol.rankedboost.desiredLPSummary')}:</span>
    <span>{t(`lol.rankedboost.${getRankByValue(toValue).name}`)}</span>
  </div>
  <div className="summary-item">
    <span>{t('lol.rankedboost.offlineModeSummary')}:</span>
    <span>{offlineMode ? t('lol.rankedboost.yes') : t('lol.rankedboost.no')}</span>
  </div>
  <div className="summary-item">
    <span>{t('lol.rankedboost.serverSummary')}:</span>
    <span>{server}</span>
  </div>
  <div className="summary-item">
    <span>{t('lol.rankedboost.queueSummary')}:</span>
    <span>{queueType === 'soloq' ? 'SoloQ' : 'FlexQ'}</span>
  </div>
  <div className="summary-item">
  <span>{t('lol.rankedboost.duoBoostSummary')}:</span>
  <span>{duoBoost ? t('lol.rankedboost.yes') : t('lol.rankedboost.no')}</span>
</div>
  <div className="summary-item">
    <span>{t('lol.rankedboost.currentLP')}:</span>
    <span>{currentLP} LP</span>
  </div>
  <div className="summary-item">
    <span>{t('lol.rankedboost.LPwonbyvictory')}:</span>
    <span>{lpPerWin} LP</span>
  </div>
  <div className="summary-item">
    <span>{t('lol.rankedboost.laneSummary')}:</span>
    <span>
      {selectedLane === 'none' ? 
        t('lol.rankedboost.donotchoose') : 
        t(`lol.rankedboost.${selectedLane}`)}
    </span>
  </div>
  <div className="summary-item">
    <span>{t('lol.rankedboost.flashSummary')}:</span>
    <span>
      {flash === 'flash-d' ? 
        t('lol.rankedboost.flashD') : 
        t('lol.rankedboost.flashF')}
    </span>
  </div>
</div>

<div className="price-display">
        <div className="price-amount-container">
          <div className="price-amount">
            {displayCurrency === 'CLP' ? priceCLP : priceUSD} {displayCurrency}
          </div>
          <div className="currency-dropdown">
            <button 
              className="currency-toggle-button"
              onClick={toggleCurrencyDropdown}
            >
              {displayCurrency}
              <span className={`arrow ${isCurrencyDropdownOpen ? 'active' : ''}`}>
                ▼
              </span>
            </button>
            <div className={`currency-options ${isCurrencyDropdownOpen ? 'active' : ''}`}>
              <div 
                className={`currency-option ${displayCurrency === 'CLP' ? 'selected' : ''}`}
                onClick={() => {
                  setDisplayCurrency('CLP');
                  setIsCurrencyDropdownOpen(false);
                }}
              >
                CLP
              </div>
              <div 
                className={`currency-option ${displayCurrency === 'USD' ? 'selected' : ''}`}
                onClick={() => {
                  setDisplayCurrency('USD');
                  setIsCurrencyDropdownOpen(false);
                }}
              >
                USD
              </div>
            </div>
          </div>
        </div>
      </div>

    {/* Botón de checkout */}
    <button className="pay-button" onClick={handleConfirmBoost}>
      {t('lol.rankedboost.checkout')}
    </button>
  </div>
</div>
      </div>
    </div>
  );
};

export default RankedBoost;