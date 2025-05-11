import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useTranslation } from "react-i18next";
import { useState, useRef, useEffect } from "react";
import { User, Globe, LogOut, UserCircle, Check, LayoutDashboard, ChevronDown, Menu, X } from 'lucide-react';
import "./Navbar.css";

const Navbar: React.FC = () => {
 const { user, userProfile } = useAuth();
 const { t, i18n } = useTranslation();
 const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
 const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
 const [isLolDropdownOpen, setIsLolDropdownOpen] = useState(false);
 const [isValorantDropdownOpen, setIsValorantDropdownOpen] = useState(false);
 const [isLolClickOpen, setIsLolClickOpen] = useState(false);
 const [isValorantClickOpen, setIsValorantClickOpen] = useState(false);
 const [isScrolled, setIsScrolled] = useState(false);
 const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
 
 const userDropdownRef = useRef<HTMLDivElement>(null);
 const languageDropdownRef = useRef<HTMLDivElement>(null);
 const lolDropdownRef = useRef<HTMLDivElement>(null);
 const valorantDropdownRef = useRef<HTMLDivElement>(null);
 const navigate = useNavigate();

 const isMobile = () => window.innerWidth <= 768;

 const handleLogout = async () => {
   try {
     await signOut(auth);
     setIsUserDropdownOpen(false);
     setIsMobileMenuOpen(false);
   } catch (error) {
     console.error("Error al cerrar sesión:", error);
   }
 };

 const handleProfileClick = () => {
   navigate("/profile");
   setIsUserDropdownOpen(false);
   setIsMobileMenuOpen(false);
 };

 const handleDashboardClick = () => {
   navigate("/booster-dashboard");
   setIsUserDropdownOpen(false);
   setIsMobileMenuOpen(false);
 };

 const handleLolClick = () => {
   if (isMobile()) {
     setIsLolDropdownOpen(!isLolDropdownOpen);
   } else {
     setIsLolClickOpen(!isLolClickOpen);
     setIsValorantClickOpen(false);
   }
 };

 const handleValorantClick = () => {
   if (isMobile()) {
     setIsValorantDropdownOpen(!isValorantDropdownOpen);
   } else {
     setIsValorantClickOpen(!isValorantClickOpen);
     setIsLolClickOpen(false);
   }
 };

 const handleLanguageClick = () => {
   if (isMobile()) {
     setIsLanguageDropdownOpen(!isLanguageDropdownOpen);
   } else {
     setIsLanguageDropdownOpen(!isLanguageDropdownOpen);
     setIsUserDropdownOpen(false);
   }
 };

 const handleUserClick = () => {
   if (isMobile()) {
     setIsUserDropdownOpen(!isUserDropdownOpen);
   } else {
     setIsUserDropdownOpen(!isUserDropdownOpen);
     setIsLanguageDropdownOpen(false);
   }
 };

 const handleLolNavigate = (path: string) => {
   navigate(`/lol/${path}`);
   setIsLolDropdownOpen(false);
   setIsLolClickOpen(false);
   setIsMobileMenuOpen(false);
 };

 const handleValorantNavigate = (path: string) => {
   navigate(`/valorant/${path}`);
   setIsValorantDropdownOpen(false);
   setIsValorantClickOpen(false);
   setIsMobileMenuOpen(false);
 };

 const handleNavLinkClick = (path: string) => {
   navigate(path);
   setIsMobileMenuOpen(false);
 };

 useEffect(() => {
   const handleScroll = () => {
     setIsScrolled(window.scrollY > 20);
   };

   window.addEventListener('scroll', handleScroll);
   return () => window.removeEventListener('scroll', handleScroll);
 }, []);

 useEffect(() => {
   const handleClickOutside = (event: MouseEvent) => {
     if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
       if (isMobile()) {
         setIsUserDropdownOpen(false);
       } else {
         setIsUserDropdownOpen(false);
       }
     }
     if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
       if (isMobile()) {
         setIsLanguageDropdownOpen(false);
       } else {
         setIsLanguageDropdownOpen(false);
       }
     }
     if (lolDropdownRef.current && !lolDropdownRef.current.contains(event.target as Node)) {
       if (isMobile()) {
         setIsLolDropdownOpen(false);
       } else {
         setIsLolClickOpen(false);
       }
     }
     if (valorantDropdownRef.current && !valorantDropdownRef.current.contains(event.target as Node)) {
       if (isMobile()) {
         setIsValorantDropdownOpen(false);
       } else {
         setIsValorantClickOpen(false);
       }
     }
   };

   document.addEventListener('mousedown', handleClickOutside);
   return () => document.removeEventListener('mousedown', handleClickOutside);
 }, []);

 useEffect(() => {
   if (isMobileMenuOpen) {
     document.body.classList.add('menu-open');
   } else {
     document.body.classList.remove('menu-open');
   }
 }, [isMobileMenuOpen]);

 return (
   <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
     <Link to="/" className="nav-logo">
      <span className="logo-elo">ELO</span>
      <span className="logo-boost">BOOST</span>
      <span className="logo-dot">.</span>
      <span className="logo-store">STORE</span>
    </Link>
     
     <button 
       className="mobile-menu-button"
       onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
     >
       {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
     </button>

     <div className={`nav-container ${isMobileMenuOpen ? 'show' : ''}`}>
       <div className="nav-links">
         {/* League of Legends Dropdown */}
         <div className="nav-dropdown" ref={lolDropdownRef}>
           <button 
             className="dropdown-button"
             onClick={handleLolClick}
           >
             League of Legends
             <ChevronDown size={16} className="dropdown-arrow" />
           </button>
           <div className={`game-dropdown-content ${
             isMobile() ? 
             (isLolDropdownOpen ? 'show' : '') : 
             (isLolClickOpen ? 'show' : '')
           }`}>
             <button 
               onClick={() => handleLolNavigate('ranked')} 
               className="dropdown-item"
             >
               Ranked Boost
             </button>
             <button 
               onClick={() => handleLolNavigate('placement')} 
               className="dropdown-item"
             >
               Placement Boost
             </button>
           </div>
         </div>

         {/* Valorant Dropdown */}
         <div className="nav-dropdown" ref={valorantDropdownRef}>
           <button 
             className="dropdown-button"
             onClick={handleValorantClick}
           >
             Valorant
             <ChevronDown size={16} className="dropdown-arrow" />
           </button>
           <div className={`game-dropdown-content ${
             isMobile() ? 
             (isValorantDropdownOpen ? 'show' : '') : 
             (isValorantClickOpen ? 'show' : '')
           }`}>
             <button 
               onClick={() => handleValorantNavigate('ranked')} 
               className="dropdown-item"
             >
               Ranked Boost
             </button>
             <button 
               onClick={() => handleValorantNavigate('placement')} 
               className="dropdown-item"
             >
               Placement Boost
             </button>
           </div>
         </div>

         {/* Static Links */}
         <button onClick={() => handleNavLinkClick('/accounts')} className="nav-link">
           Accounts
         </button>
         <button onClick={() => handleNavLinkClick('/work')} className="nav-link">
           Work
         </button>
         <button onClick={() => handleNavLinkClick('/faqs')} className="nav-link">
           FAQs
         </button>
       </div>

       <div className="nav-right">
         {/* Language Dropdown */}
         <div className="language-dropdown" ref={languageDropdownRef}>
           <button 
             className="language-dropdown-button"
             onClick={handleLanguageClick}
           >
             <Globe size={16} className="language-icon" />
             <span>
  {i18n.language === 'es' ? 'Español' : 
   i18n.language === 'pt' ? 'Português' : 
   'English'}
</span>
             <ChevronDown size={16} className="dropdown-arrow" />
           </button>
           <div className={`language-dropdown-content ${isLanguageDropdownOpen ? 'show' : ''}`}>
  <button 
    className="dropdown-item"
    onClick={() => {
      i18n.changeLanguage('en');
      setIsLanguageDropdownOpen(false);
      setIsMobileMenuOpen(false);
    }}
  >
    {i18n.language === 'en' && <Check size={16} className="dropdown-icon" />}
    English
  </button>
  <button 
    className="dropdown-item"
    onClick={() => {
      i18n.changeLanguage('es');
      setIsLanguageDropdownOpen(false);
      setIsMobileMenuOpen(false);
    }}
  >
    {i18n.language === 'es' && <Check size={16} className="dropdown-icon" />}
    Español
  </button>
  <button 
    className="dropdown-item"
    onClick={() => {
      i18n.changeLanguage('pt');
      setIsLanguageDropdownOpen(false);
      setIsMobileMenuOpen(false);
    }}
  >
    {i18n.language === 'pt' && <Check size={16} className="dropdown-icon" />}
    Português
  </button>
</div>
         </div>

         {/* User Dropdown */}
         {user ? (
           <div className="user-dropdown" ref={userDropdownRef}>
             <button 
               className="user-dropdown-button"
               onClick={handleUserClick}
             >
               <User size={16} className="user-icon" />
               <span className="user-name">{userProfile?.nickname || user.email}</span>
               <ChevronDown size={16} className="dropdown-arrow" />
             </button>
             <div className={`user-dropdown-content ${isUserDropdownOpen ? 'show' : ''}`}>
               <button onClick={handleProfileClick} className="dropdown-item">
                 <UserCircle size={16} className="dropdown-icon" />
                 {t('navbar.profile')}
               </button>
               
               {userProfile?.role === 'booster' && (
                 <button onClick={handleDashboardClick} className="dropdown-item">
                   <LayoutDashboard size={16} className="dropdown-icon" />
                   {t('navbar.boosterDashboard')}
                 </button>
               )}
           
               <button onClick={handleLogout} className="dropdown-item">
                 <LogOut size={16} className="dropdown-icon" />
                 {t('navbar.logout')}
               </button>
             </div>
           </div>
         ) : (
           <button 
             onClick={() => handleNavLinkClick('/login')} 
             className="nav-button login-button"
           >
             {t('navbar.login')} →
           </button>
         )}
       </div>
     </div>
   </nav>
 );
};

export default Navbar;