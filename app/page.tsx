"use client";
import React, { useState } from 'react';
import { Camera, Image as ImageIcon, Sparkles, Share2, Layout, Menu, CreditCard, Video, X, PlayCircle, CheckCircle2, Info } from 'lucide-react';

export default function RealEstateApp() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'photo' | 'video360'>('photo');
  const [videoFile, setVideoFile] = useState<string | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setGallery(prev => [...prev, ...newImages]);
      if (!selectedImage) setSelectedImage(newImages[0]);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setVideoFile(URL.createObjectURL(file));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* HEADER PROFESSIONALE */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-100">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <h1 className="font-bold text-xl tracking-tight text-blue-600">RE-MAGIC</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 px-3 py-1 rounded-full flex items-center gap-2 border border-blue-100">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-bold text-blue-700">12</span>
            </div>
            <button onClick={() => setIsMenuOpen(true)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <Menu className="w-6 h-6 text-slate-600" />
            </button>
          </div>
        </div>
      </header>

      {/* MENU LATERALE */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <div className="relative w-72 bg-white h-full shadow-2xl p-6 flex flex-col animate-in slide-in-from-right">
            <div className="flex justify-between items-center mb-10">
              <h2 className="font-bold text-xl text-slate-800">Navigazione</h2>
              <X className="w-6 h-6 cursor-pointer text-slate-400" onClick={() => setIsMenuOpen(false)} />
            </div>
            <nav className="space-y-3 flex-1">
              <button 
                onClick={() => { setActiveTab('photo'); setIsMenuOpen(false); }}
                className={`flex items-center gap-4 w-full p-4 rounded-2xl
