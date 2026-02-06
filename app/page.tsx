'use client';

import React, { useState, ChangeEvent } from 'react';
import { Camera, Wand2, Share2, Sparkles, Layout, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';

export default function RealEstateMagic() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfdfd] text-slate-900 font-sans selection:bg-blue-100">
      
      {/* Background Decorativo per dare profondità */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-purple-50 rounded-full blur-[100px] opacity-40" />
      </div>

      {/* Navigazione Pro */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Sparkles className="text-white" size={20} />
            </div>
            <span className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
              RE-MAGIC
            </span>
          </div>
          <button className="hidden md:flex items-center gap-2 text-sm font-bold bg-slate-900 text-white px-5 py-2.5 rounded-full hover:bg-slate-800 transition-all">
            Dashboard <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12 lg:py-20 grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Testi di impatto */}
        <div className="space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-700">AI Engine V.2 Live</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black leading-[1.1] tracking-tight text-slate-900">
              Trasforma ogni stanza in un <span className="text-blue-600 italic">capolavoro.</span>
            </h2>
            <p className="mt-6 text-lg text-slate-500 max-w-md leading-relaxed">
              Il primo strumento di Virtual Staging in tempo reale. Carica una foto, scegli lo stile e vendi l'immobile più velocemente.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
              <CheckCircle2 size={18} className="text-green-500" /> Correzione prospettica automatica
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
              <CheckCircle2 size={18} className="text-green-500" /> Generazione tour video 4K (Veo)
            </div>
          </div>
        </div>

        {/* Studio di Caricamento (Il pezzo forte) */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[3rem] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
          
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-4 md:p-6 overflow-hidden min-h-[500px] flex flex-col">
            <div className="relative flex-1 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 overflow-hidden group/upload transition-all hover:border-blue-400">
              <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 z-50 cursor-pointer" />
              
              {imagePreview && (
  <div style={{ width: '100%', height: '100%', position: 'relative' }}>
    <img 
      src={imagePreview} 
      alt="Preview" 
      style={{ 
        width: '100%', 
        height: '100%', 
        objectFit: 'cover', 
        position: 'absolute',
        top: 0,
        left: 0
      }} 
    />
  </div>
)}
            </div>

            {/* Azioni Pro */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <button onClick={() => setIsProcessing(true)} className="flex items-center justify-center gap-2 p-4 bg-slate-900 text-white rounded-[1.5rem] font-bold text-sm hover:bg-blue-600 transition-colors">
                <Wand2 size={18} /> Virtual Staging
              </button>
              <button className="flex items-center justify-center gap-2 p-4 bg-slate-100 text-slate-900 rounded-[1.5rem] font-bold text-sm hover:bg-slate-200 transition-colors">
                <Share2 size={18} /> Social Mix
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Mobile/Tablet specifico */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 lg:hidden z-50 bg-white/80 backdrop-blur-lg border-t border-slate-100">
        <button className="w-full h-14 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-200 flex items-center justify-center gap-2">
          {isProcessing ? <Loader2 className="animate-spin" /> : <><Sparkles size={18} /> Migliora con AI</>}
        </button>
      </footer>
    </div>
  );
}
