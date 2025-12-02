import React from 'react';

const IntroScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 overflow-hidden">
      <style>{`
        .draw-path {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: draw-stroke 2.5s ease-in-out forwards;
        }
        #intro-circle { animation-delay: 0s; }
        #intro-triangle { animation-delay: 0.5s; }
        #intro-square { animation-delay: 1s; }
        #intro-inner-circle { animation-delay: 1.5s; }

        .alquimia-reveal {
          opacity: 0;
          animation: fade-in-out-text 2s ease-in-out forwards;
          animation-delay: 2.5s;
        }

        .symbol-fade-out {
            animation: fade-out 0.5s ease-in-out forwards;
            animation-delay: 2.2s;
        }

        @keyframes draw-stroke {
          to { stroke-dashoffset: 0; }
        }
        
        @keyframes fade-out {
            to { opacity: 0; }
        }
        
        @keyframes fade-in-out-text {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 1; }
        }
      `}</style>
      <div className="relative w-64 h-64">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          stroke="rgba(255, 255, 255, 0.8)"
          strokeWidth="1"
          className="symbol-fade-out"
        >
          <circle id="intro-circle" className="draw-path" cx="50" cy="50" r="48" />
          <polygon id="intro-triangle" className="draw-path" points="50,2 8.5,74 91.5,74" />
          <rect id="intro-square" className="draw-path" x="30.75" y="35.5" width="38.5" height="38.5" />
          <circle id="intro-inner-circle" className="draw-path" cx="50" cy="54.75" r="19.25" />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="alquimia-reveal font-montserrat font-thin text-5xl text-gray-100 tracking-[0.2em]">
            ALQUIMIA
          </h1>
        </div>
      </div>
    </div>
  );
};
export default IntroScreen;