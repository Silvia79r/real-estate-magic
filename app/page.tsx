"use client";
import React, { useState } from 'react';
import { Camera, Image as ImageIcon, Sparkles, CreditCard, Video, Layout, Share2, Loader2, CheckCircle, Smartphone, ArrowLeft, Download, X, Plus } from 'lucide-react';

export default function RealEstateApp() {
  const [activeTab, setActiveTab] = useState<'home' | 'photo'>('home');
  const [isProcessing, setIsProcessing] = useState(false);
  const [credits, setCredits] = useState(11);
  const [isDone, setIsDone] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setSelectedImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const startAiMagic = async () => {
    if (credits <= 0 || selectedImages.length === 0) return;
    setIsProcessing(true);
    
    try {
      const res = await fetch("/api/replicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: selectedImages[0] }),
      });

      if (!res.ok) throw new Error("Server Error");
      
      const data = await res.json();
      if (data.output) {
        setCredits(prev => prev - 1);
        setIsDone(true);
      }
    } catch (err) {
      alert("Connessione API fallita. Verifica il token Replicate su Vercel e fai un Redeploy!");
    } finally {
      setIsProcessing(false);
    }
  };

  if (activeTab === 'photo') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 animate-in slide-in-from-bottom-6">
        <header className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-50">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <button onClick={() => {setActiveTab('home'); setIsDone(false); setSelectedImages([]);}} className="flex items-center gap-2 text-blue-600 font-bold">
              <ArrowLeft className="w-5 h-5" /> Home
            </button>
            <div className="bg-blue-50 px-4 py-2 rounded-full flex items-center gap-2 border border-blue-100">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <span className="text-lg font-black text-blue-700">{credits}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-5 max-w-md mx-auto w-full">
          {!isDone ? (
            <div className="space-y-6">
              <div className="bg-blue-600 text-white p-6 rounded-[2.5rem] shadow-xl text-center">
                <h2 className="text-xl font-black uppercase italic tracking-tighter">Migliora Foto AI</h2>
                <p className="text-xs opacity-80 font-bold mt-1">Carica una o più foto per sistemare luci e prospettiva.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {selectedImages.map((img, index) => (
                  <div key={index} className="relative aspect-square rounded-3xl overflow-hidden border-4 border-white shadow-sm">
                    <img src={img} className="w-full h-full object-cover" />
                    <button onClick={() => setSelectedImages(prev => prev.filter((_, i) => i !== index))} className="absolute top-2 right-2 bg-white/90 rounded-full p-1 shadow-lg">
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))}
                
                <label className="aspect-square border-4 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-all">
                  <input type="file" multiple accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
                  <Plus className="w-10 h-10 text-slate-300" />
                  <p className="text-[10px] text-slate-400 font-black uppercase mt-1">Aggiungi</p>
                </label>
              </div>

              {selectedImages.length > 0 && (
                <button 
                  onClick={startAiMagic} 
                  disabled={isProcessing}
                  className="w-full py-8 rounded-[2.5rem] font-black text-xl bg-blue-600 text-white shadow-blue-200 shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  {isProcessing ? <Loader2 className="w-8 h-8 animate-spin" /> : <><Sparkles className="w-7 h-7" /> AVVIA MAGIA ({selectedImages.length})</>}
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 text-center animate-in zoom-in">
              <div className="bg-emerald-100 p-6 rounded-full mb-6 inline-block border border-emerald-200"><CheckCircle className="w-14 h-14 text-emerald-500" /></div>
              <h3 className="text-2xl font-black text-slate-800 uppercase italic mb-8">Lavoro Finito!</h3>
              <div className="space-y-4">
                <button className="w-full bg-slate-900 text-white p-6 rounded-[2rem] flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-4"><ImageIcon className="w-6 h-6 text-blue-400" /><span className="font-black text-sm uppercase italic">Portale (4:3)</span></div>
                  <Download className="w-6 h-6 text-blue-400" />
                </button>
                <button className="w-full bg-white border-4 border-slate-100 text-slate-900 p-6 rounded-[2rem] flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-4"><Smartphone className="w-6 h-6 text-purple-500" /><span className="font-black text-sm uppercase italic">Social (4:5)</span></div>
                  <Download className="w-6 h-6 text-purple-500" />
                </button>
              </div>
              <button onClick={() => {setIsDone(false); setSelectedImages([]);}} className="mt-12 text-slate-400 font-black text-[10px] uppercase border-b-2 border-slate-200 pb-1">Nuova Elaborazione</button>
            </div>
          )}
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
          <div className="py-6 text-center text-3xl font-black text-slate-800 leading-tight tracking-tight italic">Cosa vuoi creare oggi, Silvia?</div>
          <div className="grid grid-cols-2 gap-5">
            <button onClick={() => setActiveTab('photo')} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center gap-3 active:scale-95 transition-all">
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
             <p className="text-sm opacity-70 font-medium text-slate-300">Scegli un pacchetto professionale.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
