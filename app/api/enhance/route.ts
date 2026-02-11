import { NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary'; 

export const dynamic = "force-dynamic";

// 👇 INSERISCI LE TUE CHIAVI (Senza spazi!)
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
    
    console.log("🚀 MODO FETCH: Aggiro il problema dell'ID...");

    // IL TRUCCO:
    // Invece di estrarre l'ID e rischiare di sbagliare, usiamo l'URL intero.
    // type: 'fetch' dice a Cloudinary di trattare l'immagine come esterna/nuova
    // Questo resetta ogni problema di firme vecchie.
    
    const viesusUrl = cloudinary.url(originalImageUrl, {
        type: 'fetch', // <--- QUESTA È LA CHIAVE
        transformation: [
            { effect: "viesus_correct" } // Raddrizzamento VERO (Add-on)
        ],
        sign_url: true, // Firma l'URL intero (infallibile)
        fetch_format: 'jpg'
    });

    console.log("✅ Link Fetch Generato:", viesusUrl);
    console.log("⏳ Attendo che Viesus elabori (Ping)...");

    // "Ping" di verifica: Aspettiamo che Cloudinary abbia finito prima di darti il link
    // Così non vedi l'icona rotta.
    let isReady = false;
    let attempts = 0;
    let finalUrl = null;

    while (!isReady && attempts < 15) { // Proviamo per 20 secondi circa
        try {
            const check = await fetch(viesusUrl);
            if (check.ok) {
                isReady = true;
                finalUrl = viesusUrl;
                console.log("🔥 Viesus HA RISPOSTO! Immagine pronta.");
            } else {
                // Se da errore, aspettiamo. Viesus ci mette un po' la prima volta.
                console.log(`❄️ Elaborazione in corso... (${attempts + 1})`);
                await new Promise(r => setTimeout(r, 1500));
            }
        } catch (e) {
            await new Promise(r => setTimeout(r, 1500));
        }
        attempts++;
    }

    if (!finalUrl) {
        console.warn("⚠️ Viesus lento o non partito. Uso fallback nativo.");
        // Se Viesus fallisce anche in fetch, usiamo la correzione nativa sulla URL originale
        // Ma almeno ci abbiamo provato nel modo più pulito possibile.
        const fallbackUrl = originalImageUrl.replace("/upload/", "/upload/e_distort:correction,e_improve:outdoor,e_sharpen:60/");
        return NextResponse.json({ enhancedImageUrl: fallbackUrl });
    }

    // Se arriviamo qui, Viesus ha funzionato!
    return NextResponse.json({ enhancedImageUrl: finalUrl });

  } catch (error: any) {
    console.error("❌ Errore:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
