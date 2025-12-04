import React from 'react';
import { Zap, BookMarked, Flame, BrainCircuit } from 'lucide-react';
import type { View } from '../types';

interface BottomNavProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const navItems = [
  { view: 'home' as View, icon: Zap, label: 'Inicio' },
  { view: 'transactions' as View, icon: BookMarked, label: 'Grimorio' },
  { view: 'transmutar' as View, icon: Flame, label: 'Transmutación' },
  { view: 'synthesis' as View, icon: BrainCircuit, label: 'Síntesis' },
];

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-t border-gray-200/50 dark:border-gray-700/50 z-10">
      <div className="flex justify-around items-center h-20 max-w-lg mx-auto pb-2">
        {navItems.map(({ view, icon: Icon, label }) => {
            const isActive = activeView === view;
            return (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 transition-colors duration-200 w-20 h-full relative group"
              >
                <div className={`transition-all duration-300 ${isActive ? 'scale-110' : 'scale-100 group-hover:scale-105'}`}>
                    <Icon 
                        size={26} 
                        className={isActive ? 'text-violet-500 fill-violet-500/10' : 'text-gray-500 dark:text-gray-400'}
                        strokeWidth={isActive ? 2.5 : 2}
                    />
                </div>
                <span className={`text-[10px] mt-1 font-medium tracking-wide ${isActive ? 'text-violet-500' : 'text-gray-500 dark:text-gray-400'}`}>
                  {label}
                </span>
              </button>
            )
        })}
      </div>
    </div>
  );
};

export default BottomNav;
