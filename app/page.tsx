'use client';

import React, { useState, ChangeEvent } from 'react';
import { Camera, Wand2, Share2, Sparkles, Layout, Loader2 } from 'lucide-react';

export default function RealEstateMagic() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAIAction = () => {
    if (!imagePreview) return alert("Carica prima una foto!");
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      alert("Connessione AI in corso...");
    }, 2000);
  };

  return (
    // Il "max-w-md" e "mx-auto" servono a tenere tutto centrato e stretto come un'app
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      
      {/* Header fisso che non si rimpicciolisce */}
      <header className="p-4 bg-white border-b border-slate-200 flex justify-between items-center shrink-0">
        <h1 className="text-xl font-black tracking-tighter text-blue-600">RE-MAGIC</h1>
        <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-[10px] font-bold">AI ACTIVE</span>
      </header>

      <main className="p-4 flex-1 flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-lg font-bold italic-none">Carica la foto dell'immobile</h2>
        </div>

        {/* CONTENITORE FOTO BLINDATO: Non può uscire dallo schermo */}
        <div className="relative w-full aspect-square bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-inner overflow-hidden flex items-center justify-center">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 z-20 cursor-pointer"
          />
          
          {imagePreview ? (
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="w-full h-full object-cover" // Forza la foto a riempire il quadrato senza deformarsi o uscire
            />
          ) : (
            <div className="flex flex-col items-center text-slate-300">
              <Camera size={48} />
              <p className="mt-2 text-sm font-medium">Tocca per scattare</p>
            </div>
          )}
        </div>

        {/* Pulsanti Azione Grandi */}
        <div className="grid grid-cols-2 gap-4">
          <button onClick={handleAIAction} className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center gap-2 active:scale-95 transition-transform">
            <Layout className="text-purple-600" />
            <span className="text-xs font-bold uppercase tracking-tight">Virtual Staging</span>
          </button>
          <button className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center gap-2 active:scale-95 transition-transform">
            <Share2 className="text-green-600" />
            <span className="text-xs font-bold uppercase tracking-tight">Export Social</span>
          </button>
        </div>
      </main>

      {/* Bottone AI Fisso in basso */}
      <div className="p-4 bg-white border-t border-slate-100 shrink-0">
        <button 
          onClick={handleAIAction}
          disabled={isProcessing}
          className="w-full h-14 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
        >
          {isProcessing ? <Loader2 className="animate-spin" /> : <><Sparkles size={18}/> MIGLIORA CON AI</>}
        </button>
      </div>
    </div>
  );
}
