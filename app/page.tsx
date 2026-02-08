import Link from "next/link";
import { Zap, ArrowRight, Lock, Sparkles, Video, Instagram, Rotate3d, LayoutGrid } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-32">
      
      {/* HEADER */}
      <header className="px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {/* LOGO CORRETTO: Quadrato Blu con Scintilla */}
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-indigo-200 shadow-lg">
            <Sparkles size={18} className="text-white fill-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">RE-MAGIC</span>
        </div>
        
        <div className="bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm flex items-center gap-2">
          <Zap size={16} className="text-yellow-500 fill-yellow-500" />
          <span className="font-bold text-sm">11 Crediti</span>
        </div>
      </header>

      <main className="px-6">
        
        {/* TITOLO */}
        <div className="mt-4 mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
            Strumenti Creativi.
          </h1>
          <p className="text-slate-500 text-lg">
            La suite AI per l'immobiliare. Scegli cosa vuoi creare oggi.
          </p>
        </div>

        {/* GRIGLIA CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* CARD 1: FOTO AI (ATTIVA) */}
          <Link href="/foto-ai" className="group block">
            <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col relative overflow-hidden">
              
              {/* Immagine Card */}
              <div className="relative h-48 rounded-2xl overflow-hidden mb-4 bg-slate-100 group-hover:scale-[1.02] transition-transform duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1556912173-3db9963ee790?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Cucina Moderna" 
                  className="w-full h-full object-cover"
                />
                
                {/* Badge e Etichette */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-indigo-700 text-[10px] font-bold px-3 py-1 rounded-full border border-white/20 shadow-sm uppercase tracking-wide">
                  Migliora Foto
                </div>
                <div className="absolute bottom-3 left-3 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  PRIMA
                </div>
                <div className="absolute bottom-3 right-3 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg">
                  DOPO
                </div>
              </div>

              {/* Testo Card */}
              <div className="flex flex-col grow">
                <h3 className="font-bold text-xl text-slate-900 mb-2">Foto AI</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  Raddrizza, illumina e correggi in un click.
                </p>
                
                <div className="mt-auto flex items-center gap-2 text-indigo-600 font-bold text-sm group-hover:gap-3 transition-all">
                  AVVIA MAGIA <ArrowRight size={16} />
                </div>
              </div>
            </div>
          </Link>

          {/* CARD 2: ARREDO (LOCKED) - Split Screen simulato */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm opacity-60 h-full flex flex-col relative overflow-hidden grayscale cursor-not-allowed">
            <div className="relative h-48 rounded-2xl overflow-hidden mb-4 bg-slate-100 flex">
               {/* Metà sinistra vuota */}
               <div className="w-1/2 h-full overflow-hidden border-r-2 border-white">
                  <img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80" className="w-full h-full object-cover" />
               </div>
               {/* Metà destra arredata */}
               <div className="w-1/2 h-full overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1522771753033-6a9a6f9c7258?auto=format&fit=crop&w=400&q=80" className="w-full h-full object-cover" />
               </div>
               
               {/* Icona centrale */}
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/30 backdrop-blur-md p-2 rounded-full border border-white/50">
                    <LayoutGrid size={20} className="text-white drop-shadow-md" />
                  </div>
               </div>
            </div>
            <div>
              <h3 className="font-bold text-xl text-slate-900 mb-2">Arredo</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-4">
                Home staging virtuale da vuoto a pieno.
              </p>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Lock size={12} /> Presto
              </span>
            </div>
          </div>

          {/* CARD 3: VIDEO 360 (LOCKED) - Icona 360 */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm opacity-60 h-full flex flex-col relative overflow-hidden grayscale cursor-not-allowed">
            <div className="relative h-48 rounded-2xl overflow-hidden mb-4 bg-slate-100">
               <img 
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80" 
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center bg-black/20 backdrop-blur-sm">
                    <Rotate3d size={24} className="text-white" />
                 </div>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-xl text-slate-900 mb-2">Video 360</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-4">
                Tour immersivi automatici.
              </p>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Lock size={12} /> Presto
              </span>
            </div>
          </div>

          {/* CARD 4: SOCIAL (LOCKED) - GRIGLIA INSTAGRAM REALE */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm opacity-60 h-full flex flex-col relative overflow-hidden grayscale cursor-not-allowed">
            
            {/* Griglia 2x2 Immagini */}
            <div className="relative h-48 rounded-2xl overflow-hidden mb-4 bg-slate-100 grid grid-cols-2 gap-0.5">
               <img src
