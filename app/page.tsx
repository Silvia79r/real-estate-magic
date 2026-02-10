import Link from "next/link";
import { Zap, ArrowRight, Lock, Sparkles, Video, Instagram, Rotate3d, LayoutGrid } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-32">
      
      {/* HEADER */}
      <header className="px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {/* LOGO */}
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

          {/* CARD 1: FOTO AI (Stessa stanza, filtro scuro a sx per effetto Prima/Dopo) */}
          <Link href="/foto-ai" className="group block">
            <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col relative overflow-hidden">
              
              <div className="relative h-48 rounded-2xl overflow-hidden mb-4 bg-slate-100 group-hover:scale-[1.02] transition-transform duration-500">
                {/* DOPO (Luminosa) */}
                <img 
                  src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop" 
                  alt="Dopo" 
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* PRIMA (Scura + Filtro) */}
                <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden border-r-2 border-white/80 z-10">
                    <img 
                      src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop" 
                      alt="Prima" 
                      className="absolute inset-0 w-[200%] max-w-none h-full object-cover filter brightness-75 contrast-125 sepia-[0.3]" 
                    />
                </div>

                {/* Badge */}
                <div className="absolute top-3 left-3 z-20 bg-white/90 backdrop-blur text-indigo-700 text-[10px] font-bold px-3 py-1 rounded-full border border-white/20 shadow-sm uppercase tracking-wide">
                  Migliora Foto
                </div>
                <div className="absolute bottom-3 left-3 z-20 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  PRIMA
                </div>
                <div className="absolute bottom-3 right-3 z-20 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg">
                  DOPO
                </div>
              </div>

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

          {/* CARD 2: ARREDO (VUOTA A SX - PIENA A DX) */}
          {/* Ho usato due foto dello stesso fotografo con prospettiva identica */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm opacity-60 h-full flex flex-col relative overflow-hidden grayscale cursor-not-allowed">
            <div className="relative h-48 rounded-2xl overflow-hidden mb-4 bg-slate-100 flex">
               
               {/* Sinistra: Stanza Vuota (Parete bianca e parquet) */}
               <div className="w-1/2 h-full overflow-hidden border-r-2 border-white relative">
                  <img 
                    src="https://images.unsplash.com/photo-1502005229762-cf1e2a862d43?q=80&w=400&auto=format&fit=crop" 
                    className="w-full h-full object-cover" 
                    alt="Stanza Vuota" 
                  />
               </div>
               
               {/* Destra: Stanza Arredata (Stesso stile, stesso pavimento) */}
               <div className="w-1/2 h-full relative">
                  <img 
                    src="https://images.unsplash.com/photo-1502005097973-1040051285bb?q=80&w=400&auto=format&fit=crop" 
                    className="w-full h-full object-cover" 
                    alt="Stanza Arredata" 
                  />
               </div>
               
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

          {/* CARD 3: VIDEO 360 */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm opacity-60 h-full flex flex-col relative overflow-hidden grayscale cursor-not-allowed">
            <div className="relative h-48 rounded-2xl overflow-hidden mb-4 bg-slate-100">
               <img 
                src="https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?q=80&w=800&auto=format&fit=crop" 
                alt="Villa Esterna"
                className="w-full h-full object-cover opacity-90"
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

          {/* CARD 4: SOCIAL (Griglia fissa senza errori) */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm opacity-60 h-full flex flex-col relative overflow-hidden grayscale cursor-not-allowed">
            <div className="relative h-48 rounded-2xl overflow-hidden mb-4 bg-slate-100 grid grid-cols-2 gap-0.5">
               <img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?q=80&w=300&auto=format&fit=crop" className="w-full h-full object-cover" />
               <img src="https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=300&auto=format&fit=crop" className="w-full h-full object-cover" />
               <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=300&auto=format&fit=crop" className="w-full h-full object-cover" />
               <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=300&auto=format&fit=crop" className="w-full h-full object-cover" />
               <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                  <div className="bg-white p-2 rounded-xl shadow-lg">
                    <Instagram size={20} className="text-slate-900" />
                  </div>
               </div>
            </div>
            <div>
              <h3 className="font-bold text-xl text-slate-900 mb-2">Social</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-4">
                Post e caption virali.
              </p>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Lock size={12} /> Presto
              </span>
            </div>
          </div>

        </div>
      </main>

      {/* BANNER CREDITI */}
      <div className="fixed bottom-6 left-6 right-6 z-20">
        <div className="max-w-5xl mx-auto bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-slate-700/50">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Piano Professional</p>
            <p className="font-bold text-sm">Sblocca tutte le funzioni.</p>
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-indigo-900/50">
            Ricarica Crediti
          </button>
        </div>
      </div>

    </div>
  );
}
