"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, Camera, Download, Share2, Sparkles, RefreshCw } from "lucide-react";

export default function FotoAIPage() {
  // --- CONFIGURAZIONE CLOUDINARY ---
  // Ho lasciato i tuoi dati che hai inserito tu, così è pronto all'uso.
  const CLOUD_NAME = "dfzptsood";
  const UPLOAD_PRESET = "remagic";
  // -------------------------------------------------------------

  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // GESTIONE SELEZIONE FILE
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file); // Salviamo il file per inviarlo dopo
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // FUNZIONE MAGICA (AGGIORNATA CON FILTRI FORTI)
  const startAiMagic = async () => {
    if (!imageFile) return;

    // Controllo se hai messo i dati
    if (CLOUD_NAME.includes("INSERISCI") || UPLOAD_PRESET.includes("INSERISCI")) {
        alert("⚠️ Manca la configurazione di Cloudinary nel codice!");
        return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Prepariamo i dati per Cloudinary
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("upload_preset", UPLOAD_PRESET);

      // 2. Invio DIRETTO (Bypassiamo Vercel = Niente Timeout)
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Errore Upload su Cloudinary");

      const data = await response.json();
      const originalUrl = data.secure_url;

      // 3. APPLICAZIONE FILTRI "AGGRESSIVI"
      // Qui sta la modifica per vedere la differenza netta:
      // - e_improve:outdoor (Migliora luci esterne)
      // - e_saturation:50 (Colori molto più vivi)
      // - e_contrast:30 (Più contrasto)
      // - e_sharpen:100 (Più nitidezza)
      const magicUrl = originalUrl.replace("/upload/", "/upload/e_improve:outdoor,e_saturation:50,e_contrast:30,e_sharpen:100/");

      setResult(magicUrl);

    } catch (err) {
      console.error(err);
      setError("Si è verificato un errore di connessione.");
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
      <header className="px-6 py-4 flex items-center gap-4 bg-white border
