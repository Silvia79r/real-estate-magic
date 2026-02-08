"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, Camera, Download, Share2, Sparkles, AlertCircle, RefreshCw } from "lucide-react";

export default function FotoAIPage() {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // GESTIONE UPLOAD
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4.5 * 1024 * 1024) {
        alert("Immagine troppo grande. Usa una foto sotto i 4MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // FUNZIONE MAGICA BLINDATA
  const startAiMagic = async () => {
    if (!image) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/replicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });

      // 1. Se il server non risponde o dà errore, NON cerchiamo di capire perché.
      // Lanciamo un errore generico sicuro che non causa crash.
      if (!response.ok) {
        throw new Error("Errore comunicazione Server (Timeout o Chiavi)");
      }

      // 2. Proviamo a leggere i dati
      const textData = await response.text(); 
      let data;
      try {
        data = JSON.parse(textData);
      } catch (e) {
        throw new Error("Il server ha risposto con dati non validi.");
      }

      // 3. Controllo risultato
      if (data && data.output) {
        setResult(data.output);
      } else {
        throw new Error("Nessuna immagine generata.");
      }

    } catch (err) {
      console.error(err);
      // Qui sta il trucco: NON usiamo err.message o toString.
      // Scriviamo un messaggio fisso. Così è IMPOSSIBILE che esca "undefined reading toString".
      setError("Si è verificato un errore durante la generazione. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    } catch (e) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20 font-sans text-slate-900">
      
      {/* HEADER */}
      <header className="px-6 py-4 flex items-center gap-4 bg-white border-b border-slate-200 sticky top-0 z-10">
        <Link href="/" className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <h1 className="text-xl font-bold">Foto AI</h1>
      </header>

      <main className="max-w-xl mx-auto px-6 py-8">
        
        {/* BOX ERRORE SEMPLICE */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
            <AlertCircle size={24} className="shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* AREA UPLOAD */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 mb-8">
          {!image ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-2xl h-80 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 gap-4"
            >
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                <Upload size={32} />
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-700">Carica una foto</p>
                <p className="text-sm text-slate-400">Tocca per scattare o caricare</p>
              </div>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden h-96 bg-slate-900">
              <img 
                src={result || image} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />

              <div className="absolute bottom-4 left-4 bg-black/60 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md">
                {result ? "DOPO (AI)" : "PRIMA"}
              </div>

              {loading && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm z-20">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-white font-bold animate-pulse">Generazione...</p>
                </div>
              )}

              {!loading && (
                <button 
                  onClick={() => { setImage(null); setResult(null); setError(null); }}
                  className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-white/20 backdrop-blur-md"
                >
                  <RefreshCw size={20} />
                </button>
              )}
            </div>
          )}
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            className="hidden" 
            accept="image/*"
          />
        </div>

        {/* AZIONI */}
        <div className="space-y-4">
          {!image && (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2"
            >
              <Camera size={24} />
              Scatta o Carica
            </button>
          )}

          {image && !result && !loading && (
            <button 
              onClick={startAiMagic}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2"
            >
              <Sparkles size={24} />
              Migliora Foto con AI
            </button>
          )}

          {result && (
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => downloadImage(result!, 'remagic-portale.jpg')}
                className="bg-white border-2 border-slate-200 text-slate-700 py-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-1"
              >
                <Download size={20} />
                <span className="text-sm">Portale</span>
              </button>
              
              <button 
                onClick={() => downloadImage(result!, 'remagic-social.jpg')}
                className="bg-indigo-600 text-white py-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-1 shadow-lg"
              >
                <Share2 size={20} />
                <span className="text-sm">Social</span>
              </button>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
