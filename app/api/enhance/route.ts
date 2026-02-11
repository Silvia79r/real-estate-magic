import { NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary'; 

export const dynamic = "force-dynamic";

// 👇 INSERISCI LE TUE CHIAVI (Verifica che non ci siano spazi)
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
    
    // 1. GENERAZIONE URL (Con rotazione automatica GRATIS)
    // Non serve estrarre ID complessi. Usiamo la modalità "fetch" che è più sicura.
    // a_auto: Prova a raddrizzare l'orizzonte automaticamente
    // distort:correction: Toglie la curvatura della lente
    const correctedUrl = cloudinary.url(originalImageUrl, {
        type: 'fetch', 
        transformation: [
            { angle: "auto" },            // <--- QUESTO RADDRIZZA (Rotazione)
            { effect: "distort:correction" }, // <--- QUESTO TOGLIE LA PANCIA
            { effect: "improve:outdoor:50" }, // <--- LUCE
            { effect: "sharpen:80" }          // <--- NITIDEZZA
        ],
        sign_url: true, 
        fetch_format: 'jpg'
    });

    console.log("⏳ Link generato. Attendo elaborazione Cloudinary...");

    // 2. CICLO DI ATTESA (Il server controlla che il file esista davvero)
    // Questo blocca tutto finché la foto non è PRONTA.
    // Risolve il problema del file "0 byte".
    let isValid = false;
    let attempts = 0;

    // Proviamo per 15 volte (circa 30 secondi di attesa massima)
    while (!isValid && attempts < 15) {
        try {
            const check = await fetch(correctedUrl);
            if (check.ok) {
                const blob = await check.blob();
                // Se il file è più grande di 2KB, è una foto vera.
                if (blob.size > 2000) { 
                    isValid = true;
                    console.log(`✅ Foto pronta! Dimensione: ${blob.size} bytes`);
                } else {
                    console.log(`❄️ Elaborazione in corso... (Tentativo ${attempts})`);
                }
            }
        } catch (e) {
            // Ignora errori di rete e riprova
        }
        
        if (!isValid) {
            // Aspetta 2 secondi prima di riprovare
            await new Promise(r => setTimeout(r, 2000));
            attempts++;
        }
    }

    if (!isValid) {
        // Se dopo 30 secondi Cloudinary non risponde, ti ridò l'originale
        // per non bloccare l'app, ma almeno non ti scarica un file rotto.
        return NextResponse.json({ enhancedImageUrl: originalImageUrl });
    }

    // Se siamo qui, la foto è raddrizzata e SCARICABILE.
    return NextResponse.json({ enhancedImageUrl: correctedUrl });

  } catch (error: any) {
    console.error("❌ Errore:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
