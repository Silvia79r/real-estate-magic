"use client";
import React, { useState } from 'react';
import { Camera, Image as ImageIcon, Sparkles, CreditCard, Video, Layout, Share2, Loader2, CheckCircle, Smartphone, ArrowLeft, Download, X, Plus } from 'lucide-react';

export default function RealEstateApp() {
  const [activeTab, setActiveTab] = useState<'home' | 'photo'>('home');
  const [isProcessing, setIsProcessing] = useState(false);
  const [credits, setCredits] = useState(11);
  const [isDone, setIsDone] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const compressed = await compressImage(reader.result as string);
          setSelectedImages(prev => [...prev, compressed]);
        };
        reader.readAsDataURL(files[i]);
      }
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
      const data = await res.json();
      if (data.output) {
        setCredits(prev => prev - 1);
        setIsDone(true);
      } else {
        alert(data.error || "Errore API");
      }
    } catch (err) {
      alert("Errore di connessione.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (activeTab === 'photo') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
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
              <div className="grid grid-cols-2 gap-4">
                {selectedImages.map((img, index) => (
                  <div key={index} className="relative aspect-square rounded-3xl overflow-hidden border-4 border-white shadow-sm">
                    <img src={img} className="w-full h-full object-cover" />
                    <button onClick={() => setSelectedImages(prev => prev.filter((_, i) => i !== index))} className="absolute top-2 right-2 bg-white/90 rounded-full p-1 shadow-lg">
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))}
                <label className="aspect-square border-4 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50 flex flex-col items-center justify-center cursor-pointer">
                  <input type="file" multiple accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
                  <Plus className="w-10 h-10 text-slate-300" />
                  <p className="text-[10px] text-slate-400 font-black uppercase mt-1">Aggiungi</p>
                </label>
              </div>
              {selectedImages.length > 0 && (
                <button onClick={startAiMagic} disabled={isProcessing} className="w-full py-8 rounded-[2.5rem] font-black text-xl bg-blue-600 text-white shadow-2xl flex items-center justify-center gap-3 italic uppercase">
                  {isProcessing ? <Loader2 className="w-8 h-8 animate-spin" /> : <><Sparkles className="w-7 h-7" /> AVVIA MAGIA</>}
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 text-center">
              <div className="bg-emerald-100 p-6 rounded-full mb-6 inline-block"><CheckCircle className="w-14 h-14 text-emerald-500" /></div>
              <h3 className="text-2xl font-black text-slate-800 uppercase italic mb-8">Risultato Pronto!</h3>
              <div className="space-y-4">
                <button className="w-full bg-slate-900 text-white p-6 rounded-[2rem] flex items-center justify-between">
                  <span className="font-black text-sm uppercase italic">Portale (4:3)</span>
                  <Download className="w-6 h-6 text-blue-400" />
                </button>
                <button className="w-full bg-white border-4 border-slate-100 text-slate-900 p-6 rounded-[2rem] flex items-center justify-between">
                  <span className="font-black text-sm uppercase italic">Social (4:5)</span>
                  <Download className="w-6 h-6 text-purple-500" />
                </button>
              </div>
              <button onClick={() => {setIsDone(false); setSelectedImages([]);}} className="mt-12 text-slate-400 font-black text-[10px] uppercase border-b-2 border-slate-200 pb-1">Nuova</button>
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
          <div className="bg-blue-50 px-4 py-2 rounded-full flex items-center gap-2 border border-blue-100">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <span className="text-lg font-black text-blue-700">{credits}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-5 max-w-md mx-auto w-full">
        <div className="space-y-8">
          <div className="py-6 text-center text-3xl font-black text-slate-800 italic">Cosa vuoi creare oggi?</div>
          <div className="grid grid-cols-2 gap-5">
            <button onClick={() => setActiveTab('photo')} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center"><ImageIcon className="w-8 h-8 text-white" /></div>
              <p className="font-black text-xs uppercase text-slate-800">Foto AI</p>
            </button>
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center gap-3 opacity-50">
              <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center"><Layout className="w-8 h-8 text-white" /></div>
              <p className="font-black text-xs uppercase text-slate-800">Arredo</p>
            </div>
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center gap-3 opacity-50">
              <div className="w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center"><Video className="w-8 h-8 text-white" /></div>
              <p className="font-black text-xs uppercase text-slate-800">Video 360</p>
            </div>
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center gap-3 opacity-50">
              <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center"><Share2 className="w-8 h-8 text-white" /></div>
              <p className="font-black text-xs uppercase text-slate-800">Social</p>
            </div>
          </div>
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl mt-4 text-center">
             <h3 className="text-xl font-black mb-1 uppercase italic text-blue-400">Ricarica Crediti</h3>
             <p className="text-sm opacity-70">Scegli un pacchetto professionale.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
