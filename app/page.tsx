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

  // Gestione Caricamento Immagine (Anteprima locale)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Funzione Magica (Backend call)
  const startAiMagic = async () => {
    if (!image) return;

    setLoading(true);
    setError(null);

    try {
      console.log("Invio richiesta al server...");
      
      const response = await fetch("/api/replicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });

      console.log("Risposta server status:", response.status);

      // Gestione Errori HTTP (es. 504 Timeout, 500 Server Error)
      if (!response.ok) {
        let errorMsg = `Errore Server: ${response.status}`;
        try {
            const errorData = await response.json();
            if (errorData.error) errorMsg = errorData.error;
        } catch (e) {
            // Se non è JSON (es. timeout HTML di Vercel), usiamo lo status text
            errorMsg = `Errore di connessione (${response.status} ${response.statusText}). Probabile Timeout.`;
        }
        throw new Error(errorMsg);
      }

      // Risposta OK
      const data = await response.json();
      if (data.output) {
        setResult(data.output);
      } else {
        throw new Error("Il server non ha restituito l'immagine generata.");
      }

    } catch (err: any) {
      console.error("Errore catturato:", err);
      // Qui preveniamo l'errore "toString of undefined"
      const message = err instanceof Error ? err.message : "Errore sconosciuto";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Download Sicuro
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
        
        {/* BOX ERRORE */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex flex-col gap-2 text-red-700 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-2 font-bold">
                <AlertCircle size={20} />
                <span>Qualcosa non va</span>
            </div>
            <p className="text-sm">{error}</p>
            {error.includes("Timeout") && (
                <p className="text-xs text-red-600 mt-1">
                    Nota: Vercel Free ha un limite di 10 secondi. Leonardo AI è troppo lento.
                </p>
            )}
          </div>
        )}

        {/* AREA PRINCIPALE */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 mb-8">
          
          {!image ? (
            // STATO 1: CARICA
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-2xl h-80 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors gap-4 active:scale-95 duration-200"
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
            // STATO 2: ANTEPRIMA / RISULTATO
            <div className="relative rounded-2xl overflow-hidden h-96 bg-slate-900 shadow-inner">
              <img 
                src={result || image} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />

              <div className="absolute bottom-4 left-4 bg-black/60 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                {result ? "DOPO (AI)" : "PRIMA"}
              </div>

              {/* LOADING SPINNER */}
              {loading && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm z-20">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles size={20} className="text-blue-400 animate-pulse" />
                    </div>
                  </div>
                  <p className="text-white font-bold mt-4 animate-pulse tracking-wide">Miglioramento in corso...</p>
                  <p className="text-white/60 text-xs mt-2">Attendere prego (max 20s)</p>
                </div>
              )}

              {/* TASTO CHIUDI */}
              {!loading && (
                <button 
                  onClick={() => { setImage(null); setResult(null); setError(null); }}
                  className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-red-500/80 transition-colors backdrop-blur-md"
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
            capture="environment"
          />
        </div>

        {/* PULSANTI AZIONE */}
        <div className="space-y-4">
          
          {!image && (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Camera size={24} />
              Scatta o Carica
            </button>
          )}

          {image && !result && !loading && (
            <button 
              onClick={startAiMagic}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all"
            >
              <Sparkles size={24} />
              Migliora Foto con AI
            </button>
          )}

          {result && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4">
              <button 
                onClick={() => downloadImage(result!, 'remagic-portale.jpg')}
                className="bg-white border-2 border-slate-200 text-slate-700 py-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-1 hover:bg-slate-50 active:scale-95 transition-all"
              >
                <Download size={20} />
                <span className="text-sm">Portale (4:3)</span>
              </button>
              
              <button 
                onClick={() => downloadImage(result!, 'remagic-social.jpg')}
                className="bg-indigo-600 text-white py-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-1 shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
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
