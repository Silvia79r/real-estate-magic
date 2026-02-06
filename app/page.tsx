"use client";
import React, { useState } from 'react';
import { Camera, Image as ImageIcon, Sparkles, CreditCard, Video, Loader2, CheckCircle, Smartphone, ArrowLeft, Download, Layout, Share2 } from 'lucide-react';

export default function RealEstateApp() {
  const [activeTab, setActiveTab] = useState<'home' | 'photo' | 'video360' | 'staging' | 'social' | 'shop'>('home');
  const [isProcessing, setIsProcessing] = useState(false);
  const [credits, setCredits] = useState(11); // Crediti aggiornati secondo il tuo screenshot
  const [isDone, setIsDone] = useState(false);

  const startAiMagic = () => {
    if (credits <= 0) return setActiveTab('shop');
    setIsProcessing(true);
    setIsDone(false);
    setTimeout(() => {
      setIsProcessing(false);
      setIsDone(true);
      setCredits(prev => prev - 1);
    }, 3500);
  };

  const MenuButton = ({ icon: Icon, label, sub, color, tab }: any) => (
    <button 
      onClick={() => setActiveTab(tab)}
      className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center gap-4 hover:shadow-md transition-all active:scale-95 text-center w-full"
    >
      <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center mb-1 shadow-lg`}>
        <Icon className="w-10 h-10 text-white" />
      </div>
      <div>
        <p className="font-black text-sm uppercase tracking-tight text-slate-800">{label}</p>
        <p className="text-xs text-slate-500 font-medium leading-tight mt-1">{sub}</p>
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <header className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-50">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
            <Sparkles className="text-blue-600 w-7 h-7" />
            <h1 className="font-black text-2xl tracking-tighter text-blue-600 italic uppercase">RE-MAGIC</h1>
          </div>
          <button onClick={() => setActiveTab('shop')} className="bg-blue-50 px-4 py-2 rounded-full flex items-center gap-2 border border-blue-100 active:scale-95">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <span className="text-lg font-black text-blue-700">{credits}</span>
          </button>
        </div>
      </header>

      <main className="flex-1 p-5 max-w-md mx-auto w-full">
        {activeTab === 'home' ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="py-6 text-center">
              <h2 className="text-3xl font-black text-slate-800 leading-tight">Cosa vuoi creare<br/>oggi, Silvia?</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-5">
              <MenuButton icon={ImageIcon} label="Foto AI" sub="Luci e Prospettiva" color="bg-blue-500" tab="photo" />
              <MenuButton icon={Layout} label="Arredo" sub="Virtual Staging" color="bg-indigo-500" tab="staging" />
              <MenuButton icon={Video} label="Video 360" sub="Tour Virtuale" color="bg-purple-500" tab="video360" />
              <MenuButton icon={Share2} label="Social" sub="Post e Grafiche" color="bg-emerald-500" tab="social" />
            </div>

            {/* IL PULSANTE RIPRISTINATO */}
            <div 
              onClick={() => setActiveTab('shop')} 
              className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl cursor-pointer active:scale-95 transition-all mt-4"
            >
               <h3 className="text-xl font-black mb-2 uppercase tracking-tight italic">Ricarica Crediti</h3>
               <p className="text-sm opacity-80 leading-relaxed font-medium">Scegli un pacchetto o un abbonamento per il tuo team.</p>
            </div>
          </div>
        ) : activeTab === 'shop' ? (
          <div className="space-y-8 animate-in fade-in">
            <button onClick={() => setActiveTab('home')} className="flex items-center gap-3 text-slate-500 font-black text-sm uppercase tracking-widest py-2">
              <ArrowLeft className="w-5 h-5" /> Chiudi
            </button>
            <div className="text-center">
              <h2 className="text-3xl font-black italic text-blue-600 uppercase tracking-tighter">Pacchetti Crediti</h2>
            </div>
            {[
              { title: "Starter", qty: "10 Crediti", price: "9,90€", desc: "Ideale per un singolo immobile", color: "bg-white" },
              { title: "Pro", qty: "50 Crediti", price: "39,90€", desc: "Per agenti attivi ogni giorno", color: "bg-blue-600", text: "text-white" }
            ].map((pkg, i) => (
              <div key={i} className={`p-8 rounded-[3rem] border-4 ${pkg.color} ${pkg.text || 'text-slate-900'} shadow-md mb-4`}>
                <div className="flex justify-between items-center mb-2 font-black text-2xl italic">
                  <h4>{pkg.qty}</h4>
                  <span>{pkg.price}</span>
                </div>
                <button className="w-full mt-4 py-5 rounded-[1.5rem] font-black text-sm uppercase bg-slate-900 text-white shadow-lg">Acquista Ora</button>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-bottom-6">
            <button onClick={() => {setActiveTab('home'); setIsDone(false);}} className="flex items-center gap-3 text-slate-500 font-black text-sm uppercase tracking-widest py-2">
              <ArrowLeft className="w-5 h-5" /> Indietro
            </button>
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 text-center">
              {!isDone ? (
                <>
                  <div className="mb-8 p-6 bg-blue-50 rounded-3xl text-left border border-blue-100">
                    <p className="text-[15px] text-blue-800 leading-snug font-bold italic">
                      {activeTab === 'photo' && "💡 L'AI bilancerà le luci e raddrizzerà le pareti storte per te."}
                      {activeTab === 'staging' && "💡 Carica una stanza vuota. L'AI inserirà mobili moderni in pochi secondi."}
                      {activeTab === 'video360' && "💡 Carica un video MP4. L'AI creerà un tour navigabile e luminoso."}
                      {activeTab === 'social' && "💡 Crea descrizioni accattivanti e grafiche per i tuoi canali social."}
                    </p>
                  </div>
                  <div className="aspect-square border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50 flex flex-col items-center justify-center mb-8">
                    {isProcessing ? <Loader2 className="w-14 h-14 text-blue-600 animate-spin" /> : <Camera className="w-14 h-14 text-slate-200" />}
                  </div>
                  <button onClick={startAiMagic} className="w-full bg-blue-600 text-white py-7 rounded-[2rem] font-black text-lg shadow-xl flex items-center justify-center gap-4 active:scale-95">
                    <Sparkles className="w-7 h-7" /> {isProcessing ? "ELABORAZIONE..." : "AVVIA MAGIA"}
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center animate-in zoom-in">
                  <div className="bg-emerald-100 p-5 rounded-full mb-4">
                    <CheckCircle className="w-12 h-12 text-emerald-500" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter mb-8 text-center">Risultato Pronto!</h3>
                  <div className="space-y-4 w-full">
                    <button className="w-full bg-slate-900 text-white p-6 rounded-[2rem] flex items-center justify-between shadow-lg active:scale-95">
                      <div className="flex items-center gap-4 text-left">
                        <ImageIcon className="w-6 h-6 text-blue-400" />
                        <div>
                           <p className="font-black text-sm tracking-tight uppercase leading-none">Portali 4:3</p>
                           <p className="text-[10px] opacity-50">Orizzontale</p>
                        </div>
                      </div>
                      <Download className="w-6 h-6 text-blue-400" />
                    </button>
                    <button className="w-full bg-white border-4 border-slate-100 text-slate-900 p-6 rounded-[2rem] flex items-center justify-between shadow-sm active:scale-95">
                      <div className="flex items-center gap-4 text-left">
                        <Smartphone className="w-6 h-6 text-purple-500" />
                        <div>
                           <p className="font-black text-sm tracking-tight uppercase leading-none">Social 4:5</p>
                           <p className="text-[10px] text-slate-400">Verticale</p>
                        </div>
                      </div>
                      <Download className="w-6 h-6 text-purple-500" />
                    </button>
                  </div>
                  <button onClick={() => setIsDone(false)} className="mt-10 text-slate-400 font-black text-xs uppercase tracking-widest border-b-2 border-slate-200 pb-1">
                    Nuova Elaborazione
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
