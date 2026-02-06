'use client';

import React, { useState, ChangeEvent } from 'react';
import { Camera, Wand2, Share2, Sparkles, Layout } from 'lucide-react';

export default function RealEstateMagic() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    // STILE INLINE: Questo funziona anche se Tailwind è rotto
    <div style={{ maxWidth: '500px', margin: '0 auto', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif', paddingBottom: '100px' }}>
      
      <header style={{ backgroundColor: 'white', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', sticky: 'top' }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#2563eb', letterSpacing: '-1px' }}>RE-MAGIC</h1>
        <div style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold' }}>PRO</div>
      </header>

      <main style={{ padding: '20px' }}>
        <div style={{ marginBottom: '25px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>Trasforma il tuo immobile</h2>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Carica una foto e arreda con l'AI</p>
        </div>

        {/* CONTENITORE FOTO: Questo blocca la foto gigante */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', backgroundColor: 'white', borderRadius: '30px', border: '2px dashed #cbd5e1', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            style={{ position: 'absolute', inset: 0, opacity: 0, zIndex: 10, cursor: 'pointer' }} 
          />
          
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ textAlign: 'center', color: '#94a3b8' }}>
              <Camera size={48} style={{ marginBottom: '10px' }} />
              <p style={{ margin: 0, fontWeight: 'bold' }}>Tocca per iniziare</p>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '30px' }}>
          <button style={{ padding: '20px', backgroundColor: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <Layout size={24} color="#9333ea" />
            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>STAGING</span>
          </button>
          <button style={{ padding: '20px', backgroundColor: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <Share2 size={24} color="#16a34a" />
            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>SOCIAL</span>
          </button>
        </div>
      </main>

      {/* BOTTONE FISSO IN BASSO */}
      <div style={{ position: 'fixed', bottom: '20px', left: '20px', right: '20px', maxWidth: '460px', margin: '0 auto' }}>
        <button style={{ width: '100%', height: '60px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '15px', fontWeight: 'bold', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)' }}>
          <Sparkles size={20} /> MIGLIORA CON AI
        </button>
      </div>
    </div>
  );
}
