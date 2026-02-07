"use client";
import React, { useState } from 'react';
import { Camera, Image as ImageIcon, Sparkles, CreditCard, Video, Loader2, CheckCircle, Smartphone, ArrowLeft, Download, Layout, Share2 } from 'lucide-react';

export default function RealEstateApp() {
  const [activeTab, setActiveTab] = useState<'home' | 'photo' | 'video360' | 'staging' | 'social' | 'shop'>('home');
  const [isProcessing, setIsProcessing] = useState(false);
  const [credits, setCredits] = useState(11);
  const [isDone, setIsDone] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startAiMagic = async () => {
    if (credits <= 0) return setActiveTab('shop');
    if (!selectedImage) return alert("Seleziona una foto!");
    setIsProcessing(true);
    setIsDone(false);
    try {
      const response = await fetch("/api/replicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: selectedImage }),
      });
      const data = await response.json();
      if (data.output) {
        setCredits(prev => prev - 1);
        setIsDone(true);
      }
    } catch (error) {
      alert("Errore AI. Riprova!");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <header className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-50">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => {setActiveTab('home'); setSelectedImage(null); setIsDone(false);}}>
            <Sparkles className="text-blue-600 w-7 h-7" />
            <h1 className="font-black text-2xl tracking-tighter text-blue-600 italic uppercase">RE-MAGIC</h1>
          </div>
          <button onClick={() => setActiveTab('shop')} className="bg-blue-50 px-4 py-2 rounded-full flex items-center gap-2 border border-blue-100 shadow-sm active:scale-95 transition-all">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <span className="text-lg font-black text-blue-700">{credits}</span>
          </button>
        </div>
      </header>

      <main className="flex-1 p-5 max-w-md mx-auto w-full">
        {activeTab === 'home' ? (
          <div className="space-y-8 animate-in fade-in">
            <div className="py-6 text-center">
              <h2 className="text-3xl font-black text-slate-800 leading-tight tracking-tight">Cosa vuoi creare<br/>oggi, Silvia?</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-5">
              <button onClick={() => setActiveTab('photo')} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center gap-3 hover:shadow-md transition-all active:scale-95 text-center">
                <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg"><ImageIcon className="w-8 h-8 text-white" /></div>
                <div><p className="font-black text-xs uppercase text-slate-800">Foto AI</p><p className="text-[10px] text-slate-500 font-bold uppercase opacity-60">Luci e Prospettiva</p></div>
              </button>

              <button onClick={() => setActiveTab('staging')} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center gap-3 hover:shadow-md transition-all active:scale-95 text-center">
                <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg"><Layout className="w-8 h-8 text-white" /></div>
                <div><p className="font-black text-xs uppercase text-slate-800">Arredo</p><p className="text-[10px] text-slate-500 font-bold uppercase opacity-60">Virtual Staging</p></div>
              </button>

              <button onClick={() => setActiveTab('video360')} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center gap-3 hover:shadow-md transition-all active:scale-95 text-center">
                <div className="w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center shadow-lg"><Video className="w-8 h-8 text-white" /></div>
                <div><p className="font-black text-xs uppercase text-slate-800">Video 360</p><p className="text-[10px] text-slate-500 font-bold uppercase opacity-60">Tour Virtuale</p></div>
              </button>

              <button onClick={() => setActiveTab('social')} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center gap-3 hover:shadow-md transition-all active:scale-95 text-center">
                <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg"><Share2 className="w-8 h-8 text-white" /></div>
                <div><p className="font-black text-xs uppercase text-slate-800">Social</p><p className="text-[10px] text-slate-500 font-bold uppercase opacity-60">Post e Grafiche</p></div>
              </button>
            </div>

            <div onClick={() => setActiveTab('shop')} className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl cursor-pointer active:scale-95 transition-all mt-4 relative overflow-hidden">
               <div className="relative z-10">
                 <h3 className="text-xl font-black mb-1 uppercase tracking-tight italic">Ricarica Crediti</h3>
                 <p className="text-sm opacity-70 leading-relaxed font-medium">Scegli un pacchetto per il tuo team professionale.</p>
               </div>
               <CreditCard className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12" />
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-bottom-6">
            <button onClick={() => {setActiveTab('home'); setIsDone(false); setSelectedImage(null);}} className="flex items-center gap-3 text-slate-400 font-black text-xs uppercase tracking-widest py-2 active:text-blue-600 transition-colors">
