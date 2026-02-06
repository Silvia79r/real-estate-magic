"use client";
import React, { useState } from 'react';
import { Camera, Image as ImageIcon, Sparkles, Share2, Layout, Menu, CreditCard, Video, X, PlayCircle, CheckCircle2, Info } from 'lucide-react';

export default function RealEstateApp() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'photo' | 'video360'>('photo');
  const [videoFile, setVideoFile] = useState<string | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setGallery(prev => [...prev, ...newImages]);
      if (!selectedImage) setSelectedImage(newImages[0]);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setVideoFile(URL.createObjectURL(file));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* HEADER PROFESSIONALE */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-100">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <h1 className="font-bold text-xl tracking-tight text-blue-600">RE-MAGIC</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 px-3 py-1 rounded-full flex items-center gap-2 border border-blue-100">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-bold text-blue-700">12</span>
            </div>
            <button onClick={() => setIsMenuOpen(true)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <Menu className="w-6 h-6 text-slate-600" />
            </button>
          </div>
        </div>
      </header>

      {/* MENU LATERALE */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <div className="relative w-72 bg-white h-full shadow-2xl p-6 flex flex-col animate-in slide-in-from-right">
            <div className="flex justify-between items-center mb-10">
              <h2 className="font-bold text-xl text-slate-800">Navigazione</h2>
              <X className="w-6 h-6 cursor-pointer text-slate-400" onClick={() => setIsMenuOpen(false)} />
            </div>
            <nav className="space-y-3 flex-1">
              <button 
                onClick={() => { setActiveTab('photo'); setIsMenuOpen(false); }}
                className={`flex items-center gap-4 w-full p-4 rounded-2xl transition-all ${activeTab === 'photo' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'hover:bg-slate-50 text-slate-600'}`}
              >
                <ImageIcon className="w-6 h-6" /> <span className="font-semibold">Foto AI</span>
              </button>
              <button 
                onClick={() => { setActiveTab('video360'); setIsMenuOpen(false); }}
                className={`flex items-center gap-4 w-full p-4 rounded-2xl transition-all ${activeTab === 'video360' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'hover:bg-slate-50 text-slate-600'}`}
              >
                <Video className="w-6 h-6" /> <span className="font-semibold">Tour 360°</span>
              </button>
            </nav>
            <div className="p-4 bg-slate-50 rounded-2xl mb-6">
              <p className="text-[10px] text-slate-400 uppercase font-black mb-2 tracking-widest">Il tuo piano</p>
              <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg shadow-slate-200">Compra Crediti</button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 p-4 max-w-md mx-auto w-full">
        {activeTab === 'photo' ? (
          /* SEZIONE FOTO */
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col gap-4">
              <div 
                className="aspect-[4/5] border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden cursor-pointer group"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                {selectedImage ? (
                  <img src={selectedImage} alt="Preview" className="w-full h-full object-cover rounded-[1.8rem]" />
                ) : (
                  <div className="text-center p-6">
                    <Camera className="w-10 h-10 text-slate-300 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                    <p className="text-slate-600 font-bold">Carica Foto Stanze</p>
                    <p className="text-slate-400 text-xs mt-2 italic">L'AI le renderà perfette per l'annuncio</p>
                  </div>
                )}
                <input id="file-upload" type="file" multiple className="hidden" accept="image/*" onChange={handleUpload} />
              </div>

              {gallery.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {gallery.map((img, idx) => (
                    <img key={idx} src={img} onClick={() => setSelectedImage(img)} className={`w-16 h-16 rounded-xl object-cover flex-shrink-0 cursor-pointer border-2 transition-all ${selectedImage === img ? 'border-blue-600 scale-95 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`} alt="Galleria" />
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm text-center relative overflow-hidden group">
                <Layout className="mx-auto mb-2 text-indigo-500 w-5 h-5" /> 
                <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400 group-hover:text-indigo-600 transition-colors">Virtual Staging</span>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm text-center relative overflow-hidden group">
                <Share2 className="mx-auto mb-2 text-emerald-500 w-5 h-5" /> 
                <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400 group-hover:text-emerald-600 transition-colors">Social Export</span>
              </div>
            </div>

            <button className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black shadow-xl shadow-blue-100 active:scale-95 transition-all">
              <Sparkles className="w-6 h-6 inline-block mr-2" />
              {gallery.length > 1 ? `ELABORA ${gallery.length} FOTO` : 'MIGLIORA ORA'}
            </button>
          </div>
        ) : (
          /* SEZIONE VIDEO 360 - MIGLIORATA CON TESTI GUIDA */
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6">
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-6">
                <Info className="w-4 h-4 text-blue-500" />
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Come funziona il Tour</p>
              </div>
              
              <div 
                className="aspect-video border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden cursor-pointer group mb-8"
                onClick={() => document.getElementById('video-upload')?.click()}
              >
                {videoFile ? (
                  <video src={videoFile} className="w-full h-full object-cover rounded-[1.8rem]" />
                ) : (
                  <div className="text-center p-6">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 text-blue-500 group-hover:scale-110 transition-transform">
                      <PlayCircle className="w-8 h-8" />
                    </div>
                    <p className="text-slate-600 font-bold">Carica Video Grezzo</p>
                    <p className="text-slate-400 text-[10px] mt-2 italic px-8 uppercase">Registra al centro della stanza e carica qui il file</p>
                  </div>
                )}
                <input id="video-upload" type="file" className="hidden" accept="video/*" onChange={handleVideoUpload} />
              </div>

              {/* GUIDA AGLI STEP */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-[10px] font-bold flex-shrink-0 mt-0.5">1</div>
                  <p className="text-xs text-slate-500 font-medium">L'AI corregge le distorsioni e unisce i punti ciechi del video.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-[10px] font-bold flex-shrink-0 mt-0.5">2</div>
                  <p className="text-xs text-slate-500 font-medium">L'ambiente viene illuminato e pulito da rumore visivo.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-[10px] font-bold flex-shrink-0 mt-0.5">3</div>
                  <p className="text-xs text-slate-500 font-medium font-bold text-blue-600">Ottieni un link 360° interattivo da inviare su WhatsApp.</p>
                </div>
              </div>
            </div>

            <button className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all">
              <Sparkles className="w-6 h-6 text-blue-400" />
              <span>CREA TOUR INTERATTIVO</span>
            </button>
            
            <button onClick={() => setActiveTab('photo')} className="w-full text-slate-300 font-black text-[10px] uppercase tracking-[0.2em] py-2">
              Annulla e torna alle Foto
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
