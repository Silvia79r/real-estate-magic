"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, Camera, Download, Share2, Sparkles, AlertCircle, RefreshCw, Clock } from "lucide-react";

export default function FotoAIPage() {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Controllo dimensione lato client (Max 4MB)
      if (file.size > 4 * 1024 * 1024) {
        alert("L'immagine è troppo grande per Vercel Free. Usa una foto sotto i 4MB.");
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

      // 1. CONTROLLO CRITICO: La risposta è JSON?
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        // Se non è JSON, Vercel ci ha mandato una pagina di errore HTML (spesso 504 Timeout o 500)
        const text = await response.text();
        console.error("Errore Non-JSON dal server:", text); // Guarda la console del browser per i dettagli
        throw new Error(`Errore Server (${response.status}): Probabile Timeout di Vercel (10s limit).`);
      }

      // 2. Ora è sicuro leggere il JSON
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Errore generico dal server API");
      }

      if (data.output) {
        setResult(data.output);
      } else {
        throw new Error("Il server ha risposto OK ma senza immagine.");
      }

    } catch (err: any) {
      console.error("Errore Catturato:", err);
      // Qui evitiamo l'errore "toString" usando String() che è sicuro
      setError(String(err.message || err));
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
    } catch(e) { window.open(url, '_blank'); }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20 font-sans text-slate-900">
      <header className="px-6 py-4 flex items-center gap-4 bg-white border-b border-slate-200 sticky top-0 z-10">
        <Link href="/" className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <h1 className="text-xl font-bold">Foto AI</h1>
      </header>

      <main className="max-w-xl mx-auto px-6 py-8">
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex flex-col gap-2 text-red-700">
            <div className="flex items-center gap-2 font-bold">
                <AlertCircle size={20} />
                <span>Errore Rilevato</span>
            </div>
            <p className="text-sm font-mono break-words">{error}</p>
          </div>
        )}

        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 mb-8">
          {!image ? (
            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-300 rounded-2xl h-80 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 gap-4">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center"><Upload size={32} /></div>
              <p className="font-bold text-slate-700">Carica una foto</p>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden h-96 bg-slate-900">
              <img src={result || image} className="w-full h-full object-cover" />
              <div className="absolute bottom-4 left-4 bg-black/60 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md">
                {result ? "DOPO (AI)" : "PRIMA"}
              </div>
              {loading && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm z-20">
                    <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-white font-bold animate-pulse">Miglioramento in corso...</p>
                </div>
              )}
              {!loading && (
                 <button onClick={() => { setImage(null); setResult(null); setError(null); }} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full">
                  <RefreshCw size={20} />
                </button>
              )}
            </div>
          )}
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
        </div>

        <div className="space-y-4">
          {!image && (
            <button onClick={() => fileInputRef.current?.click()} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
              <Camera size={24} /> Scatta o Carica
            </button>
          )}
          {image && !result && !loading && (
            <button onClick={startAiMagic} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
              <Sparkles size={24} /> Migliora Foto con AI
            </button>
          )}
          {result && (
            <button onClick={() => downloadImage(result!, 'foto-magic.jpg')} className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
              <Download size={24} /> Scarica Foto
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
