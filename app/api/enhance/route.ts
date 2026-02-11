import { NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary'; 

export const dynamic = "force-dynamic";

// 👇 INSERISCI LE TUE CHIAVI
const CLOUDINARY_CLOUD_NAME = "dfzptsood"; 
const CLOUDINARY_API_KEY = "469877913569186"; 
const CLOUDINARY_API_SECRET = "L1RR-AzlrdZCosB-dSiGJSavxH0"; 

// Configurazione
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true
});

export async function POST(request: Request) {
  try {
    const { image: originalImageUrl } = await request.json();
    
    // 1. GENERAZIONE URL (Algoritmo Visivo)
    // Invece di 'angle: auto' (che si fida del telefono), usiamo 'e_straighten'.
    // Questo guarda i muri e le porte e RUOTA la foto fisicamente.
    // e_improve:outdoor: Migliora la luce.
    
    const correctedUrl = cloudinary.url(originalImageUrl, {
        type: 'fetch', 
        transformation: [
            { effect: "straighten" },     // <--- ALGORITMO RADDRIZZAMENTO VISIVO
            { effect: "improve:outdoor" }, // <--- LUCE E COLORI
            { effect: "sharpen:60" }       // <--- NITIDEZZA
        ],
        sign_url: true, 
        fetch_format: 'jpg'
    });

    console.log("⏳ Link 'Straighten' generato. Attendo elaborazione...");

    // 2. CICLO DI ATTESA (Anti-File Vuoto)
    let isValid = false;
    let attempts = 0;

    // Aspettiamo fino a 30 secondi che Cloudinary raddrizzi la foto
    while (!isValid && attempts < 15) {
        try {
            const check = await fetch(correctedUrl);
            if (check.ok) {
                const blob = await check.blob();
                // Se il file pesa più di 2KB, è pronto
                if (blob.size > 2000) { 
                    isValid = true;
                }
            }
        } catch (e) {
            // Ignora errori di rete
        }
        
        if (!isValid) {
            await new Promise(r => setTimeout(r, 2000));
            attempts++;
        }
    }

    if (!isValid) {
        // Se fallisce il tempo limite, restituiamo l'originale per non rompere l'app
        return NextResponse.json({ enhancedImageUrl: originalImageUrl });
    }

    return NextResponse.json({ enhancedImageUrl: correctedUrl });

  } catch (error: any) {
    console.error("❌ Errore:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
