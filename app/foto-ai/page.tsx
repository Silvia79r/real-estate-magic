"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, Camera, Sparkles, RefreshCw, Monitor, Instagram, CheckCircle2 } from "lucide-react";

export default function FotoAIPage() {
  const CLOUD_NAME = "dfzptsood";
  const UPLOAD_PRESET = "remagic";

  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Rimosso resultImageRef perché non serve più per il canvas

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

  const startAiMagic = async () => {
    if (!imageFile) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Upload su Cloudinary
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("upload_preset", UPLOAD_PRESET);
      const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });
      if (!uploadResponse.ok) throw new Error("Errore Upload Immagine");
      const uploadData = await uploadResponse.json();
      
      // 2. Chiamata Leonardo AI (Backend)
      const aiResponse = await fetch("/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: uploadData.secure_url }),
      });
      const aiData = await aiResponse.json();
      if (!aiResponse.ok) throw new Error(aiData.error || "Errore AI");

      setResult(aiData.enhancedImageUrl);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Qualcosa è andato storto.");
    } finally {
      setLoading(false);
    }
  };

  // --- NUOVA FUNZIONE DI DOWNLOAD PROFESSIONALE ---
  // Usa Cloudinary per ritagliare senza perdere qualità
  const downloadPro = async (format: 'portali' | 'social') => {
    if (!result) return;
    setError(null);

    try {
      // 1. Se il risultato è di Leonardo, lo ricarichiamo su Cloudinary
      // per poter usare le sue funzioni di ritaglio professionale.
      let cloudinaryUrl = result;
      
      // Se l'URL non è già di Cloudinary (quindi è di Leonardo), facciamo l'upload
      if (!result.includes("cloudinary.com")) {
        setLoading(true); // Mostra "Preparazione Download..."
        const formData = new FormData();
        formData.append("file", result);
        formData.append("upload_preset", UPLOAD_PRESET);
        const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
          method: "POST",
          body: formData,
        });
        if (!uploadResponse.ok) throw new Error("Errore preparazione download");
        const uploadData = await uploadResponse.json();
        cloudinaryUrl = uploadData.secure_url;
      }

      // 2. Definiamo le trasformazioni di Cloudinary per il ritaglio perfetto
      let transformation = "";
      let filename = "";

      if (format === 'portali') {
        // Formato 16:9 (Orizzontale) - Ritaglio intelligente e qualità massima
        transformation = "ar_16:9,c_fill,g_auto,q_auto:best";
        filename = "foto-portali-pro.jpg";
      } else {
        // Formato 4:5 (Verticale Social) - Ritaglio intelligente e qualità massima
        transformation = "ar_4:5,c_fill,g_auto,q_auto:best";
        filename = "foto-social-pro.jpg";
      }

      // 3. Costruiamo l'URL finale di Cloudinary con le trasformazioni
      const finalUrl = cloudinaryUrl.replace("/upload/", `/upload/${transformation}/`);

      // 4. Scarichiamo il file generato da Cloudinary
      const response = await fetch(finalUrl);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err: any) {
      console.error(err);
      setError("Errore durante il download. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20 font-sans text-slate-900">
      <header className="px-6 py-4 flex items-center gap-4 bg-white border-b border-slate-200 sticky top-0 z-10">
        <Link href="/" className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <h1 className="text-xl font-bold">Foto AI (Phoenix Engine)</h1>
      </header>

      <main className="max-w-xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-bold flex items-center gap-2">
            ⚠️ {error}
          </div>
        )}

        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 mb-8">
          {!image ? (
            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-300 rounded-2xl h-80 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 gap-4 group">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition"><Upload size={32} /></div>
              <p className="font-bold text-slate-700">Carica Foto</p>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden min-h-[400px] bg-slate-900 flex items-center justify-center">
              <img 
                src={result || image} 
                className="w-full h-auto max-h-[600px] object-contain" 
                alt="Anteprima" 
              />
              
              <div className="absolute top-4 left-4 bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-2">
                {result ? <><CheckCircle2 size={12} className="text-green-400" /> RISULTATO PRO</> : "ORIGINALE"}
              </div>

              {loading && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm z-20">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-white font-bold animate-pulse text-lg">
                        {result ? "Preparazione Download..." : "Sviluppo Foto..."}
                    </p>
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
          
          {result && !loading && (
            <div className="grid grid-cols-2 gap-4">
                <button onClick={() => downloadPro('portali')} className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-1 hover:bg-green-700 transition shadow-lg shadow-green-200">
                  <div className="flex items-center gap-2"><Monitor size={20} /> Portali</div>
                  <span className="text-[10px] opacity-80 font-normal">Formato 16:9 HD</span>
                </button>
                <button onClick={() => downloadPro('social')} className="w-full bg-pink-600 text-white py-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-1 hover:bg-pink-700 transition shadow-lg shadow-pink-200">
                   <div className="flex items-center gap-2"><Instagram size={20} /> Social</div>
                   <span className="text-[10px] opacity-80 font-normal">Formato 4:5 HD</span>
                </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
