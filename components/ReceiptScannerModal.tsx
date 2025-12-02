import React, { useState, useRef } from 'react';
import * as Lucide from 'lucide-react';
import { analyzeReceipt } from '../services/geminiService';

interface ReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (items: { name: string; price: number }[]) => void;
}

const ReceiptScannerModal: React.FC<ReceiptScannerModalProps> = ({ isOpen, onClose, onScanComplete }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [parsedItems, setParsedItems] = useState<{ name: string; price: number }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setImageFile(null);
    setPreviewUrl(null);
    setIsLoading(false);
    setParsedItems([]);
    setError(null);
  };
  
  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      resetState();
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;
    setIsLoading(true);
    setError(null);
    setParsedItems([]);
    try {
      const items = await analyzeReceipt(imageFile);
      if (items.length === 0) {
        setError("No se pudieron extraer artículos del ticket. Prueba con otra foto.");
      } else {
        setParsedItems(items);
      }
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al analizar la imagen.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleConfirm = () => {
    if (parsedItems.length > 0) {
      onScanComplete(parsedItems);
    }
    // handleClose will be called by the parent component after processing
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white z-10">
          <Lucide.X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Escanear Ticket</h2>
        
        <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

        {!previewUrl && (
          <button onClick={() => fileInputRef.current?.click()} className="w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors">
            <Lucide.UploadCloud size={48} />
            <span className="mt-2 text-center">Tocar para subir o tomar una foto</span>
          </button>
        )}

        {previewUrl && (
            <div className="mb-4 relative">
                <img src={previewUrl} alt="Vista previa del ticket" className="rounded-lg max-h-60 w-auto mx-auto" />
                 <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors">
                    <Lucide.Replace size={20} />
                </button>
            </div>
        )}
        
        {isLoading && (
            <div className="flex flex-col items-center justify-center text-center my-4 p-4 bg-gray-100 dark:bg-gray-900/50 rounded-lg">
                <Lucide.Sparkles className="w-10 h-10 text-emerald-400 animate-spin mb-4" />
                <p className="font-semibold text-gray-800 dark:text-gray-100">La alquimia está en proceso...</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Analizando ticket con Gemini.</p>
            </div>
        )}
        
        {error && <p className="text-rose-500 bg-rose-500/10 p-3 rounded-lg text-center my-4 text-sm">{error}</p>}
        
        {parsedItems.length > 0 && (
            <div className="my-4">
                <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-100">Artículos encontrados:</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-gray-100 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    {parsedItems.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm p-1">
                            <span className="text-gray-600 dark:text-gray-300 truncate pr-2">{item.name}</span>
                            <span className="font-mono text-gray-700 dark:text-gray-200">${item.price.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}

        <div className="mt-6 flex flex-col gap-2">
            {imageFile && !isLoading && parsedItems.length === 0 && (
                <button onClick={handleAnalyze} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2">
                    <Lucide.Sparkles size={18} />
                    <span>Analizar Ticket</span>
                </button>
            )}
            {parsedItems.length > 0 && (
                <button onClick={handleConfirm} className="w-full bg-violet-500 hover:bg-violet-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2">
                    <Lucide.CheckCircle size={18} />
                    <span>Confirmar y Pre-rellenar</span>
                </button>
            )}
        </div>
        
      </div>
    </div>
  );
};

export default ReceiptScannerModal;