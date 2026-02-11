import { NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary'; 

export const dynamic = "force-dynamic";

// 👇 INSERISCI I TUOI DATI VERI TRA LE VIRGOLETTE
const CLOUDINARY_CLOUD_NAME = "dfzptsood"; 
const CLOUDINARY_API_KEY = "469877913569186"; 
const CLOUDINARY_API_SECRET = "L1RR-AzlrdZCosB-dSiGJSavxH0"; 

// Configuriamo il robot
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true
});

export async function POST(request: Request) {
  try {
    const { image: originalImageUrl } = await request.json();
    
    console.log("🚀 TEST LEGGERO: Generazione Link...");

    // 1. ESTRAZIONE ID (La parte difficile)
    // Cerchiamo di prendere l'ID pulito dell'immagine dall'URL che ci arriva
    const regex = /\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/;
    const match = originalImageUrl.match(regex);
    // Se la regex fallisce, usiamo un metodo "grezzo" prendendo l'ultima parte del file
    const publicId = match && match[1] ? match[1] : originalImageUrl.split('/').pop().split('.')[0];
    
    console.log("👉 ID Trovato:", publicId);

    // 2. GENERAZIONE URL (Solo Matematica, 0 secondi di attesa)
    // Usiamo distort:correction (toglie la pancia) + improve (luce)
    const correctedUrl = cloudinary.url(publicId, {
        transformation: [
            { effect: "distort:correction" }, // Toglie effetto barilotto
            { effect: "improve:outdoor:50" }, // Luce forte
            { effect: "sharpen:80" }          // Nitidezza
        ],
        sign_url: true, // Firma il link per sicurezza
        fetch_format: 'jpg'
    });

    console.log("✅ Link Generato:", correctedUrl);

    // Restituiamo subito il link. Il browser farà la fatica di scaricarlo.
    return NextResponse.json({ enhancedImageUrl: correctedUrl });

  } catch (error: any) {
    console.error("❌ Errore:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
