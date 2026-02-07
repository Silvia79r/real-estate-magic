"use client";
import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, Sparkles, CreditCard, Video, Loader2, CheckCircle, Smartphone, ArrowLeft, Download, Layout, Share2 } from 'lucide-react';

export default function RealEstateApp() {
  const [activeTab, setActiveTab] = useState<'home' | 'photo' | 'video360' | 'staging' | 'social' | 'shop'>('home');
  const [isProcessing, setIsProcessing] = useState(false);
  const [credits, setCredits] = useState(11);
  const [isDone, setIsDone] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. FUNZIONE PER APRIRE LA FOTOCAMERA/GALLERIA
  const handleCaptureClick = () => {
    fileInputRef.current?.click();
  };

  // 2. FUNZIONE PER GESTIRE L'IMMAGINE CARICATA
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

  // 3. FUNZIONE CHE ATTIVA L'AI
  const startAiMagic = async () => {
    if (credits <= 0) return setActiveTab('shop');
    if (!selectedImage) return alert("Scatta o seleziona prima una foto!");
    
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
      console.error("Errore AI:", error);
      alert("C'è stato un problema con l'AI. Riprova!");
    } finally {
      setIsProcessing(false);
    }
  };

  const MenuButton = ({ icon: Icon, label, sub, color, tab }: any) => (
    <button onClick={() => setActiveTab(tab)} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center gap-4 hover:shadow-md transition-all active:scale-95 text-center w-full">
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
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => {setActiveTab('home'); setSelectedImage(null);}}>
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
          <div className="space-y-8 animate-in fade-in">
            <div className="py-6 text-center">
              <h2 className="text-3xl font-black text-slate-800 leading-tight">Cosa vuoi creare<br/>oggi, Silvia?</h2>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <MenuButton icon={ImageIcon} label="Foto AI" sub="Luci e Prospettiva" color="bg-blue-500" tab="photo" />
              <MenuButton icon={Layout} label="Arredo" sub="Virtual Staging" color="bg-indigo-500" tab="staging" />
              <MenuButton icon={Video} label="Video 360" sub="Tour Virtuale" color="bg-purple-500" tab="video360" />
              <MenuButton icon={Share2} label="Social" sub="Post e Grafiche" color="bg-emerald-500" tab="social" />
            </div>
            <div onClick={() => setActiveTab('shop')} className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl cursor-pointer active:scale-95 transition-all mt-4">
               <h3 className="text-xl font-black mb-2 uppercase tracking-tight italic">Ricarica Crediti</h3>
               <p className="text-sm opacity-80 leading-relaxed font-medium">Scegli un pacchetto o un abbonamento per il tuo team.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-bottom-6">
            <button onClick={() => {setActiveTab('home'); setIsDone(false); setSelectedImage(null);}} className="flex items-center gap-3 text-slate-500 font-black text-sm uppercase tracking-widest py-2">
              <ArrowLeft className="w-5 h-5" /> Indietro
            </button>
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 text-center">
              {!isDone ? (
                <>
                  <div className="mb-8 p-6 bg-blue-50 rounded-3xl text-left border border-blue-100 italic font-bold text-blue-800">
                    <p>💡 L'AI bilancerà le luci e raddrizzerà le pareti storte per te.</p>
                  </div>
                  
                  {/* INPUT NASCOSTO PER FOTOCAMERA */}
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                  />

                  <div 
                    onClick={handleCaptureClick}
                    className="aspect-square border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50 flex flex-col items-center justify-center mb-8 overflow-hidden cursor-pointer active:bg-slate-100 transition-colors"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-14 h-14 text-blue-600 animate-spin" />
                    ) : selectedImage ? (
                      <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Camera className="w-14 h-14 text-slate-300 mb-2" />
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-tighter">Tocca
