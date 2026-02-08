"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, Camera, Download, Share2, Sparkles, AlertCircle } from "lucide-react";

export default function FotoAIPage() {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gestione Caricamento Immagine
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null); // Reset risultato precedente
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Funzione Magica (Backend)
  const startAiMagic = async () => {
    if (!image) return;

    setLoading(true);
    setError(null);

    try {
      console.log("Inizio richiesta al server...");
      
      const response = await fetch("/api/replicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });

      console.log("Stato risposta:", response.status);

      // Gestione sicura della risposta
      let data;
      try {
        data = await response.json();
      } catch (e) {
        console.error("Errore parsing JSON:", e);
        throw new Error("Il server ha risposto con un errore non leggibile (forse errore 500 html).");
      }

      if (!response.ok) {
        // Se c'è un errore, usiamo quello, altrimenti un messaggio generico
        throw new Error(data.error || `Errore server: ${response.status}`);
      }

      if (data.output) {
        setResult(data.output);
      } else {
        throw new Error("Nessuna immagine generata ricevuta.");
      }

    } catch (err: any) {
      console.error("Errore Frontend:", err);
      // Qui evitiamo l'errore "toString of undefined"
      const message = err instanceof Error ? err.message : "Errore sconosciuto durante la generazione.";
      setError(message);
      alert(message); // Mostra l'errore vero all'utente
    } finally {
      setLoading(false);
    }
  };

  // Funzione Download
  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Errore download:", e);
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
        
        {/* MESSAGGIO ERRORE */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700">
            <AlertCircle size={24} className="shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* AREA UPLOAD / ANTEPRIMA */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 mb-8">
          
          {!image ? (
            // Stato 1: Carica Foto
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-2xl h-80 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors gap-4"
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
            // Stato 2: Foto Caricata (Prima/Dopo)
            <div className="relative rounded-2xl overflow-hidden h-96 bg-slate-900">
              
              {/* Immagine */}
              <img 
                src={result || image} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />

              {/* Etichette */}
              <div className="absolute bottom-4 left-4 bg-black/60 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md">
                {result ? "DOPO (AI)" : "PRIMA"}
              </div>

              {/* Loading Overlay */}
              {loading && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center backdrop-blur-sm z-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mb-4"></div>
                  <p className="text-white font-bold animate-pulse">Miglioramento in corso...</p>
                </div>
              )}

              {/* Tasto Chiudi */}
              {!loading && (
                <button 
                  onClick={() => { setImage(null); setResult(null); setError(null); }}
                  className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-md"
                >
                  X
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
            capture="environment"
          />
        </div>

        {/* AZIONI */}
        <div className="space-y-4">
          
          {/* Tasto Scatta/Carica (se non c'è immagine) */}
          {!image && (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
            >
              <Camera size={24} />
              Scatta o Carica
            </button>
          )}

          {/* Tasto Magico (se c'è immagine ma non risultato) */}
          {image && !result && !loading && (
            <button 
              onClick={startAiMagic}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
            >
              <Sparkles size={24} />
              Migliora Foto con AI
            </button>
          )}

          {/* Tasti Download (se c'è risultato) */}
          {result && (
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => downloadImage(result, 'remagic-portale.jpg')}
                className="bg-white border-2 border-slate-200 text-slate-700 py-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-1 hover:bg-slate-50"
              >
                <Download size={20} />
                <span className="text-sm">Portale (4:3)</span>
              </button>
              
              <button 
                onClick={() => downloadImage(result, 'remagic-social.jpg')}
                className="bg-indigo-600 text-white py-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-1 shadow-lg shadow-indigo-200"
              >
                <Share2 size={20} />
                <span className="text-sm">Social (4:5)</span>
              </button>
            </div>
          )}
          
        </div>

      </main>
    </div>
  );
}
