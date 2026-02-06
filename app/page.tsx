'use client'; 

import React, { useState } from 'react';
import { Camera, Wand2, Share2, CreditCard } from 'lucide-react';

export default function RealEstateMagic() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4">
      {/* Header */}
      <header className="flex justify-between items-center py-4 mb-6">
        <h1 className="text-2xl font-black tracking-tight text-blue-600">RE-MAGIC</h1>
        <div className="flex gap-2 text-xs font-bold bg-white p-1 rounded-full shadow-sm">
          <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full italic uppercase">Pro Tier</span>
        </div>
      </header>

      {/* Upload Area (Mobile Optimized) */}
      <div className="w-full aspect-square border-2 border-dashed border-blue-200 rounded-3xl bg-white flex flex-col items-center justify-center p-6 text-center shadow-xl active:scale-[0.98] transition-all relative overflow-hidden">
        <input 
          type="file" 
          accept="image/*" 
          accept="image/*"
          className="absolute inset-0 opacity-0 z-10 cursor-pointer"
        />
        <div className="bg-blue-50 p-5 rounded-full mb-4">
          <Camera size={48} className="text-blue-500" />
        </div>
        <h3 className="text-lg font-bold uppercase tracking-wide">Scatta o Carica Foto</h3>
        <p className="text-slate-400 text-sm mt-2">Correzione prospettica automatica attiva</p>
      </div>

      {/* AI Action Menu */}
      <div className="grid grid-cols-2 gap-4 mt-8">
        <button className="flex flex-col items-center justify-center bg-white p-6 rounded-3xl shadow-md border border-slate-100 active:bg-blue-50 transition-colors">
          <Wand2 className="text-purple-500 mb-2" />
          <span className="font-bold text-sm">Virtual Staging</span>
        </button>
        <button className="flex flex-col items-center justify-center bg-white p-6 rounded-3xl shadow-md border border-slate-100 active:bg-blue-50 transition-colors">
          <Share2 className="text-green-500 mb-2" />
          <span className="font-bold text-sm">Export Social</span>
        </button>
      </div>

      {/* Stripe Quick Pay */}
      <div className="mt-8 bg-black text-white p-6 rounded-3xl flex items-center justify-between shadow-2xl">
        <div>
          <p className="text-xs opacity-60">Piano Illimitato</p>
          <p className="text-xl font-bold">€29.99<span className="text-sm font-normal">/mese</span></p>
        </div>
        <button className="bg-white text-black px-6 py-3 rounded-2xl font-bold flex items-center gap-2">
          <CreditCard size={18} /> Pay
        </button>
      </div>
    </div>
  );
}
