import React, { useEffect, useRef, useState } from 'react';
import {
  generateWhatsAppUrl,
  generateSellAccountMessage
} from '../utils/helpers';
import { SettingsService } from '../services/settingsService';
import { ProductService } from '../services/productService';
import { GameDataService } from '../services/gameDataService';
import { SellForm } from '../components/sell/SellForm';
import { SellHero } from '../components/sell/SellHero';
import { PopularGames } from '../components/sell/PopularGames';
import { SellCTA } from '../components/sell/SellCTA';
import { HowItWorks } from '../components/sell/HowItWorks';
import { GameTitle } from '../types';
import {
  MessageCircle,
  Shield,
  Smartphone,
  Gamepad2,
  Trophy
} from 'lucide-react';

const SellPage: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountDetails, setAccountDetails] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [gameOptions, setGameOptions] = useState<string[]>([]);
  const [gameTitles, setGameTitles] = useState<GameTitle[]>([]);
  const [popularGames, setPopularGames] = useState<Array<{
    name: string; 
    count: string; 
    icon: any;
    color?: string;
    logoUrl?: string;
  }>>([]);
  const [loadingGames, setLoadingGames] = useState(true);

  const [whatsappNumber, setWhatsappNumber] = useState<string>(process.env.REACT_APP_WHATSAPP_NUMBER || '6281234567890');
  const formRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const s = await SettingsService.get();
        if (s?.whatsappNumber) setWhatsappNumber(s.whatsappNumber);
      } catch (_e) {
        /* ignore settings fetch for smoother UX */
      }
    })();
  }, []);

  // Load game data from your actual database table
  useEffect(() => {
    (async () => {
      setLoadingGames(true);
      try {
        // Use ONLY your actual game data from the database table
        // Since Supabase env vars are not set, we'll use the direct data
        console.log('🚀 DEBUGGING: Starting game data loading...');
        
        const gameData = GameDataService.getActiveGames();
        console.log('🎮 Raw game data from GameDataService:', gameData);
        
        setGameTitles(gameData);
        
        // Extract game names for dropdown options
        const gameNames = gameData.map(game => game.name);
        console.log('📝 Extracted game names:', gameNames);
        
        // Add "Lainnya" option at the end
        const finalOptions = [...gameNames, 'Lainnya'];
        console.log('✅ Final dropdown options:', finalOptions);
        setGameOptions(finalOptions);
        
        // Set up popular games from your database
        const popularGameData = GameDataService.getPopularGames();
        console.log('⭐ Popular games from database:', popularGameData);
        
        const popularGamesForDisplay = popularGameData.map(game => ({
          name: game.name,
          count: game.name === 'Mobile Legends' ? '500+' : game.name === 'Free Fire' ? '300+' : '200+',
          icon: game.name === 'Mobile Legends' ? Shield : game.name === 'Free Fire' ? Trophy : Gamepad2,
          color: game.color || '#3b82f6'
        }));
        
        setPopularGames(popularGamesForDisplay);
        
        console.log('✅ SUCCESS: Loaded games from YOUR database table:', gameNames);
        console.log('✅ EXPECTED: Games in dropdown should be exactly:', ['Roblox', 'Mobile Legends', 'Free Fire', 'Lainnya']);
        console.log('❌ SHOULD NOT HAVE: PUBG Mobile, Genshin Impact, Valorant, etc.');
        
      } catch (error) {
        console.error('❌ Error loading game data:', error);
        // Final fallback using your actual database games only
        setGameOptions(['Roblox', 'Mobile Legends', 'Free Fire', 'Lainnya']);
      } finally {
        setLoadingGames(false);
      }
    })();
  }, []);

  // Normalize phone number
  const normalizePhoneNumber = (phone: string) => {
    let digits = phone.replace(/\D/g, '');
    if (digits.startsWith('0')) {
      digits = '62' + digits.substring(1);
    } else if (!digits.startsWith('62')) {
      digits = '62' + digits;
    }
    return digits;
  };

  const handleSellAccount = () => {
    // Validate required fields before submitting
    if (!selectedGame) {
      alert('Silakan pilih game terlebih dahulu');
      return;
    }
    
    if (!accountName) {
      alert('Silakan isi nama akun');
      return;
    }
    
    if (!accountDetails) {
      alert('Silakan isi detail akun');
      return;
    }

    // Generate comprehensive message with all form data
    const gameInfo = selectedGame;
    const nameInfo = accountName.trim();
    const detailsInfo = accountDetails.trim();
    const priceInfo = estimatedPrice.trim();
    
    let message = `Halo admin JB Alwikobra! 👋\n\n`;
    message += `Saya ingin menjual akun game berikut:\n\n`;
    message += `🎮 **Game:** ${gameInfo}\n`;
    message += `👤 **Nama Akun:** ${nameInfo}\n`;
    message += `📝 **Detail Akun:**\n${detailsInfo}\n`;
    
    if (priceInfo) {
      message += `💰 **Estimasi Harga:** ${priceInfo}\n`;
    }
    
    message += `\nMohon bantuan untuk evaluasi dan proses penjualan akun saya. Terima kasih! 🙏`;
    
    const whatsappUrl = generateWhatsAppUrl(normalizePhoneNumber(whatsappNumber), message);
    window.open(whatsappUrl, '_blank');
  };

  const scrollToForm = () => {
    const el = formRef.current || document.getElementById('sell-form');
    if (el) {
      // Offset for fixed header (approx 56px mobile / 64px desktop)
      const headerOffset = window.innerWidth < 768 ? 56 : 64;
      const rect = el.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const top = rect.top + scrollTop - headerOffset - 8;
      window.scrollTo({ top, behavior: 'smooth' });
      return;
    }
    // Fallback anchor navigation
    window.location.hash = '#sell-form';
  };

  // When a user clicks a popular game, prefill selection and jump to the form
  const handleSelectPopularGame = (gameName: string) => {
    setSelectedGame(gameName);
    // Slight delay to ensure state updates before scrolling
    requestAnimationFrame(() => scrollToForm());
  };

  return (
    <div className="min-h-screen bg-black text-white pb-20 md:pb-0">
      {/* Hero Section */}
      <SellHero 
        onGetStarted={scrollToForm} 
        onLearnMore={scrollToForm}
        whatsappNumber={whatsappNumber}
      />

      {/* Sell Form Section */}
      <SellForm
        ref={formRef}
        selectedGame={selectedGame}
        accountName={accountName}
        accountDetails={accountDetails}
        estimatedPrice={estimatedPrice}
        gameOptions={gameOptions}
        onGameChange={setSelectedGame}
        onNameChange={setAccountName}
        onDetailsChange={setAccountDetails}
        onPriceChange={setEstimatedPrice}
        onSubmit={handleSellAccount}
        loading={loadingGames}
      />

  {/* Popular Games Section */}
  <PopularGames games={popularGames} onGameSelect={handleSelectPopularGame} />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Final CTA Section */}
      <SellCTA onGetStarted={scrollToForm} />
    </div>
  );
};

export default SellPage;
