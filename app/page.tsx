"use client";
import React, { useState } from 'react';
import { Camera, Image as ImageIcon, Sparkles, Share2, Layout, Menu, CreditCard, Video, X } from 'lucide-react';

export default function RealEstateApp() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Gestisce il caricamento di più file contemporaneamente
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setGallery(prev => [...prev, ...newImages]);
      // Imposta la prima immagine caricata come quella principale se non ce n'è già una
      if (!selectedImage) setSelectedImage(newImages[0]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* HEADER PROFESSIONALE */}
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
          <div className="relative w-72 bg-white h-full shadow-2xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-10">
              <h2 className="font-bold text-xl text-slate-800">Menu</h2>
              <X className="w-6 h-6 cursor-pointer text-slate-400 hover:text-slate-600" onClick={() => setIsMenuOpen(false)} />
            </div>
            <nav className="space-y-2 flex-1">
              <button className="flex items-center gap-4 w-full p-4 bg-blue-50 text-blue-600 rounded-2xl">
                <ImageIcon className="w-6 h-6" /> <span className="font-semibold">Foto AI</span>
              </button>
              <button className="flex items-center gap-4 w-full p-4 hover:bg-slate-50 text-slate-600 rounded-2xl transition-colors">
                <Video className="w-6 h-6" /> <span className="font-semibold">Tour 360°</span>
              </button>
            </nav>
            <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 mb-4">
              Compra Crediti
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 p-4 max-w-md mx-auto w-full space-y-6">
        {/* AREA DI VISUALIZZAZIONE PRINCIPALE */}
        <div className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col gap-4">
          <div 
            className="aspect-[4/5] border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden group cursor-pointer"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            {selectedImage ? (
              <img src={selectedImage} alt="Preview" className="w-full h-full object-cover rounded-[1.8rem]" />
            ) : (
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-4 text-slate-400 group-hover:scale-110 transition-transform">
                  <Camera className="w-8 h-8" />
                </div>
                <p className="text-slate-600 font-bold">Tocca per caricare</p>
                <p className="text-slate-400 text-xs mt-2">Seleziona le foto dell'appartamento</p>
              </div>
            )}
            <input id="file-upload" type="file" multiple className="hidden" accept="image/*" onChange={handleUpload} />
          </div>

          {/* LA NUOVA GALLERIA DI MINIATURE */}
          {gallery.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {gallery.map((img, idx) => (
                <div 
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setSelectedImage(img); }}
                  className={`relative w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${selectedImage === img ? 'border-blue-600 scale-95 shadow-md' : 'border-transparent opacity-70'}`}
                >
                  <img src={img} className="w-full h-full object-cover" alt={`Minuatura ${idx}`} />
                </div>
              ))}
              <button 
                onClick={(e) => { e.stopPropagation(); document.getElementById('file-upload')?.click(); }}
                className="w-20 h-20 flex-shrink-0 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-100"
              >
                <span className="text-2xl font-light">+</span>
              </button>
            </div>
          )}
        </div>

        {/* BOTTONI AZIONE */}
        <div className="grid grid-cols-2 gap-4">
          <button className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center gap-3 hover:bg-slate-50 transition-colors">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <Layout className="w-6 h-6" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Staging</span>
          </button>
          <button className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center gap-3 hover:bg-slate-50 transition-colors">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
              <Share2 className="w-6 h-6" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Social</span>
          </button>
        </div>

        {/* PULSANTE MAGICO */}
        <button className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black shadow-xl shadow-blue-200 flex items-center justify-center gap-4 hover:bg-blue-700 active:scale-[0.98] transition-all">
          <Sparkles className="w-7 h-7" />
          <span className="text-lg uppercase tracking-tight">
            {gallery.length > 1 ? `Migliora ${gallery.length} foto` : 'Migliora con AI'}
          </span>
        </button>
      </main>
    </div>
  );
}
