"use client";
import React, { useState } from 'react';
import { Camera, Image as ImageIcon, Sparkles, Share2, Layout, Menu, CreditCard, Video, X, PlayCircle } from 'lucide-react';

export default function RealEstateApp() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Stato per gestire quale sezione visualizzare
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
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <h1 className="font-bold text-xl tracking-tight text-blue-600 uppercase">Re-Magic</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 px-3 py-1 rounded-full flex items-center gap-2 border border-blue-100">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-bold text-blue-700">12</span>
            </div>
            <button onClick={() => setIsMenuOpen(true)} className="p-2 hover:bg-slate-100 rounded-full">
              <Menu className="w-6 h-6 text-slate-600" />
            </button>
          </div>
        </div>
      </header>

      {/* MENU LATERALE AGGIORNATO */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <div className="relative w-72 bg-white h-full shadow-2xl p-6 flex flex-col animate-in slide-in-from-right">
            <div className="flex justify-between items-center mb-10">
              <h2 className="font-bold text-xl text-slate-800">Naviga</h2>
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
              <p className="text-xs text-slate-400 uppercase font-bold mb-2 tracking-widest">Account Pro</p>
              <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold">Compra Crediti</button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 p-4 max-w-md mx-auto w-full">
        {activeTab === 'photo' ? (
          /* SEZIONE FOTO (Quella che abbiamo già) */
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col gap-4">
              <div 
                className="aspect-[4/5] border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden cursor-pointer"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                {selectedImage ? (
                  <img src={selectedImage} alt="Preview" className="w-full h-full object-cover rounded-[1.8rem]" />
                ) : (
                  <div className="text-center p-6">
                    <Camera className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 font-bold">Carica Foto</p>
                  </div>
                )}
                <input id="file-upload" type="file" multiple className="hidden" accept="image/*" onChange={handleUpload} />
              </div>

              {gallery.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {gallery.map((img, idx) => (
                    <img key={idx} src={img} onClick={() => setSelectedImage(img)} className={`w-16 h-16 rounded-xl object-cover flex-shrink-0 cursor-pointer border-2 ${selectedImage === img ? 'border-blue-600' : 'border-transparent'}`} />
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <button className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm"><Layout className="mx-auto mb-2 text-blue-600" /> <span className="text-[10px] font-bold uppercase text-slate-400">Staging</span></button>
              <button className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm"><Share2 className="mx-auto mb-2 text-green-600" /> <span className="text-[10px] font-bold uppercase text-slate-400">Social</span></button>
            </div>

            <button className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black shadow-xl">
              {gallery.length > 1 ? `MIGLIORA ${gallery.length} FOTO` : 'MIGLIORA CON AI'}
            </button>
          </div>
        ) : (
          /* SEZIONE VIDEO 360 (NUOVA!) */
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 text-center">
              <div 
                className="aspect-video border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden cursor-pointer"
                onClick={() => document.getElementById('video-upload')?.click()}
              >
                {videoFile ? (
                  <video src={videoFile} className="w-full h-full object-cover rounded-2xl" controls />
                ) : (
                  <div className="p-6">
                    <PlayCircle className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                    <p className="text-slate-600 font-bold">Carica Video 360°</p>
                    <p className="text-slate-400 text-xs mt-2">MP4, MOV supportati</p>
                  </div>
                )}
                <input id="video-upload" type="file" className="hidden" accept="video/*" onChange={handleVideoUpload} />
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100 text-left">
                <h4 className="text-sm font-bold text-blue-800 mb-1">Cosa farà l'AI?</h4>
                <p className="text-xs text-blue-600">Creerà un tour virtuale navigabile e migliorerà la luminosità di ogni stanza automaticamente.</p>
              </div>
            </div>

            <button className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black shadow-xl flex items-center justify-center gap-3">
              <Sparkles className="w-6 h-6 text-blue-400" />
              <span>GENERA VIRTUAL TOUR</span>
            </button>
            
            <button onClick={() => setActiveTab('photo')} className="w-full text-slate-400 font-bold text-sm uppercase tracking-widest">
              Torna alle Foto
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
