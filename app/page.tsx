'use client';

import React, { useState, ChangeEvent } from 'react';
import { Camera, Wand2, Share2, CreditCard, Sparkles, Layout } from 'lucide-react';

export default function RealEstateMagic() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLoading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white text-slate-900 font-sans pb-20">
      {/* Header Premium */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Sparkles className="text-white" size={18} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">RE-Magic</h1>
        </div>
        <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
          AI Active
        </div>
      </header>

      <main className="px-6 pt-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold leading-tight">Trasforma il tuo immobile in un sogno</h2>
          <p className="text-slate-500 mt-2 text-sm">Carica una foto e lascia che l'AI faccia il resto.</p>
        </div>

        {/* Upload Area Migliorata */}
        <div className={`relative w-full aspect-[4/5] rounded-[2.5rem] border-2 border-dashed transition-all duration-500 shadow-2xl shadow-blue-100/50 flex flex-col items-center justify-center p-8 overflow-hidden
          ${imagePreview ? 'border-transparent' : 'border-blue-200 bg-blue-50/30'}`}>
          
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 z-30 cursor-pointer"
          />
          
          {imagePreview ? (
            <>
              <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover rounded-[2.5rem]" />
              <div className="absolute inset-0 bg-black/20 z-10" />
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-white/90 backdrop-blur px-6 py-2 rounded-full font-bold text-sm">
                Cambia Foto
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-xl shadow-blue-200">
                <Camera size={32} className="text-white" />
              </div>
              <span className="text-lg font-bold">Inizia da qui</span>
              <span className="text-slate-400 text-sm mt-1 underline">Sfoglia galleria</span>
            </div>
          )}
        </div>

        {/* AI Action Grid */}
        <div className="grid grid-cols-2 gap-4 mt-10">
          <button className="flex flex-col items-start p-5 bg-slate-50 rounded-[2rem] active:scale-95 transition-all">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
              <Layout size={20} className="text-purple-600" />
            </div>
            <span className="font-bold text-sm">Virtual Staging</span>
            <span className="text-[10px] text-slate-400 mt-1 uppercase">Arreda ora</span>
          </button>
          
          <button className="flex flex-col items-start p-5 bg-slate-50 rounded-[2rem] active:scale-95 transition-all">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-3">
              <Share2 size={20} className="text-green-600" />
            </div>
            <span className="font-bold text-sm">Social Export</span>
            <span className="text-[10px] text-slate-400 mt-1 uppercase">TikTok/IG</span>
          </button>
        </div>
      </main>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-6 left-6 right-6 z-50">
        <button className="w-full bg-slate-950 text-white h-16 rounded-full font-bold flex items-center justify-center gap-3 shadow-2xl active:scale-[0.98] transition-all">
          <Sparkles size={20} className="text-blue-400" />
          Migliora Foto con AI
        </button>
      </div>
    </div>
  );
}
