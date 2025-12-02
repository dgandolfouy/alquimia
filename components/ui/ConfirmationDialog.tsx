import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl text-gray-800 dark:text-gray-100" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex-shrink-0 rounded-full bg-rose-500/10 flex items-center justify-center">
                    <AlertTriangle className="text-rose-500" size={24} />
                </div>
                <div>
                    <h2 className="text-lg font-bold">{title}</h2>
                </div>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-white">
                <X size={20} />
            </button>
        </div>
        
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">{message}</p>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;