"use client";
import React, { useState } from 'react';
import { Camera, Image as ImageIcon, Sparkles, CreditCard, Video, Loader2, CheckCircle, Smartphone, ArrowLeft, Download, Layout, Share2 } from 'lucide-react';

export default function RealEstateApp() {
  const [activeTab, setActiveTab] = useState<'home' | 'photo' | 'staging' | 'video360' | 'social' | 'shop'>('home');
  const [isProcessing, setIsProcessing] = useState(false);
  const [credits, setCredits] = useState(11);
  const [isDone, setIsDone] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const startAiMagic = async () => {
    if (credits <= 0) return setActiveTab('shop');
    if (!selectedImage) return;
    setIsProcessing(true);
    try {
      const res = await fetch("/api/replicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: selectedImage }),
      });
      const data = await res.json();
      if (data.output) {
        setCredits(c => c - 1);
        setIsDone(true);
      }
    } catch (err) {
      alert("Errore");
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
          <div className="bg-blue-50 px-4 py-2 rounded-full flex items-center gap-2 border border-blue-100">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <span className="text-lg font-black text-blue-700">{credits}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-5 max-w-md mx-auto w-full">
        {activeTab === 'home' ? (
          <div className="space-y-8">
            <div className="py-6 text-center">
              <h2 className="text-3xl font-black text-slate-800 leading-tight tracking-tight italic">Cosa vuoi creare oggi?</h2>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <button onClick={() => setActiveTab('photo')} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center gap-3">
                <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg"><ImageIcon className="w-8 h-8 text-white" /></div>
                <p className="font-black text-xs uppercase text-slate-800">Foto AI</p>
              </button>
              <button onClick={() => setActiveTab('staging')} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center gap-3">
                <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg"><Layout className="w-8 h-8 text-white" /></div>
                <p className="font-black text-xs uppercase text-slate-800">Arredo</p>
              </button>
              <button onClick={() => setActiveTab('video360')} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center gap-3">
                <div className="w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center shadow-lg"><Video className="w-8 h-8 text-white" /></div>
                <p className="font-black text-xs uppercase text-slate-800">Video 360</p>
              </button>
              <button onClick={() => setActiveTab('social')} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center gap-3">
                <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg"><Share2 className="w-8 h-8 text-white" /></div>
                <p className="font-black text-xs uppercase text-slate-800">Social</p>
              </button>
            </div>
            <div onClick={() => setActiveTab('shop')} className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl text-center">
               <h3 className="text-xl font-black mb-1 uppercase italic text-blue-400">Ricarica Crediti</h3>
               <p className="text-sm opacity-70">Scegli un pacchetto professionale.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <button onClick={() => {setActiveTab('home'); setIsDone(false); setSelectedImage(null);}} className="flex items-center gap-3 text-slate-400 font-black text-xs uppercase tracking-widest py-2">
              <ArrowLeft className="w-4 h-4" /> Torna alla Home
            </button>
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 text-center">
              {!isDone ? (
                <>
                  <label className="relative aspect-square border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50 flex flex-col items-center justify-center mb-8 overflow-hidden cursor-pointer">
                    <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-20" />
                    {isProcessing ? <Loader2 className="w-14 h-14 text-blue-600 animate-spin" /> : selectedImage ? <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" /> : (
                      <div className="flex flex-col items-center">
                        <Camera className="w-14 h-14 text-slate-300 mb-2" />
                        <p className="text-slate-400 font-black text-[10px] uppercase italic">Scatta Foto</p>
                      </div>
                    )}
                  </label>
                  <button onClick={startAiMagic} disabled={isProcessing || !selectedImage} className="w-full py-7 rounded-[2rem] font-black text-lg shadow-xl flex items-center justify-center gap-4 bg-blue-600 text-white italic tracking-tighter uppercase">
                    <Sparkles className="w-7 h-7" /> {isProcessing ? "Elaborazione..." : "Avvia Magia"}
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center py-4">
                  <div className="bg-emerald-100 p-6 rounded-full mb-6 border border-emerald-200"><CheckCircle className="w-14 h-14 text-emerald-500" /></div>
                  <h3 className="text-2xl font-black text-slate-800 uppercase italic mb-8 tracking-tighter">Risultato Pronto!</h3>
                  <div className="w-full space-y-4">
                    <button className="w-full bg-slate-900 text-white p-6 rounded-[2rem] flex items-center justify-between shadow-lg">
                      <span className="font-black text-sm uppercase italic">Portale (4:3)</span>
                      <Download className="w-6 h-6 text-blue-400" />
                    </button>
                    <button className="w-full bg-white border-4 border-slate-100 text-slate-900 p-6 rounded-[2rem] flex items-center justify-between shadow-sm">
                      <span className="font-black text-sm uppercase italic">Social (4:5)</span>
                      <Download className="w-6 h-6 text-purple-500" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
