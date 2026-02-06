"use client";
import React, { useState } from 'react';
import { Camera, Image as ImageIcon, Sparkles, CreditCard, Video, X, Loader2, CheckCircle, Smartphone, ArrowLeft, Download, Layout, Share2 } from 'lucide-react';

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
          <button onClick={() => setActiveTab('shop')} className="bg-blue-50 px-4 py-2 rounded-full flex items-center gap-2 border border-blue-100">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <span className="text-lg font-black text-blue-700">{credits}</span>
          </button>
        </div>
      </header>

      <main className="flex-1 p-5 max-w-md mx-auto w-full">
        {activeTab === 'home' ? (
          <div className="space-y-8">
            <div className="py-6 text-center">
              <h2 className="text-3xl font-black text-slate-800 leading-tight">Cosa vuoi creare<br/>oggi, Silvia?</h2>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <MenuButton icon={ImageIcon} label="Foto AI" sub="Luci e Prospettiva" color="bg-blue-500" tab="photo" />
              <MenuButton icon={Layout} label="Arredo" sub="Virtual Staging" color="bg-indigo-500" tab="staging" />
              <MenuButton icon={Video} label="Video 360" sub="Tour Virtuale" color="bg-purple-500" tab="video360" />
              <MenuButton icon={Share2} label="Social" sub="Post e Grafiche" color="bg-emerald-500" tab="social" />
            </div>
          </div>
        ) : activeTab === 'shop' ? (
          <div className="space-y-8">
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
              <div key={i} className={`p-8 rounded-[3rem] border-4 ${pkg.color} ${pkg.text || 'text-slate-900'} shadow-md`}>
                <div className="flex justify-between items-center mb-2 font-black text-2xl italic">
                  <h4>{pkg.qty}</h4>
                  <span>{pkg.price}</span>
                </div>
                <button className="w-full mt-4 py-5 rounded-[1.5rem] font-black text-sm uppercase bg-slate-900 text-white">Acquista</button>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <button onClick={() => {setActiveTab('home'); setIsDone(false);}} className="flex items-center gap-3 text-slate-500 font-black text-sm uppercase tracking-widest py-2">
              <ArrowLeft className="w-5 h-5" /> Indietro
            </button>
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 text-center">
              {!isDone ? (
                <>
                  <div className="mb-8 p-6 bg-blue-50 rounded-3xl text-left border border-blue-100">
                    <p className="text-[15px] text-blue-800 leading-snug font-bold italic">
                      {activeTab === 'photo' && "💡 Correzione luci e prospettiva pareti."}
                      {activeTab === 'staging' && "💡 Inserimento mobili moderni AI."}
                      {activeTab === 'video360' && "💡 Trasforma MP4 in tour interattivo."}
                      {activeTab === 'social' && "💡 Genera testi e grafiche social."}
                    </p>
                  </div>
                  <div className="aspect-square border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50 flex flex-col items-center justify-center mb-8">
                    {isProcessing ? <Loader2 className="w-14 h-14 text-blue-600 animate-spin" /> : <Camera className="w-14 h-14 text-slate-200" />}
                  </div>
                  <button onClick={startAiMagic} className="w-full bg-blue-600 text-white py-7 rounded-[2rem] font-black text-lg shadow-xl flex items-center justify-center gap-4">
                    <Sparkles className="w-7 h-7" /> {isProcessing ? "ELABORAZIONE..." : "AVVIA MAGIA"}
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center animate-in zoom-in">
                  <div className
