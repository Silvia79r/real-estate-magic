"use client";
import React, { useState } from 'react';
import { Camera, Image as ImageIcon, Sparkles, CreditCard, Video, Layout, Share2 } from 'lucide-react';

export default function RealEstateApp() {
  // Stato minimo solo per navigare tra le sezioni
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Header con Logo e Crediti */}
      <header className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-50">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-blue-600 w-7 h-7" />
            <h1 className="font-black text-2xl tracking-tighter text-blue-600 italic uppercase">RE-MAGIC</h1>
          </div>
          <div className="bg-blue-50 px-4 py-2 rounded-full flex items-center gap-2 border border-blue-100 shadow-sm">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <span className="text-lg font-black text-blue-700">11</span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-5 max-w-md mx-auto w-full">
        <div className="space-y-8">
          {/* Titolo di Benvenuto */}
          <div className="py-6 text-center">
            <h2 className="text-3xl font-black text-slate-800 leading-tight tracking-tight italic">Cosa vuoi creare<br/>oggi, Silvia?</h2>
          </div>
          
          {/* Griglia 4 Pulsanti Principali */}
          <div className="grid grid-cols-2 gap-5">
            {/* Foto AI - Blu */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                <ImageIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="font-black text-xs uppercase text-slate-800 tracking-widest">Foto AI</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase opacity-60">Luce e Colori</p>
              </div>
            </div>

            {/* Arredo - Indigo */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Layout className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="font-black text-xs uppercase text-slate-800 tracking-widest">Arredo</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase opacity-60">Virtual Staging</p>
              </div>
            </div>

            {/* Video 360 - Purple */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Video className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="font-black text-xs uppercase text-slate-800 tracking-widest">Video 360</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase opacity-60">Tour 360°</p>
              </div>
            </div>

            {/* Social - Emerald */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Share2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="font-black text-xs uppercase text-slate-800 tracking-widest">Social</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase opacity-60">Post Creativi</p>
              </div>
            </div>
          </div>

          {/* Banner Ricarica Crediti - Nero */}
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl mt-4 relative overflow-hidden text-center">
             <h3 className="text-xl font-black mb-1 uppercase tracking-tight italic text-blue-400">Ricarica Crediti</h3>
             <p className="text-sm opacity-70 leading-relaxed font-medium text-slate-300">Scegli un pacchetto professionale.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
