"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, Camera, Sparkles, RefreshCw, Monitor, Instagram, CheckCircle2 } from "lucide-react";

export default function FotoAIPage() {
  // CONFIGURAZIONE CLOUDINARY
  const CLOUD_NAME = "dfzptsood";
  const UPLOAD_PRESET = "remagic";

  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultImageRef = useRef<HTMLImageElement>(null);

  // Gestione caricamento file locale
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file); 
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- AI ENHANCEMENT SICURO (Versione Aggressiva HDR) ---
  const startAiMagic = async () => {
    if (!imageFile) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Upload dell'immagine originale su Cloudinary
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("upload_preset", UPLOAD_PRESET);

      const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) throw new Error("Errore durante il caricamento dell'immagine.");

      const uploadData = await uploadResponse.json();
      const originalUrl = uploadData.secure_url;

      // 2. APPLICAZIONE FILTRI STANDARD (POTENZIATI)
      // Usiamo solo filtri nativi che non richiedono abbonamenti extra.
      // e_gamma:80 -> Aumenta la luminosità globale (effetto sole)
      // e_contrast:60 -> Contrasto molto forte per dare profondità
      // e_vibrance:100 -> Vividezza al massimo per i colori spenti
      // e_saturation:30 -> Boost addizionale ai colori
      // e_sharpen:150 -> Nitidezza estrema per dettagli croccanti
      const transformation = "e_gamma:80,e_contrast:60,e_vibrance:100,e_saturation:30,e_sharpen:150,q_auto:best";
      
      // Inseriamo la trasformazione nell'URL dopo "/upload/"
      const enhancedUrl = originalUrl.replace("/upload/", `/upload/${transformation}/`);

      // Aggiungiamo un piccolo ritardo artificiale (1 secondo) per feedback visivo
      await new Promise(r => setTimeout(r, 1000));

      setResult(enhancedUrl);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Si è verificato un errore imprevisto.");
    } finally {
      setLoading(false);
    }
  };

  // Funzione di Ritaglio e Download
  const cropAndDownload = (aspectRatio: number, filename: string) => {
    if (!resultImageRef.current) return;
    const img = resultImageRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let newWidth = img.naturalWidth;
    let newHeight = img.naturalWidth / aspectRatio;

    if (newHeight > img.naturalHeight) {
        newHeight = img.naturalHeight;
        newWidth = newHeight * aspectRatio;
    }

    canvas.width = newWidth;
    canvas.height = newHeight;

    const startX = (img.naturalWidth - newWidth) / 2;
    const startY = (img.naturalHeight - newHeight) / 2;

    ctx.drawImage(img, startX, startY, newWidth, newHeight, 0, 0, newWidth, newHeight);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 'image/jpeg', 0.95);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20 font-sans text-slate-900">
      <header className="px-6 py-4 flex items-center gap-4 bg-white border-b border-slate-200 sticky top-0 z-10">
        <Link href="/" className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <h1 className="text-xl font-bold">Foto AI (Professional Enhance)</h1>
      </header>

      <main className="max-w-xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-bold flex items-center gap-2">
            ⚠️ {error}
          </div>
        )}

        {/* AREA ANTEPRIMA */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 mb-8">
          {!image ? (
            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-300 rounded-2xl h-80 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 gap-4 group">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition"><Upload size={32} /></div>
              <p className="font-bold text-slate-700">Carica Foto</p>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden min-h-[400px] bg-slate-900 flex items-center justify-center">
              {/* Immagine con crossOrigin per permettere il ritaglio su canvas */}
              <img 
                ref={resultImageRef}
                src={result || image} 
                className="w-full h-auto max-h-[600px] object-contain" 
                alt="Anteprima" 
                crossOrigin="anonymous"
                onError={() => setError("Errore visualizzazione immagine. Riprova.")}
              />
              
              <div className="absolute top-4 left-4 bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-2">
                {result ? <><CheckCircle2 size={12} className="text-green-400" /> RISULTATO PRO</> : "ORIGINALE"}
              </div>

              {loading && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm z-20">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-white font-bold animate-pulse text-lg">Ottimizzazione in corso...</p>
                    <p className="text-slate-400 text-sm mt-2">Analisi luci e colori</p>
                </div>
              )}

              {!loading && (
                 <button onClick={() => { setImage(null); setResult(null); setImageFile(null); }} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition">
                  <RefreshCw size={20} />
                </button>
              )}
            </div>
          )}
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
        </div>

        {/* PULSANTI AZIONE */}
        <div className="space-y-4">
          {!image && (
            <button onClick={() => fileInputRef.current?.click()} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-200">
              <Camera size={24} /> Scatta o Carica
            </button>
          )}
          
          {image && !result && !loading && (
            <button onClick={startAiMagic} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
              <Sparkles size={24} /> Migliora Foto (Pro)
            </button>
          )}
          
          {result && (
            <div className="grid grid-cols-2 gap-4">
                <button onClick={() => cropAndDownload(16/9, 'foto-portali.jpg')} className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-1 hover:bg-green-700 transition shadow-lg shadow-green-200">
                  <div className="flex items-center gap-2"><Monitor size={20} /> Portali</div>
                  <span className="text-[10px] opacity-80 font-normal">Formato 16:9</span>
                </button>
                <button onClick={() => cropAndDownload(4/5, 'foto-social.jpg')} className="w-full bg-pink-600 text-white py-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-1 hover:bg-pink-700 transition shadow-lg shadow-pink-200">
                   <div className="flex items-center gap-2"><Instagram size={20} /> Social</div>
                   <span className="text-[10px] opacity-80 font-normal">Formato 4:5</span>
                </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
