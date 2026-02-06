"use client";
import React, { useState } from 'react';
import { Camera, Image as ImageIcon, Sparkles, Share2, Layout, Menu, CreditCard, Video, X } from 'lucide-react';

export default function RealEstateApp() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [view, setView] = useState<'photo' | 'video360'>('photo');

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setGallery(prev => [...prev, ...newImages]);
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
            <div className="bg-blue-50 px-3 py-1 rounded-full flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-bold text-blue-700">12</span>
            </div>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <Menu className="w-6 h-6 text-slate-600" />
            </button>
          </div>
        </div>
      </header>

      {/* MENU A TENDINA (SIDEBAR) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <div className="relative w-64 bg-white h-full shadow-2xl p-6 animate-in slide-in-from-right">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-bold text-lg">Menu</h2>
              <X className="w-6 h-6 cursor-pointer" onClick={() => setIsMenuOpen(false)} />
            </div>
            <nav className="space-y-4">
              <button onClick={() => {setView('photo'); setIsMenuOpen(false)}} className="flex items-center gap-3 w-full p-3 hover:bg-blue-50 rounded-xl transition-colors">
                <ImageIcon className="w-5 h-5 text-blue-600" /> <span className="font-medium">Foto AI</span>
              </button>
              <button onClick={() => {setView('video360'); setIsMenuOpen(false)}} className="flex items-center gap-3 w-full p-3 hover:bg-blue-50 rounded-xl transition-colors text-slate-600">
                <Video className="w-5 h-5" /> <span className="font-medium">Tour 360°</span>
              </button>
              <div className="border-t border-slate-100 pt-4 mt-4">
                <button className="flex items-center gap-3 w-full p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200">
                  <CreditCard className="w-5 h-5" /> <span className="font-medium">Compra Crediti</span>
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* AREA PRINCIPALE */}
      <main className="flex-1 p-4 max-w-md mx-auto w-full space-y-4">
        {view === 'photo' ? (
          <>
            {/* GRIGLIA MULTI-FOTO */}
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 min-h-[400px] flex flex-col">
              <div 
                className="flex-1 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden group"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                {selectedImage ? (
                  <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Camera className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-medium">Tocca per caricare l'appartamento</p>
                    <p className="text-slate-400 text-xs mt-1">Puoi selezionare più foto</p>
                  </>
                )}
                <input id="file-upload" type="file" multiple className="hidden" accept="image/*" onChange={handleUpload} />
              </div>

              {/* MINIATURE GALLERIA */}
              {gallery.length > 0 && (
                <div className="flex gap-2 overflow-x-auto mt-4 pb-2">
                  {gallery.map((img, idx) => (
                    <img 
                      key={idx} 
                      src={img} 
                      className={`w-16 h-16 rounded-lg object-cover flex-shrink-0 cursor-pointer border-2 ${selectedImage === img ? 'border-blue-600' : 'border-transparent'}`}
                      onClick={() => setSelectedImage(img)}
                    />
                  ))}
                  <button 
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 border-2 border-dashed border-slate-300"
                  >
                    <span className="text-2xl text-slate-400">+</span>
                  </button>
                </div>
              )}
            </div>

            {/* BOTTONI AZIONE */}
            <div className="grid grid-cols-2 gap-4">
              <button className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center gap-2 active:scale-95 transition-transform">
                <Layout className="w-6 h-6 text-blue-600" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Virtual Staging</span>
              </button>
              <button className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center gap-2 active:scale-95 transition-transform text-slate-400 italic">
                <Share2 className="w-6 h-6" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Social Export</span>
              </button>
            </div>

            <button className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold shadow-xl shadow-blue-100 flex items-center justify-center gap-3 hover:bg-blue-700 active:scale-[0.98] transition-all">
              <Sparkles className="w-6 h-6" />
              <span>MIGLIORA {gallery.length > 1 ? `TUTTE LE ${gallery.length} FOTO` : 'CON AI'}</span>
            </button>
          </>
        ) : (
          /* SEZIONE VIDEO 360 */
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center space-y-4">
             <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
               <Video className="w-10 h-10 text-blue-600" />
             </div>
             <h2 className="text-xl font-bold">Crea Virtual Tour 360°</h2>
             <p className="text-slate-500">Carica un video panoramico o una sequenza di foto 360 per creare il tour.</p>
             <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold">Carica File 360</button>
             <button onClick={() => setView('photo')} className="text-blue-600 font-medium">Torna alle Foto</button>
          </div>
        )}
      </main>
    </div>
  );
}
