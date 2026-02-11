import { NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary';

export const dynamic = "force-dynamic";

// 👇 INSERISCI QUI LE TUE CHIAVI CLOUDINARY (Quelle che funzionavano all'inizio)
const CLOUDINARY_CLOUD_NAME = "dfzptsood";
const CLOUDINARY_API_KEY = "469877913569186";
const CLOUDINARY_API_SECRET = "L1RR-AzlrdZCosB-dSiGJSavxH0";

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true
});

export async function POST(request: Request) {
  try {
    const { image: originalImageUrl } = await request.json();

    console.log("🚀 MODO GEOMETRA: Correzione Lente Aggressiva...");

    // 1. GENERAZIONE URL DIRETTA (Nessun upload, nessuna attesa)
    // Usiamo 'fetch' per dire a Cloudinary di prendere l'immagine al volo.
    const url = cloudinary.url(originalImageUrl, {
        type: 'fetch',
        transformation: [
            // Questo comando TOGLIE LA PANCIA ai muri (Barilotto)
            { effect: "distort:correction" }, 
            
            // Questo comando TOGLIE LA VELATURA (Dehaze)
            { effect: "dehaze:80" },
            
            // Questo comando AUMENTA LA LUCE E IL CONTRASTO
            { effect: "improve:outdoor:50" },
            
            // Questo comando RAFFORZA I DETTAGLI (Nitidezza)
            { effect: "sharpen:100" },

            // Ottimizzazioni finali
            { quality: "auto" },
            { fetch_format: "jpg" }
        ],
        sign_url: true 
    });

    console.log("✅ Link Generato:", url);

    // Restituiamo SUBITO il link.
    // Se la foto originale si vede, si vedrà anche questa.
    return NextResponse.json({ enhancedImageUrl: url });

  } catch (error: any) {
    console.error("❌ Errore:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
