'use client';

import React, { useState } from 'react';
import { Camera, Sparkles, Layout, Share2 } from 'lucide-react';

export default function RealEstateMagic() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '500px', margin: '0 auto', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', backgroundColor: 'white', borderBottom: '1px solid #eee' }}>
        <h1 style={{ color: '#2563eb', margin: 0, fontSize: '20px' }}>RE-MAGIC</h1>
        <div style={{ backgroundColor: '#2563eb', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '12px' }}>PRO</div>
      </header>

      <main style={{ padding: '20px' }}>
        <div style={{ width: '100%', aspectRatio: '1/1', backgroundColor: 'white', borderRadius: '24px', border: '2px dashed #ccc', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <input type="file" accept="image/*" onChange={handleFile} style={{ position: 'absolute', inset: 0, opacity: 0, zIndex: 10, cursor: 'pointer' }} />
          {imagePreview ? (
            <img src={imagePreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Preview" />
          ) : (
            <div style={{ color: '#ccc', textAlign: 'center' }}>
              <Camera size={40} />
              <p>Tocca per scattare</p>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
          <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '20px', textAlign: 'center', border: '1px solid #eee' }}>
            <Layout style={{ color: '#8b5cf6', margin: '0 auto' }} />
            <div style={{ fontSize: '12px', fontWeight: 'bold', marginTop: '5px' }}>STAGING</div>
          </div>
          <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '20px', textAlign: 'center', border: '1px solid #eee' }}>
            <Share2 style={{ color: '#10b981', margin: '0 auto' }} />
            <div style={{ fontSize: '12px', fontWeight: 'bold', marginTop: '5px' }}>SOCIAL</div>
          </div>
        </div>
      </main>

      <div style={{ padding: '20px', position: 'fixed', bottom: 0, width: '100%', maxWidth: '500px', boxSizing: 'border-box' }}>
        <button style={{ width: '100%', padding: '15px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '15px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <Sparkles size={20} /> MIGLIORA CON AI
        </button>
      </div>
    </div>
  );
}
