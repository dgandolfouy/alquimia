import React,{useState}from'react';
import{Settings,LogOut,Eye,EyeOff}from'lucide-react';
interface HeaderProps{userName:string;onSettingsClick:()=>void;onLogoutClick:()=>void;onPrivacyClick:()=>void;isPrivacyMode:boolean;}
const Header:React.FC<HeaderProps>=({userName,onSettingsClick,onLogoutClick,onPrivacyClick,isPrivacyMode})=>{
const[isRotating,setIsRotating]=useState(false);
const handleSettingsClick=()=>{setIsRotating(true);onSettingsClick();setTimeout(()=>setIsRotating(false),600);};
return(
<header className="fixed top-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-800/50 z-30 h-24 flex items-center justify-between px-6 transition-all duration-300">
<div className="flex flex-col items-start justify-center h-full pt-2">
<div className="flex flex-col items-start gap-0">
<span className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-widest mb-0.5">Bienvenido</span>
<h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-violet-500 to-fuchsia-400 leading-none -ml-1">{userName}</h1>
</div>
</div>
<div className="flex items-center gap-3">
<button onClick={onPrivacyClick} className="p-2 text-gray-400 hover:text-violet-500 transition-colors" type="button">
{isPrivacyMode?<EyeOff size={20}/>:<Eye size={20}/>}
</button>
<button onClick={handleSettingsClick} className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors rounded-full active:bg-gray-200 dark:active:bg-gray-700" type="button">
<Settings size={20} className={`transition-transform duration-500 ease-in-out ${isRotating?'rotate-180':'rotate-0'}`}/>
</button>
<button onClick={onLogoutClick} className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" type="button">
<LogOut size={20}/>
</button>
</div>
</header>
);};
export default Header;
