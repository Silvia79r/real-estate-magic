import Link from "next/link";
import { Camera, Armchair, Video, Share2, CreditCard, User } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900 pb-20">
      
      {/* HEADER */}
      <header className="px-6 py-5 flex justify-between items-center bg-white sticky top-0 z-10 border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">R</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800">RE-MAGIC</span>
        </div>
        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
          <User size={20} className="text-slate-600" />
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="px-6 py-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Ciao, Silvia 👋</h1>
          <p className="text-slate-500 text-lg">Cosa vuoi creare oggi?</p>
        </div>

        {/* GRIGLIA PULSANTI */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          
          {/* 1. FOTO AI (Link alla pagina che abbiamo appena creato) */}
          <Link href="/foto-ai" className="group">
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all h-full flex flex-col justify-between">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Camera size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">Foto AI</h3>
                <p className="text-xs text-slate-400 mt-1">Migliora luce e colori</p>
              </div>
            </div>
          </Link>

          {/* 2. ARREDO (Coming Soon) */}
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 opacity-60 h-full flex flex-col justify-between grayscale">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
              <Armchair size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">Arredo</h3>
              <p className="text-xs text-slate-400 mt-1">Virtual Staging</p>
            </div>
          </div>

          {/* 3. VIDEO 360 (Coming Soon) */}
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 opacity-60 h-full flex flex-col justify-between grayscale">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
              <Video size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">Video 360</h3>
              <p className="text-xs text-slate-400 mt-1">Reels automatici</p>
            </div>
          </div>

          {/* 4. SOCIAL (Coming Soon) */}
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 opacity-60 h-full flex flex-col justify-between grayscale">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
              <Share2 size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">Social</h3>
              <p className="text-xs text-slate-400 mt-1">Post pronti</p>
            </div>
          </div>

        </div>

      </main>

      {/* BANNER RICARICA CREDITI (Fisso in basso) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 z-20">
        <div className="max-w-xl mx-auto bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-lg cursor-pointer hover:bg-slate-800 transition">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full">
              <CreditCard size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Piano Pro</p>
              <p className="font-bold text-sm">Ricarica Crediti</p>
            </div>
          </div>
          <span className="text-sm font-bold bg-white text-slate-900 px-3 py-1 rounded-lg">
            +
          </span>
        </div>
      </div>

    </div>
  );
}
