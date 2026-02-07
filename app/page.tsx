"use client";
import React, { useState } from 'react';
import { Camera, Image as ImageIcon, Sparkles, CreditCard, Video, Layout, Share2, Loader2, CheckCircle, Smartphone, ArrowLeft, Download } from 'lucide-react';

export default function RealEstateApp() {
  const [activeTab, setActiveTab] = useState<'home' | 'photo'>('home');
  const [isProcessing, setIsProcessing] = useState(false);
  const [credits, setCredits] = useState(11);
  const [isDone, setIsDone] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setSelectedImage(reader.result as string); };
      reader.readAsDataURL(file);
    }
  };

  const startAiMagic = async () => {
    if (credits <= 0) return;
    if (!selectedImage) return;
    setIsProcessing(true);
    setIsDone(false);
    try {
      const res = await fetch("/api/replicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: selectedImage }),
      });
      const data = await res.json();
      if (data.output) {
        setCredits((c) => c - 1);
        setIsDone(true);
      }
    } catch (err) {
      alert("Errore durante l'elaborazione");
    } finally {
      setIsProcessing(false);
    }
  };

  if (activeTab === 'photo') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 animate-in slide-in-from-bottom-6">
        <header className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-50">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <button onClick={() => {setActiveTab('home'); setIsDone(false); setSelectedImage(null);}} className="flex items-center gap-2 text-blue-600 font-bold">
              <ArrowLeft className="w-5 h-5" /> Home
            </button>
            <div className="bg-blue-50 px-4 py-2 rounded-full flex items-center gap-2 border border-blue-100">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <span className="text-lg font-black text-blue-700">{credits}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-5 max-w-md mx-auto w-full">
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 text-center">
            {!isDone ? (
              <>
                <div className="mb-8 p-6 bg-blue-50 rounded-3xl text-blue-800 text-sm font-bold italic">
                  💡 L'AI bilancerà le luci e raddrizzerà le pareti storte per te.
                </div>
                <label className="relative aspect-square border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50 flex flex-col items-center justify-center mb-8 overflow-hidden cursor-pointer">
                  <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="absolute inset-0 opacity-0 w-full h-full z-20" />
                  {isProcessing ? <Loader2 className="w-14 h-14 text-blue-600 animate-spin" /> : selectedImage ? <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" /> : (
                    <div className="flex flex-col items-center">
                      <Camera className="w-14 h-14 text-slate-300 mb-2" />
                      <p className="text-slate-400 font-black text-[10px] uppercase italic underline">Tocca per scattare foto reale</p>
                    </div>
                  )}
                </label>
                <button onClick={startAiMagic} disabled={isProcessing || !selectedImage} className="w-full py-7 rounded-[2rem] font-black text-lg bg-blue-600 text-white uppercase italic shadow-xl active:scale-95 transition-all">
                  <Sparkles className="w-7 h-7 inline mr-2" /> {isProcessing ? "ELABORAZIONE..." : "AVVIA MAGIA"}
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center py-4 animate-in zoom-in">
                <div className="bg-emerald-100 p-6 rounded-full mb-6 border border-emerald-200"><CheckCircle className="w-14 h-14 text-emerald-500" /></div>
                <h3 className="text-2xl font-black text-slate-800 uppercase italic mb-8">Risultato Pronto!</h3>
                <div className="w-full space-y-4">
                  <button className="w-full bg-slate-900 text-white p-6 rounded-[2rem] flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-4"><ImageIcon className="w-6 h-6 text-blue-400" /><span className="font-black text-sm uppercase italic">Portale (4:3)</span></div>
                    <Download className="w-6 h-6 text-blue-400" />
                  </button>
                  <button className="w-full bg-white border-4 border-slate-100 text-slate-900 p-6 rounded-[2rem] flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4"><Smartphone className="w-6 h-6 text-purple-500" /><span className="font-black text-sm uppercase italic">Social (4:5)</span></div>
                    <Download className="w-6 h-6 text-purple-500" />
                  </button>
                </div>
                <button onClick={() => {setIsDone(false); setSelectedImage(null);}} className="mt-12 text-slate-400 font-black text-[10px] uppercase border-b-2 border-slate-200 pb-1">Nuova Elaborazione</button>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <header className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-50">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-blue-600 w-7 h-7" />
            <h1 className="font-black text-2xl tracking-tighter text-blue-600 italic uppercase">RE-MAGIC</h1>
          </div>
          <div className="bg-blue-50 px-4 py-2 rounded-full flex items-center gap-2 border border-blue-100 shadow-sm">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <span className="text-lg font-black text-blue-700">{credits}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-5 max-w-md mx-auto w-full">
        <div className="space-y-8 animate-in fade-in">
          <div className="py-6 text-center">
            <h2 className="text-3xl font-black text-slate-800 leading-tight tracking-tight italic">Cosa vuoi creare<br/>oggi, Silvia?</h2>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <button onClick={() => setActiveTab('photo')} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center gap-3 text-center active:scale-95 transition-all">
              <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg"><ImageIcon className="w-8 h-8 text-white" /></div>
              <div><p className="font-black text-xs uppercase text-slate-800 tracking-widest">Foto AI</p><p className="text-[10px] text-slate-500 font-bold uppercase opacity-60 text-center">Luce e Colori</p></div>
            </button>
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center gap-3 text-center opacity-50">
              <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center"><Layout className="w-8 h-8 text-white" /></div>
              <div><p className="font-black text-xs uppercase text-slate-800 tracking-widest">Arredo</p><p className="text-[10px] text-slate-500 font-bold uppercase opacity-60">Staging</p></div>
            </div>
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center gap-3 text-center opacity-50">
              <div className="w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center"><Video className="w-8 h-8 text-white" /></div>
              <div><p className="font-black text-xs uppercase text-slate-800 tracking-widest">Video 360</p><p className="text-[10px] text-slate-500 font-bold uppercase opacity-60">Tour 360°</p></div>
            </div>
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center gap-3 text-center opacity-50">
              <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center"><Share2 className="w-8 h-8 text-white" /></div>
              <div><p className="font-black text-xs uppercase text-slate-800 tracking-widest">Social</p><p className="text-[10px] text-slate-500 font-bold uppercase opacity-60">Grafiche</p></div>
            </div>
          </div>
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl mt-4 text-center">
             <h3 className="text-xl font-black mb-1 uppercase tracking-tight italic text-blue-400">Ricarica Crediti</h3>
             <p className="text-sm opacity-70 font-medium text-slate-300 text-center">Scegli un pacchetto professionale.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
