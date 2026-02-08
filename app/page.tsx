import Link from "next/link";
import { Zap, ArrowRight, Lock, Sparkles, Video, Instagram, Rotate3d, LayoutGrid } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-32">
      
      {/* HEADER */}
      <header className="px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {/* LOGO: Quadrato Blu con Scintilla */}
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

          {/* CARD 1: FOTO AI (Funzionante) */}
          <Link href="/foto-ai" className="group block">
            <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col relative overflow-hidden">
              
              {/* Immagine Split Screen (Stessa foto, filtro diverso) */}
              <div className="relative h-48 rounded-2xl overflow-hidden mb-4 bg-slate-100 group-hover:scale-[1.02] transition-transform duration-500">
                {/* FOTO "DOPO" (Sotto, luminosa) */}
                <img 
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80" 
                  alt="Dopo" 
                  className="w-full h-full object-cover absolute inset-0"
                />
                
                {
