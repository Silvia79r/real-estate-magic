"use client";
import React, { useState } from 'react';
import { Camera, Image as ImageIcon, Sparkles, Share2, Layout, Menu, CreditCard, Video, X, PlayCircle, Loader2, CheckCircle, Smartphone } from 'lucide-react';

export default function RealEstateApp() {
  const [activeTab, setActiveTab] = useState<'home' | 'photo' | 'video360'>('home');
  const [isProcessing, setIsProcessing] = useState(false);
  const [credits, setCredits] = useState(12);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);

  // Funzione per simulare l'AI
  const startAiMagic = () => {
    if (credits <= 0) return alert("Crediti esauriti!");
    setIsProcessing(true);
    setIsDone(false);
    setTimeout(() => {
      setIsProcessing(false);
      setIsDone(true);
      setCredits(prev => prev - 1);
      setTimeout(() => setIsDone(false), 5000);
    }, 3500);
  };

  // Componente per i pulsanti della Dashboard
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
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
            <Sparkles className="text-blue-600 w-6 h-6" />
            <h1 className="font-black text-xl tracking-tighter text-blue-600 italic uppercase">RE-MAGIC</h1>
          </div>
          <div className="bg-blue-50 px-3 py-1 rounded-full flex items-center gap-2 border border-blue-100">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-bold text-blue-700">{credits}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 max-w-md mx-auto w-full">
        {activeTab === 'home' ? (
          /* DASHBOARD PRINCIPALE */
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="py-4 text-center">
              <h2 className="text-2xl font-black text-slate-800 leading-tight">Cosa vuoi creare<br/>oggi, Silvia?</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <MenuButton icon={ImageIcon} label="Migliora Foto" sub="Luci e Prospettiva AI" color="bg-blue-500" tab="photo" />
              <MenuButton icon={Layout} label="Arreda Stanza" sub="Virtual Staging" color="bg-indigo-500" tab="photo" />
              <MenuButton icon={Video} label="Video 360" sub="Tour Interattivi" color="bg-purple-500" tab="video360" />
              <MenuButton icon={Share2} label="Post Social" sub="Grafica e Testi" color="bg-emerald-500" tab="home" />
            </div>

            <div className="bg-blue-600 p-6 rounded-[2.5rem] text-white shadow-xl shadow-blue-100 relative overflow-hidden">
               <div className="relative z-10">
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Novità</p>
                 <h3 className="text-lg font-bold mb-3">Rimuovi Oggetti AI</h3>
                 <p className="text-xs opacity-90 leading-relaxed">Cancella disordine o vecchi mobili dalle foto in un tocco.</p>
               </div>
               <Smartphone className="absolute -right-4 -bottom-4 w-24 h-24 opacity-20 rotate-12" />
            </div>
          </div>
        ) : (
          /* SEZIONE DI CARICAMENTO INTERNA */
          <div className="space-y-6 animate-in slide-in-from-bottom-4">
            <button onClick={() => setActiveTab('home')} className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
              ← Torna alla Dashboard
            </button>

            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className="mb-6">
                <h3 className="font-bold text-lg">{activeTab === 'photo' ? 'Migliora le tue foto' : 'Crea il Tour 360°'}</h3>
                <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold flex-shrink-0">!</div>
                  <p className="text-[11px] text-slate-500 leading-tight italic">
                    {activeTab === 'photo' 
                      ? "L'AI correggerà esposizione, colori e raddrizzerà automaticamente la prospettiva delle pareti."
                      : "Carica un video MP4 girato al centro della stanza. Tieni lo smartphone ad altezza occhi."}
                  </p>
                </div>
              </div>

              <div 
                className="aspect-[4/5] border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden mb-6 cursor-pointer"
                onClick={() => document.getElementById(activeTab === 'photo' ? 'file-upload' : 'video-upload')?.click()}
              >
                {isProcessing ? (
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    <p className="text-blue-600 font-bold uppercase tracking-widest text-[10px]">L'AI sta lavorando...</p>
                  </div>
                ) : isDone ? (
                  <div className="flex flex-col items-center gap-4 text-emerald-500">
                    <CheckCircle className="w-16 h-16" />
                    <p className="font-bold text-sm">Completato!</p>
                  </div>
                ) : (
                  <div className="text-center p-6">
                    <Camera className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tocca per caricare</p>
                  </div>
                )}
                <input id="file-upload" type="file" multiple className="hidden" accept="image/*" onChange={(e) => setSelectedImage(e.target.files?.[0] ? URL.createObjectURL(e.target.files[0]) : null)} />
                <input id="video-upload" type="file" className="hidden" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] ? URL.createObjectURL(e.target.files[0]) : null)} />
              </div>

              <button 
                onClick={startAiMagic}
                className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black shadow-lg shadow-blue-50 flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                <Sparkles className="w-6 h-6" />
                <span>AVVIA MAGIA AI</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
