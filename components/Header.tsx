import React, { useState } from 'react';
import { Settings, LogOut, Eye, EyeOff } from 'lucide-react';

interface HeaderProps {
  userName: string;
  onSettingsClick: () => void;
  onLogoutClick: () => void;
  onPrivacyClick: () => void;
  isPrivacyMode: boolean;
}

const Header: React.FC<HeaderProps> = ({ userName, onSettingsClick, onLogoutClick, onPrivacyClick, isPrivacyMode }) => {
  const [isRotating, setIsRotating] = useState(false);

  const handleSettingsClick = () => {
      setIsRotating(true);
      onSettingsClick();
      setTimeout(() => setIsRotating(false), 600); 
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-800/50 z-30 h-24 flex items-center justify-between px-6">
      <div className="flex flex-col items-start justify-center h-full pt-2">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Bienvenido</span>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-fuchsia-400 -ml-1">{userName}</h1>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={onPrivacyClick} className="p-2 text-gray-400 hover:text-violet-500"><{isPrivacyMode ? 'EyeOff' : 'Eye'} size={20} /></button>
        <button onClick={handleSettingsClick} className="p-2 text-gray-400"><Settings size={20} className={`transition-transform duration-500 ${isRotating ? 'rotate-180' : ''}`}/></button>
        <button onClick={onLogoutClick} className="p-2 text-gray-400"><LogOut size={20} /></button>
      </div>
    </header>
  );
};
export default Header;
