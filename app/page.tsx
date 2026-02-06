"use client";
import React, { useState } from 'react';
import { Camera, Image as ImageIcon, Sparkles, Share2, Layout, Menu, CreditCard, Video, X, PlayCircle, Loader2, CheckCircle, Smartphone, ShoppingCart, ArrowLeft } from 'lucide-react';

export default function RealEstateApp() {
  const [activeTab, setActiveTab] = useState<'home' | 'photo' | 'video360' | 'staging' | 'social' | 'shop'>('home');
  const [isProcessing, setIsProcessing] = useState(false);
  const [credits, setCredits] = useState(12);
  const [isDone, setIsDone] = useState(false);

  const startAiMagic = () => {
    if (credits <= 0) return setActiveTab('shop');
    setIsProcessing(true);
    setIsDone(false);
    setTimeout(() => {
      setIsProcessing(false);
      setIsDone(true);
      setCredits(prev => prev - 1);
      setTimeout(() => setIsDone(false), 5000);
    }, 3500);
  };

  const MenuButton = ({ icon: Icon, label, sub, color, tab }: any) => (
    <button 
      onClick={() => setActiveTab(tab)}
      className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center gap-3 hover:shadow-md transition-all active:scale-95 text-center"
    >
      <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-1 shadow-lg shadow-slate-100`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <div>
        <p className="font-black text-[10px] uppercase tracking-tighter text-slate-800">{label}</p>
        <p className="text-[9px] text-slate-400 font-medium leading-tight">{sub}</p>
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
            <Sparkles className="text-blue-600 w-6 h-6" />
            <h1 className="font-black text-xl tracking-tighter text-blue-600 italic uppercase">RE-MAGIC</h1>
          </div>
          <button onClick={() => setActiveTab('shop')} className="bg-blue-50 px-3 py-1 rounded-full flex items-center gap-2 border border-blue-100 active:scale-95 transition-transform">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-bold text-blue-700">{credits}</span>
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 max-w-md mx-auto w-full">
        {activeTab === 'home' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="py-4 text-center">
              <h2 className="text-2xl font-black text-slate-800 leading-tight">Cosa vuoi creare<br/>oggi, Silvia?</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <MenuButton icon={ImageIcon} label="Migliora Foto" sub="Luci e Prospettiva" color="bg-blue-500" tab="photo" />
              <MenuButton icon={Layout} label="Arreda Stanza" sub="Virtual Staging" color="bg-indigo-500" tab="staging" />
              <MenuButton icon={Video} label="Video 360" sub="Tour Interattivo" color="bg-purple-500" tab="video360" />
              <MenuButton icon={Share2} label="Post Social" sub="Grafica e Testi" color="bg-emerald-500" tab="social" />
            </div>
            <div onClick={() => setActiveTab('shop')} className="bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-xl cursor-pointer">
               <h3 className="text-lg font-bold">I tuoi crediti stanno finendo?</h3>
               <p className="text-xs opacity-70 mt-1">Ricarica ora per non fermare il tuo lavoro.</p>
            </div>
          </div>
        )}

        {(activeTab === 'photo' || activeTab === 'staging' || activeTab === 'video360' || activeTab === 'social') && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4">
            <button onClick={() => setActiveTab('home')} className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
              <ArrowLeft className="w-3 h-3" /> Torna alla Dashboard
            </button>
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 text-center">
              <h3 className="font-black uppercase text-sm tracking-widest mb-4">
                {activeTab === 'photo' && "Migliora Foto"}
                {activeTab === 'staging' && "Virtual Staging"}
                {activeTab === 'video360' && "Tour 360°"}
                {activeTab === 'social' && "Generatore Post"}
              </h3>
              <div className="mb-6 p-4 bg-blue-50 rounded-2xl text-left border border-blue-100">
                <p className="text-[11px] text-blue-700 leading-relaxed italic">
                  {activeTab === 'photo' && "💡 L'AI bilancerà le luci e raddrizzerà le linee cadenti delle pareti per foto professionali."}
                  {activeTab === 'staging' && "💡 Carica una stanza vuota: l'AI inserirà mobili moderni seguendo lo stile dell'immobile."}
                  {activeTab === 'video360' && "💡 Carica il video MP4. L'AI creerà un ambiente navigabile e luminoso."}
                  {activeTab === 'social' && "💡 Inserisci i dati dell'immobile: genereremo una descrizione accattivante e una grafica per Instagram."}
                </p>
              </div>
              <div className="aspect-square border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50 flex flex-col items-center justify-center mb-6 overflow-hidden">
                {isProcessing ? <Loader2 className="w-10 h-10 text-blue-600 animate-spin" /> : isDone ? <CheckCircle className="w-12 h-12 text-emerald-500" /> : <Camera className="w-10 h-10 text-slate-200" />}
              </div>
              <button onClick={startAiMagic} className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black shadow-lg flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" /> {isProcessing ? "ELABORAZIONE..." : "AVVIA MAGIA"}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'shop' && (
          <div className="space-y-6 animate-in fade-in">
            <button onClick={() => setActiveTab('home')} className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
              <ArrowLeft className="w-3 h-3" /> Chiudi Negozio
            </button>
            <div className="text-center mb-4">
              <h2 className="text-2xl font-black italic text-blue-600 uppercase">Ricarica Crediti</h2>
              <p className="text-xs text-slate-400 mt-1">Scegli il pacchetto più adatto alle tue vendite</p>
            </div>
            {[
              { title: "Starter", qty: "10 Crediti", price: "9,90€", desc: "Ideale per un singolo appartamento" },
              { title: "Pro", qty: "50 Crediti", price: "39,90€", desc: "Per agenti attivi ogni giorno", hot: true },
              { title: "Agency", qty: "200 Crediti", price: "99,90€", desc: "La scelta migliore per il tuo team" }
            ].map((pkg, i) => (
              <div key={i} className={`p-6 rounded-[2.5rem] border-2 transition-all ${pkg.hot ? 'border-blue-600 bg-blue-600 text-white' : 'border-white bg-white'}`}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-black uppercase tracking-tighter text-lg">{pkg.qty}</h4>
                  <span className="font-bold">{pkg.price}</span>
                </div>
                <p className={`text-[10px] mb-4 ${pkg.hot ? 'opacity-80' : 'text-slate-400'}`}>{pkg.desc}</p>
                <button className={`w-full py-3 rounded-2xl font-bold text-xs uppercase ${pkg.hot ? 'bg-white text-blue-600' : 'bg-slate-900 text-white'}`}>Acquista</button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
