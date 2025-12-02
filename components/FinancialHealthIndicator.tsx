
import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface FinancialHealthIndicatorProps {
    savingsRate: number;
    onClick: () => void;
}

const FinancialHealthIndicator: React.FC<FinancialHealthIndicatorProps> = ({ savingsRate, onClick }) => {
    const [simulatedTier, setSimulatedTier] = useState<'silver' | 'bronze' | 'gold'>('silver');

    useEffect(() => {
        const tiers: ('silver' | 'bronze' | 'gold')[] = ['silver', 'bronze', 'gold'];
        let currentTierIndex = 0;
        const interval = setInterval(() => {
            currentTierIndex = (currentTierIndex + 1) % tiers.length;
            setSimulatedTier(tiers[currentTierIndex]);
        }, 4000); 

        return () => clearInterval(interval);
    }, []);

    // Organic metallic gradients for the inner symbol - More vivid and shiny
    const iconGradients = {
        silver: { id: 'silverIcon', stops: <><stop offset="0%" stopColor="#FFFFFF"/><stop offset="40%" stopColor="#9CA3AF"/><stop offset="100%" stopColor="#E5E7EB"/></> },
        bronze: { id: 'bronzeIcon', stops: <><stop offset="0%" stopColor="#FFF7ED"/><stop offset="40%" stopColor="#D97706"/><stop offset="100%" stopColor="#78350F"/></> },
        gold: { id: 'goldIcon', stops: <><stop offset="0%" stopColor="#FFFBEB"/><stop offset="40%" stopColor="#F59E0B"/><stop offset="100%" stopColor="#B45309"/></> },
    };

    const displayTier = simulatedTier;
    
    // Alquimia Brand Gradient for Outer Ring
    const brandGradient = <><stop offset="0%" stopColor="#7e22ce" /><stop offset="50%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#d946ef" /></>;

    const percentage = Math.max(10, Math.min(100, savingsRate * 100));
    // Increased radius for bigger visual
    const radius = 85; 
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div 
            className="relative w-64 h-64 mx-auto my-8 flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 group"
            onClick={onClick}
            title="Nueva Transacción"
        >
            {/* Glow Effect behind */}
            <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-xl group-hover:bg-violet-500/30 transition-all"></div>

            <svg className="w-full h-full drop-shadow-lg" viewBox="0 0 200 200">
                <defs>
                    <linearGradient id="silverIcon" x1="0" y1="0" x2="1" y2="1">{iconGradients.silver.stops}</linearGradient>
                    <linearGradient id="bronzeIcon" x1="0" y1="0" x2="1" y2="1">{iconGradients.bronze.stops}</linearGradient>
                    <linearGradient id="goldIcon" x1="0" y1="0" x2="1" y2="1">{iconGradients.gold.stops}</linearGradient>
                    <linearGradient id="alquimiaGradient" x1="0%" y1="0%" x2="100%" y2="0%">{brandGradient}</linearGradient>
                </defs>
                
                {/* Background Circle - Thicker (Doubled to 16) */}
                <circle
                    stroke={document.documentElement.classList.contains('dark') ? "#374151" : "#e5e7eb"}
                    fill={document.documentElement.classList.contains('dark') ? "#111827" : "#f3f4f6"}
                    strokeWidth="16"
                    r={radius}
                    cx="100"
                    cy="100"
                    className="transition-colors"
                />
                
                {/* Progress Circle (Alquimia Gradient) - Thicker (Doubled to 16) */}
                <circle
                    stroke="url(#alquimiaGradient)"
                    fill="transparent"
                    strokeWidth="16"
                    strokeLinecap="round"
                    r={radius}
                    cx="100"
                    cy="100"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    transform="rotate(-90 100 100)"
                    style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
                />
            </svg>
            
            {/* Center Content */}
            <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                <Sparkles 
                    size={80} 
                    className="animate-pulse drop-shadow-2xl transition-all duration-1000" 
                    fill={`url(#${iconGradients[displayTier].id})`} 
                    stroke="none"
                />
                <span className="text-xs font-bold text-gray-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity absolute top-24 pt-2 tracking-widest">AGREGAR</span>
            </div>
        </div>
    );
};

export default FinancialHealthIndicator;
