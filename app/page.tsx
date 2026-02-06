'use client';

import React, { useState, ChangeEvent } from 'react';
import { Camera, Wand2, Share2, CreditCard, Sparkles, Layout, Loader2 } from 'lucide-react';

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
    // Qui collegheremo l'API di Google tra poco
    setTimeout(() => {
      setIsProcessing(false);
      alert("L'AI sta elaborando... (Dobbiamo ancora collegare le chiavi API)");
    }, 3000);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white text-slate-900 font-sans pb-24 overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-slate-100">
        <h1 className="text-xl font-black tracking-tighter text-blue-600">RE-MAGIC</h1>
        <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase">Pro</div>
      </header>

      <main className="px-6 pt-6">
        {/* Area Upload con dimensione fissa per non rompere il layout */}
        <div className="relative w-full aspect-[4/5] rounded-[2rem] bg-slate-100 border-2 border-dashed border-slate-200 overflow-hidden flex flex-col items-center justify-center">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 z-30 cursor-pointer"
          />
          
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="w-full h-full object-contain bg-black" />
          ) : (
            <div className="text-center p-10">
              <Camera size={40} className="mx-auto text-slate-300 mb-4" />
              <p className="font-bold text-slate-400">Tocca per scattare foto</p>
            </div>
          )}
        </div>

        {/* Pulsanti Azione */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          <button 
            onClick={handleAIAction}
            className="flex flex-col items-center p-6 bg-slate-50 rounded-[2rem] active:bg-blue-50 transition-all border border-transparent active:border-blue-200"
          >
            <Layout className="text-purple-600 mb-2" />
            <span className="font-bold text-sm text-center leading-tight">Virtual Staging</span>
          </button>
          
          <button className="flex flex-col items-center p-6 bg-slate-50 rounded-[2rem] active:bg-blue-50 transition-all">
            <Share2 className="text-green-600 mb-2" />
            <span className="font-bold text-sm text-center leading-tight">Export Social</span>
          </button>
        </div>
      </main>

      {/* Bottone Principale */}
      <div className="fixed bottom-6 left-6 right-6">
        <button 
          onClick={handleAIAction}
          disabled={isProcessing}
          className="w-full h-16 bg-blue-600 text-white rounded-full font-bold shadow-xl shadow-blue-200 flex items-center justify-center gap-3 disabled:bg-slate-400"
        >
          {isProcessing ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>
              <Sparkles size={20} />
              Migliora Foto con AI
            </>
          )}
        </button>
      </div>
    </div>
  );
}
