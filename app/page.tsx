"use client";
import React, { useState } from 'react';
import { Camera, Image as ImageIcon, Sparkles, Share2, Layout, Menu, CreditCard, Video, X, PlayCircle, Loader2, CheckCircle } from 'lucide-react';

export default function RealEstateApp() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'photo' | 'video360'>('photo');
  const [videoFile, setVideoFile] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [credits, setCredits] = useState(12);
  const [isDone, setIsDone] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setGallery(prev => [...prev, ...newImages]);
      if (!selectedImage) setSelectedImage(newImages[0]);
    }
  };

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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <h1 className="font-bold text-xl tracking-tight text-blue-600">RE-MAGIC</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 px-3 py-1 rounded-full flex items-center gap-2 border border-blue-100">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-bold text-blue-700">{credits}</span>
            </div>
            <button onClick={() => setIsMenuOpen(true)} className="p-2 hover:bg-slate-100 rounded-full">
              <Menu className="w-6 h-6 text-slate-600" />
            </button>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <div className="relative w-72 bg-white h-full shadow-2xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-10">
              <h2 className="font-bold text-xl text-slate-800">Menu</h2>
              <X className="w-6 h-6 cursor-pointer text-slate-400" onClick={() => setIsMenuOpen(false)} />
            </div>
            <nav className="space-y-3 flex-1">
              <button onClick={() => {setActiveTab('photo'); setIsMenuOpen(false)}} className={`flex items-center gap-4 w-full p-4 rounded-2xl ${activeTab === 'photo' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}>
                <ImageIcon className="w-6 h-6" /> <span className="font-semibold">Foto AI</span>
              </button>
              <button onClick={() => {setActiveTab('video360'); setIsMenuOpen(false)}} className={`flex items-center gap-4 w-full p-4 rounded-2xl ${activeTab === 'video360' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}>
                <Video className="w-6 h-6" /> <span className="font-semibold">Tour 360°</span>
              </button>
            </nav>
            <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold">Compra Crediti</button>
          </div>
        </div>
      )}

      <main className="flex-1 p-4 max-w-md mx-auto w-full">
        <div className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-slate-100 mb-6">
          <div className="aspect-[4/5] border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
            {isProcessing ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <p className="text-blue-600 font-bold uppercase tracking-widest text-[10px]">L'AI sta creando la magia...</p>
              </div>
            ) : isDone ? (
              <div className="flex flex-col items-center gap-4 text-emerald-500">
                <CheckCircle className="w-16 h-16" />
                <p className="font-bold text-sm">Elaborazione Completata!</p>
              </div>
            ) : selectedImage ? (
              <img src={selectedImage} alt="Preview" className="w-full h-full object-cover rounded-[1.8rem]" />
            ) : (
              <div className="text-center p-6 cursor-pointer" onClick={() => document.getElementById('file-upload')?.click()}>
                <Camera className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-bold uppercase text-[10px]">Carica l'immobile</p>
                <input id="file-upload" type="file" multiple className="hidden" accept="image/*" onChange={handleUpload} />
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={startAiMagic}
          disabled={isProcessing || (!selectedImage && !videoFile)}
          className={`w-full py-6 rounded-[2rem] font-black shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 ${
            isProcessing ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white'
          }`}
        >
          {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
          <span>{isProcessing ? 'ELABORAZIONE...' : activeTab === 'photo' ? 'MIGLIORA ORA' : 'GENERA TOUR 360'}</span>
        </button>

        <p className="text-center text-[10px] text-slate-400 mt-4 uppercase tracking-[0.2em]">Costo: 1 credito</p>
      </main>
    </div>
  );
}
